-- =====================================================
-- MELHORIAS NO MÓDULO DE COTAÇÕES
-- =====================================================

-- Adicionar novos campos à tabela quotes
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS hospital_name TEXT,
  ADD COLUMN IF NOT EXISTS hospital_cnpj VARCHAR(18),
  ADD COLUMN IF NOT EXISTS billing_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'pending' 
    CHECK (billing_status IN ('pending', 'authorized', 'billed', 'pending_items')),
  ADD COLUMN IF NOT EXISTS total_value DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS billed_value DECIMAL(15,2) DEFAULT 0;

-- Criar tabela para histórico de ações da cotação
CREATE TABLE IF NOT EXISTS quote_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Ação realizada
  action_type TEXT NOT NULL CHECK (action_type IN (
    'budgeted',           -- Orçado
    'authorized',         -- Autorizado
    'used_supplier',      -- Utilizado (Fornecedor)
    'usage_confirmed',    -- Confirmada a Utilização (Comprador)
    'billing_authorized', -- Faturamento Autorizado (Comprador)
    'billed',            -- Faturado
    'billing_pending',   -- Pendente de Faturamento
    'created',           -- Criado
    'updated',           -- Atualizado
    'cancelled',         -- Cancelado
    'comment'            -- Comentário
  )),
  
  -- Detalhes da ação
  description TEXT,
  metadata JSONB DEFAULT '{}', -- Dados adicionais da ação
  
  -- Quem realizou a ação
  performed_by UUID REFERENCES profiles(id),
  performed_by_name TEXT,
  performed_by_role TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para quote_history
CREATE INDEX idx_quote_history_quote_id ON quote_history(quote_id);
CREATE INDEX idx_quote_history_action_type ON quote_history(action_type);
CREATE INDEX idx_quote_history_created_at ON quote_history(quote_id, created_at DESC);

-- Criar tabela para anexos descritivos
CREATE TABLE IF NOT EXISTS quote_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Tipo de anexo
  attachment_type TEXT NOT NULL CHECK (attachment_type IN (
    'pre_surgical',      -- Pré-cirúrgico
    'post_surgical',     -- Pós-cirúrgico
    'billing_evidence',  -- Evidência de faturamento
    'authorization',     -- Autorização
    'invoice',          -- Nota fiscal
    'receipt',          -- Recibo
    'medical_report',   -- Relatório médico
    'other'             -- Outro
  )),
  
  -- Dados do arquivo
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  
  -- Descrição e contexto
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Relacionamento com etapa
  related_action TEXT, -- Relacionado a qual ação do histórico
  
  -- Quem anexou
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_by_name TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para quote_attachments
CREATE INDEX idx_quote_attachments_quote_id ON quote_attachments(quote_id);
CREATE INDEX idx_quote_attachments_type ON quote_attachments(attachment_type);
CREATE INDEX idx_quote_attachments_created_at ON quote_attachments(created_at DESC);

-- Criar tabela para itens de faturamento pendentes
CREATE TABLE IF NOT EXISTS quote_billing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Dados do item
  product_name TEXT NOT NULL,
  product_code TEXT,
  
  -- Quantidades
  quantity_budgeted INTEGER NOT NULL DEFAULT 0,
  quantity_authorized INTEGER DEFAULT 0,
  quantity_used INTEGER DEFAULT 0,
  quantity_billed INTEGER DEFAULT 0,
  
  -- Preços
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_budgeted DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_authorized DECIMAL(15,2) DEFAULT 0,
  total_used DECIMAL(15,2) DEFAULT 0,
  total_billed DECIMAL(15,2) DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',           -- Pendente
    'partially_billed',  -- Parcialmente faturado
    'fully_billed',      -- Totalmente faturado
    'cancelled'          -- Cancelado
  )),
  
  -- Observações
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para quote_billing_items
CREATE INDEX idx_quote_billing_items_quote_id ON quote_billing_items(quote_id);
CREATE INDEX idx_quote_billing_items_status ON quote_billing_items(status);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quote_attachments_updated_at
  BEFORE UPDATE ON quote_attachments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_billing_items_updated_at
  BEFORE UPDATE ON quote_billing_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE quote_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_billing_items ENABLE ROW LEVEL SECURITY;

-- Policies para quote_history
CREATE POLICY "users_view_org_quote_history"
  ON quote_history FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "users_create_quote_history"
  ON quote_history FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = public.get_user_organization_id());

-- Policies para quote_attachments
CREATE POLICY "users_view_org_attachments"
  ON quote_attachments FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "users_manage_attachments"
  ON quote_attachments FOR ALL
  TO authenticated
  USING (organization_id = public.get_user_organization_id())
  WITH CHECK (organization_id = public.get_user_organization_id());

-- Policies para quote_billing_items
CREATE POLICY "users_view_org_billing_items"
  ON quote_billing_items FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "users_manage_billing_items"
  ON quote_billing_items FOR ALL
  TO authenticated
  USING (organization_id = public.get_user_organization_id())
  WITH CHECK (organization_id = public.get_user_organization_id());

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para adicionar ação ao histórico
CREATE OR REPLACE FUNCTION add_quote_history(
  p_quote_id UUID,
  p_action_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_history_id UUID;
  v_user_profile RECORD;
BEGIN
  -- Buscar dados do usuário atual
  SELECT id, full_name, role INTO v_user_profile
  FROM profiles
  WHERE id = auth.uid();
  
  -- Inserir histórico
  INSERT INTO quote_history (
    quote_id,
    organization_id,
    action_type,
    description,
    metadata,
    performed_by,
    performed_by_name,
    performed_by_role
  )
  SELECT
    p_quote_id,
    q.organization_id,
    p_action_type,
    p_description,
    p_metadata,
    v_user_profile.id,
    v_user_profile.full_name,
    v_user_profile.role
  FROM quotes q
  WHERE q.id = p_quote_id
  RETURNING id INTO v_history_id;
  
  RETURN v_history_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular pendências de faturamento
CREATE OR REPLACE FUNCTION calculate_billing_pending(p_quote_id UUID)
RETURNS TABLE (
  total_items INTEGER,
  pending_items INTEGER,
  total_value DECIMAL,
  billed_value DECIMAL,
  pending_value DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_items,
    COUNT(*) FILTER (WHERE status IN ('pending', 'partially_billed'))::INTEGER as pending_items,
    COALESCE(SUM(total_used), 0) as total_value,
    COALESCE(SUM(total_billed), 0) as billed_value,
    COALESCE(SUM(total_used - total_billed), 0) as pending_value
  FROM quote_billing_items
  WHERE quote_id = p_quote_id;
END;
$$ LANGUAGE plpgsql;
