-- =====================================================
-- SOLUÇÃO IMEDIATA: Corrigir Recursão Infinita RLS
-- Execute este script AGORA no SQL Editor do Supabase
-- =====================================================

-- PASSO 1: Remover políticas problemáticas
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- PASSO 2: Criar políticas simples e corretas
CREATE POLICY "Enable read access for users to own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Enable update for users to own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- PASSO 3: Verificar se funcionou
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- PASSO 4: Testar a query que estava falhando
SELECT 
  p.*,
  o.name as organization_name
FROM profiles p
LEFT JOIN organizations o ON o.id = p.organization_id
WHERE p.id = auth.uid();
