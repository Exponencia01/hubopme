import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useQuotations } from '@/hooks/useQuotations';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function Dashboard() {
  const { quotations, isLoading } = useQuotations();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    totalValue: 0,
  });

  useEffect(() => {
    if (quotations) {
      const pending = quotations.filter(q => q.status === 'pending').length;
      const completed = quotations.filter(q => q.status === 'completed').length;

      setStats({
        total: quotations.length,
        pending,
        completed,
        totalValue: 0, // Será calculado quando houver respostas
      });
    }
  }, [quotations]);

  const recentQuotations = quotations?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral das suas cotações e vendas OPME</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Cotações
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Concluídas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Valor Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.totalValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cotações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : recentQuotations.length === 0 ? (
            <p className="text-gray-500">Nenhuma cotação encontrada</p>
          ) : (
            <div className="space-y-4">
              {recentQuotations.map((quotation) => (
                <Link
                  key={quotation.id}
                  to={`/quotations/${quotation.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{quotation.titulo}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {quotation.patient_name} • {quotation.pedido_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Prazo: {formatDate(quotation.encerramento_cotacao)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {quotation.solicitante}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
