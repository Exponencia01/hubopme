# 📋 Como Usar as Cotações de Exemplo

## 🎯 Objetivo

Este script cria **10 cotações realistas** de OPME para você testar o sistema completo de resposta a cotações.

---

## 🚀 Como Executar

### **Passo 1: Abrir SQL Editor do Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Entre no seu projeto
3. Vá em **SQL Editor** (ícone de banco de dados no menu lateral)

### **Passo 2: Executar o Script**
1. Clique em **"New Query"**
2. Abra o arquivo `supabase/migrations/006_seed_sample_quotes.sql`
3. Copie **TODO o conteúdo** do arquivo
4. Cole no SQL Editor
5. Clique em **"Run"** (ou pressione Ctrl+Enter)

### **Passo 3: Verificar Resultado**
Você verá uma tabela com as 10 cotações criadas:
```
pedido_id     | titulo                              | patient_name    | status  | num_produtos
--------------|-------------------------------------|-----------------|---------|-------------
PED-2026-001  | Artroplastia Total de Joelho        | João da Silva   | pending | 3
PED-2026-002  | Implante de Stent Coronariano       | Maria Santos    | pending | 3
...
```

---

## 📊 Cotações Criadas

### **1. Artroplastia Total de Joelho** 🦵
- **Hospital:** São Lucas
- **Paciente:** João da Silva
- **Prazo:** 48 horas
- **Produtos:** Prótese de joelho, parafusos, cimento ósseo
- **Urgência:** Eletivo

### **2. Implante de Stent Coronariano** ❤️
- **Clínica:** Instituto Cardíaco Premium
- **Paciente:** Maria Santos
- **Prazo:** 24 horas (URGENTE)
- **Produtos:** Stent farmacológico, cateter, balão
- **Urgência:** Urgência

### **3. Artrodese Lombar L4-L5** 🦴
- **Clínica:** Ortopédica Vida
- **Paciente:** Pedro Oliveira
- **Prazo:** 72 horas
- **Produtos:** Cage intersomático, parafusos pediculares, hastes
- **Urgência:** Eletivo

### **4. Artroplastia Total de Quadril** 🦴
- **Hospital:** São Lucas
- **Paciente:** Ana Costa
- **Prazo:** 96 horas
- **Produtos:** Prótese de quadril, cabeça cerâmica, acetábulo
- **Urgência:** Eletivo

### **5. Implante de Marca-passo** ⚡
- **Clínica:** Instituto Cardíaco Premium
- **Paciente:** José Ferreira
- **Prazo:** 36 horas (URGENTE)
- **Produtos:** Marca-passo dupla câmara, eletrodos
- **Urgência:** Urgência

### **6. Reparo de Manguito Rotador** 💪
- **Clínica:** Ortopédica Vida
- **Paciente:** Carlos Alberto
- **Prazo:** 120 horas
- **Produtos:** Âncoras de sutura, fio, lâmina de shaver
- **Urgência:** Eletivo

### **7. Reconstrução Mamária Bilateral** 👩
- **Hospital:** Santa Maria
- **Paciente:** Fernanda Lima
- **Prazo:** 168 horas
- **Produtos:** Próteses de silicone, tela cirúrgica
- **Urgência:** Eletivo
- **Pagamento:** Particular

### **8. Facoemulsificação com LIO** 👁️
- **Hospital:** São Lucas
- **Paciente:** Helena Martins
- **Prazo:** 144 horas
- **Produtos:** Lente intraocular, viscoelástico
- **Urgência:** Eletivo

### **9. Discectomia Cervical C5-C6** 🦴
- **Clínica:** Ortopédica Vida
- **Paciente:** Roberto Almeida
- **Prazo:** 192 horas
- **Produtos:** Cage cervical, placa, parafusos
- **Urgência:** Eletivo

### **10. Artroplastia Total de Tornozelo** 🦶
- **Hospital:** Santa Maria
- **Paciente:** Marcos Silva
- **Prazo:** 216 horas
- **Produtos:** Prótese de tornozelo, parafusos
- **Urgência:** Eletivo

---

## 🧪 Testando o Sistema

### **Após Executar o Script:**

1. **Recarregue a página** do OPME Hub
2. Vá em **Cotações** no menu lateral
3. Você verá as **10 cotações** na lista

### **Para Testar Resposta:**

1. **Clique em uma cotação** da lista
2. Veja os detalhes (produtos, paciente, prazo)
3. Clique em **"Responder Cotação"**
4. Preencha o formulário:
   - Marque produtos disponíveis
   - Defina preços (ex: R$ 1.500,00 para prótese)
   - Adicione condições comerciais
5. Clique em **"Enviar Resposta"**
6. Veja a confirmação de sucesso

### **Sugestões de Preços Realistas:**

| Produto | Preço Sugerido |
|---------|----------------|
| Prótese de Joelho | R$ 8.000 - R$ 15.000 |
| Stent Coronariano | R$ 3.000 - R$ 8.000 |
| Cage Lombar | R$ 2.500 - R$ 5.000 |
| Parafusos Pediculares | R$ 800 - R$ 1.500 (cada) |
| Marca-passo | R$ 12.000 - R$ 25.000 |
| Prótese de Mama | R$ 4.000 - R$ 8.000 |
| Lente Intraocular | R$ 800 - R$ 2.000 |

---

## 🔄 Limpar Dados de Teste

Se quiser remover as cotações de exemplo:

```sql
-- Remover cotações de exemplo
DELETE FROM quotes 
WHERE id IN (
  'c0000001-0000-0000-0000-000000000001',
  'c0000002-0000-0000-0000-000000000002',
  'c0000003-0000-0000-0000-000000000003',
  'c0000004-0000-0000-0000-000000000004',
  'c0000005-0000-0000-0000-000000000005',
  'c0000006-0000-0000-0000-000000000006',
  'c0000007-0000-0000-0000-000000000007',
  'c0000008-0000-0000-0000-000000000008',
  'c0000009-0000-0000-0000-000000000009',
  'c0000010-0000-0000-0000-000000000010'
);

-- Remover organizações de exemplo (opcional)
DELETE FROM organizations 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);
```

---

## 📝 Dados Incluídos

### **4 Organizações (Clientes):**
1. Hospital São Lucas
2. Clínica Ortopédica Vida
3. Hospital Santa Maria
4. Instituto Cardíaco Premium

### **10 Cotações com:**
- ✅ Dados completos do paciente
- ✅ Médico solicitante
- ✅ Operadora de saúde
- ✅ Produtos OPME realistas
- ✅ Prazos variados (24h a 216h)
- ✅ Observações específicas
- ✅ Diferentes especialidades médicas

---

## 🎯 Cenários de Teste

### **Teste 1: Cotação Urgente**
- Use a **Cotação 2** (Stent) ou **Cotação 5** (Marca-passo)
- Prazo curto (24-36h)
- Simule resposta rápida

### **Teste 2: Cotação com Múltiplos Itens**
- Use a **Cotação 3** (Artrodese Lombar)
- 4 produtos diferentes
- Teste marcando alguns como indisponíveis

### **Teste 3: Cotação Particular**
- Use a **Cotação 7** (Reconstrução Mamária)
- Sem operadora
- Teste condições de pagamento diferentes

### **Teste 4: Produto Substituto**
- Use qualquer cotação
- Marque produto como indisponível
- Sugira produto alternativo

---

## ✅ Checklist de Teste

- [ ] Script executado com sucesso
- [ ] 10 cotações aparecem na lista
- [ ] Consegue abrir detalhes de uma cotação
- [ ] Consegue clicar em "Responder Cotação"
- [ ] Formulário carrega com todos os produtos
- [ ] Consegue marcar produtos disponíveis/indisponíveis
- [ ] Consegue definir preços e quantidades
- [ ] Cálculos automáticos funcionam
- [ ] Consegue adicionar condições comerciais
- [ ] Consegue enviar resposta
- [ ] Recebe confirmação de sucesso
- [ ] Resposta aparece nos detalhes da cotação

---

## 🆘 Problemas Comuns

### **Erro: "relation quotes does not exist"**
**Solução:** Execute primeiro a migração `001_opmenexo_schema.sql`

### **Erro: "duplicate key value"**
**Solução:** As cotações já existem. Use o script de limpeza acima.

### **Cotações não aparecem na lista**
**Solução:** 
1. Verifique se executou o script corretamente
2. Recarregue a página (Ctrl+R)
3. Verifique as políticas RLS

### **Erro ao responder cotação**
**Solução:**
1. Confirme que executou `004_fix_rls_policies.sql`
2. Verifique se seu usuário tem perfil vinculado
3. Veja o console do navegador (F12) para erros

---

## 📊 Estatísticas das Cotações

- **Total:** 10 cotações
- **Urgentes:** 2 (Stent, Marca-passo)
- **Eletivas:** 8
- **Especialidades:** Ortopedia (5), Cardiologia (2), Plástica (1), Oftalmologia (1), Neurocirurgia (1)
- **Total de Produtos:** 29 itens diferentes
- **Hospitais:** 2
- **Clínicas:** 2

---

**Última atualização:** 04/02/2026 22:50
