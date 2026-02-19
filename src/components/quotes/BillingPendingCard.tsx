import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle, FileText, Download } from 'lucide-react';
import { quoteBillingItemsApi, quoteEnhancedUtils } from '@/lib/quotesEnhanced';
import type { BillingPendingSummary, QuoteBillingItem } from '@/lib/types';

interface BillingPendingCardProps {
  quoteId: string;
  quotation?: any;
}

export default function BillingPendingCard({ quoteId, quotation }: BillingPendingCardProps) {
  const [summary, setSummary] = useState<BillingPendingSummary | null>(null);
  const [pendingItems, setPendingItems] = useState<QuoteBillingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    loadData();
  }, [quoteId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [summaryData, itemsData] = await Promise.all([
        quoteBillingItemsApi.getBillingSummary(quoteId),
        quoteBillingItemsApi.getPending(quoteId),
      ]);
      setSummary(summaryData);
      setPendingItems(itemsData);
    } catch (error) {
      console.error('Erro ao carregar pendências:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const report = await quoteEnhancedUtils.generateBillingReport(quoteId);
      
      // Criar blob e fazer download
      const blob = new Blob([report], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-faturamento-${quoteId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!summary || summary.pending_items === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <FileText className="h-5 w-5" />
            Faturamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">✓ Todos os itens foram faturados</p>
        </CardContent>
      </Card>
    );
  }

  const percentageBilled = summary.total_value > 0 
    ? (summary.billed_value / summary.total_value) * 100 
    : 0;

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="h-5 w-5" />
          Pendências de Faturamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informações para Faturamento */}
        {quotation && (
          <div className="bg-white rounded-lg p-4 border border-yellow-300 space-y-3">
            <h4 className="font-semibold text-sm text-gray-900">Dados para Cobrança</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Pedido</p>
                <p className="font-medium">{quotation.pedido_id}</p>
              </div>
              <div>
                <p className="text-gray-600">Paciente</p>
                <p className="font-medium">{quotation.patient_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Data Cirurgia</p>
                <p className="font-medium">{quotation.surgery_date}</p>
              </div>
              <div>
                <p className="text-gray-600">Hospital</p>
                <p className="font-medium">{quotation.hospital_name || quotation.surgery_location}</p>
              </div>
              {quotation.billing_data?.payer_name && (
                <>
                  <div className="col-span-2 border-t pt-2 mt-1">
                    <p className="text-gray-600">Fonte Pagadora</p>
                    <p className="font-medium">{quotation.billing_data.payer_name}</p>
                  </div>
                  {quotation.billing_data.payer_cnpj && (
                    <div>
                      <p className="text-gray-600">CNPJ</p>
                      <p className="font-medium">{quotation.billing_data.payer_cnpj}</p>
                    </div>
                  )}
                  {quotation.billing_data.contact_name && (
                    <div>
                      <p className="text-gray-600">Contato</p>
                      <p className="font-medium">{quotation.billing_data.contact_name}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Resumo */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Itens Pendentes</p>
            <p className="text-2xl font-bold text-yellow-800">
              {summary.pending_items} / {summary.total_items}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valor Pendente</p>
            <p className="text-2xl font-bold text-yellow-800">
              R$ {summary.pending_value.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progresso do Faturamento</span>
            <span>{percentageBilled.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-600 h-2 rounded-full transition-all"
              style={{ width: `${percentageBilled}%` }}
            ></div>
          </div>
        </div>

        {/* Lista de itens pendentes */}
        <div>
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Itens Pendentes:</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pendingItems.map((item) => {
              const pendingQty = (item.quantity_used || item.quantity_budgeted) - (item.quantity_billed || 0);
              const pendingValue = pendingQty * item.unit_price;
              
              return (
                <div key={item.id} className="bg-white rounded p-3 text-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      {item.product_code && (
                        <p className="text-xs text-gray-500">Código: {item.product_code}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-yellow-700">
                        {pendingQty} un.
                      </p>
                      <p className="text-xs text-gray-600">
                        R$ {pendingValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Faturado: {item.quantity_billed || 0} / {item.quantity_used || item.quantity_budgeted}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botão de gerar relatório */}
        <Button
          onClick={handleGenerateReport}
          disabled={isGeneratingReport}
          className="w-full"
          variant="outline"
        >
          {isGeneratingReport ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Gerando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Gerar Relatório de Pendências
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
