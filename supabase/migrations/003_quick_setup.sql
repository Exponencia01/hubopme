-- =====================================================
-- SETUP RÁPIDO - Cole seus dados e execute
-- =====================================================

-- PASSO 1: Descubra seu USER_ID
-- Execute esta query primeiro para pegar seu ID:
SELECT id as user_id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- PASSO 2: Crie sua organização e perfil de uma vez
-- Substitua apenas os valores entre aspas simples abaixo:

DO $$
DECLARE
  v_org_id UUID;
  v_user_id UUID := 'COLE_SEU_USER_ID_AQUI'::uuid; -- Pegue da query acima
BEGIN
  -- Criar organização
  INSERT INTO organizations (
    name,
    cnpj,
    email,
    phone,
    type,
    status
  ) VALUES (
    'Hospital Exemplo',              -- MUDE: Nome da sua organização
    '12.345.678/0001-90',           -- MUDE: CNPJ da organização
    'contato@hospital.com',         -- MUDE: E-mail da organização
    '(11) 3333-4444',               -- MUDE: Telefone
    'hospital',                     -- hospital, clinic ou supplier
    'active'
  )
  ON CONFLICT (cnpj) DO UPDATE 
  SET name = EXCLUDED.name
  RETURNING id INTO v_org_id;

  RAISE NOTICE 'Organização criada com ID: %', v_org_id;

  -- Criar/atualizar perfil do usuário
  INSERT INTO profiles (
    id,
    organization_id,
    full_name,
    role,
    phone,
    is_active
  ) VALUES (
    v_user_id,
    v_org_id,
    'Seu Nome Completo',            -- MUDE: Seu nome
    'admin',                        -- admin, buyer, specialist, reviewer
    '(11) 98765-4321',              -- MUDE: Seu telefone
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    organization_id = EXCLUDED.organization_id,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    updated_at = NOW();

  RAISE NOTICE 'Perfil criado/atualizado para user_id: %', v_user_id;
END $$;

-- PASSO 3: Verificar se deu certo
SELECT 
  u.email,
  p.full_name,
  p.role,
  o.name as organization_name,
  o.cnpj,
  p.is_active
FROM profiles p
JOIN auth.users u ON p.id = u.id
JOIN organizations o ON p.organization_id = o.id
ORDER BY p.created_at DESC;
