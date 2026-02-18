import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, CheckCircle, FileText, Stethoscope, Package, ClipboardList, Upload, Percent, Settings, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useQuotation } from '@/hooks/useQuotations';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import ResponseForm, { type QuoteResponseData } from '@/components/quotations/ResponseForm';
import { quotationsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import FileUpload from '@/components/common/FileUpload';
import { listFiles, downloadFile, deleteFile, formatFileSize, type FileMetadata } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

export default function QuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quotation, isLoading } = useQuotation(id!);
  const { user } = useAuthStore();
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [documents, setDocuments] = useState<FileMetadata[]>([]);
  const [preSurgicalFiles, setPreSurgicalFiles] = useState<FileMetadata[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [showPreSurgicalUpload, setShowPreSurgicalUpload] = useState(false);

  // Definir todas as funções antes dos hooks
  const loadAllFiles = async () => {
    if (!user?.organization_id || !quotation?.id) return;

    setLoadingFiles(true);
    try {
      // Carregar documentos
      const docs = await listFiles('quote-documents', user.organization_id, quotation.id);
      setDocuments(docs);

      // Carregar arquivos pré-cirúrgicos
      const preSurgical = await listFiles('pre-surgical-files', user.organization_id, quotation.id);
      setPreSurgicalFiles(preSurgical);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Carregar arquivos ao montar o componente
  useEffect(() => {
    if (quotation && user?.organization_id) {
      loadAllFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotation?.id, user?.organization_id]);

  // Early returns DEPOIS de todos os hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cotação não encontrada</p>
      </div>
    );
  }

  const handleDocumentUpload = async (file: FileMetadata) => {
    // Adicionar à lista local
    setDocuments(prev => [...prev, file]);
    
    // Atualizar no banco de dados
    const updatedDocuments = [...(quotation.documents || []), {
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: file.url,
      uploaded_at: file.uploaded_at,
    }];

    await supabase
      .from('quotes')
      .update({ documents: updatedDocuments })
      .eq('id', quotation.id);

    setShowDocUpload(false);
  };

  const handlePreSurgicalUpload = async (file: FileMetadata) => {
    // Adicionar à lista local
    setPreSurgicalFiles(prev => [...prev, file]);
    
    // Atualizar no banco de dados
    const updatedFiles = [...(quotation.pre_surgical_files || []), {
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: file.url,
      uploaded_at: file.uploaded_at,
    }];

    await supabase
      .from('quotes')
      .update({ pre_surgical_files: updatedFiles })
      .eq('id', quotation.id);

    setShowPreSurgicalUpload(false);
  };

  const handleDownload = async (bucket: 'quote-documents' | 'pre-surgical-files', filePath: string, fileName: string) => {
    try {
      const blob = await downloadFile(bucket, filePath);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      alert('Erro ao fazer download do arquivo');
    }
  };

  const handleDelete = async (bucket: 'quote-documents' | 'pre-surgical-files', filePath: string, fileId: string) => {
    if (!confirm('Tem certeza que deseja deletar este arquivo?')) return;

    try {
      await deleteFile(bucket, filePath);

      // Atualizar lista local e banco de dados
      if (bucket === 'quote-documents') {
        const updatedDocs = documents.filter(doc => doc.id !== fileId);
        setDocuments(updatedDocs);
        
        await supabase
          .from('quotes')
          .update({ documents: updatedDocs })
          .eq('id', quotation.id);
      } else {
        const updatedFiles = preSurgicalFiles.filter(file => file.id !== fileId);
        setPreSurgicalFiles(updatedFiles);
        
        await supabase
          .from('quotes')
          .update({ pre_surgical_files: updatedFiles })
          .eq('id', quotation.id);
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      alert('Erro ao deletar arquivo');
    }
  };

  const handleSubmitResponse = async (responseData: QuoteResponseData) => {
    if (!user?.id || !user?.organization_id) {
      throw new Error('Usuário não autenticado');
    }

    setSubmitting(true);
    try {
      const response = await quotationsApi.createQuoteResponse({
        quote_id: quotation.id,
        organization_id: user.organization_id,
        created_by: user.id,
        ...responseData,
      });

      // Enviar resposta (mudar status para submitted)
      await quotationsApi.submitQuoteResponse(response.id, user.id);

      setSubmitSuccess(true);
      setShowResponseForm(false);
      
      // Recarregar página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // Se está mostrando o formulário de resposta
  if (showResponseForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => setShowResponseForm(false)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Responder Cotação</h1>
            <p className="text-gray-600 mt-1">{quotation.titulo || quotation.pedido_id}</p>
          </div>
        </div>

        <ResponseForm
          quote={quotation}
          onSubmit={handleSubmitResponse}
          onCancel={() => setShowResponseForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/quotations')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{quotation.titulo}</h1>
          <p className="text-gray-600 mt-1">Cotação #{quotation.pedido_id}</p>
        </div>
        <Badge className={getStatusColor(quotation.status)}>
          {getStatusLabel(quotation.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUNA ESQUERDA - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Resumo da Cotação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resumo da Cotação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID Pedido</p>
                  <p className="font-medium">{quotation.pedido_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Solicitante</p>
                  <p className="font-medium">{quotation.solicitante}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contato</p>
                  <p className="font-medium">{quotation.contato}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Título</p>
                  <p className="font-medium">{quotation.titulo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Caráter de Internação</p>
                  <p className="font-medium">{quotation.carater_internacao}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CNPJ</p>
                  <p className="font-medium">N/A</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Encerramento da Cotação</p>
                  <p className="font-medium">{formatDate(quotation.encerramento_cotacao)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Forma de Pagamento</p>
                  <p className="font-medium">{quotation.forma_pagamento}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Dados da Cirurgia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Dados da Cirurgia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Data da Cirurgia</p>
                  <p className="font-medium">{quotation.surgery_date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Local da Cirurgia</p>
                  <p className="font-medium">{quotation.surgery_location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Operadora</p>
                  <p className="font-medium">{quotation.operadora}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Senha de Autorização</p>
                  <p className="font-medium">{quotation.senha_autorizacao || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Atendimento</p>
                  <p className="font-medium">{quotation.atendimento}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Agenda</p>
                  <p className="font-medium">{quotation.agenda || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Médico</p>
                  <p className="font-medium">{quotation.medico}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CRM/UF</p>
                  <p className="font-medium">{quotation.crm_uf}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Procedimentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Procedimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quotation.procedures && quotation.procedures.length > 0 ? (
                <div className="space-y-3">
                  {quotation.procedures.map((proc: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {proc.principal && (
                              <Badge variant="outline" className="text-xs">Principal</Badge>
                            )}
                            <span className="text-sm font-medium text-gray-600">Código: {proc.codigo}</span>
                          </div>
                          <p className="font-medium">{proc.descricao}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Quantidade</p>
                          <p className="font-medium">{proc.quantidade}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum procedimento cadastrado</p>
              )}
            </CardContent>
          </Card>

          {/* Card: Produtos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quotation.products && quotation.products.length > 0 ? (
                <div className="space-y-3">
                  {quotation.products.map((product: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Ref: {product.referencia}</p>
                          <p className="font-medium">{product.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Quantidade</p>
                          <p className="font-medium">{product.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum produto cadastrado</p>
              )}
            </CardContent>
          </Card>

          {/* Card: Produtos Não Codificados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produtos Não Codificados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quotation.non_coded_products && quotation.non_coded_products.length > 0 ? (
                <div className="space-y-3">
                  {quotation.non_coded_products.map((product: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{product.descricao}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Quantidade</p>
                          <p className="font-medium">{product.quantidade}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum produto não codificado</p>
              )}
            </CardContent>
          </Card>

          {/* Card: Observação do Comprador */}
          {quotation.observacao_comprador && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Observação do Comprador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{quotation.observacao_comprador}</p>
              </CardContent>
            </Card>
          )}

          {/* Card: Desconto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Desconto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quotation.discount && Object.keys(quotation.discount).length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Aplicar em</p>
                      <p className="font-medium">{quotation.discount.aplicar_em || 'Total'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tipo</p>
                      <p className="font-medium">{quotation.discount.tipo || 'Percentual'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valor</p>
                      <p className="font-medium text-green-600">
                        {quotation.discount.valor || 0}{quotation.discount.unidade || '%'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum desconto configurado</p>
              )}
            </CardContent>
          </Card>

          {/* Card: Condições do Fornecedor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Condições do Fornecedor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quotation.provider_conditions && Object.keys(quotation.provider_conditions).length > 0 ? (
                <div className="space-y-3">
                  {quotation.provider_conditions.prazo_entrega && (
                    <div>
                      <p className="text-sm text-gray-600">Prazo de Entrega</p>
                      <p className="font-medium">{quotation.provider_conditions.prazo_entrega}</p>
                    </div>
                  )}
                  {quotation.provider_conditions.garantia && (
                    <div>
                      <p className="text-sm text-gray-600">Garantia</p>
                      <p className="font-medium">{quotation.provider_conditions.garantia}</p>
                    </div>
                  )}
                  {quotation.provider_conditions.validade_proposta && (
                    <div>
                      <p className="text-sm text-gray-600">Validade da Proposta</p>
                      <p className="font-medium">{quotation.provider_conditions.validade_proposta}</p>
                    </div>
                  )}
                  {quotation.provider_conditions.observacoes && (
                    <div>
                      <p className="text-sm text-gray-600">Observações</p>
                      <p className="text-sm whitespace-pre-wrap">{quotation.provider_conditions.observacoes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma condição especificada</p>
              )}
            </CardContent>
          </Card>

          {/* Card: Documentos do Hospital */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos do Hospital
                </div>
                {!showDocUpload && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDocUpload(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Component */}
              {showDocUpload && user?.organization_id && (
                <div className="border-t pt-4">
                  <FileUpload
                    bucket="quote-documents"
                    organizationId={user.organization_id}
                    quoteId={quotation.id}
                    onUploadComplete={handleDocumentUpload}
                    onUploadError={(error) => console.error(error)}
                    maxFiles={10}
                    currentFilesCount={documents.length}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowDocUpload(false)}
                    className="mt-2"
                  >
                    Cancelar
                  </Button>
                </div>
              )}

              {/* Lista de Arquivos */}
              {loadingFiles ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">Carregando arquivos...</p>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownload('quote-documents', doc.id, doc.name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete('quote-documents', doc.id, doc.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Nenhum documento anexado</p>
                  <p className="text-gray-400 text-xs mt-1">Clique em "Adicionar" para fazer upload</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card: Arquivos Pré-Cirúrgicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Arquivos Pré-Cirúrgicos
                </div>
                {!showPreSurgicalUpload && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPreSurgicalUpload(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Component */}
              {showPreSurgicalUpload && user?.organization_id && (
                <div className="border-t pt-4">
                  <FileUpload
                    bucket="pre-surgical-files"
                    organizationId={user.organization_id}
                    quoteId={quotation.id}
                    onUploadComplete={handlePreSurgicalUpload}
                    onUploadError={(error) => console.error(error)}
                    maxFiles={20}
                    currentFilesCount={preSurgicalFiles.length}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowPreSurgicalUpload(false)}
                    className="mt-2"
                  >
                    Cancelar
                  </Button>
                </div>
              )}

              {/* Lista de Arquivos */}
              {loadingFiles ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">Carregando arquivos...</p>
                </div>
              ) : preSurgicalFiles.length > 0 ? (
                <div className="space-y-2">
                  {preSurgicalFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownload('pre-surgical-files', file.id, file.name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete('pre-surgical-files', file.id, file.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Nenhum arquivo pré-cirúrgico anexado</p>
                  <p className="text-gray-400 text-xs mt-1">Clique em "Adicionar" para fazer upload</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA - 1/3 */}
        <div className="space-y-6">
          {submitSuccess && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Resposta enviada com sucesso!</p>
                    <p className="text-sm">O cliente receberá sua proposta.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full"
                onClick={() => setShowResponseForm(true)}
                disabled={submitting}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Responder Cotação
              </Button>
              <Button variant="outline" className="w-full">
                Exportar PDF
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Paciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-medium">{quotation.patient_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data da Cirurgia</p>
                <p className="font-medium">{quotation.surgery_date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Operadora</p>
                <p className="font-medium">{quotation.operadora}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prazos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Encerramento da Cotação</p>
                <p className="font-medium text-orange-600">{formatDate(quotation.encerramento_cotacao)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Etapa</p>
                <p className="font-medium">{quotation.etapa}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
