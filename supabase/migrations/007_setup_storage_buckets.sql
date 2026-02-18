-- =====================================================
-- CONFIGURAÇÃO DE STORAGE BUCKETS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. CRIAR BUCKET: quote-documents
-- Para documentos do hospital vinculados à cotação
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'quote-documents',
  'quote-documents',
  false, -- Não público, requer autenticação
  10485760, -- 10MB em bytes
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- 2. CRIAR BUCKET: pre-surgical-files
-- Para arquivos pré-cirúrgicos (exames, laudos, etc)
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pre-surgical-files',
  'pre-surgical-files',
  false, -- Não público, requer autenticação
  20971520, -- 20MB em bytes
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/dicom'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- 3. POLÍTICAS RLS PARA quote-documents
-- =====================================================

-- Permitir SELECT (download) para usuários autenticados da mesma organização
CREATE POLICY "Users can view quote documents from their organization"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'quote-documents' 
  AND auth.uid() IN (
    SELECT id FROM profiles 
    WHERE organization_id = (
      SELECT organization_id 
      FROM quotes 
      WHERE id::text = (storage.foldername(name))[2]
    )
  )
);

-- Permitir INSERT (upload) para usuários autenticados
CREATE POLICY "Authenticated users can upload quote documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'quote-documents' 
  AND auth.role() = 'authenticated'
);

-- Permitir UPDATE para usuários autenticados da mesma organização
CREATE POLICY "Users can update quote documents from their organization"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'quote-documents' 
  AND auth.uid() IN (
    SELECT id FROM profiles 
    WHERE organization_id = (
      SELECT organization_id 
      FROM quotes 
      WHERE id::text = (storage.foldername(name))[2]
    )
  )
);

-- Permitir DELETE para usuários autenticados da mesma organização
CREATE POLICY "Users can delete quote documents from their organization"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'quote-documents' 
  AND auth.uid() IN (
    SELECT id FROM profiles 
    WHERE organization_id = (
      SELECT organization_id 
      FROM quotes 
      WHERE id::text = (storage.foldername(name))[2]
    )
  )
);

-- =====================================================
-- 4. POLÍTICAS RLS PARA pre-surgical-files
-- =====================================================

-- Permitir SELECT (download) para usuários autenticados da mesma organização
CREATE POLICY "Users can view pre-surgical files from their organization"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'pre-surgical-files' 
  AND auth.uid() IN (
    SELECT id FROM profiles 
    WHERE organization_id = (
      SELECT organization_id 
      FROM quotes 
      WHERE id::text = (storage.foldername(name))[2]
    )
  )
);

-- Permitir INSERT (upload) para usuários autenticados
CREATE POLICY "Authenticated users can upload pre-surgical files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pre-surgical-files' 
  AND auth.role() = 'authenticated'
);

-- Permitir UPDATE para usuários autenticados da mesma organização
CREATE POLICY "Users can update pre-surgical files from their organization"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'pre-surgical-files' 
  AND auth.uid() IN (
    SELECT id FROM profiles 
    WHERE organization_id = (
      SELECT organization_id 
      FROM quotes 
      WHERE id::text = (storage.foldername(name))[2]
    )
  )
);

-- Permitir DELETE para usuários autenticados da mesma organização
CREATE POLICY "Users can delete pre-surgical files from their organization"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pre-surgical-files' 
  AND auth.uid() IN (
    SELECT id FROM profiles 
    WHERE organization_id = (
      SELECT organization_id 
      FROM quotes 
      WHERE id::text = (storage.foldername(name))[2]
    )
  )
);

-- =====================================================
-- 5. VERIFICAÇÃO
-- =====================================================

-- Verificar buckets criados
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id IN ('quote-documents', 'pre-surgical-files');

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%quote%' OR policyname LIKE '%surgical%'
ORDER BY policyname;
