# HUB OPME - Sistema de Gestão de Cotações OPME

Sistema completo para gerenciamento de cotações de Órteses, Próteses e Materiais Especiais (OPME), desenvolvido com React, TypeScript, Vite e Supabase.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI/Styling**: TailwindCSS + Lucide Icons
- **Backend/Database**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod

## 📋 Funcionalidades

### Para Hospitais/Clínicas
- ✅ Criar e gerenciar solicitações de cotação
- ✅ Distribuir cotações para múltiplos fornecedores
- ✅ Receber e comparar propostas
- ✅ Acompanhar status em tempo real
- ✅ Dashboard com métricas e estatísticas
- ✅ Histórico completo de cotações

### Para Fornecedores
- ✅ Receber notificações de novas cotações
- ✅ Visualizar detalhes das solicitações
- ✅ Enviar propostas com preços e prazos
- ✅ Acompanhar status das respostas
- ✅ Gerenciar catálogo de produtos

### Recursos Técnicos
- 🔐 Autenticação segura com Supabase Auth
- 🔒 Row Level Security (RLS) no banco de dados
- 📱 Interface responsiva e moderna
- 🔔 Sistema de notificações em tempo real
- 📊 Relatórios e analytics
- 🔌 API REST para integrações externas
- 📄 Exportação de dados em PDF

## 🛠️ Instalação

### Pré-requisitos

- Node.js 18+ e npm/yarn
- Conta no Supabase (gratuita)

### Passo 1: Clone e Instale Dependências

```bash
cd opme-hub
npm install
```

### Passo 2: Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie as credenciais do projeto
3. Crie o arquivo `.env`:

```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### Passo 3: Criar o Schema do Banco de Dados

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Copie e execute o conteúdo de `supabase/migrations/001_initial_schema.sql`

### Passo 4: Executar o Projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
opme-hub/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes UI reutilizáveis
│   │   └── layout/          # Componentes de layout
│   ├── pages/               # Páginas da aplicação
│   ├── lib/
│   │   ├── supabase.ts      # Cliente Supabase
│   │   ├── api.ts           # Funções de API
│   │   ├── types.ts         # Tipos TypeScript
│   │   ├── utils.ts         # Utilitários
│   │   └── store.ts         # Estado global (Zustand)
│   ├── hooks/               # Custom hooks
│   ├── App.tsx              # Componente principal
│   └── main.tsx             # Entry point
├── supabase/
│   └── migrations/          # Migrations do banco
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🗄️ Schema do Banco de Dados

### Principais Tabelas

- **organizations**: Hospitais e clínicas
- **suppliers**: Fornecedores de OPME
- **products**: Catálogo de produtos OPME
- **quotation_requests**: Solicitações de cotação
- **quotation_items**: Itens das cotações
- **quotation_distributions**: Distribuição para fornecedores
- **quotation_responses**: Respostas dos fornecedores
- **quotation_response_items**: Itens das respostas
- **user_profiles**: Perfis de usuários
- **notifications**: Notificações do sistema

## 🔌 API REST

### Endpoints Principais

#### Hospitais/Clínicas

```typescript
// Criar cotação
POST /api/quotations
Body: { quotation, items[] }

// Listar cotações
GET /api/quotations?status=pending&urgency=urgent

// Detalhes da cotação
GET /api/quotations/:id

// Distribuir para fornecedores
POST /api/quotations/:id/distribute
Body: { supplierIds[] }

// Aceitar proposta
POST /api/quotations/:id/accept-response
Body: { responseId }
```

#### Fornecedores

```typescript
// Cotações recebidas
GET /api/supplier/quotations

// Enviar resposta
POST /api/supplier/quotations/:id/respond
Body: { response, items[] }

// Atualizar resposta
PUT /api/supplier/quotations/:id/response
Body: { updates }
```

## 🔐 Autenticação

O sistema utiliza Supabase Auth com suporte a:

- Email/Senha
- Magic Links
- OAuth (Google, GitHub, etc.)

### Roles de Usuário

- **admin**: Administrador do sistema
- **buyer**: Comprador (hospital/clínica)
- **supplier_admin**: Administrador do fornecedor
- **supplier_user**: Usuário do fornecedor

## 🎨 Customização

### Cores e Tema

Edite `src/index.css` para customizar as cores do tema:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  /* ... */
}
```

### Componentes UI

Os componentes UI estão em `src/components/ui/` e seguem o padrão do shadcn/ui.

## 📊 Dashboard e Métricas

O dashboard exibe:

- Total de cotações
- Cotações pendentes
- Cotações concluídas
- Valor total economizado
- Cotações recentes
- Performance de fornecedores

## 🔔 Notificações

Sistema de notificações em tempo real para:

- Novas cotações recebidas
- Respostas de fornecedores
- Prazos próximos do vencimento
- Mudanças de status

## 🚀 Deploy

### Netlify/Vercel

```bash
npm run build
```

O build será gerado em `dist/`. Faça upload para seu serviço de hospedagem preferido.

### Variáveis de Ambiente

Configure as mesmas variáveis do `.env` no seu serviço de hospedagem:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📝 Dados de Teste

Para popular o banco com dados de teste, você pode usar o SQL Editor do Supabase:

```sql
-- Inserir organização de teste
INSERT INTO organizations (name, cnpj, email, type)
VALUES ('Hospital Exemplo', '12.345.678/0001-90', 'contato@hospital.com', 'hospital');

-- Inserir fornecedor de teste
INSERT INTO suppliers (name, cnpj, email, specialties, rating)
VALUES ('Fornecedor OPME', '98.765.432/0001-10', 'vendas@fornecedor.com', 
        ARRAY['ortopedia', 'cardiologia'], 4.5);
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para dúvidas e suporte:

- Email: suporte@opmehub.com
- Documentação: [docs.opmehub.com](https://docs.opmehub.com)
- Issues: [GitHub Issues](https://github.com/seu-usuario/opme-hub/issues)

## 🎯 Roadmap

- [ ] Integração com sistemas hospitalares (HIS)
- [ ] App mobile (React Native)
- [ ] Relatórios avançados e BI
- [ ] Integração com ANVISA
- [ ] Sistema de leilão reverso
- [ ] Gestão de contratos
- [ ] Integração com ERPs
- [ ] API pública para integrações

---

Desenvolvido para otimizar o processo de cotação de OPME no Brasil.
