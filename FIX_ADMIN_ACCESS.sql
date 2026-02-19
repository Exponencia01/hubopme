-- =====================================================
-- FIX: Restaurar acesso de admins mantendo acesso público
-- =====================================================

-- O problema: As policies de admin verificam auth.uid() mas podem não estar
-- funcionando corretamente. Vamos verificar e recriar se necessário.

-- 1. Verificar seu user_id e perfil
SELECT 
  auth.uid() as my_user_id,
  p.id,
  p.organization_id,
  p.full_name,
  p.role
FROM profiles p
WHERE p.id = auth.uid();

-- 2. Testar se você consegue ver convites (deve retornar dados)
SELECT COUNT(*) as total_invitations
FROM user_invitations
WHERE organization_id IN (
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'supplier_admin')
);

-- 3. Testar se você consegue ver usuários (deve retornar dados)
SELECT COUNT(*) as total_users
FROM profiles
WHERE organization_id IN (
  SELECT organization_id 
  FROM profiles 
  WHERE id = auth.uid()
);

-- =====================================================
-- SOLUÇÃO: Recriar policies de admin
-- =====================================================

-- Remover policies antigas de admin
DROP POLICY IF EXISTS "Admins can view organization invitations" ON user_invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON user_invitations;
DROP POLICY IF EXISTS "Admins can update organization invitations" ON user_invitations;

-- Recriar policy de visualização para admins (mais simples e direta)
CREATE POLICY "Admins can view organization invitations"
  ON user_invitations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = user_invitations.organization_id
      AND profiles.role IN ('admin', 'supplier_admin')
    )
  );

-- Recriar policy de criação para admins
CREATE POLICY "Admins can create invitations"
  ON user_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = user_invitations.organization_id
      AND profiles.role IN ('admin', 'supplier_admin')
    )
  );

-- Recriar policy de atualização para admins
CREATE POLICY "Admins can update organization invitations"
  ON user_invitations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = user_invitations.organization_id
      AND profiles.role IN ('admin', 'supplier_admin')
    )
  );

-- 4. Verificar se as policies foram recriadas
SELECT 
  policyname,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'user_invitations'
ORDER BY policyname;

-- 5. Testar novamente se você consegue ver convites
SELECT 
  id,
  email,
  full_name,
  status,
  created_at
FROM user_invitations
ORDER BY created_at DESC
LIMIT 5;
