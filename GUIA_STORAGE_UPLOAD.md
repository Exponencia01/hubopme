# 📁 Guia de Storage e Upload de Arquivos

## 🎯 Visão Geral

O sistema agora suporta upload de arquivos em duas categorias:
1. **Documentos do Hospital** - Documentos vinculados à cotação
2. **Arquivos Pré-Cirúrgicos** - Exames, laudos e imagens médicas

---

## 🗄️ Estrutura de Storage

### **Buckets Criados:**

#### 1. `quote-documents`
- **Propósito:** Documentos administrativos e comerciais
- **Tipos permitidos:** PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
- **Tamanho máximo:** 10MB por arquivo
- **Estrutura:** `/{organization_id}/{quote_id}/{filename}`

#### 2. `pre-surgical-files`
- **Propósito:** Arquivos médicos pré-cirúrgicos
- **Tipos permitidos:** PDF, JPG, PNG, DICOM
- **Tamanho máximo:** 20MB por arquivo
- **Estrutura:** `/{organization_id}/{quote_id}/pre-surgical/{filename}`

---

## 🚀 Como Configurar (Primeira Vez)

### **Passo 1: Executar Script SQL**

Execute o script no **SQL Editor do Supabase**:

```bash
# Arquivo: supabase/migrations/007_setup_storage_buckets.sql
```

Este script irá:
- ✅ Criar os 2 buckets
- ✅ Configurar limites de tamanho
- ✅ Definir tipos de arquivo permitidos
- ✅ Criar políticas RLS de segurança

### **Passo 2: Verificar Criação**

Execute no SQL Editor:

```sql
-- Verificar buckets
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id IN ('quote-documents', 'pre-surgical-files');

-- Verificar políticas
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'objects' 
AND (policyname LIKE '%quote%' OR policyname LIKE '%surgical%');
```

**Resultado esperado:**
- 2 buckets criados
- 8 políticas RLS (4 para cada bucket)

---

## 💻 Como Usar no Código

### **1. Upload de Arquivo**

```typescript
import { uploadFile } from '@/lib/storage';

const handleUpload = async (file: File) => {
  try {
    const fileMetadata = await uploadFile({
      bucket: 'quote-documents',
      organizationId: user.organization_id,
      quoteId: quotation.id,
      file: file,
    });
    
    console.log('Upload completo:', fileMetadata);
  } catch (error) {
    console.error('Erro no upload:', error);
  }
};
```

### **2. Listar Arquivos**

```typescript
import { listFiles } from '@/lib/storage';

const loadFiles = async () => {
  const files = await listFiles(
    'quote-documents',
    organizationId,
    quoteId
  );
  
  console.log('Arquivos:', files);
};
```

### **3. Download de Arquivo**

```typescript
import { downloadFile } from '@/lib/storage';

const handleDownload = async (filePath: string) => {
  const blob = await downloadFile('quote-documents', filePath);
  
  // Criar link de download
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'arquivo.pdf';
  a.click();
};
```

### **4. Deletar Arquivo**

```typescript
import { deleteFile } from '@/lib/storage';

const handleDelete = async (filePath: string) => {
  await deleteFile('quote-documents', filePath);
  console.log('Arquivo deletado');
};
```

---

## 🎨 Componente FileUpload

### **Uso Básico**

```tsx
import FileUpload from '@/components/common/FileUpload';

<FileUpload
  bucket="quote-documents"
  organizationId={user.organization_id}
  quoteId={quotation.id}
  onUploadComplete={(file) => {
    console.log('Upload completo:', file);
    // Atualizar lista de arquivos
  }}
  onUploadError={(error) => {
    console.error('Erro:', error);
  }}
  maxFiles={10}
  currentFilesCount={documents.length}
/>
```

### **Props do Componente**

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `bucket` | `'quote-documents' \| 'pre-surgical-files'` | ✅ | Bucket de destino |
| `organizationId` | `string` | ✅ | ID da organização |
| `quoteId` | `string` | ✅ | ID da cotação |
| `folder` | `string` | ❌ | Subpasta (opcional) |
| `onUploadComplete` | `(file: FileMetadata) => void` | ❌ | Callback de sucesso |
| `onUploadError` | `(error: string) => void` | ❌ | Callback de erro |
| `maxFiles` | `number` | ❌ | Limite de arquivos (padrão: 10) |
| `currentFilesCount` | `number` | ❌ | Quantidade atual de arquivos |

---

## 🔒 Segurança e Políticas RLS

### **Regras de Acesso:**

1. **SELECT (Download):**
   - ✅ Usuários autenticados da mesma organização
   - ❌ Usuários de outras organizações
   - ❌ Usuários não autenticados

2. **INSERT (Upload):**
   - ✅ Qualquer usuário autenticado
   - ❌ Usuários não autenticados

3. **UPDATE/DELETE:**
   - ✅ Usuários autenticados da mesma organização
   - ❌ Usuários de outras organizações

### **Como Funciona:**

As políticas RLS verificam:
1. Se o usuário está autenticado (`auth.uid()`)
2. Se o usuário pertence à mesma organização da cotação
3. Extrai o `quote_id` do path do arquivo
4. Verifica se a organização do usuário = organização da cotação

---

## 📋 Validações Implementadas

### **1. Tipo de Arquivo**

```typescript
import { validateFileType } from '@/lib/storage';

const isValid = validateFileType(file, 'quote-documents');
// true se o tipo é permitido
```

**Tipos permitidos por bucket:**

**quote-documents:**
- PDF
- DOC, DOCX
- XLS, XLSX
- JPG, JPEG, PNG

**pre-surgical-files:**
- PDF
- JPG, JPEG, PNG
- DICOM

### **2. Tamanho do Arquivo**

```typescript
import { validateFileSize } from '@/lib/storage';

const isValid = validateFileSize(file, 'quote-documents');
// true se <= 10MB (quote-documents) ou <= 20MB (pre-surgical-files)
```

### **3. Número de Arquivos**

O componente `FileUpload` valida automaticamente se o limite de arquivos foi atingido.

---

## 🛠️ Funções Utilitárias

### **Formatar Tamanho de Arquivo**

```typescript
import { formatFileSize } from '@/lib/storage';

formatFileSize(1024);        // "1 KB"
formatFileSize(1048576);     // "1 MB"
formatFileSize(5242880);     // "5 MB"
```

### **Gerar URL Assinada**

```typescript
import { getSignedUrl } from '@/lib/storage';

const url = await getSignedUrl(
  'quote-documents',
  'path/to/file.pdf',
  3600 // Expira em 1 hora
);
```

---

## 🐛 Troubleshooting

### **Erro: "Bucket not found"**

**Solução:** Execute o script `007_setup_storage_buckets.sql`

```sql
-- Verificar se buckets existem
SELECT * FROM storage.buckets;
```

### **Erro: "new row violates row-level security policy"**

**Solução:** Verificar políticas RLS

```sql
-- Listar políticas
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

### **Erro: "File type not allowed"**

**Solução:** Verificar se o tipo do arquivo está na lista de permitidos

```typescript
// Verificar tipo MIME do arquivo
console.log(file.type);
```

### **Erro: "File too large"**

**Solução:** 
- quote-documents: máx. 10MB
- pre-surgical-files: máx. 20MB

```typescript
// Verificar tamanho
console.log(formatFileSize(file.size));
```

---

## 📊 Estrutura de Dados

### **FileMetadata**

```typescript
interface FileMetadata {
  id: string;           // Path completo do arquivo
  name: string;         // Nome original do arquivo
  size: number;         // Tamanho em bytes
  type: string;         // MIME type
  url: string;          // URL assinada para download
  uploaded_at: string;  // ISO timestamp
  uploaded_by?: string; // ID do usuário (opcional)
}
```

### **Atualizar Quote com Arquivos**

Após upload, atualize o campo JSONB da cotação:

```typescript
// Para documentos
const updatedDocuments = [
  ...quotation.documents,
  {
    id: fileMetadata.id,
    name: fileMetadata.name,
    type: fileMetadata.type,
    url: fileMetadata.url,
    uploaded_at: fileMetadata.uploaded_at,
  }
];

await supabase
  .from('quotes')
  .update({ documents: updatedDocuments })
  .eq('id', quoteId);

// Para arquivos pré-cirúrgicos
const updatedFiles = [
  ...quotation.pre_surgical_files,
  {
    id: fileMetadata.id,
    name: fileMetadata.name,
    type: fileMetadata.type,
    url: fileMetadata.url,
    uploaded_at: fileMetadata.uploaded_at,
  }
];

await supabase
  .from('quotes')
  .update({ pre_surgical_files: updatedFiles })
  .eq('id', quoteId);
```

---

## ✅ Checklist de Implementação

- [x] Script SQL criado (`007_setup_storage_buckets.sql`)
- [x] Helper functions criadas (`src/lib/storage.ts`)
- [x] Componente FileUpload criado (`src/components/common/FileUpload.tsx`)
- [ ] Integrar FileUpload na página QuotationDetail
- [ ] Testar upload de documentos
- [ ] Testar upload de arquivos pré-cirúrgicos
- [ ] Testar download de arquivos
- [ ] Testar delete de arquivos
- [ ] Validar políticas RLS

---

## 🎯 Próximos Passos

1. Executar script SQL no Supabase
2. Integrar componente FileUpload nos cards de documentos
3. Implementar atualização do campo JSONB após upload
4. Implementar listagem de arquivos existentes
5. Implementar download e delete

---

**Última atualização:** 04/02/2026 23:20
