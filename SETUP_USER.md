# 🚀 Guia de Configuração - Usuário e Organização

## Situação Atual
- ✅ Você criou seu usuário direto no banco de dados (tabela `auth.users`)
- ✅ A tabela foi renomeada de `user_profiles` para `profiles`
- ⏳ Falta criar sua organização e vincular seu perfil

## 📋 Passo a Passo

### **Passo 1: Descobrir seu User ID**

No Supabase Dashboard, vá em **SQL Editor** e execute:

```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
```

**Copie o `id` do seu usuário** - você vai precisar dele!

---

### **Passo 2: Criar Organização e Perfil**

Cole o script abaixo no **SQL Editor**, **substitua os valores** e execute:

```sql
DO $$
DECLARE
  v_org_id UUID;
  v_user_id UUID := 'COLE_SEU_USER_ID_AQUI'::uuid; -- ⚠️ MUDE AQUI
BEGIN
  -- Criar sua organização
  INSERT INTO organizations (
    name,
    cnpj,
    email,
    phone,
    type,
    status
  ) VALUES (
    'Hospital Exemplo',              -- ⚠️ MUDE: Nome da sua organização
    '12.345.678/0001-90',           -- ⚠️ MUDE: CNPJ
    'contato@hospital.com',         -- ⚠️ MUDE: E-mail
    '(11) 3333-4444',               -- ⚠️ MUDE: Telefone
    'hospital',                     -- hospital, clinic ou supplier
    'active'
  )
  ON CONFLICT (cnpj) DO UPDATE 
  SET name = EXCLUDED.name
  RETURNING id INTO v_org_id;

  RAISE NOTICE 'Organização criada com ID: %', v_org_id;

  -- Criar seu perfil
  INSERT INTO profiles (
    id,
    organization_id,
    full_name,
    role,
    phone,
    is_active
  ) VALUES (
    v_user_id,
    v_org_id,
    'Seu Nome Completo',            -- ⚠️ MUDE: Seu nome
    'admin',                        -- admin, buyer, specialist, reviewer
    '(11) 98765-4321',              -- ⚠️ MUDE: Seu telefone
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    organization_id = EXCLUDED.organization_id,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    updated_at = NOW();

  RAISE NOTICE 'Perfil criado para user_id: %', v_user_id;
END $$;
```

---

### **Passo 3: Verificar se Funcionou**

Execute esta query para confirmar:

```sql
SELECT 
  u.email,
  p.full_name,
  p.role,
  o.name as organization_name,
  o.cnpj,
  p.is_active
FROM profiles p
JOIN auth.users u ON p.id = u.id
JOIN organizations o ON p.organization_id = o.id
WHERE u.email = 'seu@email.com';  -- ⚠️ MUDE para seu e-mail
```

**Resultado esperado:**
```
email                | full_name      | role  | organization_name | cnpj              | is_active
---------------------|----------------|-------|-------------------|-------------------|----------
seu@email.com        | Seu Nome       | admin | Hospital Exemplo  | 12.345.678/0001-90| true
```

---

## 🔧 Tipos de Organização

- **`hospital`** - Hospital
- **`clinic`** - Clínica
- **`supplier`** - Fornecedor de OPME

## 👤 Tipos de Role (Papel do Usuário)

- **`admin`** - Administrador (acesso total)
- **`buyer`** - Comprador (cria e gerencia cotações)
- **`specialist`** - Especialista (auxilia em cotações)
- **`reviewer`** - Revisor (aprova cotações)
- **`supplier_admin`** - Admin do fornecedor
- **`supplier_user`** - Usuário do fornecedor

---

## ✅ Próximos Passos

Após executar o script:

1. **Faça logout** do sistema (se estiver logado)
2. **Faça login novamente** com suas credenciais
3. O sistema agora vai reconhecer sua organização e perfil
4. Você terá acesso completo ao dashboard

---

## 🆘 Problemas Comuns

### Erro: "duplicate key value violates unique constraint"
**Solução**: A organização com esse CNPJ já existe. Use outro CNPJ ou remova o registro existente.

### Erro: "null value in column organization_id"
**Solução**: Certifique-se de que a organização foi criada primeiro e o ID foi capturado corretamente.

### Perfil não aparece após login
**Solução**: 
1. Verifique se o `user_id` está correto
2. Confirme que `is_active = true`
3. Faça logout e login novamente

---

## 📝 Exemplo Completo

```sql
-- Exemplo com dados fictícios
DO $$
DECLARE
  v_org_id UUID;
  v_user_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid;
BEGIN
  INSERT INTO organizations (name, cnpj, email, phone, type, status)
  VALUES ('Hospital São Lucas', '12.345.678/0001-90', 'contato@saolucas.com', '(11) 3333-4444', 'hospital', 'active')
  ON CONFLICT (cnpj) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_org_id;

  INSERT INTO profiles (id, organization_id, full_name, role, phone, is_active)
  VALUES (v_user_id, v_org_id, 'João Silva', 'admin', '(11) 98765-4321', true)
  ON CONFLICT (id) DO UPDATE SET
    organization_id = EXCLUDED.organization_id,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    updated_at = NOW();
END $$;
```

---

**Dúvidas?** Entre em contato ou consulte a documentação do Supabase.
