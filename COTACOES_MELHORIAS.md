# 📋 Melhorias no Módulo de Cotações

## ✅ Implementações Concluídas

### 🏥 **1. Local da Cirurgia - Dados do Hospital**

**Novos Campos Adicionados:**
- `hospital_name` - Nome do hospital onde será realizada a cirurgia
- `hospital_cnpj` - CNPJ do hospital

**Localização no Banco:**
- Tabela: `quotes`
- Campos adicionados via migration `011_enhance_quotations.sql`

**Como Usar:**
```typescript
// Ao criar/editar cotação
const quote = {
  ...outrosCampos,
  hospital_name: "Hospital São Lucas",
  hospital_cnpj: "12.345.678/0001-90"
};
```

---

### 💰 **2. Dados de Faturamento - Fonte Pagadora**

**Novo Campo JSONB:**
- `billing_data` - Objeto com informações da fonte pagadora

**Estrutura:**
```typescript
{
  payer_name?: string;           // Nome da fonte pagadora
  payer_cnpj?: string;           // CNPJ da fonte pagadora
  payer_type?: string;           // Tipo: 'insurance' (Convênio), 'hospital', 'patient' (Particular)
  payment_terms?: string;        // Condições de pagamento
  contact_name?: string;         // Contato para faturamento
  contact_phone?: string;        // Telefone do contato
  contact_email?: string;        // E-mail do contato
  notes?: string;                // Observações
}
```

**Status de Faturamento:**
- `billing_status`: 'pending' | 'authorized' | 'billed' | 'pending_items'

---

### 📎 **3. Anexos Descritivos**

**Nova Tabela:** `quote_attachments`

**Tipos de Anexos:**
- `pre_surgical` - Pré-cirúrgico
- `post_surgical` - Pós-cirúrgico
- `billing_evidence` - Evidência de faturamento
- `authorization` - Autorização
- `invoice` - Nota fiscal
- `receipt` - Recibo
- `medical_report` - Relatório médico
- `other` - Outro

**API:**
```typescript
import { quoteAttachmentsApi } from '@/lib/quotesEnhanced';

// Listar anexos
const attachments = await quoteAttachmentsApi.getByQuoteId(quoteId);

// Criar anexo
await quoteAttachmentsApi.create({
  quote_id: quoteId,
  attachment_type: 'billing_evidence',
  file_name: 'nota_fiscal.pdf',
  file_url: 'https://...',
  title: 'Nota Fiscal #12345',
  description: 'Nota fiscal referente ao faturamento da cirurgia',
  tags: ['faturamento', 'nota_fiscal']
});
```

---

### 📊 **4. Card de Pendências de Faturamento**

**Componente:** `BillingPendingCard`

**Funcionalidades:**
- ✅ Mostra resumo de itens pendentes
- ✅ Exibe valor total vs valor faturado
- ✅ Barra de progresso visual
- ✅ Lista detalhada de itens pendentes
- ✅ **Botão para gerar relatório**

**Como Usar:**
```tsx
import BillingPendingCard from '@/components/quotes/BillingPendingCard';

<BillingPendingCard quoteId={quote.id} />
```

**Relatório Gerado:**
- Formato: TXT (pode ser expandido para PDF)
- Conteúdo: Resumo completo com todos os itens pendentes
- Download automático

---

### 📜 **5. Histórico de Ações da Cotação**

**Nova Tabela:** `quote_history`

**Estados do Ciclo de Vida:**
1. **Orçado** (`budgeted`) - Cotação criada com orçamento
2. **Autorizado** (`authorized`) - Autorização aprovada
3. **Utilizado** (`used_supplier`) - Fornecedor confirmou uso
4. **Confirmada a Utilização** (`usage_confirmed`) - Comprador confirmou
5. **Faturamento Autorizado** (`billing_authorized`) - Aprovado para faturar
6. **Faturado** (`billed`) - Nota fiscal emitida
7. **Pendente de Faturamento** (`billing_pending`) - Aguardando faturamento

**Componente:** `QuoteHistoryTimeline`

**Funcionalidades:**
- ✅ Timeline visual com ícones e cores
- ✅ Mostra quem realizou cada ação
- ✅ Data e hora de cada evento
- ✅ Descrições detalhadas

**Como Usar:**
```tsx
import QuoteHistoryTimeline from '@/components/quotes/QuoteHistoryTimeline';

<QuoteHistoryTimeline quoteId={quote.id} />
```

**Adicionar Ação ao Histórico:**
```typescript
import { quoteHistoryApi } from '@/lib/quotesEnhanced';

await quoteHistoryApi.addAction(
  quoteId,
  'authorized',
  'Autorização aprovada pelo plano de saúde'
);
```

---

### 🧾 **6. Itens de Faturamento com Quantidades**

**Nova Tabela:** `quote_billing_items`

**Campos por Item:**
- `quantity_budgeted` - Quantidade orçada
- `quantity_authorized` - Quantidade autorizada
- `quantity_used` - Quantidade utilizada
- `quantity_billed` - Quantidade faturada
- `unit_price` - Preço unitário
- `total_budgeted` - Total orçado
- `total_authorized` - Total autorizado
- `total_used` - Total utilizado
- `total_billed` - Total faturado

**Status:**
- `pending` - Pendente
- `partially_billed` - Parcialmente faturado
- `fully_billed` - Totalmente faturado
- `cancelled` - Cancelado

**API:**
```typescript
import { quoteBillingItemsApi } from '@/lib/quotesEnhanced';

// Criar item
await quoteBillingItemsApi.create({
  quote_id: quoteId,
  product_name: 'Parafuso Pedicular',
  product_code: 'PP-001',
  quantity_budgeted: 10,
  unit_price: 150.00
});

// Atualizar quantidades
await quoteBillingItemsApi.updateQuantities(itemId, {
  authorized: 8,
  used: 7,
  billed: 5
});

// Obter resumo
const summary = await quoteBillingItemsApi.getBillingSummary(quoteId);
```

---

## 🚀 Como Aplicar as Melhorias

### **Passo 1: Aplicar Migration**

Execute no **Supabase SQL Editor**:

```sql
-- Copie e cole todo o conteúdo de:
supabase/migrations/011_enhance_quotations.sql
```

### **Passo 2: Atualizar Página de Detalhes da Cotação**

Adicione os novos componentes em `src/pages/QuotationDetail.tsx`:

```tsx
import QuoteHistoryTimeline from '@/components/quotes/QuoteHistoryTimeline';
import BillingPendingCard from '@/components/quotes/BillingPendingCard';

// No render:
<div className="grid gap-6">
  {/* Card de Pendências */}
  <BillingPendingCard quoteId={quote.id} />
  
  {/* Histórico de Ações */}
  <QuoteHistoryTimeline quoteId={quote.id} />
</div>
```

### **Passo 3: Adicionar Campos no Formulário**

Adicione campos para hospital e CNPJ no formulário de cotação:

```tsx
<div>
  <Label>Nome do Hospital</Label>
  <Input
    value={formData.hospital_name}
    onChange={(e) => setFormData({...formData, hospital_name: e.target.value})}
  />
</div>

<div>
  <Label>CNPJ do Hospital</Label>
  <Input
    value={formData.hospital_cnpj}
    onChange={(e) => setFormData({...formData, hospital_cnpj: e.target.value})}
    placeholder="00.000.000/0000-00"
  />
</div>
```

### **Passo 4: Adicionar Seção de Dados de Faturamento (Fonte Pagadora)**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Dados de Faturamento</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Fonte Pagadora</Label>
        <Input
          value={formData.billing_data?.payer_name}
          onChange={(e) => setFormData({
            ...formData,
            billing_data: {
              ...formData.billing_data,
              payer_name: e.target.value
            }
          })}
          placeholder="Nome do convênio, hospital, etc"
        />
      </div>
      <div>
        <Label>CNPJ da Fonte Pagadora</Label>
        <Input
          value={formData.billing_data?.payer_cnpj}
          onChange={(e) => setFormData({
            ...formData,
            billing_data: {
              ...formData.billing_data,
              payer_cnpj: e.target.value
            }
          })}
          placeholder="00.000.000/0000-00"
        />
      </div>
      <div>
        <Label>Tipo</Label>
        <select
          value={formData.billing_data?.payer_type}
          onChange={(e) => setFormData({
            ...formData,
            billing_data: {
              ...formData.billing_data,
              payer_type: e.target.value
            }
          })}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Selecione...</option>
          <option value="insurance">Convênio/Plano de Saúde</option>
          <option value="hospital">Hospital</option>
          <option value="patient">Particular</option>
          <option value="other">Outro</option>
        </select>
      </div>
      <div>
        <Label>Condições de Pagamento</Label>
        <Input
          value={formData.billing_data?.payment_terms}
          onChange={(e) => setFormData({
            ...formData,
            billing_data: {
              ...formData.billing_data,
              payment_terms: e.target.value
            }
          })}
          placeholder="Ex: 30 dias"
        />
      </div>
      <div className="col-span-2">
        <Label>Contato para Faturamento</Label>
        <Input
          value={formData.billing_data?.contact_name}
          onChange={(e) => setFormData({
            ...formData,
            billing_data: {
              ...formData.billing_data,
              contact_name: e.target.value
            }
          })}
        />
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 📁 Arquivos Criados/Modificados

### **Novos Arquivos:**
```
✅ supabase/migrations/011_enhance_quotations.sql
✅ src/lib/quotesEnhanced.ts
✅ src/components/quotes/QuoteHistoryTimeline.tsx
✅ src/components/quotes/BillingPendingCard.tsx
✅ COTACOES_MELHORIAS.md (este arquivo)
```

### **Arquivos Modificados:**
```
✅ src/lib/types.ts (novos tipos adicionados)
```

---

## 🎯 Próximos Passos Sugeridos

1. **Aplicar a migration** no Supabase
2. **Integrar componentes** na página de detalhes
3. **Testar fluxo completo:**
   - Criar cotação com dados do hospital
   - Adicionar anexos descritivos
   - Registrar ações no histórico
   - Gerar relatório de pendências
4. **Sincronizar itens de faturamento** com produtos da cotação
5. **Implementar upload de arquivos** para anexos

---

## 💡 Funcionalidades Extras Disponíveis

### **Sincronizar Itens de Faturamento**
```typescript
import { quoteEnhancedUtils } from '@/lib/quotesEnhanced';

// Cria automaticamente itens de faturamento baseado nos produtos da cotação
await quoteEnhancedUtils.syncBillingItemsFromQuote(quoteId);
```

### **Função SQL para Adicionar Histórico**
```sql
SELECT add_quote_history(
  'uuid-da-cotacao',
  'authorized',
  'Autorização aprovada pelo convênio'
);
```

### **Calcular Pendências**
```sql
SELECT * FROM calculate_billing_pending('uuid-da-cotacao');
```

---

## 🔒 Segurança (RLS)

Todas as novas tabelas têm **Row Level Security** habilitado:
- ✅ Usuários só veem dados da própria organização
- ✅ Histórico rastreia quem fez cada ação
- ✅ Anexos vinculados à organização

---

## 📞 Suporte

Todas as funcionalidades estão prontas para uso. Basta aplicar a migration e integrar os componentes!
