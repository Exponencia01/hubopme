import { supabase } from './supabase';
import type {
  QuoteHistory,
  QuoteAttachment,
  QuoteBillingItem,
  BillingPendingSummary,
  CreateQuoteHistoryPayload,
  CreateQuoteAttachmentPayload,
  CreateBillingItemPayload,
} from './types';

// =====================================================
// HISTÓRICO DE AÇÕES
// =====================================================

export const quoteHistoryApi = {
  async getByQuoteId(quoteId: string): Promise<QuoteHistory[]> {
    const { data, error } = await supabase
      .from('quote_history')
      .select('*')
      .eq('quote_id', quoteId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as QuoteHistory[];
  },

  async create(payload: CreateQuoteHistoryPayload): Promise<QuoteHistory> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, organization_id')
      .eq('id', user?.id)
      .single();

    const { data, error } = await supabase
      .from('quote_history')
      .insert({
        ...payload,
        organization_id: profile?.organization_id,
        performed_by: user?.id,
        performed_by_name: profile?.full_name,
        performed_by_role: profile?.role,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as QuoteHistory;
  },

  async addAction(quoteId: string, actionType: string, description?: string) {
    return this.create({
      quote_id: quoteId,
      action_type: actionType as any,
      description,
    });
  },
};

// =====================================================
// ANEXOS
// =====================================================

export const quoteAttachmentsApi = {
  async getByQuoteId(quoteId: string): Promise<QuoteAttachment[]> {
    const { data, error } = await supabase
      .from('quote_attachments')
      .select('*')
      .eq('quote_id', quoteId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as QuoteAttachment[];
  },

  async getByType(quoteId: string, type: string): Promise<QuoteAttachment[]> {
    const { data, error } = await supabase
      .from('quote_attachments')
      .select('*')
      .eq('quote_id', quoteId)
      .eq('attachment_type', type)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as QuoteAttachment[];
  },

  async create(payload: CreateQuoteAttachmentPayload): Promise<QuoteAttachment> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, organization_id')
      .eq('id', user?.id)
      .single();

    const { data, error } = await supabase
      .from('quote_attachments')
      .insert({
        ...payload,
        organization_id: profile?.organization_id,
        uploaded_by: user?.id,
        uploaded_by_name: profile?.full_name,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as QuoteAttachment;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('quote_attachments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// =====================================================
// ITENS DE FATURAMENTO
// =====================================================

export const quoteBillingItemsApi = {
  async getByQuoteId(quoteId: string): Promise<QuoteBillingItem[]> {
    const { data, error } = await supabase
      .from('quote_billing_items')
      .select('*')
      .eq('quote_id', quoteId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as QuoteBillingItem[];
  },

  async getPending(quoteId: string): Promise<QuoteBillingItem[]> {
    const { data, error } = await supabase
      .from('quote_billing_items')
      .select('*')
      .eq('quote_id', quoteId)
      .in('status', ['pending', 'partially_billed'])
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as QuoteBillingItem[];
  },

  async create(payload: CreateBillingItemPayload): Promise<QuoteBillingItem> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    const totalBudgeted = payload.quantity_budgeted * payload.unit_price;

    const { data, error } = await supabase
      .from('quote_billing_items')
      .insert({
        ...payload,
        organization_id: profile?.organization_id,
        total_budgeted: totalBudgeted,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as QuoteBillingItem;
  },

  async update(id: string, payload: Partial<QuoteBillingItem>): Promise<QuoteBillingItem> {
    const { data, error } = await supabase
      .from('quote_billing_items')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as QuoteBillingItem;
  },

  async updateQuantities(
    id: string,
    quantities: {
      authorized?: number;
      used?: number;
      billed?: number;
    }
  ): Promise<QuoteBillingItem> {
    const { data: item } = await supabase
      .from('quote_billing_items')
      .select('*')
      .eq('id', id)
      .single();

    if (!item) throw new Error('Item não encontrado');

    const updates: any = {};
    
    if (quantities.authorized !== undefined) {
      updates.quantity_authorized = quantities.authorized;
      updates.total_authorized = quantities.authorized * item.unit_price;
    }
    
    if (quantities.used !== undefined) {
      updates.quantity_used = quantities.used;
      updates.total_used = quantities.used * item.unit_price;
    }
    
    if (quantities.billed !== undefined) {
      updates.quantity_billed = quantities.billed;
      updates.total_billed = quantities.billed * item.unit_price;
      
      // Atualizar status baseado na quantidade faturada
      if (quantities.billed === 0) {
        updates.status = 'pending';
      } else if (quantities.billed >= (item.quantity_used || item.quantity_budgeted)) {
        updates.status = 'fully_billed';
      } else {
        updates.status = 'partially_billed';
      }
    }

    return this.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('quote_billing_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getBillingSummary(quoteId: string): Promise<BillingPendingSummary> {
    const { data, error } = await supabase
      .rpc('calculate_billing_pending', { p_quote_id: quoteId });
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data[0] as BillingPendingSummary;
    }
    
    return {
      total_items: 0,
      pending_items: 0,
      total_value: 0,
      billed_value: 0,
      pending_value: 0,
    };
  },
};

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

export const quoteEnhancedUtils = {
  // Gerar relatório de pendências de faturamento
  async generateBillingReport(quoteId: string): Promise<string> {
    const [quote, items, summary] = await Promise.all([
      supabase.from('quotes').select('*').eq('id', quoteId).single(),
      quoteBillingItemsApi.getPending(quoteId),
      quoteBillingItemsApi.getBillingSummary(quoteId),
    ]);

    // Aqui você pode gerar um PDF ou HTML com os dados
    // Por enquanto, retornamos um resumo em texto
    const report = `
RELATÓRIO DE PENDÊNCIAS DE FATURAMENTO
========================================

Cotação: ${quote.data?.pedido_id}
Título: ${quote.data?.titulo}
Paciente: ${quote.data?.patient_name}

RESUMO:
- Total de Itens: ${summary.total_items}
- Itens Pendentes: ${summary.pending_items}
- Valor Total: R$ ${summary.total_value.toFixed(2)}
- Valor Faturado: R$ ${summary.billed_value.toFixed(2)}
- Valor Pendente: R$ ${summary.pending_value.toFixed(2)}

ITENS PENDENTES:
${items.map(item => `
- ${item.product_name}
  Orçado: ${item.quantity_budgeted} x R$ ${item.unit_price.toFixed(2)} = R$ ${item.total_budgeted.toFixed(2)}
  Utilizado: ${item.quantity_used || 0}
  Faturado: ${item.quantity_billed || 0}
  Pendente: ${(item.quantity_used || item.quantity_budgeted) - (item.quantity_billed || 0)}
`).join('\n')}
    `;

    return report;
  },

  // Sincronizar itens de faturamento com produtos da cotação
  async syncBillingItemsFromQuote(quoteId: string): Promise<void> {
    const { data: quote } = await supabase
      .from('quotes')
      .select('products')
      .eq('id', quoteId)
      .single();

    if (!quote || !quote.products) return;

    const existingItems = await quoteBillingItemsApi.getByQuoteId(quoteId);
    const existingCodes = new Set(existingItems.map(i => i.product_code));

    for (const product of quote.products) {
      if (!existingCodes.has(product.code)) {
        await quoteBillingItemsApi.create({
          quote_id: quoteId,
          product_name: product.name,
          product_code: product.code,
          quantity_budgeted: product.quantity || 1,
          unit_price: product.unit_price || 0,
        });
      }
    }
  },
};
