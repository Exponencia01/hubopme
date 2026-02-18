# 📋 Análise de Campos OPMEnexo - Página de Cotação

## 🎯 Objetivo
Implementar todos os campos e funcionalidades da OPMEnexo na página de detalhes da cotação, organizados em cards conforme especificação.

---

## 📊 Análise de Campos por Card

### **1. Resumo da Cotação** ✅ COMPLETO
| Campo | Existe no DB | Tipo | Observação |
|-------|--------------|------|------------|
| ID Pedido | ✅ `pedido_id` | TEXT | OK |
| Solicitante | ✅ `solicitante` | TEXT | OK |
| Contato | ✅ `contato` | TEXT | OK |
| Título | ✅ `titulo` | TEXT | OK |
| Caráter de Internação | ✅ `carater_internacao` | TEXT | OK |
| CNPJ | ✅ `organizations.cnpj` | VARCHAR(18) | Via JOIN |
| Encerramento da Cotação | ✅ `encerramento_cotacao` | TIMESTAMPTZ | OK |
| Forma de Pagamento | ✅ `forma_pagamento` | TEXT | OK |

**Status:** ✅ Todos os campos existem

---

### **2. Dados da Cirurgia** ✅ COMPLETO
| Campo | Existe no DB | Tipo | Observação |
|-------|--------------|------|------------|
| Data da Cirurgia | ✅ `surgery_date` | TEXT | OK |
| Local da Cirurgia | ✅ `surgery_location` | TEXT | OK |
| Operadora | ✅ `operadora` | TEXT | OK |
| Senha de Autorização | ✅ `senha_autorizacao` | TEXT | Opcional |
| Atendimento | ✅ `atendimento` | TEXT | OK |
| Agenda | ✅ `agenda` | TEXT | Opcional |
| Médico | ✅ `medico` | TEXT | OK |
| CRM/UF | ✅ `crm_uf` | TEXT | OK |

**Status:** ✅ Todos os campos existem

---

### **3. Lista de Documentos do Hospital Vinculados ao Fornecedor** ⚠️ PARCIAL
| Campo | Existe no DB | Tipo | Observação |
|-------|--------------|------|------------|
| Documentos | ✅ `documents` | JSONB | Array de objetos |
| Upload de Arquivos | ❌ | - | **PRECISA CRIAR STORAGE** |

**Estrutura Atual (JSONB):**
```json
[
  {
    "id": "uuid",
    "name": "documento.pdf",
    "type": "pdf",
    "url": "storage_url",
    "uploaded_at": "timestamp"
  }
]
```

**Ações Necessárias:**
- ✅ Campo existe no DB
- ❌ Criar bucket no Supabase Storage: `quote-documents`
- ❌ Implementar componente de upload
- ❌ Implementar listagem de documentos

---

### **4. Procedimentos** ✅ COMPLETO
| Campo | Existe no DB | Tipo | Observação |
|-------|--------------|------|------------|
| Principal | ✅ `procedures[].principal` | JSONB | Boolean |
| Código | ✅ `procedures[].codigo` | JSONB | TEXT |
| Descrição | ✅ `procedures[].descricao` | JSONB | TEXT |
| Quantidade | ✅ `procedures[].quantidade` | JSONB | INTEGER |

**Estrutura Atual (JSONB):**
```json
[
  {
    "principal": true,
    "codigo": "40101010",
    "descricao": "Artroplastia Total de Joelho",
    "quantidade": 1
  }
]
```

**Status:** ✅ Campo existe, precisa apenas UI

---

### **5. Observação do Comprador** ✅ COMPLETO
| Campo | Existe no DB | Tipo | Observação |
|-------|--------------|------|------------|
| Observação | ✅ `observacao_comprador` | TEXT | OK |

**Status:** ✅ Campo existe

---

### **6. Produtos Não Codificados** ✅ COMPLETO
| Campo | Existe no DB | Tipo | Observação |
|-------|--------------|------|------------|
| Produtos | ✅ `non_coded_products` | JSONB | Array de objetos |

**Estrutura Atual (JSONB):**
```json
[
  {
    "id": "uuid",
    "descricao": "Material especial",
    "quantidade": 2
  }
]
```

**Status:** ✅ Campo existe, precisa apenas UI

---

### **7. Lista de Documentos do Hospital** ⚠️ DUPLICADO?
**Observação:** Parece ser o mesmo que "Lista de Documentos do Hospital Vinculados ao Fornecedor"

Se for diferente, precisamos:
- ❌ Criar novo campo `hospital_documents` JSONB
- ❌ Criar bucket separado no Storage

**Aguardando clarificação do usuário**

---

### **8. Produtos** ✅ COMPLETO
| Campo | Existe no DB | Tipo | Observação |
|-------|--------------|------|------------|
| Produtos | ✅ `products` | JSONB | Array de objetos |
| Botão Adicionar | - | UI | Apenas frontend |

**Estrutura Atual (JSONB):**
```json
[
  {
    "referencia": "REF123",
    "name": "Prótese de Joelho",
    "quantity": 1
  }
]
```

**Status:** ✅ Campo existe, precisa UI com botão adicionar

---

### **9. Desconto** ✅ COMPLETO
| Campo | Existe no DB | Tipo | Observação |
|-------|--------------|------|------------|
| Desconto | ✅ `discount` | JSONB | Objeto com configurações |

**Estrutura Sugerida (JSONB):**
```json
{
  "aplicar_em": "total", // "total" | "produtos" | "servicos"
  "tipo": "percentual", // "percentual" | "valor"
  "valor": 10,
  "unidade": "%"
}
```

**Status:** ✅ Campo existe, precisa UI

---

### **10. Condições do Fornecedor** ✅ COMPLETO
| Campo | Existe no DB | Tipo | Observação |
|-------|--------------|------|------------|
| Condições | ✅ `provider_conditions` | JSONB | Objeto livre |

**Estrutura Sugerida (JSONB):**
```json
{
  "prazo_entrega": "5 dias úteis",
  "garantia": "12 meses",
  "validade_proposta": "30 dias",
  "observacoes": "Texto livre"
}
```

**Status:** ✅ Campo existe, precisa UI

---

### **11. Incluir Novo Arquivo Pré-Cirúrgico** ⚠️ PARCIAL
| Campo | Existe no DB | Tipo | Observação |
|-------|--------------|------|------------|
| Arquivos | ✅ `pre_surgical_files` | JSONB | Array de objetos |
| Upload | ❌ | - | **PRECISA CRIAR STORAGE** |

**Estrutura Atual (JSONB):**
```json
[
  {
    "id": "uuid",
    "name": "exame.pdf",
    "type": "pdf",
    "url": "storage_url",
    "uploaded_at": "timestamp",
    "uploaded_by": "user_id"
  }
]
```

**Ações Necessárias:**
- ✅ Campo existe no DB
- ❌ Criar bucket no Supabase Storage: `pre-surgical-files`
- ❌ Implementar componente de upload
- ❌ Implementar listagem de arquivos

---

### **12. Lista de Arquivos Pré-Cirúrgico do Fornecedor** ✅ COMPLETO
| Campo | Existe no DB | Tipo | Observação |
|-------|--------------|------|------------|
| Arquivos | ✅ `pre_surgical_files` | JSONB | Mesmo campo acima |

**Status:** ✅ Campo existe, precisa UI de listagem

---

## 📦 Campos Faltantes no Banco de Dados

### ❌ Nenhum campo faltante!

Todos os campos necessários já existem na estrutura atual da tabela `quotes`.

---

## 🗄️ Storage Buckets Necessários

### **1. quote-documents** (Documentos do Hospital)
- **Política:** Authenticated users podem ler/escrever
- **Estrutura:** `/{organization_id}/{quote_id}/{filename}`
- **Tipos permitidos:** PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
- **Tamanho máximo:** 10MB por arquivo

### **2. pre-surgical-files** (Arquivos Pré-Cirúrgicos)
- **Política:** Authenticated users podem ler/escrever
- **Estrutura:** `/{organization_id}/{quote_id}/pre-surgical/{filename}`
- **Tipos permitidos:** PDF, JPG, PNG, DICOM
- **Tamanho máximo:** 20MB por arquivo

---

## 🎨 Reorganização do Layout

### **Estrutura Proposta:**

```
┌─────────────────────────────────────────────────────────┐
│ Header: Título + Status + Ações                        │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────┐
│ COLUNA ESQUERDA (2/3)│ COLUNA DIREITA (1/3)            │
├──────────────────────┼──────────────────────────────────┤
│ 📋 Resumo da Cotação │ 📊 Status e Prazos              │
│                      │                                  │
│ 🏥 Dados da Cirurgia │ 👤 Informações do Solicitante   │
│                      │                                  │
│ 📄 Procedimentos     │                                  │
│                      │                                  │
│ 📦 Produtos          │                                  │
│ [+ Adicionar]        │                                  │
│                      │                                  │
│ 📝 Produtos Não      │                                  │
│    Codificados       │                                  │
│                      │                                  │
│ 💰 Desconto          │                                  │
│                      │                                  │
│ 📋 Condições do      │                                  │
│    Fornecedor        │                                  │
│                      │                                  │
│ 💬 Observação do     │                                  │
│    Comprador         │                                  │
│                      │                                  │
│ 📎 Documentos do     │                                  │
│    Hospital          │                                  │
│ [Upload]             │                                  │
│                      │                                  │
│ 🏥 Arquivos Pré-     │                                  │
│    Cirúrgicos        │                                  │
│ [Upload]             │                                  │
└──────────────────────┴──────────────────────────────────┘
```

---

## 🚀 Plano de Implementação

### **Fase 1: Infraestrutura** (Storage)
1. Criar buckets no Supabase Storage
2. Configurar políticas RLS para storage
3. Criar helper functions para upload

### **Fase 2: Componentes Base**
1. Componente `FileUpload` genérico
2. Componente `FileList` para exibir arquivos
3. Componente `ProductForm` para adicionar produtos
4. Componente `DiscountConfig` para configurar desconto

### **Fase 3: Cards da Página**
1. Card "Resumo da Cotação"
2. Card "Dados da Cirurgia"
3. Card "Procedimentos"
4. Card "Produtos" (com botão adicionar)
5. Card "Produtos Não Codificados"
6. Card "Desconto"
7. Card "Condições do Fornecedor"
8. Card "Observação do Comprador"
9. Card "Documentos do Hospital" (com upload)
10. Card "Arquivos Pré-Cirúrgicos" (com upload)

### **Fase 4: Integração e Testes**
1. Integrar todos os cards na página
2. Testar upload de arquivos
3. Testar adição de produtos
4. Validar dados salvos

---

## 📝 Próximos Passos Imediatos

1. ✅ Confirmar com usuário se "Lista de Documentos do Hospital" é duplicado
2. ❌ Criar migration para Storage buckets
3. ❌ Implementar componentes de upload
4. ❌ Redesenhar página QuotationDetail

---

**Última atualização:** 04/02/2026 23:10
