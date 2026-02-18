# 🔧 Troubleshooting - Botão de Login Não Funciona

## 🔍 Diagnóstico

Adicionei logs de debug na página de login. Siga os passos abaixo:

### **Passo 1: Abrir o Console do Navegador**

1. Abra o navegador em `http://localhost:3001`
2. Pressione **F12** ou **Ctrl+Shift+I** (Windows) para abrir as DevTools
3. Vá na aba **Console**
4. Recarregue a página

### **Passo 2: Verificar as Mensagens**

Você verá uma destas mensagens:

#### ✅ **Se aparecer:**
```
✅ Supabase configurado corretamente
```
**Ótimo!** As variáveis de ambiente estão OK. Pule para o Passo 3.

#### ❌ **Se aparecer:**
```
❌ Variáveis de ambiente do Supabase não configuradas!
Configure o arquivo .env com:
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```
**Problema identificado!** Você precisa configurar o arquivo `.env`.

---

## 🛠️ Solução: Configurar Arquivo .env

### **1. Verificar se o arquivo .env existe**

Abra o terminal no diretório do projeto e execute:

```bash
# Windows PowerShell
Get-Content .env

# Se der erro "cannot find path", o arquivo não existe
```

### **2. Criar/Editar o arquivo .env**

No terminal, execute:

```bash
# Criar o arquivo .env
@"
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
"@ | Out-File -FilePath .env -Encoding utf8
```

### **3. Obter suas credenciais do Supabase**

1. Acesse [supabase.com](https://supabase.com)
2. Entre no seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** (exemplo: `https://abcdefgh.supabase.co`)
   - **anon public** key (chave longa começando com `eyJ...`)

### **4. Atualizar o arquivo .env**

Edite o arquivo `.env` na raiz do projeto com suas credenciais reais:

```env
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDU0NjQ4MDAsImV4cCI6MTk2MTA0MDgwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **5. Reiniciar o servidor de desenvolvimento**

**IMPORTANTE:** Após alterar o `.env`, você DEVE reiniciar o servidor!

```bash
# Pare o servidor (Ctrl+C no terminal)
# Inicie novamente
npm run dev
```

---

## 🔍 Passo 3: Testar o Login

Após configurar o `.env` e reiniciar o servidor:

1. Recarregue a página (`Ctrl+R` ou `F5`)
2. Abra o Console (F12)
3. Preencha e-mail e senha
4. Clique em **Entrar**

### **Mensagens no Console:**

#### ✅ **Login bem-sucedido:**
```
🔐 Tentando fazer login...
Email: seu@email.com
📡 Chamando signIn...
✅ Login bem-sucedido: { user: {...}, session: {...} }
```

#### ❌ **Credenciais incorretas:**
```
🔐 Tentando fazer login...
Email: seu@email.com
📡 Chamando signIn...
❌ Erro no login: AuthApiError: Invalid login credentials
Mensagem de erro: Invalid login credentials
```
**Solução:** Verifique se o e-mail e senha estão corretos no banco de dados.

#### ❌ **Usuário sem perfil:**
```
✅ Login bem-sucedido
(mas não redireciona para o dashboard)
```
**Solução:** Você precisa criar o perfil do usuário na tabela `profiles`. Veja o arquivo `SETUP_USER.md`.

---

## 🐛 Problemas Comuns

### **1. Botão não faz nada (sem mensagens no console)**

**Causa:** JavaScript não está carregando.

**Solução:**
```bash
# Limpar cache e reinstalar
npm install
npm run dev
```

### **2. Erro: "Missing Supabase environment variables"**

**Causa:** Arquivo `.env` não existe ou está mal configurado.

**Solução:** Siga os passos acima para criar/configurar o `.env`.

### **3. Login funciona mas fica na tela de login**

**Causa:** Usuário não tem perfil na tabela `profiles`.

**Solução:** Execute o script `003_quick_setup.sql` para criar seu perfil.

### **4. Erro: "Failed to fetch" ou "Network error"**

**Causa:** URL do Supabase incorreta ou projeto pausado.

**Solução:**
- Verifique se a URL está correta
- Acesse o Supabase Dashboard e confirme que o projeto está ativo

### **5. Erro: "Invalid API key"**

**Causa:** Chave anon incorreta.

**Solução:**
- Copie novamente a chave do Supabase Dashboard
- Certifique-se de copiar a chave **anon public** (não a service_role)

---

## 📋 Checklist de Verificação

- [ ] Arquivo `.env` existe na raiz do projeto
- [ ] `VITE_SUPABASE_URL` está configurado com a URL correta
- [ ] `VITE_SUPABASE_ANON_KEY` está configurado com a chave correta
- [ ] Servidor foi reiniciado após alterar o `.env`
- [ ] Console do navegador mostra "✅ Supabase configurado corretamente"
- [ ] Usuário existe na tabela `auth.users`
- [ ] Perfil do usuário existe na tabela `profiles`
- [ ] Organização existe na tabela `organizations`
- [ ] Perfil está vinculado à organização

---

## 🆘 Ainda não funciona?

Execute este comando no SQL Editor do Supabase para verificar seu usuário:

```sql
-- Verificar usuário
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.full_name,
  p.role,
  o.name as organization_name
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN organizations o ON o.id = p.organization_id
WHERE u.email = 'seu@email.com';  -- MUDE para seu e-mail
```

**Resultado esperado:**
- Se `full_name` e `organization_name` estão NULL → Execute o `003_quick_setup.sql`
- Se tudo está preenchido → O problema é nas variáveis de ambiente

---

## 📞 Logs Úteis

Compartilhe estas informações se precisar de ajuda:

1. **Console do navegador** (copie todas as mensagens)
2. **Resultado da query SQL** acima
3. **Conteúdo do arquivo .env** (SEM mostrar as chaves completas, apenas os primeiros caracteres)

Exemplo:
```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (oculto)
```
