# Setup Inicial - OPME Hub

## 🚀 Configuração Inicial do Sistema

Após fazer o deploy e configurar o Supabase, você precisa criar seu perfil de administrador inicial.

## Passo 1: Aplicar Migrations

No Supabase Dashboard:
1. Vá em **SQL Editor**
2. Crie uma nova query
3. Cole o conteúdo de cada migration em ordem:
   - `supabase/migrations/001_opmenexo_schema.sql`
   - `supabase/migrations/008_user_invitations.sql`
4. Execute cada uma

## Passo 2: Criar Primeiro Usuário

### 2.1 Fazer Cadastro no Sistema

1. Acesse sua aplicação
2. Faça o cadastro/login usando email e senha
3. Isso criará um usuário na tabela `auth.users`

### 2.2 Obter seu User ID

No Supabase Dashboard:
1. Vá em **Authentication > Users**
2. Encontre seu usuário
3. Copie o **UUID** (ID do usuário)

Exemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### 2.3 Criar Organização e Perfil

No Supabase Dashboard:
1. Vá em **SQL Editor**
2. Abra o arquivo `scripts/create_admin_profile.sql`
3. **IMPORTANTE**: Edite os seguintes campos:
   - `SEU_USER_ID` → Cole o UUID que você copiou
   - `Minha Organização` → Nome da sua empresa
   - `00.000.000/0001-00` → CNPJ da sua empresa
   - `contato@empresa.com` → Email corporativo
   - `(11) 3333-4444` → Telefone
   - `Seu Nome Completo` → Seu nome
   - `(11) 98765-4321` → Seu telefone pessoal
4. Execute o script

### 2.4 Verificar

Execute esta query para confirmar:

```sql
SELECT 
  up.id,
  up.full_name,
  up.role,
  up.is_active,
  o.name as organization_name,
  o.type as organization_type
FROM user_profiles up
JOIN organizations o ON o.id = up.organization_id
WHERE up.id = 'SEU_USER_ID'; -- Cole seu UUID aqui
```

Você deve ver:
- ✅ Seu nome
- ✅ Role: `admin`
- ✅ Status: `true` (ativo)
- ✅ Nome da organização

## Passo 3: Testar o Sistema

1. Faça logout e login novamente
2. Acesse **Configurações > Usuários**
3. Clique em **"Convidar Usuário"**
4. Preencha os dados de um novo usuário
5. Clique em **"Enviar Convite"**

Se tudo estiver correto, o convite será criado! ✅

## 🔧 Troubleshooting

### Erro: "Perfil não encontrado"

**Causa**: Você não tem um registro na tabela `user_profiles`

**Solução**: Execute o script `create_admin_profile.sql` conforme Passo 2.3

### Erro: "Apenas administradores podem convidar"

**Causa**: Seu perfil não tem role `admin` ou `supplier_admin`

**Solução**: Execute esta query:

```sql
UPDATE user_profiles
SET role = 'admin'
WHERE id = 'SEU_USER_ID'; -- Cole seu UUID aqui
```

### Erro: "Já existe um convite pendente"

**Causa**: Você já enviou um convite para este email

**Solução**: 
- Cancele o convite anterior em **Configurações > Usuários > Convites**
- Ou use outro email

### Erro ao aceitar convite

**Causa**: O usuário convidado já tem perfil em outra organização

**Solução**: Atualmente, um usuário só pode pertencer a uma organização. Use outro email.

## 📋 Checklist de Setup

- [ ] Migrations aplicadas
- [ ] Primeiro usuário cadastrado (auth.users)
- [ ] Organização criada
- [ ] Perfil de admin criado (user_profiles)
- [ ] Login funcionando
- [ ] Consegue acessar Configurações > Usuários
- [ ] Consegue criar convites

## 🎯 Próximos Passos

Após o setup inicial:

1. **Convidar Equipe**: Use o sistema de convites para adicionar sua equipe
2. **Configurar Organização**: Preencha dados em Configurações > Organização
3. **Ativar Módulos**: Configure módulos em Configurações > Módulos
4. **Começar a Usar**: Crie cotações, gerencie produtos, etc.

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Supabase (Database > Logs)
2. Confirme que as RLS policies estão ativas
3. Verifique se seu user_id está correto
4. Confirme que a organização foi criada

---

**Importante**: Guarde bem o UUID do seu usuário e da sua organização. Você pode precisar deles no futuro.
