import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Modal } from '@/components/ui/Modal';
import { BarChart3, Plus, Edit2, Trash2, TrendingUp, DollarSign, Users, FileText } from 'lucide-react';
import { analyticsApi } from '@/lib/analytics';
import type { AnalyticsDashboard, CreateDashboardPayload } from '@/lib/types';

export default function Analytics() {
  const [dashboards, setDashboards] = useState<AnalyticsDashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<AnalyticsDashboard | null>(null);

  const [formData, setFormData] = useState<CreateDashboardPayload>({
    name: '',
    dashboard_type: 'custom',
    is_public: false,
    display_order: 0,
  });

  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsApi.getDashboards();
      setDashboards(data);
    } catch (error) {
      console.error('Erro ao carregar dashboards:', error);
      alert('Não foi possível carregar os dashboards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (dashboard?: AnalyticsDashboard) => {
    if (dashboard) {
      setEditingDashboard(dashboard);
      setFormData({
        name: dashboard.name,
        description: dashboard.description,
        dashboard_type: dashboard.dashboard_type,
        embed_url: dashboard.embed_url,
        is_public: dashboard.is_public,
        display_order: dashboard.display_order,
      });
    } else {
      setEditingDashboard(null);
      setFormData({
        name: '',
        dashboard_type: 'custom',
        is_public: false,
        display_order: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDashboard(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDashboard) {
        await analyticsApi.updateDashboard(editingDashboard.id, formData);
        alert('Dashboard atualizado com sucesso');
      } else {
        await analyticsApi.createDashboard(formData);
        alert('Dashboard criado com sucesso');
      }
      handleCloseModal();
      loadDashboards();
    } catch (error) {
      console.error('Erro ao salvar dashboard:', error);
      alert('Não foi possível salvar o dashboard');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este dashboard?')) return;

    try {
      await analyticsApi.deleteDashboard(id);
      alert('Dashboard excluído com sucesso');
      loadDashboards();
    } catch (error) {
      console.error('Erro ao excluir dashboard:', error);
      alert('Não foi possível excluir o dashboard');
    }
  };

  const getDashboardIcon = (type: string) => {
    switch (type) {
      case 'sales': return DollarSign;
      case 'quotes': return FileText;
      case 'products': return BarChart3;
      case 'doctors': return Users;
      default: return TrendingUp;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-600 mt-1">Visualize métricas e dashboards personalizados</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Dashboard
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Carregando dashboards...</p>
        </div>
      ) : dashboards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum dashboard configurado</p>
            <Button onClick={() => handleOpenModal()} className="mt-4">
              Criar Primeiro Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {dashboards.map((dashboard) => {
            const Icon = getDashboardIcon(dashboard.dashboard_type);
            return (
              <Card key={dashboard.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    {dashboard.name}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-gray-500" />
                </CardHeader>
                <CardContent>
                  {dashboard.description && (
                    <p className="text-sm text-gray-600 mb-4">{dashboard.description}</p>
                  )}

                  {dashboard.embed_url ? (
                    <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <iframe
                        src={dashboard.embed_url}
                        className="w-full h-full rounded-lg"
                        title={dashboard.name}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <p className="text-gray-500 text-sm">Nenhum embed configurado</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Tipo: {dashboard.dashboard_type}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(dashboard)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(dashboard.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDashboard ? 'Editar Dashboard' : 'Novo Dashboard'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nome do Dashboard *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="dashboard_type">Tipo</Label>
              <select
                id="dashboard_type"
                value={formData.dashboard_type}
                onChange={(e) => setFormData({ ...formData, dashboard_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="sales">Vendas</option>
                <option value="quotes">Cotações</option>
                <option value="products">Produtos</option>
                <option value="doctors">Médicos</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            <div>
              <Label htmlFor="display_order">Ordem de Exibição</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="embed_url">URL de Embed (Metabase, Looker, etc)</Label>
              <Input
                id="embed_url"
                type="url"
                value={formData.embed_url || ''}
                onChange={(e) => setFormData({ ...formData, embed_url: e.target.value })}
                placeholder="https://..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Cole a URL de embed do seu dashboard externo
              </p>
            </div>

            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Dashboard público (visível para todos os usuários)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingDashboard ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
