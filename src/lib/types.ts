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
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  
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

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
