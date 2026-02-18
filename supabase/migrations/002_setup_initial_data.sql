-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO INICIAL
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. CRIAR SUA ORGANIZAÇÃO
-- Substitua os valores abaixo com os dados reais da sua organização

INSERT INTO organizations (
  name,
  cnpj,
  email,
  phone,
  type,
  status,
  address
) VALUES (
  'Minha Organização',                    -- Nome da sua organização
  '00.000.000/0001-00',                   -- CNPJ da sua organização
  'contato@minhaorganizacao.com',         -- E-mail da organização
  '(11) 99999-9999',                      -- Telefone (opcional)
  'hospital',                             -- Tipo: 'hospital', 'clinic' ou 'supplier'
  'active',                               -- Status
  '{"street": "Rua Exemplo", "number": "123", "city": "São Paulo", "state": "SP", "zip": "01234-567"}'::jsonb
) 
ON CONFLICT (cnpj) DO NOTHING
RETURNING id;

-- Anote o ID retornado acima, você vai precisar dele!

-- =====================================================
-- 2. VINCULAR SEU USUÁRIO À ORGANIZAÇÃO
-- =====================================================

-- Primeiro, vamos verificar o ID do seu usuário
-- Execute esta query para ver seu user_id:
-- SELECT id, email FROM auth.users WHERE email = 'seu@email.com';

-- Depois, insira seu perfil na tabela profiles
-- IMPORTANTE: Substitua 'SEU_USER_ID' e 'ORGANIZATION_ID' pelos valores corretos

INSERT INTO profiles (
  id,                                     -- ID do usuário (mesmo da tabela auth.users)
  organization_id,                        -- ID da organização criada acima
  full_name,
  role,
  phone,
  is_active
) VALUES (
  'SEU_USER_ID'::uuid,                   -- Substitua pelo ID do auth.users
  'ORGANIZATION_ID'::uuid,                -- Substitua pelo ID da organization
  'Seu Nome Completo',                    -- Seu nome
  'admin',                                -- Role: 'admin', 'buyer', 'specialist', 'reviewer', 'supplier_admin', 'supplier_user'
  '(11) 98765-4321',                      -- Seu telefone (opcional)
  true
)
ON CONFLICT (id) DO UPDATE SET
  organization_id = EXCLUDED.organization_id,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Execute estas queries para verificar se tudo está correto:

-- Ver todas as organizações
SELECT id, name, cnpj, type, status FROM organizations;

-- Ver todos os perfis
SELECT 
  p.id,
  p.full_name,
  p.role,
  o.name as organization_name,
  u.email
FROM profiles p
JOIN organizations o ON p.organization_id = o.id
JOIN auth.users u ON p.id = u.id;
