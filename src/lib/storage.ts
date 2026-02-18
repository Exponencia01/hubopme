import { supabase } from './supabase';

/**
 * Helper functions para upload e gerenciamento de arquivos no Supabase Storage
 */

export interface UploadFileOptions {
  bucket: 'quote-documents' | 'pre-surgical-files';
  organizationId: string;
  quoteId: string;
  file: File;
  folder?: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploaded_at: string;
  uploaded_by?: string;
}

/**
 * Upload de arquivo para o Storage
 */
export async function uploadFile(options: UploadFileOptions): Promise<FileMetadata> {
  const { bucket, organizationId, quoteId, file, folder } = options;

  // Gerar nome único para o arquivo
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  // Construir path: /{organization_id}/{quote_id}/{folder}/{filename}
  const folderPath = folder ? `${folder}/` : '';
  const filePath = `${organizationId}/${quoteId}/${folderPath}${fileName}`;

  // Upload do arquivo
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Erro ao fazer upload:', error);
    throw new Error(`Erro ao fazer upload: ${error.message}`);
  }

  // Obter URL pública (signed URL para buckets privados)
  const { data: urlData } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 3600 * 24 * 365); // 1 ano

  return {
    id: data.path,
    name: file.name,
    size: file.size,
    type: file.type,
    url: urlData?.signedUrl || '',
    uploaded_at: new Date().toISOString(),
  };
}

/**
 * Listar arquivos de uma cotação
 */
export async function listFiles(
  bucket: 'quote-documents' | 'pre-surgical-files',
  organizationId: string,
  quoteId: string,
  folder?: string
): Promise<FileMetadata[]> {
  const folderPath = folder ? `${folder}/` : '';
  const path = `${organizationId}/${quoteId}/${folderPath}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path);

  if (error) {
    console.error('Erro ao listar arquivos:', error);
    throw new Error(`Erro ao listar arquivos: ${error.message}`);
  }

  // Criar signed URLs para cada arquivo
  const filesWithUrls = await Promise.all(
    (data || []).map(async (file) => {
      const filePath = `${path}${file.name}`;
      const { data: urlData } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600 * 24); // 24 horas

      return {
        id: filePath,
        name: file.name,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || '',
        url: urlData?.signedUrl || '',
        uploaded_at: file.created_at || new Date().toISOString(),
      };
    })
  );

  return filesWithUrls;
}

/**
 * Download de arquivo
 */
export async function downloadFile(
  bucket: 'quote-documents' | 'pre-surgical-files',
  filePath: string
): Promise<Blob> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(filePath);

  if (error) {
    console.error('Erro ao fazer download:', error);
    throw new Error(`Erro ao fazer download: ${error.message}`);
  }

  return data;
}

/**
 * Deletar arquivo
 */
export async function deleteFile(
  bucket: 'quote-documents' | 'pre-surgical-files',
  filePath: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    console.error('Erro ao deletar arquivo:', error);
    throw new Error(`Erro ao deletar arquivo: ${error.message}`);
  }
}

/**
 * Obter URL assinada para um arquivo
 */
export async function getSignedUrl(
  bucket: 'quote-documents' | 'pre-surgical-files',
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    console.error('Erro ao gerar URL assinada:', error);
    throw new Error(`Erro ao gerar URL: ${error.message}`);
  }

  return data?.signedUrl || '';
}

/**
 * Validar tipo de arquivo
 */
export function validateFileType(file: File, bucket: 'quote-documents' | 'pre-surgical-files'): boolean {
  const allowedTypes = {
    'quote-documents': [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ],
    'pre-surgical-files': [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/dicom',
    ],
  };

  return allowedTypes[bucket].includes(file.type);
}

/**
 * Validar tamanho do arquivo
 */
export function validateFileSize(file: File, bucket: 'quote-documents' | 'pre-surgical-files'): boolean {
  const maxSizes = {
    'quote-documents': 10 * 1024 * 1024, // 10MB
    'pre-surgical-files': 20 * 1024 * 1024, // 20MB
  };

  return file.size <= maxSizes[bucket];
}

/**
 * Formatar tamanho de arquivo para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
