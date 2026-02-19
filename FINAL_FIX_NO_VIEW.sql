-- =====================================================
-- FIX DEFINITIVO - SEM CRIAR VIEW
-- =====================================================

-- IMPORTANTE: 'profiles' já existe como tabela, não precisamos criar view

-- PARTE 1: Limpar TODAS as policies antigas
DROP POLICY IF EXISTS "Admins can view organization invitations" ON user_invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON user_invitations;
DROP POLICY IF EXISTS "Admins can update organization invitations" ON user_invitations;
DROP POLICY IF EXISTS "Users can view their own invitations" ON user_invitations;
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON user_invitations;
DROP POLICY IF EXISTS "Temp allow all for authenticated" ON user_invitations;
DROP POLICY IF EXISTS "Admins view org invitations" ON user_invitations;
DROP POLICY IF EXISTS "Admins create invitations" ON user_invitations;
DROP POLICY IF EXISTS "Admins update org invitations" ON user_invitations;
DROP POLICY IF EXISTS "Public view by token" ON user_invitations;
DROP POLICY IF EXISTS "Users view own invitations" ON user_invitations;
DROP POLICY IF EXISTS "Users view org members" ON profiles;
DROP POLICY IF EXISTS "Authenticated users view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;

-- PARTE 2: Criar policies corretas para PROFILES
CREATE POLICY "view_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "view_org_profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.id = auth.uid()
      AND p2.organization_id = profiles.organization_id
    )
  );

-- PARTE 3: Criar policies corretas para USER_INVITATIONS
CREATE POLICY "admins_view_invitations"
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

CREATE POLICY "admins_create_invitations"
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

CREATE POLICY "admins_update_invitations"
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

CREATE POLICY "public_view_by_token"
  ON user_invitations FOR SELECT
  TO anon, authenticated
  USING (
    status = 'pending'
    AND expires_at > NOW()
    AND invitation_token IS NOT NULL
  );

CREATE POLICY "users_view_own_invitations"
  ON user_invitations FOR SELECT
  TO authenticated
  USING (
    email IN (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- VERIFICAÇÃO FINAL
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_invitations')
ORDER BY tablename, policyname;

-- Testar se funciona
SELECT 'profiles count:' as test, COUNT(*)::text as result FROM profiles
UNION ALL
SELECT 'invitations count:' as test, COUNT(*)::text as result FROM user_invitations;
