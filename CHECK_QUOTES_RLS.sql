-- =====================================================
-- VERIFICAR E CORRIGIR RLS DA TABELA QUOTES
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. Verificar políticas RLS existentes na tabela quotes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'quotes'
ORDER BY policyname;

-- 2. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'quotes';

-- 3. Criar políticas RLS corretas para a tabela quotes
-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view quotes in their organization" ON quotes;
DROP POLICY IF EXISTS "Users can view all quotes" ON quotes;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON quotes;

-- Criar política para permitir que usuários vejam cotações da sua organização
CREATE POLICY "Users can view quotes for their organization"
  ON quotes FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 4. Verificar se funcionou
SELECT 
  id,
  pedido_id,
  titulo,
  patient_name,
  status,
  organization_id,
  created_at
FROM quotes
ORDER BY created_at DESC
LIMIT 10;
