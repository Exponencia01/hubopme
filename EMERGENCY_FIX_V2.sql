-- =====================================================
-- EMERGENCY FIX V2 - Funções no schema public
-- =====================================================

-- PASSO 3: Criar funções no schema PUBLIC (não auth)
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
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

-- PASSO 5: Criar policies usando as funções
CREATE POLICY "profiles_select"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR organization_id = public.get_user_organization_id()
  );

CREATE POLICY "invitations_select_admin"
  ON user_invitations FOR SELECT
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'supplier_admin')
  );

CREATE POLICY "invitations_insert_admin"
  ON user_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'supplier_admin')
  );

CREATE POLICY "invitations_update_admin"
  ON user_invitations FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'supplier_admin')
  );

CREATE POLICY "invitations_select_public"
  ON user_invitations FOR SELECT
  TO anon, authenticated
  USING (
    status = 'pending'
    AND expires_at > NOW()
  );

-- VERIFICAÇÃO
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('profiles', 'user_invitations')
ORDER BY tablename, policyname;
