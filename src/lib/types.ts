export type UserRole = 'admin' | 'buyer' | 'supplier_admin' | 'supplier_user';

export type QuotationStatus = 'pending' | 'sent' | 'received_quotes' | 'completed' | 'cancelled';

export type QuotationUrgency = 'urgent' | 'normal' | 'scheduled';

export type ResponseStatus = 'draft' | 'in_review' | 'submitted' | 'sent_to_portal';

export type DistributionStatus = 'sent' | 'viewed' | 'responded' | 'declined';

export interface Organization {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone?: string;
  address?: any;
  type: 'hospital' | 'clinic' | 'supplier';
  status: 'active' | 'inactive' | 'suspended';
  specialties?: string[];
  rating?: number;
  certifications?: any;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone?: string;
  address?: any;
  specialties?: string[];
  rating?: number;
  certifications?: any;
  status?: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  manufacturer?: string;
  anvisa_registration?: string;
  technical_specs?: any;
  unit_of_measure?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  organization_id: string;
  organization?: Organization;
  
  // Identificação
  pedido_id: string;
  titulo: string;
  solicitante: string;
  contato: string;
  
  // Procedimento
  carater_internacao: string;
  encerramento_cotacao: string;
  forma_pagamento: string;
  etapa: string;
  
  // Paciente
  patient_name: string;
  surgery_date: string;
  surgery_location: string;
  operadora: string;
  senha_autorizacao?: string;
  atendimento: string;
  agenda?: string;
  
  // Médico
  medico: string;
  crm_uf: string;
  
  // Hospital (NOVO)
  hospital_name?: string;
  hospital_cnpj?: string;
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  billing_status?: 'pending' | 'authorized' | 'billed' | 'pending_items';
  
  // Dados Estruturados
  procedures: any[];
  products: QuoteProductItem[];
  non_coded_products: NonCodedProduct[];
  documents: any[];
  pre_surgical_files: any[];
  
  // Observações
  observacao_comprador?: string;
  discount: any;
  provider_conditions: any;
  
  // Faturamento (NOVO) - Fonte Pagadora
  billing_data?: {
    payer_name?: string;           // Nome da fonte pagadora
    payer_cnpj?: string;           // CNPJ da fonte pagadora
    payer_type?: 'insurance' | 'hospital' | 'patient' | 'other'; // Tipo: Convênio, Hospital, Particular
    payment_terms?: string;        // Condições de pagamento
    contact_name?: string;         // Contato para faturamento
    contact_phone?: string;        // Telefone do contato
    contact_email?: string;        // E-mail do contato
    notes?: string;                // Observações
  };
  total_value?: number;
  billed_value?: number;
  
  // Resposta
  response_id?: string;
  response_status?: string;
  
  // Origem
  source_platform?: string;
  external_quote_id?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface QuoteProductItem {
  referencia: string;
  name: string;
  quantity: number;
}

export interface NonCodedProduct {
  id: string;
  descricao: string;
  quantidade: number;
}

export interface QuoteResponse {
  id: string;
  quote_id: string;
  organization_id: string;
  created_by: string;
  submitted_at?: string;
  
  // Status
  status: 'draft' | 'in_review' | 'submitted' | 'sent_to_portal';
  
  // Condições Comerciais
  prazo_entrega_dias: number;
  condicoes_pagamento: string;
  validade_proposta?: string;
  tipo_frete: 'CIF' | 'FOB';
  
  // Valores Financeiros
  subtotal: number;
  desconto_percentual: number;
  desconto_valor: number;
  valor_total: number;
  
  // Integração com Portal
  external_response_id?: string;
  portal_submission_date?: string;
  portal_status?: string;
  portal_error_message?: string;
  is_sent_to_portal: boolean;
  send_attempts: number;
  last_send_attempt?: string;
  
  // Observações
  observacoes_gerais: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface QuoteResponseItem {
  id: string;
  response_id: string;
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
  created_at: string;
  updated_at: string;
}

export interface QuoteResponseCollaborator {
  id: string;
  response_id: string;
  user_id: string;
  role: 'specialist' | 'reviewer';
  invited_by: string;
  invited_at: string;
  accepted_at?: string;
  can_edit: boolean;
  can_view_prices: boolean;
  contribution_notes: string;
  status: 'pending' | 'active' | 'removed';
  created_at: string;
  
  // Dados do usuário (join)
  user_name?: string;
  user_email?: string;
}

export interface QuoteResponseActivityLog {
  id: string;
  response_id: string;
  user_id?: string;
  action_type: 'created' | 'updated' | 'item_changed' | 'collaborator_invited' | 'submitted' | 'sent_to_portal' | 'send_failed';
  details: Record<string, any>;
  timestamp: string;
  
  // Dados do usuário (join)
  user_name?: string;
}

export interface QuoteResponseWithDetails extends QuoteResponse {
  items: QuoteResponseItem[];
  collaborators: QuoteResponseCollaborator[];
  creator_name?: string;
  quote?: Quote;
}

export interface PortalSubmissionPayload {
  quoteId: string;
  externalQuoteId: string;
  platform: string;
  items: Array<{
    productRef: string;
    productName: string;
    available: boolean;
    quantityOffered: number;
    unitPrice: number;
    totalPrice: number;
    deliveryTime?: number;
    notes: string;
  }>;
  commercialConditions: {
    deliveryDays: number;
    paymentTerms: string;
    proposalValidity: string;
    freightType: 'CIF' | 'FOB';
  };
  totals: {
    subtotal: number;
    discount: number;
    total: number;
  };
  notes: string;
}

export interface UserProfile {
  id: string;
  organization_id: string;
  full_name: string;
  role: 'admin' | 'buyer' | 'specialist' | 'reviewer' | 'supplier_admin' | 'supplier_user';
  phone?: string;
  crm?: string;
  crm_uf?: string;
  avatar_url?: string;
  preferences?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_entity_type?: string;
  related_entity_id?: string;
  read: boolean;
  created_at: string;
}

export interface UserInvitation {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'buyer' | 'specialist' | 'reviewer' | 'supplier_admin' | 'supplier_user';
  phone?: string;
  invited_by: string;
  invited_at: string;
  expires_at: string;
  invitation_token: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  accepted_at?: string;
  accepted_by?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvitationPayload {
  email: string;
  full_name: string;
  role: 'admin' | 'buyer' | 'specialist' | 'reviewer' | 'supplier_admin' | 'supplier_user';
  phone?: string;
}

// =====================================================
// MÓDULO: MÉDICOS
// =====================================================

export interface Doctor {
  id: string;
  organization_id: string;
  full_name: string;
  cpf?: string;
  rg?: string;
  birth_date?: string;
  crm: string;
  crm_uf: string;
  specialties: string[];
  email?: string;
  phone?: string;
  mobile?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  };
  hospitals?: Array<{
    name: string;
    city: string;
    state: string;
  }>;
  relationship_type: 'active' | 'inactive' | 'prospect';
  relationship_notes?: string;
  first_contact_date?: string;
  last_contact_date?: string;
  preferred_products?: string[];
  notes?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDoctorPayload {
  full_name: string;
  cpf?: string;
  rg?: string;
  birth_date?: string;
  crm: string;
  crm_uf: string;
  specialties?: string[];
  email?: string;
  phone?: string;
  mobile?: string;
  address?: Doctor['address'];
  hospitals?: Doctor['hospitals'];
  relationship_type?: 'active' | 'inactive' | 'prospect';
  relationship_notes?: string;
  first_contact_date?: string;
  notes?: string;
}

// =====================================================
// MÓDULO: TABELA DE PREÇOS
// =====================================================

export interface PriceTable {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  code?: string;
  table_type: 'standard' | 'promotional' | 'special' | 'contract';
  category?: string;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  is_default: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PriceTableItem {
  id: string;
  price_table_id: string;
  organization_id: string;
  product_code: string;
  product_name: string;
  product_description?: string;
  manufacturer?: string;
  category?: string;
  subcategory?: string;
  unit_of_measure: string;
  package_quantity: number;
  cost_price?: number;
  list_price: number;
  min_price?: number;
  max_discount_percent: number;
  anvisa_registration?: string;
  sus_code?: string;
  tuss_code?: string;
  ncm?: string;
  stock_quantity: number;
  lead_time_days?: number;
  is_available: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePriceTablePayload {
  name: string;
  description?: string;
  code?: string;
  table_type?: 'standard' | 'promotional' | 'special' | 'contract';
  category?: string;
  valid_from?: string;
  valid_until?: string;
  is_default?: boolean;
}

export interface CreatePriceTableItemPayload {
  price_table_id: string;
  product_code: string;
  product_name: string;
  product_description?: string;
  manufacturer?: string;
  category?: string;
  subcategory?: string;
  unit_of_measure?: string;
  package_quantity?: number;
  cost_price?: number;
  list_price: number;
  min_price?: number;
  max_discount_percent?: number;
  anvisa_registration?: string;
  sus_code?: string;
  tuss_code?: string;
  ncm?: string;
  stock_quantity?: number;
  lead_time_days?: number;
  notes?: string;
}

// =====================================================
// MÓDULO: ANALYTICS
// =====================================================

export interface AnalyticsDashboard {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  dashboard_type: 'sales' | 'quotes' | 'products' | 'doctors' | 'custom';
  config?: any;
  embed_url?: string;
  allowed_roles: string[];
  is_public: boolean;
  display_order: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsMetric {
  id: string;
  organization_id: string;
  metric_name: string;
  metric_type: 'count' | 'sum' | 'avg' | 'percentage';
  period_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  period_start: string;
  period_end: string;
  metric_value: number;
  metric_metadata?: any;
  calculated_at: string;
  created_at: string;
}

export interface CreateDashboardPayload {
  name: string;
  description?: string;
  dashboard_type: 'sales' | 'quotes' | 'products' | 'doctors' | 'custom';
  config?: any;
  embed_url?: string;
  allowed_roles?: string[];
  is_public?: boolean;
  display_order?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// =====================================================
// MÓDULO: COTAÇÕES APRIMORADAS
// =====================================================

export type QuoteActionType = 
  | 'budgeted'           // Orçado
  | 'authorized'         // Autorizado
  | 'used_supplier'      // Utilizado (Fornecedor)
  | 'usage_confirmed'    // Confirmada a Utilização (Comprador)
  | 'billing_authorized' // Faturamento Autorizado (Comprador)
  | 'billed'            // Faturado
  | 'billing_pending'   // Pendente de Faturamento
  | 'created'           // Criado
  | 'updated'           // Atualizado
  | 'cancelled'         // Cancelado
  | 'comment';          // Comentário

export interface QuoteHistory {
  id: string;
  quote_id: string;
  organization_id: string;
  action_type: QuoteActionType;
  description?: string;
  metadata?: any;
  performed_by?: string;
  performed_by_name?: string;
  performed_by_role?: string;
  created_at: string;
}

export type AttachmentType = 
  | 'pre_surgical'      // Pré-cirúrgico
  | 'post_surgical'     // Pós-cirúrgico
  | 'billing_evidence'  // Evidência de faturamento
  | 'authorization'     // Autorização
  | 'invoice'          // Nota fiscal
  | 'receipt'          // Recibo
  | 'medical_report'   // Relatório médico
  | 'other';           // Outro

export interface QuoteAttachment {
  id: string;
  quote_id: string;
  organization_id: string;
  attachment_type: AttachmentType;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  title: string;
  description?: string;
  tags?: string[];
  related_action?: string;
  uploaded_by?: string;
  uploaded_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteBillingItem {
  id: string;
  quote_id: string;
  organization_id: string;
  product_name: string;
  product_code?: string;
  quantity_budgeted: number;
  quantity_authorized?: number;
  quantity_used?: number;
  quantity_billed?: number;
  unit_price: number;
  total_budgeted: number;
  total_authorized?: number;
  total_used?: number;
  total_billed?: number;
  status: 'pending' | 'partially_billed' | 'fully_billed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BillingPendingSummary {
  total_items: number;
  pending_items: number;
  total_value: number;
  billed_value: number;
  pending_value: number;
}

export interface CreateQuoteHistoryPayload {
  quote_id: string;
  action_type: QuoteActionType;
  description?: string;
  metadata?: any;
}

export interface CreateQuoteAttachmentPayload {
  quote_id: string;
  attachment_type: AttachmentType;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  title: string;
  description?: string;
  tags?: string[];
  related_action?: string;
}

export interface CreateBillingItemPayload {
  quote_id: string;
  product_name: string;
  product_code?: string;
  quantity_budgeted: number;
  unit_price: number;
  notes?: string;
}
