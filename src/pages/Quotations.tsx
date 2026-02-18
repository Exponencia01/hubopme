import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useQuotations } from '@/hooks/useQuotations';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function Quotations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter] = useState<string>('');
  const { quotations, isLoading } = useQuotations({ status: statusFilter });

  const filteredQuotations = quotations?.filter((q) =>
    q.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.pedido_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cotações Recebidas</h1>
          <p className="text-gray-600 mt-1">Cotações de hospitais e clínicas aguardando sua resposta</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avançados
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por procedimento, número ou paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Carregando cotações...</p>
          </CardContent>
        </Card>
      ) : filteredQuotations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Nenhuma cotação encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredQuotations.map((quotation) => (
            <Link key={quotation.id} to={`/quotations/${quotation.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{quotation.titulo}</h3>
                        <Badge className={getStatusColor(quotation.status)}>
                          {getStatusLabel(quotation.status)}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Número:</span> {quotation.pedido_id}
                        </p>
                        {quotation.patient_name && (
                          <p>
                            <span className="font-medium">Paciente:</span> {quotation.patient_name}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Itens:</span> {quotation.products?.length || 0}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Prazo</p>
                        <p className="font-medium">{formatDate(quotation.encerramento_cotacao)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Hospital</p>
                        <p className="font-medium text-primary text-xs">
                          {quotation.solicitante}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
