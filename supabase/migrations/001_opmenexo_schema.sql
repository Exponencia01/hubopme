-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ORGANIZATIONS (Hospitais/Clínicas/Fornecedores)
-- =====================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address JSONB,
  type VARCHAR(50) DEFAULT 'hospital' CHECK (type IN ('hospital', 'clinic', 'supplier')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  
  -- Dados adicionais para fornecedores
  specialties TEXT[],
  rating DECIMAL(3,2) DEFAULT 0,
  certifications JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER PROFILES (Extensão do auth.users do Supabase)
-- =====================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'buyer', 'specialist', 'reviewer', 'supplier_admin', 'supplier_user')),
  phone VARCHAR(20),
  crm VARCHAR(20),
  crm_uf VARCHAR(2),
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- QUOTES (Cotações/Pedidos)
-- =====================================================
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificação do Pedido
  pedido_id TEXT NOT NULL,
  titulo TEXT NOT NULL,
  solicitante TEXT NOT NULL,
  contato TEXT NOT NULL,
  
  -- Dados do Procedimento
  carater_internacao TEXT NOT NULL,
  encerramento_cotacao TIMESTAMPTZ NOT NULL,
  forma_pagamento TEXT NOT NULL,
  etapa TEXT NOT NULL,
  
  -- Dados do Paciente
  patient_name TEXT NOT NULL,
  surgery_date TEXT NOT NULL,
  surgery_location TEXT NOT NULL,
  operadora TEXT NOT NULL,
  senha_autorizacao TEXT,
  atendimento TEXT NOT NULL,
  agenda TEXT,
  
  -- Dados do Médico
  medico TEXT NOT NULL,
  crm_uf TEXT NOT NULL,
  
  -- Status e Controle
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'expired')),
  
  -- Dados Estruturados (JSONB)
  procedures JSONB NOT NULL DEFAULT '[]',
  products JSONB NOT NULL DEFAULT '[]',
  non_coded_products JSONB NOT NULL DEFAULT '[]',
  documents JSONB NOT NULL DEFAULT '[]',
  pre_surgical_files JSONB NOT NULL DEFAULT '[]',
  
  -- Observações e Condições
  observacao_comprador TEXT,
  discount JSONB NOT NULL DEFAULT '{}',
  provider_conditions JSONB NOT NULL DEFAULT '{}',
  
  -- Referência à Resposta
  response_id UUID,
  response_status TEXT,
  
  -- Plataforma de Origem
  source_platform TEXT DEFAULT 'internal',
  external_quote_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(organization_id, pedido_id)
);

-- =====================================================
-- QUOTE RESPONSES (Respostas de Cotação)
-- =====================================================
CREATE TABLE quote_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID UNIQUE NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ,
  
  -- Status da Resposta
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'submitted', 'sent_to_portal')),
  
  -- Condições Comerciais
  prazo_entrega_dias INTEGER DEFAULT 0,
  condicoes_pagamento TEXT DEFAULT '',
  validade_proposta TIMESTAMPTZ,
  tipo_frete TEXT DEFAULT 'CIF' CHECK (tipo_frete IN ('CIF', 'FOB')),
  
  -- Valores Financeiros
  subtotal DECIMAL(12, 2) DEFAULT 0,
  desconto_percentual DECIMAL(5, 2) DEFAULT 0,
  desconto_valor DECIMAL(12, 2) DEFAULT 0,
  valor_total DECIMAL(12, 2) DEFAULT 0,
  
  -- Integração com Portal Externo
  external_response_id TEXT,
  portal_submission_date TIMESTAMPTZ,
  portal_status TEXT,
  portal_error_message TEXT,
  is_sent_to_portal BOOLEAN DEFAULT false,
  send_attempts INTEGER DEFAULT 0,
  last_send_attempt TIMESTAMPTZ,
  
  -- Observações
  observacoes_gerais TEXT DEFAULT '',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- QUOTE RESPONSE ITEMS (Itens da Resposta)
-- =====================================================
CREATE TABLE quote_response_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES quote_responses(id) ON DELETE CASCADE,
  
  -- Identificação do Produto
  product_ref TEXT NOT NULL,
  product_name TEXT NOT NULL,
  original_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Disponibilidade e Oferta
  disponivel BOOLEAN DEFAULT true,
  quantidade_oferecida DECIMAL(10, 2) DEFAULT 0,
  
  -- Preços
  preco_unitario DECIMAL(12, 2) DEFAULT 0,
  preco_total DECIMAL(12, 2) DEFAULT 0,
  
  -- Prazo e Alternativas
  prazo_entrega_especifico INTEGER,
  substituto_sugerido TEXT DEFAULT '',
  
  -- Observações
  observacoes_item TEXT DEFAULT '',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- QUOTE RESPONSE COLLABORATORS (Colaboradores)
-- =====================================================
CREATE TABLE quote_response_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES quote_responses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Papel e Permissões
  role TEXT NOT NULL DEFAULT 'specialist' CHECK (role IN ('specialist', 'reviewer')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  
  -- Permissões Específicas
  can_edit BOOLEAN DEFAULT true,
  can_view_prices BOOLEAN DEFAULT true,
  
  -- Contribuições
  contribution_notes TEXT DEFAULT '',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'removed')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(response_id, user_id)
);

-- =====================================================
-- QUOTE RESPONSE ACTIVITY LOG (Log de Atividades)
-- =====================================================
CREATE TABLE quote_response_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES quote_responses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  -- Tipo de Ação
  action_type TEXT NOT NULL,
  
  -- Detalhes da Ação
  details JSONB DEFAULT '{}',
  
  -- Timestamp
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS (Notificações)
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Organizations
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_cnpj ON organizations(cnpj);

-- User Profiles
CREATE INDEX idx_user_profiles_organization_id ON user_profiles(organization_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Quotes
CREATE INDEX idx_quotes_organization_id ON quotes(organization_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_pedido_id ON quotes(pedido_id);
CREATE INDEX idx_quotes_response_id ON quotes(response_id);
CREATE INDEX idx_quotes_encerramento_cotacao ON quotes(encerramento_cotacao);
CREATE INDEX idx_quotes_source_platform ON quotes(source_platform);

-- Quote Responses
CREATE INDEX idx_quote_responses_quote_id ON quote_responses(quote_id);
CREATE INDEX idx_quote_responses_organization_id ON quote_responses(organization_id);
CREATE INDEX idx_quote_responses_status ON quote_responses(status);
CREATE INDEX idx_quote_responses_created_by ON quote_responses(created_by);
CREATE INDEX idx_quote_responses_is_sent_to_portal ON quote_responses(is_sent_to_portal);

-- Quote Response Items
CREATE INDEX idx_quote_response_items_response_id ON quote_response_items(response_id);
CREATE INDEX idx_quote_response_items_product_ref ON quote_response_items(product_ref);

-- Quote Response Collaborators
CREATE INDEX idx_quote_response_collaborators_response_id ON quote_response_collaborators(response_id);
CREATE INDEX idx_quote_response_collaborators_user_id ON quote_response_collaborators(user_id);
CREATE INDEX idx_quote_response_collaborators_status ON quote_response_collaborators(status);

-- Quote Response Activity Log
CREATE INDEX idx_quote_response_activity_log_response_id ON quote_response_activity_log(response_id);
CREATE INDEX idx_quote_response_activity_log_user_id ON quote_response_activity_log(user_id);
CREATE INDEX idx_quote_response_activity_log_timestamp ON quote_response_activity_log(timestamp);

-- Notifications
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para calcular preço total do item
CREATE OR REPLACE FUNCTION calculate_response_item_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.preco_total = NEW.quantidade_oferecida * NEW.preco_unitario;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para atualizar referência da resposta na cotação
CREATE OR REPLACE FUNCTION update_quote_response_reference()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE quotes
  SET response_id = NEW.id,
      response_status = NEW.status
  WHERE id = NEW.quote_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para sincronizar status entre quote_responses e quotes
CREATE OR REPLACE FUNCTION sync_quote_response_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE quotes
  SET response_status = NEW.status
  WHERE id = NEW.quote_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para registrar atividade automaticamente
CREATE OR REPLACE FUNCTION log_response_activity()
RETURNS TRIGGER AS $$
DECLARE
  action_type_val TEXT;
  details_val JSONB;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    action_type_val := 'created';
    details_val := jsonb_build_object('response_id', NEW.id);
  ELSIF (TG_OP = 'UPDATE') THEN
    action_type_val := 'updated';
    details_val := jsonb_build_object(
      'response_id', NEW.id,
      'old_status', OLD.status,
      'new_status', NEW.status
    );
  END IF;
  
  INSERT INTO quote_response_activity_log (response_id, user_id, action_type, details)
  VALUES (NEW.id, NEW.created_by, action_type_val, details_val);
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Triggers para updated_at
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at 
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_responses_updated_at 
  BEFORE UPDATE ON quote_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_response_items_updated_at 
  BEFORE UPDATE ON quote_response_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para calcular preço total do item
CREATE TRIGGER calculate_item_total 
  BEFORE INSERT OR UPDATE ON quote_response_items
  FOR EACH ROW EXECUTE FUNCTION calculate_response_item_total();

-- Trigger para atualizar referência da resposta
CREATE TRIGGER update_quote_reference 
  AFTER INSERT ON quote_responses
  FOR EACH ROW EXECUTE FUNCTION update_quote_response_reference();

-- Trigger para sincronizar status
CREATE TRIGGER sync_response_status 
  AFTER UPDATE ON quote_responses
  FOR EACH ROW 
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION sync_quote_response_status();

-- Trigger para log de atividades
CREATE TRIGGER log_activity 
  AFTER INSERT OR UPDATE ON quote_responses
  FOR EACH ROW EXECUTE FUNCTION log_response_activity();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_response_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_response_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_response_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Organizations: Users can view their own organization
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- User Profiles: Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can view profiles in their organization"
  ON user_profiles FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Quotes: Users can view quotes from their organization
CREATE POLICY "Users can view their organization quotes"
  ON quotes FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create quotes for their organization"
  ON quotes FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their organization quotes"
  ON quotes FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Quote Responses: Users can view responses from their organization
CREATE POLICY "Users can view their organization responses"
  ON quote_responses FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
    OR
    id IN (
      SELECT response_id FROM quote_response_collaborators 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create responses for their organization"
  ON quote_responses FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update responses they created or collaborate on"
  ON quote_responses FOR UPDATE
  USING (
    created_by = auth.uid()
    OR
    id IN (
      SELECT response_id FROM quote_response_collaborators 
      WHERE user_id = auth.uid() AND status = 'active' AND can_edit = true
    )
  );

-- Quote Response Items: Follow response permissions
CREATE POLICY "Users can view items from accessible responses"
  ON quote_response_items FOR SELECT
  USING (
    response_id IN (
      SELECT id FROM quote_responses
      WHERE organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
      OR id IN (
        SELECT response_id FROM quote_response_collaborators 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Users can manage items from editable responses"
  ON quote_response_items FOR ALL
  USING (
    response_id IN (
      SELECT id FROM quote_responses
      WHERE created_by = auth.uid()
      OR id IN (
        SELECT response_id FROM quote_response_collaborators 
        WHERE user_id = auth.uid() AND status = 'active' AND can_edit = true
      )
    )
  );

-- Quote Response Collaborators: Response creator and collaborators can view
CREATE POLICY "Users can view collaborators of accessible responses"
  ON quote_response_collaborators FOR SELECT
  USING (
    response_id IN (
      SELECT id FROM quote_responses WHERE created_by = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Response creators can manage collaborators"
  ON quote_response_collaborators FOR ALL
  USING (
    response_id IN (
      SELECT id FROM quote_responses WHERE created_by = auth.uid()
    )
  );

-- Activity Log: Users can view logs of accessible responses
CREATE POLICY "Users can view activity logs of accessible responses"
  ON quote_response_activity_log FOR SELECT
  USING (
    response_id IN (
      SELECT id FROM quote_responses
      WHERE organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
      OR id IN (
        SELECT response_id FROM quote_response_collaborators 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- Você pode adicionar dados iniciais aqui se necessário
-- Por exemplo, uma organização de teste:

-- INSERT INTO organizations (name, cnpj, email, type)
-- VALUES ('Hospital Exemplo', '12.345.678/0001-90', 'contato@hospital.com', 'hospital');
