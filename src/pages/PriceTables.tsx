import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Modal } from '@/components/ui/Modal';
import { DollarSign, Plus, Edit2, Trash2, Package, Search } from 'lucide-react';
import { priceTablesApi, priceTableItemsApi } from '@/lib/priceTables';
import type { PriceTable, CreatePriceTablePayload } from '@/lib/types';

export default function PriceTables() {
  const [tables, setTables] = useState<PriceTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<PriceTable | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<CreatePriceTablePayload>({
    name: '',
    table_type: 'standard',
    is_default: false,
  });

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setIsLoading(true);
      const data = await priceTablesApi.getAll();
      setTables(data);
    } catch (error) {
      console.error('Erro ao carregar tabelas:', error);
      alert('Não foi possível carregar as tabelas de preço');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (table?: PriceTable) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        name: table.name,
        description: table.description,
        code: table.code,
        table_type: table.table_type,
        category: table.category,
        valid_from: table.valid_from,
        valid_until: table.valid_until,
        is_default: table.is_default,
      });
    } else {
      setEditingTable(null);
      setFormData({
        name: '',
        table_type: 'standard',
        is_default: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTable) {
        await priceTablesApi.update(editingTable.id, formData);
        alert('Tabela atualizada com sucesso');
      } else {
        await priceTablesApi.create(formData);
        alert('Tabela criada com sucesso');
      }
      handleCloseModal();
      loadTables();
    } catch (error) {
      console.error('Erro ao salvar tabela:', error);
      alert('Não foi possível salvar a tabela');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tabela?')) return;

    try {
      await priceTablesApi.delete(id);
      alert('Tabela excluída com sucesso');
      loadTables();
    } catch (error) {
      console.error('Erro ao excluir tabela:', error);
      alert('Não foi possível excluir a tabela');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await priceTablesApi.setDefault(id);
      alert('Tabela definida como padrão');
      loadTables();
    } catch (error) {
      console.error('Erro ao definir tabela padrão:', error);
      alert('Não foi possível definir a tabela como padrão');
    }
  };

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tabelas de Preço</h1>
          <p className="text-gray-600 mt-1">Gerencie suas tabelas de preço e produtos</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tabela
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Carregando tabelas...</p>
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma tabela encontrada</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTables.map((table) => (
                <Card key={table.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{table.name}</h3>
                        {table.code && (
                          <p className="text-sm text-gray-500">Código: {table.code}</p>
                        )}
                      </div>
                      {table.is_default && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          Padrão
                        </span>
                      )}
                    </div>

                    {table.description && (
                      <p className="text-sm text-gray-600 mb-4">{table.description}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Tipo:</span>
                        <span className="font-medium">
                          {table.table_type === 'standard' ? 'Padrão' :
                           table.table_type === 'promotional' ? 'Promocional' :
                           table.table_type === 'special' ? 'Especial' : 'Contrato'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Status:</span>
                        <span className={`font-medium ${table.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {table.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {!table.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(table.id)}
                          className="flex-1"
                        >
                          Definir Padrão
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(table)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(table.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTable ? 'Editar Tabela' : 'Nova Tabela'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nome da Tabela *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="table_type">Tipo</Label>
              <select
                id="table_type"
                value={formData.table_type}
                onChange={(e) => setFormData({ ...formData, table_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="standard">Padrão</option>
                <option value="promotional">Promocional</option>
                <option value="special">Especial</option>
                <option value="contract">Contrato</option>
              </select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="valid_from">Válida de</Label>
              <Input
                id="valid_from"
                type="date"
                value={formData.valid_from || ''}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="valid_until">Válida até</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until || ''}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Definir como tabela padrão</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingTable ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
