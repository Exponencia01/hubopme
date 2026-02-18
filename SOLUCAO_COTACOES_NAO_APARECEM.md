# 🔧 Solução: Cotações Não Aparecem

## 🎯 Problema Identificado

As cotações foram criadas na tabela `quotes`, mas a aplicação estava buscando da tabela antiga `quotation_requests`.

## ✅ Correções Aplicadas

### **1. API Atualizada** ✅
- Arquivo `src/lib/api.ts` corrigido
- Agora busca da tabela `quotes` (estrutura OPMEnexo)
- Queries simplificadas

### **2. Próximo Passo: Verificar RLS**

Execute este script no SQL Editor do Supabase para verificar e corrigir as políticas RLS:

```sql
-- Verificar políticas existentes
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'quotes';

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view quotes in their organization" ON quotes;
DROP POLICY IF EXISTS "Users can view all quotes" ON quotes;

-- Criar política correta
CREATE POLICY "Users can view quotes for their organization"
  ON quotes FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Testar se funciona
SELECT 
  id,
  pedido_id,
  titulo,
  patient_name,
  status
FROM quotes
ORDER BY created_at DESC
LIMIT 10;
```

## 🚀 Passos para Resolver

### **Passo 1: Executar Script RLS**
1. Copie o script acima
2. Cole no SQL Editor do Supabase
3. Execute

### **Passo 2: Recarregar Aplicação**
1. Volte para o navegador
2. Pressione **Ctrl+R** para recarregar
3. Vá em **Cotações** no menu

### **Passo 3: Verificar**
- As 10 cotações devem aparecer na lista
- Se não aparecer, abra o Console (F12) e veja os erros

## 🐛 Troubleshooting

### **Ainda não aparece?**

Execute esta query para verificar se as cotações existem:

```sql
SELECT COUNT(*) as total_cotacoes
FROM quotes
WHERE organization_id = '81463c26-2b9d-4b59-8a32-90bbcaff00d5';
```

**Resultado esperado:** `total_cotacoes: 10`

### **Erro de RLS?**

Desabilite temporariamente o RLS para testar:

```sql
-- APENAS PARA TESTE - NÃO USE EM PRODUÇÃO
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;

-- Depois de testar, reabilite:
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
```

### **Console do navegador mostra erro?**

Abra o Console (F12) e procure por:
- Erros de permissão (403)
- Erros de query SQL
- Mensagens de erro do Supabase

## 📊 Verificação Rápida

Execute no SQL Editor:

```sql
-- Ver suas cotações
SELECT 
  pedido_id,
  titulo,
  patient_name,
  status,
  created_at
FROM quotes
WHERE organization_id = '81463c26-2b9d-4b59-8a32-90bbcaff00d5'
ORDER BY created_at DESC;
```

Se aparecer as 10 cotações aqui, o problema é RLS ou na aplicação.
Se não aparecer nada, as cotações não foram criadas corretamente.

---

**Última atualização:** 04/02/2026 22:55
