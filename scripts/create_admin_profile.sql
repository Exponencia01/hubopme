-- Script para criar perfil de administrador inicial
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, crie uma organização (se ainda não existir)
INSERT INTO organizations (
  id,
  name,
  type,
  document,
  email,
  phone,
  is_active
) VALUES (
  gen_random_uuid(),
  'Minha Organização', -- ALTERE AQUI
  'hospital', -- ou 'supplier'
  '00.000.000/0001-00', -- ALTERE AQUI
  'contato@empresa.com', -- ALTERE AQUI
  '(11) 3333-4444', -- ALTERE AQUI
  true
)
ON CONFLICT (document) DO NOTHING
RETURNING id;

-- 2. Depois, crie seu perfil de admin
-- IMPORTANTE: Substitua 'SEU_USER_ID' pelo ID do seu usuário autenticado
-- Você pode encontrar seu user_id em: Authentication > Users no Supabase Dashboard

INSERT INTO user_profiles (
  id,
  organization_id,
  full_name,
  role,
  phone,
  is_active
) VALUES (
  'SEU_USER_ID', -- ALTERE AQUI: Cole o UUID do seu usuário
  (SELECT id FROM organizations WHERE email = 'contato@empresa.com' LIMIT 1), -- Deve corresponder ao email acima
  'Seu Nome Completo', -- ALTERE AQUI
  'admin',
  '(11) 98765-4321', -- ALTERE AQUI
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true;

-- 3. Verificar se foi criado corretamente
SELECT 
  up.id,
  up.full_name,
  up.role,
  o.name as organization_name
FROM user_profiles up
JOIN organizations o ON o.id = up.organization_id
WHERE up.id = 'SEU_USER_ID'; -- ALTERE AQUI
