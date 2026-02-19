import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Clock, CheckCircle, XCircle, AlertCircle, FileText, DollarSign } from 'lucide-react';
import { quoteHistoryApi } from '@/lib/quotesEnhanced';
import type { QuoteHistory } from '@/lib/types';

interface QuoteHistoryTimelineProps {
  quoteId: string;
}

const ACTION_LABELS: Record<string, string> = {
  budgeted: 'Orçado',
  authorized: 'Autorizado',
  used_supplier: 'Utilizado (Fornecedor)',
  usage_confirmed: 'Confirmada a Utilização',
  billing_authorized: 'Faturamento Autorizado',
  billed: 'Faturado',
  billing_pending: 'Pendente de Faturamento',
  created: 'Criado',
  updated: 'Atualizado',
  cancelled: 'Cancelado',
  comment: 'Comentário',
};

const ACTION_ICONS: Record<string, any> = {
  budgeted: FileText,
  authorized: CheckCircle,
  used_supplier: AlertCircle,
  usage_confirmed: CheckCircle,
  billing_authorized: DollarSign,
  billed: CheckCircle,
  billing_pending: Clock,
  created: Clock,
  updated: Clock,
  cancelled: XCircle,
  comment: FileText,
};

const ACTION_COLORS: Record<string, string> = {
  budgeted: 'text-blue-600 bg-blue-100',
  authorized: 'text-green-600 bg-green-100',
  used_supplier: 'text-orange-600 bg-orange-100',
  usage_confirmed: 'text-green-600 bg-green-100',
  billing_authorized: 'text-purple-600 bg-purple-100',
  billed: 'text-green-600 bg-green-100',
  billing_pending: 'text-yellow-600 bg-yellow-100',
  created: 'text-gray-600 bg-gray-100',
  updated: 'text-gray-600 bg-gray-100',
  cancelled: 'text-red-600 bg-red-100',
  comment: 'text-blue-600 bg-blue-100',
};

export default function QuoteHistoryTimeline({ quoteId }: QuoteHistoryTimelineProps) {
  const [history, setHistory] = useState<QuoteHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [quoteId]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await quoteHistoryApi.getByQuoteId(quoteId);
      setHistory(data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Carregando histórico...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Ações</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma ação registrada</p>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => {
              const Icon = ACTION_ICONS[item.action_type] || Clock;
              const colorClass = ACTION_COLORS[item.action_type] || 'text-gray-600 bg-gray-100';
              const label = ACTION_LABELS[item.action_type] || item.action_type;

              return (
                <div key={item.id} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`rounded-full p-2 ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {index < history.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{label}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>{item.performed_by_name || 'Sistema'}</span>
                          {item.performed_by_role && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{item.performed_by_role}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
