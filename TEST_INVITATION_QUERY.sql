-- =====================================================
-- TESTE: Verificar se a policy está funcionando
-- =====================================================

-- 1. Verificar se a policy foi criada
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_invitations'
ORDER BY policyname;

-- 2. Listar todos os convites pendentes (para pegar um token de teste)
SELECT 
  id,
  email,
  full_name,
  invitation_token,
  status,
  expires_at,
  created_at
FROM user_invitations
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 5;

-- 3. Testar query específica por token (SUBSTITUA O TOKEN)
-- Copie um invitation_token da query acima e cole abaixo
SELECT *
FROM user_invitations
WHERE invitation_token = 'COLE_O_TOKEN_AQUI'
  AND status = 'pending'
  AND expires_at > NOW();

-- 4. Verificar RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'user_invitations';

-- =====================================================
-- SOLUÇÃO ALTERNATIVA: Se a policy não estiver funcionando
-- =====================================================

-- Opção 1: Recriar a policy (execute se necessário)
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON user_invitations;

CREATE POLICY "Anyone can view invitation by token"
  ON user_invitations FOR SELECT
  TO anon, authenticated
  USING (
    invitation_token IS NOT NULL
    AND status = 'pending'
    AND expires_at > NOW()
  );

-- Opção 2: Verificar se há conflito com outras policies
-- Se houver, pode ser necessário ajustar a ordem ou combinar as policies
