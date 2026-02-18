-- =====================================================
-- SISTEMA MODULAR POR ORGANIZAÇÃO
-- =====================================================

-- Tabela de Módulos Disponíveis no Sistema
CREATE TABLE system_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  requires_modules VARCHAR(50)[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Módulos Habilitados por Organização
CREATE TABLE organization_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  module_code VARCHAR(50) NOT NULL REFERENCES system_modules(code) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  enabled_at TIMESTAMPTZ DEFAULT NOW(),
  enabled_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, module_code)
);

-- Índices
CREATE INDEX idx_organization_modules_org ON organization_modules(organization_id);
CREATE INDEX idx_organization_modules_code ON organization_modules(module_code);
CREATE INDEX idx_organization_modules_enabled ON organization_modules(organization_id, is_enabled);

-- Inserir módulos padrão do sistema
INSERT INTO system_modules (code, name, description, icon, is_active) VALUES
  ('quotes', 'Cotações', 'Gerenciamento de cotações e pedidos de OPME', 'FileText', true),
  ('responses', 'Respostas', 'Responder cotações de hospitais e clínicas', 'MessageSquare', true),
  ('products', 'Produtos', 'Catálogo de produtos OPME', 'Package', true),
  ('inventory', 'Estoque', 'Controle de estoque e disponibilidade', 'Warehouse', true),
  ('pricing', 'Precificação', 'Gestão de preços e tabelas', 'DollarSign', true),
  ('customers', 'Clientes', 'Gestão de hospitais e clínicas (clientes)', 'Users', true),
  ('suppliers', 'Fornecedores', 'Gestão de fornecedores e fabricantes', 'Truck', true),
  ('reports', 'Relatórios', 'Relatórios e análises', 'BarChart', true),
  ('integrations', 'Integrações', 'Integrações com portais externos (OPMEnexo, Inpart)', 'Plug', true),
  ('settings', 'Configurações', 'Configurações da organização', 'Settings', true);

-- RLS para system_modules (todos podem ver)
ALTER TABLE system_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view system modules"
  ON system_modules FOR SELECT
  TO authenticated
  USING (true);

-- RLS para organization_modules
ALTER TABLE organization_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization modules"
  ON organization_modules FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage organization modules"
  ON organization_modules FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_system_modules_updated_at 
  BEFORE UPDATE ON system_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_modules_updated_at 
  BEFORE UPDATE ON organization_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para habilitar módulos padrão para nova organização
CREATE OR REPLACE FUNCTION enable_default_modules_for_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- Habilitar módulos essenciais automaticamente
  INSERT INTO organization_modules (organization_id, module_code, is_enabled)
  SELECT NEW.id, code, true
  FROM system_modules
  WHERE code IN ('quotes', 'responses', 'products', 'customers', 'settings')
  ON CONFLICT (organization_id, module_code) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para habilitar módulos ao criar organização
CREATE TRIGGER enable_default_modules_trigger
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION enable_default_modules_for_organization();

-- View para facilitar consulta de módulos habilitados
CREATE OR REPLACE VIEW v_organization_modules AS
SELECT 
  om.id,
  om.organization_id,
  om.module_code,
  sm.name as module_name,
  sm.description as module_description,
  sm.icon as module_icon,
  om.is_enabled,
  om.settings,
  om.enabled_at,
  sm.requires_modules
FROM organization_modules om
JOIN system_modules sm ON sm.code = om.module_code
WHERE sm.is_active = true;

-- Verificar módulos criados
SELECT * FROM system_modules ORDER BY name;
