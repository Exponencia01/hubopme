# 🚀 Primeiro Acesso - Configuração Rápida

## ⚠️ Você está vendo o erro: "Seu perfil de usuário não foi encontrado"?

Isso é normal! Você precisa criar seu perfil de administrador primeiro.

## 📋 Passo a Passo Rápido

### 1️⃣ Obter seu User ID

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Authentication** → **Users**
4. Encontre seu email e **copie o UUID** (ID do usuário)
   - Exemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### 2️⃣ Criar sua Organização e Perfil

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **New Query**
3. Cole o código abaixo e **EDITE OS VALORES**:

```sql
-- PASSO 1: Criar sua organização
INSERT INTO organizations (
  id,
  name,
  type,
  document,
  email,
  phone,
  is_active
) VALUES (
  gen_random_uuid(),
  'Nome da Sua Empresa',           -- ⚠️ ALTERE AQUI
  'hospital',                       -- ou 'supplier'
  '12.345.678/0001-90',            -- ⚠️ ALTERE: CNPJ
  'contato@suaempresa.com',        -- ⚠️ ALTERE: Email
  '(11) 3333-4444',                -- ⚠️ ALTERE: Telefone
  true
)
ON CONFLICT (document) DO NOTHING
RETURNING id, name;

-- PASSO 2: Criar seu perfil de administrador
-- ⚠️ IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo UUID que você copiou
INSERT INTO user_profiles (
  id,
  organization_id,
  full_name,
  role,
  phone,
  is_active
) VALUES (
  'SEU_USER_ID_AQUI',              -- ⚠️ COLE SEU UUID AQUI
  (SELECT id FROM organizations WHERE email = 'contato@suaempresa.com' LIMIT 1),
  'Seu Nome Completo',             -- ⚠️ ALTERE AQUI
  'admin',
  '(11) 98765-4321',               -- ⚠️ ALTERE: Seu telefone
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true;
```

4. Clique em **Run** (ou pressione Ctrl+Enter)

### 3️⃣ Verificar se Funcionou

Execute esta query:

```sql
SELECT 
  up.id,
  up.full_name,
  up.role,
  up.is_active,
  o.name as organization_name
FROM user_profiles up
JOIN organizations o ON o.id = up.organization_id
WHERE up.id = 'SEU_USER_ID_AQUI';  -- ⚠️ Cole seu UUID aqui
```

Você deve ver seus dados! ✅

### 4️⃣ Testar no Sistema

1. **Faça logout** da aplicação
2. **Faça login** novamente
3. Vá em **Configurações** → **Usuários**
4. Agora você pode **Convidar Usuário**! 🎉

## 🎯 Sobre o Sistema de Convites

### Como Funciona:

1. **Você (Admin)** cria um convite para um novo usuário
2. O sistema gera um token único válido por 7 dias
3. O **novo usuário** recebe o convite (futuramente por email)
4. Ele faz cadastro/login no sistema
5. Ao aceitar o convite, ele automaticamente:
   - Entra na sua organização
   - Recebe a função (role) que você definiu
   - Fica ativo no sistema

### Quem Pode Convidar:

- ✅ Administradores (`admin`)
- ✅ Administradores de Fornecedor (`supplier_admin`)
- ❌ Outros usuários não veem a opção

### Funções Disponíveis:

- **Administrador** - Acesso total, pode convidar usuários
- **Comprador** - Gerencia cotações e pedidos
- **Especialista** - Colabora em respostas técnicas
- **Revisor** - Revisa e aprova respostas
- **Admin Fornecedor** - Administrador de fornecedor
- **Usuário Fornecedor** - Usuário de fornecedor

## ❓ Perguntas Frequentes

### "Por que preciso criar meu perfil manualmente?"

Este é o **primeiro acesso** do sistema. Você é o administrador inicial, então precisa criar sua organização e perfil manualmente. Depois disso, todos os outros usuários serão criados automaticamente através dos convites!

### "O usuário convidado precisa ter perfil?"

**NÃO!** O usuário convidado **não deve** ter perfil. O perfil dele será criado automaticamente quando ele aceitar o convite. Por isso você está criando um **convite**, não um usuário diretamente.

### "Posso convidar alguém que já tem conta?"

Sim, mas ele não pode pertencer a outra organização. Atualmente, cada usuário pertence a apenas uma organização.

### "Como o convidado vai aceitar?"

Atualmente, o convite é criado no banco de dados. Você precisará implementar:
1. Sistema de envio de email com link
2. Página de aceitação de convite

Ou pode criar os usuários manualmente no banco seguindo o mesmo processo que você fez para seu perfil.

## 🆘 Problemas Comuns

### Erro: "Perfil não encontrado"
- **Causa**: Você não executou o script de criação de perfil
- **Solução**: Volte ao Passo 2

### Erro: "Apenas administradores podem convidar"
- **Causa**: Seu perfil não tem role `admin`
- **Solução**: Execute:
```sql
UPDATE user_profiles SET role = 'admin' WHERE id = 'SEU_USER_ID';
```

### Não vejo a aba "Usuários" em Configurações
- **Causa**: Seu perfil não é admin
- **Solução**: Verifique seu role no banco de dados

### Erro: "Já existe um convite pendente"
- **Causa**: Você já enviou convite para este email
- **Solução**: Cancele o convite anterior ou use outro email

## 📞 Próximos Passos

Após configurar seu perfil:

1. ✅ Convide sua equipe
2. ✅ Configure dados da organização
3. ✅ Ative os módulos necessários
4. ✅ Comece a usar o sistema!

---

**Dica**: Salve seu User ID em um lugar seguro. Você pode precisar dele no futuro.
