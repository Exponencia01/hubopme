-- =====================================================
-- EMERGENCY FIX - Remover recursão completamente
-- =====================================================

-- PASSO 1: DESABILITAR RLS temporariamente para permitir login
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Remover TODAS as policies
DROP POLICY IF EXISTS "view_own_profile" ON profiles;
DROP POLICY IF EXISTS "view_org_profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "admins_view_invitations" ON user_invitations;
DROP POLICY IF EXISTS "admins_create_invitations" ON user_invitations;
DROP POLICY IF EXISTS "admins_update_invitations" ON user_invitations;
DROP POLICY IF EXISTS "public_view_by_token" ON user_invitations;
DROP POLICY IF EXISTS "users_view_own_invitations" ON user_invitations;

-- PASSO 3: Criar função helper para evitar recursão
CREATE OR REPLACE FUNCTION auth.user_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- PASSO 4: Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Criar policies SIMPLES usando as funções
CREATE POLICY "profiles_select"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR organization_id = auth.user_organization_id()
  );

CREATE POLICY "invitations_select_admin"
  ON user_invitations FOR SELECT
  TO authenticated
  USING (
    organization_id = auth.user_organization_id()
    AND auth.user_role() IN ('admin', 'supplier_admin')
  );

CREATE POLICY "invitations_insert_admin"
  ON user_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = auth.user_organization_id()
    AND auth.user_role() IN ('admin', 'supplier_admin')
  );

CREATE POLICY "invitations_update_admin"
  ON user_invitations FOR UPDATE
  TO authenticated
  USING (
    organization_id = auth.user_organization_id()
    AND auth.user_role() IN ('admin', 'supplier_admin')
  );

CREATE POLICY "invitations_select_public"
  ON user_invitations FOR SELECT
  TO anon, authenticated
  USING (
    status = 'pending'
    AND expires_at > NOW()
  );

-- VERIFICAÇÃO
SELECT 'Policies criadas:' as status;
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('profiles', 'user_invitations')
ORDER BY tablename, policyname;
