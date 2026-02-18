# 📤 Como Usar o Sistema de Upload de Arquivos

## ✅ Sistema Implementado e Pronto para Uso!

O sistema de upload de arquivos está **100% funcional** na página de detalhes da cotação.

---

## 🎯 Funcionalidades Disponíveis

### **1. Upload de Documentos do Hospital**
- **Localização:** Card "Documentos do Hospital" na página de cotação
- **Tipos aceitos:** PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
- **Tamanho máximo:** 10MB por arquivo
- **Limite:** 10 arquivos

### **2. Upload de Arquivos Pré-Cirúrgicos**
- **Localização:** Card "Arquivos Pré-Cirúrgicos" na página de cotação
- **Tipos aceitos:** PDF, JPG, PNG, DICOM
- **Tamanho máximo:** 20MB por arquivo
- **Limite:** 20 arquivos

---

## 📝 Como Usar

### **Fazer Upload:**

1. Acesse uma cotação (clique em qualquer cotação da lista)
2. Role até o card "Documentos do Hospital" ou "Arquivos Pré-Cirúrgicos"
3. Clique no botão **"Adicionar"** no canto superior direito do card
4. Clique na área de upload ou arraste um arquivo
5. Selecione o arquivo do seu computador
6. Clique em **"Fazer Upload"**
7. Aguarde a confirmação (o arquivo aparecerá na lista)

### **Fazer Download:**

1. Localize o arquivo na lista
2. Clique no ícone de **download** (seta para baixo)
3. O arquivo será baixado automaticamente

### **Deletar Arquivo:**

1. Localize o arquivo na lista
2. Clique no ícone de **lixeira** (vermelho)
3. Confirme a exclusão
4. O arquivo será removido

---

## 🔒 Segurança

- ✅ Apenas usuários autenticados podem fazer upload
- ✅ Apenas usuários da mesma organização podem ver os arquivos
- ✅ Validação automática de tipo e tamanho de arquivo
- ✅ Arquivos armazenados de forma segura no Supabase Storage
- ✅ URLs assinadas com expiração para downloads

---

## 🎨 Interface

### **Estados Visuais:**

1. **Vazio:** Mostra ícone de upload e mensagem "Clique em Adicionar"
2. **Carregando:** Mostra "Carregando arquivos..."
3. **Com arquivos:** Lista todos os arquivos com nome, tamanho e ações
4. **Fazendo upload:** Mostra barra de progresso e botão "Enviando..."

### **Informações Exibidas:**

- ✅ Nome do arquivo
- ✅ Tamanho formatado (KB, MB)
- ✅ Botões de download e delete
- ✅ Hover effect nos itens da lista

---

## 🛠️ Estrutura Técnica

### **Arquivos Criados:**

1. ✅ `supabase/migrations/007_setup_storage_buckets.sql` - Criação dos buckets
2. ✅ `src/lib/storage.ts` - Helper functions para upload/download
3. ✅ `src/components/common/FileUpload.tsx` - Componente de upload
4. ✅ `src/pages/QuotationDetail.tsx` - Integração completa

### **Buckets no Supabase:**

- ✅ `quote-documents` - Documentos do hospital
- ✅ `pre-surgical-files` - Arquivos pré-cirúrgicos

### **Políticas RLS:**

- ✅ 8 políticas criadas (4 por bucket)
- ✅ SELECT, INSERT, UPDATE, DELETE configurados
- ✅ Isolamento por organização

---

## 🧪 Como Testar

### **Teste 1: Upload de Documento**

1. Acesse qualquer cotação
2. Vá até "Documentos do Hospital"
3. Clique em "Adicionar"
4. Selecione um PDF ou imagem
5. Clique em "Fazer Upload"
6. ✅ Arquivo deve aparecer na lista

### **Teste 2: Download**

1. Clique no ícone de download de um arquivo
2. ✅ Arquivo deve ser baixado automaticamente

### **Teste 3: Delete**

1. Clique no ícone de lixeira
2. Confirme a exclusão
3. ✅ Arquivo deve sumir da lista

### **Teste 4: Validações**

1. Tente fazer upload de arquivo muito grande (>10MB para documentos)
2. ✅ Deve mostrar erro "Arquivo muito grande"
3. Tente fazer upload de tipo não permitido (.exe, .zip)
4. ✅ Deve mostrar erro "Tipo de arquivo não permitido"

---

## 📊 Dados Armazenados

### **No Storage (Supabase):**

```
/{organization_id}/{quote_id}/{timestamp}_{filename}
```

Exemplo:
```
/81463c26-2b9d-4b59-8a32-90bbcaff00d5/abc123/1738712345_documento.pdf
```

### **No Banco de Dados (quotes table):**

Os metadados dos arquivos são salvos nos campos JSONB:

```json
{
  "documents": [
    {
      "id": "path/to/file.pdf",
      "name": "documento.pdf",
      "type": "application/pdf",
      "size": 1024000,
      "url": "https://...",
      "uploaded_at": "2026-02-04T23:00:00Z"
    }
  ],
  "pre_surgical_files": [...]
}
```

---

## ⚠️ Limitações Conhecidas

1. **Tamanho máximo:**
   - Documentos: 10MB
   - Arquivos pré-cirúrgicos: 20MB

2. **Número de arquivos:**
   - Documentos: 10 arquivos
   - Arquivos pré-cirúrgicos: 20 arquivos

3. **Tipos de arquivo:**
   - Apenas os tipos listados são aceitos
   - Outros tipos serão rejeitados

---

## 🐛 Troubleshooting

### **Erro: "Bucket not found"**

**Causa:** Buckets não foram criados  
**Solução:** Execute o script `007_setup_storage_buckets.sql` no Supabase

### **Erro: "new row violates row-level security policy"**

**Causa:** Políticas RLS não configuradas  
**Solução:** Verifique se as 8 políticas foram criadas corretamente

### **Erro: "File type not allowed"**

**Causa:** Tipo de arquivo não está na lista de permitidos  
**Solução:** Use apenas os tipos aceitos (PDF, DOC, XLS, imagens)

### **Erro: "File too large"**

**Causa:** Arquivo excede o limite de tamanho  
**Solução:** Reduza o tamanho do arquivo ou use compressão

### **Arquivos não aparecem após upload**

**Causa:** Erro ao atualizar banco de dados  
**Solução:** Recarregue a página (F5) para ver os arquivos

---

## 🎉 Recursos Implementados

- ✅ Upload de arquivos com drag-and-drop
- ✅ Validação de tipo e tamanho
- ✅ Preview de arquivo selecionado
- ✅ Barra de progresso durante upload
- ✅ Lista de arquivos com nome e tamanho
- ✅ Download de arquivos
- ✅ Delete de arquivos com confirmação
- ✅ Mensagens de erro amigáveis
- ✅ Loading states
- ✅ Hover effects
- ✅ Integração completa com banco de dados
- ✅ Segurança com RLS
- ✅ URLs assinadas para downloads

---

## 📚 Documentação Adicional

- `GUIA_STORAGE_UPLOAD.md` - Guia técnico completo
- `ANALISE_CAMPOS_OPMENEXO.md` - Análise dos campos da OPMEnexo
- `007_setup_storage_buckets.sql` - Script SQL de configuração

---

**Sistema 100% funcional e pronto para uso!** 🚀

**Última atualização:** 04/02/2026 23:50
