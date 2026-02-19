-- =====================================================
-- MÓDULOS: Médicos, Tabela de Preços e Analytics
-- =====================================================

-- =====================================================
-- MÓDULO 1: MÉDICOS
-- =====================================================

CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Dados Pessoais
  full_name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  rg VARCHAR(20),
  birth_date DATE,
  
  -- Dados Profissionais
  crm VARCHAR(20) NOT NULL,
  crm_uf VARCHAR(2) NOT NULL,
  specialties TEXT[] DEFAULT '{}',
  
  -- Contato
  email VARCHAR(255),
  phone VARCHAR(20),
  mobile VARCHAR(20),
  
  -- Endereço
  address JSONB DEFAULT '{}', -- {street, number, complement, neighborhood, city, state, zip_code}
  
  -- Hospitais/Clínicas onde atua
  hospitals JSONB DEFAULT '[]', -- [{name, city, state}]
  
  -- Relacionamento com Fornecedor
  relationship_type VARCHAR(50) DEFAULT 'active' CHECK (relationship_type IN ('active', 'inactive', 'prospect')),
  relationship_notes TEXT,
  first_contact_date DATE,
  last_contact_date DATE,
  
  -- Preferências e Observações
  preferred_products JSONB DEFAULT '[]', -- IDs ou nomes de produtos preferidos
  notes TEXT,
  
  -- Metadados
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para Médicos
CREATE INDEX idx_doctors_organization_id ON doctors(organization_id);
CREATE INDEX idx_doctors_crm ON doctors(crm, crm_uf);
CREATE INDEX idx_doctors_cpf ON doctors(cpf);
CREATE INDEX idx_doctors_relationship_type ON doctors(relationship_type);
CREATE INDEX idx_doctors_is_active ON doctors(is_active);

-- =====================================================
-- MÓDULO 2: TABELA DE PREÇOS
-- =====================================================

CREATE TABLE price_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificação
  name VARCHAR(255) NOT NULL,
  description TEXT,
  code VARCHAR(50), -- Código interno da tabela
  
  -- Tipo e Categoria
  table_type VARCHAR(50) DEFAULT 'standard' CHECK (table_type IN ('standard', 'promotional', 'special', 'contract')),
  category VARCHAR(100), -- Ex: "OPME Ortopedia", "OPME Cardio"
  
  -- Vigência
  valid_from DATE,
  valid_until DATE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false, -- Tabela padrão para novos orçamentos
  
  -- Metadados
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE price_table_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_table_id UUID NOT NULL REFERENCES price_tables(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Produto
  product_code VARCHAR(100) NOT NULL, -- Código do produto (ANVISA, interno, etc)
  product_name VARCHAR(500) NOT NULL,
  product_description TEXT,
  manufacturer VARCHAR(255),
  
  -- Classificação
  category VARCHAR(100),
  subcategory VARCHAR(100),
  
  -- Unidade e Embalagem
  unit_of_measure VARCHAR(20) DEFAULT 'UN', -- UN, CX, KIT, etc
  package_quantity INTEGER DEFAULT 1,
  
  -- Preços
  cost_price DECIMAL(15,2), -- Preço de custo
  list_price DECIMAL(15,2) NOT NULL, -- Preço de tabela
  min_price DECIMAL(15,2), -- Preço mínimo permitido
  max_discount_percent DECIMAL(5,2) DEFAULT 0, -- Desconto máximo permitido (%)
  
  -- Informações Adicionais
  anvisa_registration VARCHAR(100),
  sus_code VARCHAR(50),
  tuss_code VARCHAR(50),
  ncm VARCHAR(20),
  
  -- Estoque e Disponibilidade
  stock_quantity INTEGER DEFAULT 0,
  lead_time_days INTEGER, -- Prazo de entrega em dias
  is_available BOOLEAN DEFAULT true,
  
  -- Observações
  notes TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para Tabela de Preços
CREATE INDEX idx_price_tables_organization_id ON price_tables(organization_id);
CREATE INDEX idx_price_tables_is_active ON price_tables(is_active);
CREATE INDEX idx_price_tables_valid_dates ON price_tables(valid_from, valid_until);

CREATE INDEX idx_price_table_items_price_table_id ON price_table_items(price_table_id);
CREATE INDEX idx_price_table_items_organization_id ON price_table_items(organization_id);
CREATE INDEX idx_price_table_items_product_code ON price_table_items(product_code);
CREATE INDEX idx_price_table_items_category ON price_table_items(category);
CREATE INDEX idx_price_table_items_is_available ON price_table_items(is_available);

-- =====================================================
-- MÓDULO 3: ANALYTICS
-- =====================================================

CREATE TABLE analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificação
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Tipo de Dashboard
  dashboard_type VARCHAR(50) DEFAULT 'custom' CHECK (dashboard_type IN ('sales', 'quotes', 'products', 'doctors', 'custom')),
  
  -- Configuração
  config JSONB DEFAULT '{}', -- Configurações específicas do dashboard
  embed_url TEXT, -- URL de embed de ferramenta externa (Metabase, Looker, etc)
  
  -- Permissões
  allowed_roles TEXT[] DEFAULT '{admin,supplier_admin}',
  is_public BOOLEAN DEFAULT false,
  
  -- Ordem e Visibilidade
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadados
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para armazenar métricas calculadas (cache)
CREATE TABLE analytics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificação da Métrica
  metric_name VARCHAR(100) NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'count', 'sum', 'avg', 'percentage', etc
  
  -- Período
  period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Valor
  metric_value DECIMAL(15,2) NOT NULL,
  metric_metadata JSONB DEFAULT '{}', -- Dados adicionais da métrica
  
  -- Metadados
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para Analytics
CREATE INDEX idx_analytics_dashboards_organization_id ON analytics_dashboards(organization_id);
CREATE INDEX idx_analytics_dashboards_type ON analytics_dashboards(dashboard_type);
CREATE INDEX idx_analytics_dashboards_is_active ON analytics_dashboards(is_active);

CREATE INDEX idx_analytics_metrics_organization_id ON analytics_metrics(organization_id);
CREATE INDEX idx_analytics_metrics_name ON analytics_metrics(metric_name);
CREATE INDEX idx_analytics_metrics_period ON analytics_metrics(period_type, period_start, period_end);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para updated_at em doctors
CREATE TRIGGER update_doctors_updated_at 
  BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para updated_at em price_tables
CREATE TRIGGER update_price_tables_updated_at 
  BEFORE UPDATE ON price_tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para updated_at em price_table_items
CREATE TRIGGER update_price_table_items_updated_at 
  BEFORE UPDATE ON price_table_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para updated_at em analytics_dashboards
CREATE TRIGGER update_analytics_dashboards_updated_at 
  BEFORE UPDATE ON analytics_dashboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_table_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Policies para DOCTORS
CREATE POLICY "users_view_org_doctors"
  ON doctors FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "users_manage_org_doctors"
  ON doctors FOR ALL
  TO authenticated
  USING (organization_id = public.get_user_organization_id())
  WITH CHECK (organization_id = public.get_user_organization_id());

-- Policies para PRICE_TABLES
CREATE POLICY "users_view_org_price_tables"
  ON price_tables FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "admins_manage_price_tables"
  ON price_tables FOR ALL
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'supplier_admin')
  )
  WITH CHECK (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'supplier_admin')
  );

-- Policies para PRICE_TABLE_ITEMS
CREATE POLICY "users_view_org_price_items"
  ON price_table_items FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "admins_manage_price_items"
  ON price_table_items FOR ALL
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'supplier_admin')
  )
  WITH CHECK (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'supplier_admin')
  );

-- Policies para ANALYTICS_DASHBOARDS
CREATE POLICY "users_view_org_dashboards"
  ON analytics_dashboards FOR SELECT
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id()
    AND (is_public = true OR public.get_user_role() = ANY(allowed_roles))
  );

CREATE POLICY "admins_manage_dashboards"
  ON analytics_dashboards FOR ALL
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'supplier_admin')
  )
  WITH CHECK (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'supplier_admin')
  );

-- Policies para ANALYTICS_METRICS
CREATE POLICY "users_view_org_metrics"
  ON analytics_metrics FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "system_manage_metrics"
  ON analytics_metrics FOR ALL
  TO authenticated
  USING (organization_id = public.get_user_organization_id())
  WITH CHECK (organization_id = public.get_user_organization_id());
