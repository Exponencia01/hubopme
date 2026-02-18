# HUB OPME - Documentação da API

## 📋 Visão Geral

A API do HUB OPME permite integração completa com sistemas externos para gerenciamento de cotações de OPME. Todas as requisições requerem autenticação via Bearer Token do Supabase.

## 🔐 Autenticação

```typescript
// Headers obrigatórios
Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN
Content-Type: application/json
```

## 📡 Endpoints

### Cotações (Quotations)

#### Listar Cotações

```http
GET /api/quotations
```

**Query Parameters:**
- `status` (opcional): pending, sent, received_quotes, completed, cancelled
- `urgency` (opcional): urgent, normal, scheduled
- `organization_id` (opcional): UUID da organização

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "request_number": "COT-2024-001",
      "organization_id": "uuid",
      "procedure_name": "Cirurgia de Joelho",
      "patient_name": "João Silva",
      "urgency": "urgent",
      "status": "pending",
      "deadline": "2024-02-15T23:59:59Z",
      "items": [
        {
          "id": "uuid",
          "product_name": "Prótese de Joelho",
          "quantity": 1,
          "unit_of_measure": "unidade"
        }
      ],
      "created_at": "2024-02-01T10:00:00Z"
    }
  ]
}
```

#### Criar Cotação

```http
POST /api/quotations
```

**Request Body:**
```json
{
  "quotation": {
    "organization_id": "uuid",
    "request_number": "COT-2024-001",
    "procedure_name": "Cirurgia de Joelho",
    "patient_name": "João Silva",
    "patient_id": "12345",
    "procedure_date": "2024-02-20",
    "urgency": "urgent",
    "deadline": "2024-02-15T23:59:59Z",
    "notes": "Paciente com alergia a níquel"
  },
  "items": [
    {
      "product_name": "Prótese de Joelho",
      "product_description": "Prótese total de joelho, tamanho médio",
      "quantity": 1,
      "unit_of_measure": "unidade",
      "technical_requirements": {
        "material": "titânio",
        "tamanho": "médio"
      }
    }
  ]
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "request_number": "COT-2024-001",
    "status": "pending",
    "created_at": "2024-02-01T10:00:00Z"
  }
}
```

#### Detalhes da Cotação

```http
GET /api/quotations/:id
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "request_number": "COT-2024-001",
    "organization": {
      "id": "uuid",
      "name": "Hospital Exemplo",
      "cnpj": "12.345.678/0001-90"
    },
    "procedure_name": "Cirurgia de Joelho",
    "patient_name": "João Silva",
    "urgency": "urgent",
    "status": "received_quotes",
    "deadline": "2024-02-15T23:59:59Z",
    "items": [...],
    "distributions": [
      {
        "id": "uuid",
        "supplier": {
          "id": "uuid",
          "name": "Fornecedor OPME"
        },
        "status": "responded",
        "sent_at": "2024-02-01T10:00:00Z",
        "responded_at": "2024-02-02T14:30:00Z"
      }
    ],
    "responses": [
      {
        "id": "uuid",
        "supplier": {
          "id": "uuid",
          "name": "Fornecedor OPME"
        },
        "total_value": 15000.00,
        "delivery_days": 7,
        "payment_terms": "30 dias",
        "status": "submitted",
        "items": [...]
      }
    ]
  }
}
```

#### Distribuir Cotação para Fornecedores

```http
POST /api/quotations/:id/distribute
```

**Request Body:**
```json
{
  "supplierIds": [
    "uuid-supplier-1",
    "uuid-supplier-2",
    "uuid-supplier-3"
  ]
}
```

**Response:**
```json
{
  "data": {
    "quotation_id": "uuid",
    "distributions": [
      {
        "id": "uuid",
        "supplier_id": "uuid-supplier-1",
        "status": "sent",
        "sent_at": "2024-02-01T10:00:00Z"
      }
    ]
  }
}
```

#### Aceitar Proposta

```http
POST /api/quotations/:id/accept-response
```

**Request Body:**
```json
{
  "responseId": "uuid"
}
```

**Response:**
```json
{
  "data": {
    "quotation_id": "uuid",
    "response_id": "uuid",
    "status": "completed",
    "accepted_at": "2024-02-05T16:00:00Z"
  }
}
```

### Fornecedores (Suppliers)

#### Listar Fornecedores

```http
GET /api/suppliers
```

**Query Parameters:**
- `specialties` (opcional): array de especialidades
- `status` (opcional): active, inactive

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Fornecedor OPME",
      "cnpj": "98.765.432/0001-10",
      "email": "vendas@fornecedor.com",
      "phone": "(11) 98765-4321",
      "specialties": ["ortopedia", "cardiologia"],
      "rating": 4.5,
      "status": "active"
    }
  ]
}
```

#### Criar Fornecedor

```http
POST /api/suppliers
```

**Request Body:**
```json
{
  "name": "Fornecedor OPME",
  "cnpj": "98.765.432/0001-10",
  "email": "vendas@fornecedor.com",
  "phone": "(11) 98765-4321",
  "address": {
    "street": "Rua Exemplo",
    "number": "123",
    "city": "São Paulo",
    "state": "SP",
    "zip": "01234-567"
  },
  "specialties": ["ortopedia", "cardiologia"],
  "certifications": {
    "iso9001": true,
    "anvisa": "12345678"
  }
}
```

### Respostas de Fornecedores

#### Cotações Recebidas (Fornecedor)

```http
GET /api/supplier/quotations
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "quotation_request": {
        "id": "uuid",
        "request_number": "COT-2024-001",
        "organization": {
          "name": "Hospital Exemplo"
        },
        "procedure_name": "Cirurgia de Joelho",
        "deadline": "2024-02-15T23:59:59Z",
        "items": [...]
      },
      "status": "sent",
      "sent_at": "2024-02-01T10:00:00Z"
    }
  ]
}
```

#### Enviar Resposta (Fornecedor)

```http
POST /api/supplier/quotations/:id/respond
```

**Request Body:**
```json
{
  "response": {
    "distribution_id": "uuid",
    "supplier_id": "uuid",
    "quotation_request_id": "uuid",
    "total_value": 15000.00,
    "delivery_days": 7,
    "delivery_date": "2024-02-12",
    "payment_terms": "30 dias",
    "warranty_months": 12,
    "notes": "Produto disponível em estoque",
    "valid_until": "2024-02-20"
  },
  "items": [
    {
      "quotation_item_id": "uuid",
      "product_name": "Prótese de Joelho",
      "manufacturer": "Fabricante XYZ",
      "anvisa_registration": "80123456789",
      "quantity": 1,
      "unit_price": 15000.00,
      "total_price": 15000.00,
      "availability": "in_stock",
      "delivery_days": 7,
      "notes": "Produto certificado ANVISA"
    }
  ]
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "quotation_request_id": "uuid",
    "total_value": 15000.00,
    "status": "submitted",
    "created_at": "2024-02-02T14:30:00Z"
  }
}
```

### Produtos

#### Listar Produtos

```http
GET /api/products
```

**Query Parameters:**
- `category` (opcional): ortopedia, cardiologia, neurologia, etc.
- `manufacturer` (opcional): nome do fabricante
- `search` (opcional): busca por nome ou descrição

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Prótese de Joelho",
      "description": "Prótese total de joelho",
      "category": "ortopedia",
      "subcategory": "joelho",
      "manufacturer": "Fabricante XYZ",
      "anvisa_registration": "80123456789",
      "unit_of_measure": "unidade",
      "technical_specs": {
        "material": "titânio",
        "tamanhos": ["pequeno", "médio", "grande"]
      },
      "status": "active"
    }
  ]
}
```

### Notificações

#### Listar Notificações Não Lidas

```http
GET /api/notifications/unread
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "new_quotation",
      "title": "Nova Cotação Recebida",
      "message": "Você recebeu uma nova solicitação de cotação: COT-2024-001",
      "related_entity_type": "quotation_request",
      "related_entity_id": "uuid",
      "read": false,
      "created_at": "2024-02-01T10:00:00Z"
    }
  ],
  "unread_count": 5
}
```

#### Marcar Notificação como Lida

```http
PUT /api/notifications/:id/read
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "read": true
  }
}
```

## 🔔 Webhooks

Configure webhooks para receber notificações em tempo real sobre eventos importantes.

### Eventos Disponíveis

- `quotation.created` - Nova cotação criada
- `quotation.distributed` - Cotação distribuída para fornecedores
- `quotation.response_received` - Resposta de fornecedor recebida
- `quotation.completed` - Cotação concluída
- `quotation.deadline_approaching` - Prazo próximo do vencimento

### Payload do Webhook

```json
{
  "event": "quotation.response_received",
  "timestamp": "2024-02-02T14:30:00Z",
  "data": {
    "quotation_id": "uuid",
    "response_id": "uuid",
    "supplier": {
      "id": "uuid",
      "name": "Fornecedor OPME"
    },
    "total_value": 15000.00
  }
}
```

## 📊 Rate Limiting

- **Limite**: 100 requisições por minuto por IP
- **Headers de resposta**:
  - `X-RateLimit-Limit`: Limite total
  - `X-RateLimit-Remaining`: Requisições restantes
  - `X-RateLimit-Reset`: Timestamp do reset

## ❌ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Não autorizado |
| 404 | Recurso não encontrado |
| 429 | Muitas requisições |
| 500 | Erro interno do servidor |

**Formato de Erro:**
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "O campo 'procedure_name' é obrigatório",
    "details": {
      "field": "procedure_name",
      "reason": "required"
    }
  }
}
```

## 🔧 Exemplos de Integração

### JavaScript/TypeScript

```typescript
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_KEY = 'sua-chave';

async function createQuotation(data) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/quotation_requests`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY
    },
    body: JSON.stringify(data)
  });
  
  return response.json();
}
```

### Python

```python
import requests

SUPABASE_URL = 'https://seu-projeto.supabase.co'
SUPABASE_KEY = 'sua-chave'

def create_quotation(data):
    response = requests.post(
        f'{SUPABASE_URL}/rest/v1/quotation_requests',
        headers={
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY
        },
        json=data
    )
    return response.json()
```

### cURL

```bash
curl -X POST https://seu-projeto.supabase.co/rest/v1/quotation_requests \
  -H "Authorization: Bearer sua-chave" \
  -H "Content-Type: application/json" \
  -H "apikey: sua-chave" \
  -d '{
    "organization_id": "uuid",
    "request_number": "COT-2024-001",
    "procedure_name": "Cirurgia de Joelho",
    "urgency": "urgent",
    "deadline": "2024-02-15T23:59:59Z"
  }'
```

## 📚 SDKs Disponíveis

- **JavaScript/TypeScript**: `@supabase/supabase-js`
- **Python**: `supabase-py`
- **Dart/Flutter**: `supabase-flutter`
- **Swift**: `supabase-swift`

## 🆘 Suporte

Para dúvidas sobre a API:
- Email: api@opmehub.com
- Documentação: https://docs.opmehub.com/api
- Status da API: https://status.opmehub.com
