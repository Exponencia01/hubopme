-- =====================================================
-- ANÁLISE COMPLETA E FIX DEFINITIVO
-- =====================================================

-- PROBLEMA RAIZ IDENTIFICADO:
-- O schema original usa "user_profiles" mas o código TypeScript usa "profiles"
-- Isso está causando confusão e erros de permissão

-- PASSO 1: Verificar qual tabela realmente existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'user_profiles')
ORDER BY table_name;

-- PASSO 2: Verificar se existe um VIEW chamado 'profiles'
SELECT 
  table_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name = 'profiles';

-- PASSO 3: Ver todas as policies atuais
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_profiles', 'user_invitations')
ORDER BY tablename, policyname;

-- =====================================================
-- SOLUÇÃO: Criar VIEW 'profiles' apontando para 'user_profiles'
-- =====================================================

-- Se a tabela real é 'user_profiles' mas o código usa 'profiles',
-- criar um VIEW para compatibilidade
DROP VIEW IF EXISTS profiles CASCADE;

CREATE VIEW profiles AS
SELECT * FROM user_profiles;

-- Dar permissões no VIEW
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO anon;

-- =====================================================
-- REMOVER TODAS AS POLICIES ANTIGAS
-- =====================================================

-- Remover policies de user_invitations
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

-- Remover policies problemáticas de user_profiles
DROP POLICY IF EXISTS "Users view org members" ON user_profiles;

-- =====================================================
-- CRIAR POLICIES CORRETAS PARA user_profiles
-- =====================================================

-- 1. Usuários podem ver seu próprio perfil
CREATE POLICY "view_own_profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- 2. Usuários podem ver perfis da mesma organização
-- Usando CTE para evitar recursão
CREATE POLICY "view_org_profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      WITH user_org AS (
        SELECT organization_id 
        FROM user_profiles 
        WHERE id = auth.uid()
        LIMIT 1
      )
      SELECT organization_id FROM user_org
    )
  );

-- =====================================================
-- CRIAR POLICIES CORRETAS PARA user_invitations
-- =====================================================

-- 1. Admins podem ver convites da organização
CREATE POLICY "admins_view_invitations"
  ON user_invitations FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT up.organization_id 
      FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'supplier_admin')
    )
  );

-- 2. Admins podem criar convites
CREATE POLICY "admins_create_invitations"
  ON user_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT up.organization_id 
      FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'supplier_admin')
    )
  );

-- 3. Admins podem atualizar convites
CREATE POLICY "admins_update_invitations"
  ON user_invitations FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT up.organization_id 
      FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'supplier_admin')
    )
  );

-- 4. Acesso público por token (para página de aceitação)
-- IMPORTANTE: Esta policy permite acesso anônimo
CREATE POLICY "public_view_by_token"
  ON user_invitations FOR SELECT
  TO anon, authenticated
  USING (
    status = 'pending'
    AND expires_at > NOW()
    AND invitation_token IS NOT NULL
  );

-- 5. Usuários podem ver convites enviados para seu email
CREATE POLICY "users_view_own_invitations"
  ON user_invitations FOR SELECT
  TO authenticated
  USING (
    email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Ver policies criadas
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_invitations')
ORDER BY tablename, policyname;

-- Testar queries
SELECT 'user_profiles count:' as test, COUNT(*)::text as result FROM user_profiles
UNION ALL
SELECT 'user_invitations count:' as test, COUNT(*)::text as result FROM user_invitations;
