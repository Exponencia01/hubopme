# 📋 Plano de Migração - Estrutura OPMEnexo

## ✅ Análise Concluída

Revisei a estrutura do banco de dados e tipos TypeScript para seguir o padrão da **OPMEnexo**.

## 🔄 Mudanças Principais

### 1. **Estrutura de Banco de Dados**

#### ❌ Estrutura Antiga (Genérica)
- `quotation_requests` - Solicitações genéricas
- `quotation_items` - Itens da solicitação
- `quotation_distributions` - Distribuição para múltiplos fornecedores
- `quotation_responses` - Múltiplas respostas por cotação
- `suppliers` - Tabela separada de fornecedores

#### ✅ Nova Estrutura (Padrão OPMEnexo)
- `quotes` - Cotações com campos específicos do contexto hospitalar brasileiro
- `quote_responses` - **Uma resposta única por cotação** (1:1)
- `quote_response_items` - Itens da resposta com preços e disponibilidade
- `quote_response_collaborators` - Sistema de colaboração entre especialistas
- `quote_response_activity_log` - Auditoria completa de ações
- `organizations` - Unificado (hospitais + fornecedores)

### 2. **Campos Específicos do Brasil**

A nova estrutura inclui campos essenciais para o contexto brasileiro:

```typescript
// Dados do Pedido
pedido_id: string
carater_internacao: string
forma_pagamento: string
operadora: string (plano de saúde)
senha_autorizacao: string

// Dados do Médico
medico: string
crm_uf: string

// Produtos
products: QuoteProductItem[] (codificados)
non_coded_products: NonCodedProduct[] (não codificados)
```

### 3. **Sistema de Colaboração**

Novo recurso não presente na estrutura antiga:

```typescript
interface QuoteResponseCollaborator {
  role: 'specialist' | 'reviewer'
  can_edit: boolean
  can_view_prices: boolean
  status: 'pending' | 'active' | 'removed'
}
```

### 4. **Integração com Portal Externo**

Campos para sincronização com portais como OPMEnexo:

```typescript
external_response_id: string
portal_submission_date: Date
portal_status: string
is_sent_to_portal: boolean
send_attempts: number
```

### 5. **Auditoria Automática**

Sistema de log automático via triggers:

```sql
CREATE TABLE quote_response_activity_log (
  action_type: 'created' | 'updated' | 'item_changed' | 
               'collaborator_invited' | 'submitted' | 
               'sent_to_portal' | 'send_failed'
  details: JSONB
)
```

## 📊 Comparação de Funcionalidades

| Funcionalidade | Estrutura Antiga | Nova Estrutura OPMEnexo |
|----------------|------------------|-------------------------|
| Múltiplos fornecedores | ✅ Sim | ❌ Não (1 resposta por cotação) |
| Colaboradores | ❌ Não | ✅ Sim |
| Campos BR específicos | ❌ Limitado | ✅ Completo |
| Integração portal | ❌ Não | ✅ Sim |
| Log de auditoria | ❌ Básico | ✅ Automático |
| Produtos não codificados | ❌ Não | ✅ Sim |
| Cálculo automático | ❌ Manual | ✅ Triggers |

## 🎯 Arquivos Criados/Atualizados

### ✅ Concluído
1. **`supabase/migrations/001_opmenexo_schema.sql`** - Schema completo do banco
2. **`src/lib/types.ts`** - Tipos TypeScript atualizados

### 🔄 Próximos Passos
3. **`src/lib/api.ts`** - Atualizar funções de API
4. **`src/hooks/`** - Criar hooks para quotes e responses
5. **`src/pages/`** - Atualizar páginas para nova estrutura
6. **`src/components/`** - Criar componentes específicos

## ⚠️ Decisões Importantes

### 1. **Modelo de Resposta**
- **Antiga**: Múltiplas respostas de diferentes fornecedores
- **Nova**: Uma resposta única por cotação (padrão OPMEnexo)
- **Impacto**: Simplifica o fluxo, mas remove competição entre fornecedores

### 2. **Unificação de Organizations**
- Hospitais e Fornecedores na mesma tabela
- Diferenciados pelo campo `type: 'hospital' | 'clinic' | 'supplier'`

### 3. **Produtos JSONB**
- Produtos armazenados como JSONB em `quotes.products`
- Permite flexibilidade para produtos codificados e não-codificados

## 🚀 Próximas Ações Recomendadas

1. **Revisar e Aprovar** este plano de migração
2. **Configurar Supabase** e executar a migração SQL
3. **Atualizar API Client** (`src/lib/api.ts`)
4. **Criar Hooks Customizados** para quotes e responses
5. **Atualizar Componentes UI** para refletir nova estrutura
6. **Testar Fluxo Completo**

## 📝 Observações

- A nova estrutura é **mais específica** para o mercado brasileiro de OPME
- **Melhor auditoria** e rastreabilidade de ações
- **Sistema de colaboração** permite trabalho em equipe
- **Integração com portais** externos facilitada
- Menos flexível para **múltiplos fornecedores simultâneos**

## ❓ Perguntas para Validação

1. **Você precisa de múltiplos fornecedores respondendo a mesma cotação?**
   - Se SIM: Precisamos ajustar o modelo para permitir múltiplas respostas
   - Se NÃO: Estrutura atual está perfeita

2. **Vai integrar com portais externos (OPMEnexo, Inpart)?**
   - Se SIM: Estrutura atual tem todos os campos necessários
   - Se NÃO: Podemos simplificar removendo campos de integração

3. **Precisa do sistema de colaboradores?**
   - Se SIM: Mantemos como está
   - Se NÃO: Podemos remover essa tabela

---

**Status**: ⏸️ Aguardando aprovação para prosseguir com a implementação completa.
