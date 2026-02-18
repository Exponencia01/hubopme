import { useState } from 'react';
import { Plus, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSuppliers } from '@/hooks/useSuppliers';
import { formatCNPJ } from '@/lib/utils';

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState('');
  const { suppliers, isLoading } = useSuppliers();

  const filteredSuppliers = suppliers?.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cnpj.includes(searchTerm)
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fornecedores</h1>
          <p className="text-gray-600 mt-1">Gerencie sua rede de fornecedores OPME</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Carregando fornecedores...</p>
          </CardContent>
        </Card>
      ) : filteredSuppliers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Nenhum fornecedor encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{supplier.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <p className="text-gray-600">
                    <span className="font-medium">CNPJ:</span> {formatCNPJ(supplier.cnpj)}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">E-mail:</span> {supplier.email}
                  </p>
                  {supplier.phone && (
                    <p className="text-gray-600">
                      <span className="font-medium">Telefone:</span> {supplier.phone}
                    </p>
                  )}
                </div>

                {supplier.specialties && supplier.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {supplier.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{supplier.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                    {supplier.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
