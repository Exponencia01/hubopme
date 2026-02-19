-- =====================================================
-- FIX: Infinite recursion in profiles policy
-- =====================================================

-- O erro "infinite recursion detected in policy for relation profiles"
-- acontece porque a policy está fazendo SELECT em profiles dentro
-- da própria policy de profiles, criando um loop infinito.

-- SOLUÇÃO: Remover a policy problemática e criar uma mais simples

-- Remover policy que causa recursão
DROP POLICY IF EXISTS "Users view org members" ON profiles;

-- Criar policy SEM subquery que referencia a mesma tabela
-- Opção 1: Permitir que usuários autenticados vejam todos os perfis
-- (mais simples, mas menos seguro)
CREATE POLICY "Authenticated users view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- OU

-- Opção 2: Usar uma função para evitar recursão
-- Primeiro, criar função que retorna organization_id do usuário atual
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Depois, usar a função na policy
DROP POLICY IF EXISTS "Authenticated users view profiles" ON profiles;

CREATE POLICY "Users view org members"
  ON profiles FOR SELECT
  TO authenticated
  USING (organization_id = get_user_organization_id());

-- Verificar policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';

-- Testar se funciona
SELECT COUNT(*) FROM profiles;
