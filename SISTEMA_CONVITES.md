# Sistema de Convites de Usuários

## Visão Geral

O HUB OPME agora possui um sistema completo de convites para adicionar novos usuários à sua organização. Este sistema permite que administradores convidem pessoas para se juntarem à equipe através de e-mail.

## Arquitetura Multi-Tenant

### ✅ Confirmação Multi-Tenancy

O projeto **já é multi-tenant** com a seguinte estrutura:

- **Organizações**: Cada hospital/clínica/fornecedor é uma organização separada
- **Isolamento de Dados**: Row Level Security (RLS) garante que cada organização veja apenas seus dados
- **Usuários por Organização**: Cada usuário pertence a uma organização via `organization_id`
- **Roles Hierárquicas**: Sistema de permissões baseado em funções

### Roles Disponíveis

1. **admin** - Administrador da organização (acesso total)
2. **buyer** - Comprador (gerencia cotações e pedidos)
3. **specialist** - Especialista (colabora em respostas técnicas)
4. **reviewer** - Revisor (revisa e aprova respostas)
5. **supplier_admin** - Administrador de fornecedor
6. **supplier_user** - Usuário de fornecedor

## Funcionalidades do Sistema de Convites

### 1. Criar Convites

**Quem pode convidar:**
- Apenas usuários com role `admin` ou `supplier_admin`

**Fluxo Completo**

1. Admin clica em "Configurações" no menu
2. Seleciona a aba "Usuários"
3. Clica em "Convidar Usuário"
4. Preenche formulário no modal
5. Clica em "Enviar Convite"
6. Sistema:
   - Valida permissões
   - Cria convite no banco
   - Gera token único
   - Define validade de 7 dias
7. Convite aparece na sub-tab "Convites"
8. Admin pode reenviar ou cancelar

### 2. Gerenciar Convites

**Ações disponíveis:**

- **Visualizar**: Lista todos os convites da organização
- **Reenviar**: Estende a validade do convite por mais 7 dias
- **Cancelar**: Cancela um convite pendente com motivo opcional
- **Filtrar**: Visualiza por status (pendente, aceito, expirado, cancelado)

### 3. Aceitar Convites

**Fluxo de aceitação:**

1. Usuário recebe convite por e-mail (implementação futura)
2. Clica no link com token único
3. Faz cadastro/login no sistema
4. Sistema valida:
   - Token é válido e não expirado
   - Email corresponde ao convite
   - Convite ainda está pendente
5. Perfil do usuário é criado automaticamente
6. Convite é marcado como aceito
7. Notificação é enviada ao admin que convidou

### 4. Expiração Automática

**Convites expiram após 7 dias:**
- Status muda automaticamente para "expired"
- Função `expire_old_invitations()` pode ser chamada periodicamente
- Admin pode reenviar convite expirado

## Estrutura do Banco de Dados

### Tabela: `user_invitations`

```sql
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  invited_by UUID NOT NULL,
  invited_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  invitation_token UUID UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  accepted_at TIMESTAMPTZ,
  accepted_by UUID,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Políticas RLS

- Admins podem ver/criar/atualizar convites de sua organização
- Usuários podem ver convites enviados para seu email
- Isolamento total entre organizações

## API TypeScript

### Arquivo: `src/lib/invitations.ts`

#### Principais Funções

```typescript
// Criar convite
await invitationsApi.createInvitation({
  email: 'usuario@email.com',
  full_name: 'Nome Completo',
  role: 'buyer',
  phone: '(11) 98765-4321'
});

// Listar convites da organização
const invitations = await invitationsApi.getOrganizationInvitations();

// Listar apenas pendentes
const pending = await invitationsApi.getPendingInvitations();

// Cancelar convite
await invitationsApi.cancelInvitation(invitationId, 'Motivo opcional');

// Reenviar convite
await invitationsApi.resendInvitation(invitationId);

// Aceitar convite (usuário final)
await invitationsApi.acceptInvitation(token);

// Buscar convite por token
const invitation = await invitationsApi.getInvitationByToken(token);
```

### Gerenciamento de Usuários

```typescript
// Listar usuários da organização
const users = await usersApi.getOrganizationUsers();

// Ativar/desativar usuário
await usersApi.updateUserStatus(userId, true);

// Atualizar role
await usersApi.updateUserRole(userId, 'specialist');
```

## Interface do Usuário

### Localização: Configurações > Usuários

**Acesso:**
- Menu lateral: **Configurações**
- Aba: **Usuários** (terceira aba)

**Componentes:**

1. **UsersSettings.tsx** - Componente integrado em Settings
   - Sub-tabs: Usuários Ativos / Convites
   - Lista de usuários com badges de status e role
   - Lista de convites com ações (reenviar/cancelar)
   - Botão "Convidar Usuário"

2. **InviteUserModal.tsx** - Modal de convite
   - Formulário completo com validação
   - Seleção visual de roles
   - Feedback de erros

### Navegação

Integrado ao módulo de **Configurações**:
- Caminho: Configurações → Usuários
- Localizado entre as abas "Perfil" e "Módulos"

## Segurança

### Validações Implementadas

1. **Trigger `validate_invitation_permission`**
   - Verifica se usuário é admin antes de criar convite
   - Valida se convite é para mesma organização

2. **RLS Policies**
   - Isolamento total entre organizações
   - Apenas admins gerenciam convites
   - Usuários veem apenas convites para seu email

3. **Função `accept_invitation`**
   - Valida token e expiração
   - Verifica correspondência de email
   - Cria perfil atomicamente
   - Registra aceitação

### Constraints

- Email único por organização (convites pendentes)
- Token único globalmente
- Apenas um convite pendente por email/organização

## Próximos Passos

### Implementações Futuras

1. **Sistema de E-mail**
   - Enviar email ao criar convite
   - Template com link de aceitação
   - Lembretes antes de expirar

2. **Página de Aceitação**
   - Rota `/accept-invitation/:token`
   - Formulário de cadastro/login
   - Validação visual do token

3. **Notificações**
   - Notificar admin quando convite é aceito
   - Alertas de convites expirando
   - Histórico de convites

4. **Expiração Automática**
   - Job agendado (pg_cron)
   - Ou chamada periódica via API

5. **Auditoria**
   - Log de todas as ações
   - Histórico de mudanças de role
   - Rastreamento de atividades

## Migrações

### Aplicar Migration

```bash
# No Supabase Dashboard:
# SQL Editor > New Query > Colar conteúdo de:
# supabase/migrations/008_user_invitations.sql
```

### Rollback (se necessário)

```sql
DROP TABLE IF EXISTS user_invitations CASCADE;
DROP FUNCTION IF EXISTS expire_old_invitations() CASCADE;
DROP FUNCTION IF EXISTS can_user_invite() CASCADE;
DROP FUNCTION IF EXISTS accept_invitation(UUID, UUID) CASCADE;
```

## Testes

### Cenários de Teste

1. **Criar Convite**
   - ✅ Admin pode criar
   - ✅ Não-admin não pode criar
   - ✅ Email duplicado é rejeitado

2. **Aceitar Convite**
   - ✅ Token válido cria perfil
   - ✅ Token expirado é rejeitado
   - ✅ Email incorreto é rejeitado

3. **Gerenciar Convites**
   - ✅ Reenviar estende validade
   - ✅ Cancelar muda status
   - ✅ Filtros funcionam corretamente

4. **Isolamento Multi-Tenant**
   - ✅ Organização A não vê convites de B
   - ✅ RLS bloqueia acesso cruzado
   - ✅ Usuários veem apenas sua org

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs do Supabase
2. Confirme que a migration foi aplicada
3. Valide as políticas RLS
4. Teste as permissões de role

## Changelog

### v1.0.0 - Sistema de Convites Inicial
- ✅ Tabela de convites
- ✅ API completa de gerenciamento
- ✅ Interface de usuário
- ✅ Validações e segurança
- ✅ Integração com navegação
- ✅ Documentação completa
