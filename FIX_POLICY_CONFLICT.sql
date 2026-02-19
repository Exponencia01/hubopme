-- =====================================================
-- FIX: Remover policy temporária que causa conflito
-- =====================================================

-- Remover a policy temporária
DROP POLICY IF EXISTS "Temp allow all for authenticated" ON user_invitations;

-- Verificar se a remoção funcionou
SELECT 
  policyname,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'user_invitations'
ORDER BY policyname;
