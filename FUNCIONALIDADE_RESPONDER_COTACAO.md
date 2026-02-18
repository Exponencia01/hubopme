# 📝 Funcionalidade: Responder Cotação

## ✅ Implementação Completa

A funcionalidade de responder cotações foi totalmente implementada e está pronta para uso!

---

## 🎯 O que foi Criado

### **1. Componente de Formulário de Resposta**
**Arquivo:** `src/components/quotations/ResponseForm.tsx`

**Funcionalidades:**
- ✅ Lista todos os itens da cotação
- ✅ Checkbox para marcar produtos disponíveis/indisponíveis
- ✅ Campos para quantidade oferecida e preço unitário
- ✅ Cálculo automático de preço total por item
- ✅ Campo para prazo de entrega específico (opcional)
- ✅ Campo para sugerir produto substituto
- ✅ Observações por item
- ✅ Condições comerciais:
  - Prazo de entrega (dias)
  - Condições de pagamento
  - Validade da proposta
  - Tipo de frete (CIF/FOB)
  - Desconto percentual
- ✅ Observações gerais
- ✅ Resumo financeiro com cálculo automático
- ✅ Validações de formulário

### **2. API de Resposta**
**Arquivo:** `src/lib/api.ts`

**Funções Criadas:**
- `createQuoteResponse()` - Cria resposta com itens
- `submitQuoteResponse()` - Envia resposta ao cliente
- Registra atividades no log automaticamente
- Calcula totais (subtotal, desconto, valor final)

### **3. Integração na Página de Detalhes**
**Arquivo:** `src/pages/QuotationDetail.tsx`

**Mudanças:**
- ✅ Botão "Responder Cotação" no painel de ações
- ✅ Modal/tela de formulário de resposta
- ✅ Feedback de sucesso após envio
- ✅ Recarga automática da página após envio
- ✅ Estados de loading durante submissão

---

## 🚀 Como Usar

### **Passo 1: Acessar Cotação**
1. Vá em **Cotações** no menu lateral
2. Clique em uma cotação da lista
3. Você verá os detalhes da cotação

### **Passo 2: Iniciar Resposta**
1. No painel lateral direito, clique em **"Responder Cotação"**
2. O formulário de resposta será exibido

### **Passo 3: Preencher Itens**
Para cada item da cotação:
1. ✅ Marque o checkbox se o produto está **disponível**
2. Se disponível, preencha:
   - **Quantidade oferecida** (pode ser diferente da solicitada)
   - **Preço unitário** (em R$)
   - **Prazo específico** (opcional, se diferente do prazo geral)
   - **Produto substituto** (opcional, se quiser sugerir alternativa)
   - **Observações** (opcional, informações adicionais)

### **Passo 4: Condições Comerciais**
Preencha as condições da sua proposta:
- **Prazo de entrega:** Quantos dias para entregar
- **Condições de pagamento:** Ex: "30 dias", "À vista", "30/60/90"
- **Validade da proposta:** Ex: "7 dias", "15 dias"
- **Tipo de frete:** CIF (você paga) ou FOB (cliente paga)
- **Desconto:** Percentual de desconto sobre o total (opcional)
- **Observações gerais:** Informações adicionais sobre a proposta

### **Passo 5: Revisar e Enviar**
1. Verifique o **Resumo Financeiro** no final
2. Confirme todos os valores
3. Clique em **"Enviar Resposta"**
4. Aguarde confirmação de sucesso
5. A página será recarregada automaticamente

---

## 📊 Estrutura de Dados

### **Tabelas Utilizadas:**

#### `quote_responses`
```sql
- id (UUID)
- quote_id (referência à cotação)
- organization_id (seu fornecedor)
- created_by (usuário que criou)
- status (draft, in_review, submitted, sent_to_portal)
- prazo_entrega_dias
- condicoes_pagamento
- validade_proposta
- tipo_frete (CIF/FOB)
- subtotal
- desconto_percentual
- desconto_valor
- valor_total
- observacoes_gerais
- submitted_at
- is_sent_to_portal
- send_attempts
```

#### `quote_response_items`
```sql
- id (UUID)
- response_id (referência à resposta)
- product_ref (referência do produto)
- product_name
- original_quantity (quantidade solicitada)
- disponivel (boolean)
- quantidade_oferecida
- preco_unitario
- preco_total
- prazo_entrega_especifico
- substituto_sugerido
- observacoes_item
```

#### `quote_response_activity_log`
```sql
- id (UUID)
- response_id
- user_id
- action_type (created, updated, submitted, etc)
- details (JSON)
- timestamp
```

---

## 🔄 Fluxo Completo

```
1. Hospital cria cotação
        ↓
2. Cotação chega para você (fornecedor)
        ↓
3. Você acessa a cotação
        ↓
4. Clica em "Responder Cotação"
        ↓
5. Preenche formulário:
   - Marca produtos disponíveis
   - Define preços e quantidades
   - Adiciona condições comerciais
        ↓
6. Clica em "Enviar Resposta"
        ↓
7. Sistema salva resposta (status: draft)
        ↓
8. Sistema envia resposta (status: submitted)
        ↓
9. Sistema registra atividade no log
        ↓
10. Hospital recebe sua proposta
        ↓
11. Hospital compara propostas
        ↓
12. Hospital escolhe fornecedor
```

---

## 💡 Recursos Especiais

### **Cálculos Automáticos**
- ✅ Preço total por item = quantidade × preço unitário
- ✅ Subtotal = soma de todos os itens disponíveis
- ✅ Desconto em valor = subtotal × (desconto% / 100)
- ✅ Valor total = subtotal - desconto

### **Validações**
- ✅ Pelo menos 1 item deve estar disponível
- ✅ Itens disponíveis devem ter preço > 0
- ✅ Condições de pagamento são obrigatórias
- ✅ Prazo de entrega deve ser > 0

### **Flexibilidade**
- ✅ Pode oferecer quantidade diferente da solicitada
- ✅ Pode marcar itens como indisponíveis
- ✅ Pode sugerir produtos substitutos
- ✅ Pode definir prazo específico por item
- ✅ Pode adicionar observações por item

### **Rastreabilidade**
- ✅ Todas as ações são registradas no log
- ✅ Data/hora de criação e envio
- ✅ Usuário que criou a resposta
- ✅ Histórico de tentativas de envio ao portal

---

## 🎨 Interface

### **Formulário de Resposta:**
- Design limpo e organizado
- Cards separados por seção
- Feedback visual (✓ disponível, ✗ indisponível)
- Resumo financeiro destacado
- Botões de ação claros

### **Estados:**
- **Loading:** Durante envio da resposta
- **Sucesso:** Mensagem de confirmação verde
- **Erro:** Mensagem de erro vermelha com detalhes

---

## 🔮 Próximas Melhorias

### **Curto Prazo:**
1. Salvar rascunho (status: draft)
2. Editar resposta antes de enviar
3. Anexar documentos (catálogos, certificados)
4. Copiar resposta de cotação anterior

### **Médio Prazo:**
1. Integração com portal externo (OPMEnexo)
2. Envio automático ao portal
3. Notificações em tempo real
4. Chat com o cliente

### **Longo Prazo:**
1. IA para sugerir preços competitivos
2. Análise de histórico de vendas
3. Previsão de demanda
4. Otimização de estoque

---

## 🐛 Troubleshooting

### **Erro: "Usuário não autenticado"**
**Solução:** Faça logout e login novamente

### **Erro ao salvar resposta**
**Solução:** 
1. Verifique se executou as migrações SQL
2. Confirme que as tabelas existem no Supabase
3. Verifique as políticas RLS

### **Campos não aparecem**
**Solução:** 
1. Verifique se a cotação tem produtos
2. Confirme que os dados estão corretos
3. Recarregue a página

### **Cálculos incorretos**
**Solução:**
1. Verifique se preencheu quantidade e preço
2. Confirme que os valores são numéricos
3. Verifique o desconto percentual

---

## 📋 Checklist de Implementação

- [x] Componente ResponseForm criado
- [x] API createQuoteResponse implementada
- [x] API submitQuoteResponse implementada
- [x] Integração na página de detalhes
- [x] Validações de formulário
- [x] Cálculos automáticos
- [x] Feedback de sucesso/erro
- [x] Log de atividades
- [x] Estados de loading
- [x] Documentação completa

---

## 🎯 Status: ✅ PRONTO PARA USO

A funcionalidade está **100% implementada** e pronta para ser testada!

**Próximo passo:** Testar o fluxo completo com dados reais.

---

**Última atualização:** 04/02/2026 22:45
