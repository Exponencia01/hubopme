-- =====================================================
-- DEBUG: Por que não aparecem usuários e convites?
-- =====================================================

-- 1. Verificar seu contexto (quem você é)
SELECT 
  auth.uid() as my_user_id,
  p.id,
  p.organization_id,
  p.full_name,
  p.role,
  p.is_active
FROM profiles p
WHERE p.id = auth.uid();

-- 2. Contar usuários da sua organização
SELECT COUNT(*) as total_users
FROM profiles
WHERE organization_id = (
  SELECT organization_id FROM profiles WHERE id = auth.uid()
);

-- 3. Listar usuários da sua organização
SELECT 
  id,
  full_name,
  role,
  is_active,
  created_at
FROM profiles
WHERE organization_id = (
  SELECT organization_id FROM profiles WHERE id = auth.uid()
)
ORDER BY created_at DESC;

-- 4. Contar convites da sua organização
SELECT COUNT(*) as total_invitations
FROM user_invitations
WHERE organization_id = (
  SELECT organization_id FROM profiles WHERE id = auth.uid()
);

-- 5. Listar convites da sua organização
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  expires_at,
  created_at
FROM user_invitations
WHERE organization_id = (
  SELECT organization_id FROM profiles WHERE id = auth.uid()
)
ORDER BY created_at DESC;

-- 6. Verificar RLS na tabela profiles
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- 7. Ver policies da tabela profiles
SELECT 
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =====================================================
-- POSSÍVEL SOLUÇÃO: Adicionar policy para profiles
-- =====================================================

-- Se a tabela profiles não tiver policy para usuários verem
-- outros usuários da mesma organização, adicione:

CREATE POLICY IF NOT EXISTS "Users can view organization members"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );
