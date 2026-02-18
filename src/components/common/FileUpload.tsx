import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { uploadFile, validateFileType, validateFileSize, formatFileSize, type FileMetadata } from '@/lib/storage';

interface FileUploadProps {
  bucket: 'quote-documents' | 'pre-surgical-files';
  organizationId: string;
  quoteId: string;
  folder?: string;
  onUploadComplete?: (file: FileMetadata) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  currentFilesCount?: number;
}

export default function FileUpload({
  bucket,
  organizationId,
  quoteId,
  folder,
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  currentFilesCount = 0,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');

    // Validar número máximo de arquivos
    if (currentFilesCount >= maxFiles) {
      const errorMsg = `Número máximo de arquivos atingido (${maxFiles})`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // Validar tipo de arquivo
    if (!validateFileType(file, bucket)) {
      const errorMsg = 'Tipo de arquivo não permitido';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // Validar tamanho do arquivo
    if (!validateFileSize(file, bucket)) {
      const maxSize = bucket === 'quote-documents' ? '10MB' : '20MB';
      const errorMsg = `Arquivo muito grande. Tamanho máximo: ${maxSize}`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    try {
      const fileMetadata = await uploadFile({
        bucket,
        organizationId,
        quoteId,
        file: selectedFile,
        folder,
      });

      onUploadComplete?.(fileMetadata);
      setSelectedFile(null);
      
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao fazer upload';
      setError(errorMsg);
      onUploadError?.(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const acceptedTypes = bucket === 'quote-documents'
    ? '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'
    : '.pdf,.jpg,.jpeg,.png';

  return (
    <div className="space-y-3">
      {/* Área de seleção de arquivo */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
          id={`file-upload-${bucket}`}
          disabled={uploading || currentFilesCount >= maxFiles}
        />
        <label
          htmlFor={`file-upload-${bucket}`}
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-700">
            Clique para selecionar arquivo
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {bucket === 'quote-documents' 
              ? 'PDF, DOC, XLS, Imagens (máx. 10MB)'
              : 'PDF, Imagens, DICOM (máx. 20MB)'}
          </p>
        </label>
      </div>

      {/* Arquivo selecionado */}
      {selectedFile && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Botão de upload */}
          <div className="mt-3 flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={uploading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Informação sobre limite de arquivos */}
      {currentFilesCount >= maxFiles && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            Número máximo de arquivos atingido ({maxFiles})
          </p>
        </div>
      )}
    </div>
  );
}
