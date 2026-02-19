-- =====================================================
-- FIX FINAL: Corrigir todas as policies de uma vez
-- =====================================================

-- O erro "permission denied for table users" indica que as policies
-- não foram criadas corretamente ou não estão funcionando.

-- PASSO 1: Remover TODAS as policies antigas
DROP POLICY IF EXISTS "Admins can view organization invitations" ON user_invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON user_invitations;
DROP POLICY IF EXISTS "Admins can update organization invitations" ON user_invitations;
DROP POLICY IF EXISTS "Users can view their own invitations" ON user_invitations;
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON user_invitations;
DROP POLICY IF EXISTS "Temp allow all for authenticated" ON user_invitations;

-- PASSO 2: Criar policies corretas para user_invitations

-- 1. Admins podem ver convites da sua organização
CREATE POLICY "Admins view org invitations"
  ON user_invitations FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'supplier_admin')
    )
  );

-- 2. Admins podem criar convites
CREATE POLICY "Admins create invitations"
  ON user_invitations FOR INSERT
  WITH CHECK (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'supplier_admin')
    )
  );

-- 3. Admins podem atualizar convites
CREATE POLICY "Admins update org invitations"
  ON user_invitations FOR UPDATE
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'supplier_admin')
    )
  );

-- 4. Qualquer pessoa pode ver convite por token (para página de aceitação)
CREATE POLICY "Public view by token"
  ON user_invitations FOR SELECT
  USING (
    status = 'pending'
    AND expires_at > NOW()
    AND invitation_token IS NOT NULL
  );

-- 5. Usuários podem ver convites enviados para seu email
CREATE POLICY "Users view own invitations"
  ON user_invitations FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- PASSO 3: Adicionar policy para profiles (ver usuários da organização)
-- Necessário para a lista de usuários funcionar

-- Remover se já existir
DROP POLICY IF EXISTS "Users view org members" ON profiles;

-- Criar policy
CREATE POLICY "Users view org members"
  ON profiles FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- PASSO 4: Verificar resultado
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('user_invitations', 'profiles')
ORDER BY tablename, policyname;

-- PASSO 5: Testar se funciona
SELECT COUNT(*) as invitations_count FROM user_invitations;
SELECT COUNT(*) as users_count FROM profiles;
