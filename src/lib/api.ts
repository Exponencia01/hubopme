import { supabase } from './supabase';
import type { Quote, QuoteResponse, Supplier } from './types';

export interface CreateQuoteResponsePayload {
  quote_id: string;
  organization_id: string;
  created_by: string;
  items: Array<{
    product_ref: string;
    product_name: string;
    original_quantity: number;
    disponivel: boolean;
    quantidade_oferecida: number;
    preco_unitario: number;
    preco_total: number;
    prazo_entrega_especifico?: number;
    substituto_sugerido: string;
    observacoes_item: string;
  }>;
  prazo_entrega_dias: number;
  condicoes_pagamento: string;
  validade_proposta: string;
  tipo_frete: 'CIF' | 'FOB';
  desconto_percentual: number;
  observacoes_gerais: string;
}

export const quotationsApi = {
  async getAll(filters?: { status?: string; urgency?: string }) {
    let query = supabase
      .from('quotes')
      .select(`
        *,
        organization:organizations(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.urgency) {
      query = query.eq('urgency', filters.urgency);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Quote[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Quote;
  },

  async create(quotation: Partial<Quote>, items: any[]) {
    const { data: quotationData, error: quotationError } = await supabase
      .from('quotation_requests')
      .insert(quotation)
      .select()
      .single();

    if (quotationError) throw quotationError;

    const itemsWithQuotationId = items.map(item => ({
      ...item,
      quotation_request_id: quotationData.id,
    }));

    const { error: itemsError } = await supabase
      .from('quotation_items')
      .insert(itemsWithQuotationId);

    if (itemsError) throw itemsError;

    return quotationData;
  },

  async update(id: string, updates: Partial<Quote>) {
    const { data, error } = await supabase
      .from('quotation_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async distributeToSuppliers(quotationId: string, supplierIds: string[]) {
    const distributions = supplierIds.map(supplierId => ({
      quotation_request_id: quotationId,
      supplier_id: supplierId,
      status: 'sent',
    }));

    const { data, error } = await supabase
      .from('quotation_distributions')
      .insert(distributions)
      .select();

    if (error) throw error;

    await supabase
      .from('quotation_requests')
      .update({ status: 'sent' })
      .eq('id', quotationId);

    return data;
  },

  async getSupplierQuotations(supplierId: string) {
    const { data, error } = await supabase
      .from('quotation_distributions')
      .select(`
        *,
        quotation_request:quotation_requests(*, organization:organizations(*), items:quotation_items(*))
      `)
      .eq('supplier_id', supplierId)
      .order('sent_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createQuoteResponse(payload: CreateQuoteResponsePayload) {
    // Calcular totais
    const itemsDisponiveis = payload.items.filter(item => item.disponivel);
    const subtotal = itemsDisponiveis.reduce((sum, item) => sum + item.preco_total, 0);
    const desconto_valor = (subtotal * payload.desconto_percentual) / 100;
    const valor_total = subtotal - desconto_valor;

    // Criar resposta principal
    const { data: responseData, error: responseError } = await supabase
      .from('quote_responses')
      .insert({
        quote_id: payload.quote_id,
        organization_id: payload.organization_id,
        created_by: payload.created_by,
        status: 'draft',
        prazo_entrega_dias: payload.prazo_entrega_dias,
        condicoes_pagamento: payload.condicoes_pagamento,
        validade_proposta: payload.validade_proposta,
        tipo_frete: payload.tipo_frete,
        subtotal,
        desconto_percentual: payload.desconto_percentual,
        desconto_valor,
        valor_total,
        observacoes_gerais: payload.observacoes_gerais,
        is_sent_to_portal: false,
        send_attempts: 0,
      })
      .select()
      .single();

    if (responseError) throw responseError;

    // Criar itens da resposta
    const itemsToInsert = payload.items.map(item => ({
      response_id: responseData.id,
      product_ref: item.product_ref,
      product_name: item.product_name,
      original_quantity: item.original_quantity,
      disponivel: item.disponivel,
      quantidade_oferecida: item.quantidade_oferecida,
      preco_unitario: item.preco_unitario,
      preco_total: item.preco_total,
      prazo_entrega_especifico: item.prazo_entrega_especifico,
      substituto_sugerido: item.substituto_sugerido,
      observacoes_item: item.observacoes_item,
    }));

    const { error: itemsError } = await supabase
      .from('quote_response_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    // Registrar atividade
    await supabase
      .from('quote_response_activity_log')
      .insert({
        response_id: responseData.id,
        user_id: payload.created_by,
        action_type: 'created',
        details: { message: 'Resposta criada' },
      });

    return responseData;
  },

  async submitQuoteResponse(responseId: string, userId: string) {
    const { data, error } = await supabase
      .from('quote_responses')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', responseId)
      .select()
      .single();

    if (error) throw error;

    // Registrar atividade
    await supabase
      .from('quote_response_activity_log')
      .insert({
        response_id: responseId,
        user_id: userId,
        action_type: 'submitted',
        details: { message: 'Resposta enviada ao cliente' },
      });

    return data;
  },
};

export const responsesApi = {
  async create(response: Partial<QuoteResponse>, items: any[]) {
    const { data: responseData, error: responseError } = await supabase
      .from('quotation_responses')
      .insert(response)
      .select()
      .single();

    if (responseError) throw responseError;

    const itemsWithResponseId = items.map(item => ({
      ...item,
      response_id: responseData.id,
    }));

    const { error: itemsError } = await supabase
      .from('quotation_response_items')
      .insert(itemsWithResponseId);

    if (itemsError) throw itemsError;

    await supabase
      .from('quotation_distributions')
      .update({ 
        status: 'responded',
        responded_at: new Date().toISOString(),
      })
      .eq('id', response.distribution_id);

    await supabase
      .from('quotation_requests')
      .update({ status: 'received_quotes' })
      .eq('id', response.quotation_request_id);

    return responseData;
  },

  async update(id: string, updates: Partial<QuoteResponse>) {
    const { data, error } = await supabase
      .from('quotation_responses')
      .update(updates)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getByQuotationId(quotationId: string) {
    const { data, error } = await supabase
      .from('quotation_responses')
      .select(`
        *,
        supplier:suppliers(*),
        items:quotation_response_items(*)
      `)
      .eq('quotation_request_id', quotationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as QuotationResponse[];
  },

  async acceptResponse(responseId: string) {
    const { data, error } = await supabase
      .from('quotation_responses')
      .update({ status: 'accepted' })
      .eq('id', responseId)
      .select()
      .single();

    if (error) throw error;

    const { error: quotationError } = await supabase
      .from('quotation_requests')
      .update({ status: 'completed' })
      .eq('id', data.quotation_request_id);

    if (quotationError) throw quotationError;

    return data;
  },
};

export const suppliersApi = {
  async getAll(filters?: { specialties?: string[] }) {
    let query = supabase
      .from('suppliers')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (filters?.specialties && filters.specialties.length > 0) {
      query = query.overlaps('specialties', filters.specialties);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Supplier[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Supplier;
  },

  async create(supplier: Partial<Supplier>) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Supplier>) {
    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const notificationsApi = {
  async getUnread(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  },
};
