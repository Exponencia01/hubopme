-- =====================================================
-- DEBUG: Testar RLS Policies para User Invitations
-- =====================================================

-- 1. Verificar seu user_id atual
SELECT auth.uid() as current_user_id;

-- 2. Verificar se seu perfil existe e qual é sua role
SELECT 
  id,
  organization_id,
  full_name,
  role,
  is_active
FROM profiles
WHERE id = auth.uid();

-- 3. Testar a query que a RLS policy usa
SELECT organization_id 
FROM profiles 
WHERE id = auth.uid() 
AND role IN ('admin', 'supplier_admin');

-- 4. Verificar se você consegue ver convites (SELECT)
SELECT * FROM user_invitations LIMIT 5;

-- 5. Testar se a policy de INSERT está funcionando
-- Esta query deve retornar TRUE se você pode inserir
SELECT 
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'supplier_admin')
  ) as can_create_invitations;

-- 6. Ver detalhes das policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_invitations';

-- =====================================================
-- SOLUÇÃO TEMPORÁRIA: Se as policies não estiverem funcionando
-- =====================================================

-- Desabilitar RLS temporariamente para testar (NÃO RECOMENDADO EM PRODUÇÃO)
-- ALTER TABLE user_invitations DISABLE ROW LEVEL SECURITY;

-- OU criar uma policy mais permissiva temporariamente:
-- DROP POLICY IF EXISTS "Temp allow all for admins" ON user_invitations;
-- CREATE POLICY "Temp allow all for admins"
--   ON user_invitations
--   FOR ALL
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);
