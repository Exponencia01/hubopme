import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Modal } from '@/components/ui/Modal';
import { UserCircle, Plus, Edit2, Trash2, Phone, Mail, Search } from 'lucide-react';
import { doctorsApi } from '@/lib/doctors';
import type { Doctor, CreateDoctorPayload } from '@/lib/types';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const SPECIALTIES = [
  'Ortopedia', 'Cardiologia', 'Neurologia', 'Cirurgia Geral', 'Cirurgia Cardíaca',
  'Cirurgia Vascular', 'Neurocirurgia', 'Traumatologia', 'Anestesiologia', 'Outras'
];

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<CreateDoctorPayload>({
    full_name: '',
    crm: '',
    crm_uf: 'SP',
    specialties: [],
    email: '',
    phone: '',
    mobile: '',
    relationship_type: 'active',
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setIsLoading(true);
      const data = await doctorsApi.getAll();
      setDoctors(data);
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
      alert('Não foi possível carregar os médicos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        full_name: doctor.full_name,
        cpf: doctor.cpf,
        rg: doctor.rg,
        birth_date: doctor.birth_date,
        crm: doctor.crm,
        crm_uf: doctor.crm_uf,
        specialties: doctor.specialties,
        email: doctor.email,
        phone: doctor.phone,
        mobile: doctor.mobile,
        address: doctor.address,
        hospitals: doctor.hospitals,
        relationship_type: doctor.relationship_type,
        relationship_notes: doctor.relationship_notes,
        first_contact_date: doctor.first_contact_date,
        notes: doctor.notes,
      });
    } else {
      setEditingDoctor(null);
      setFormData({
        full_name: '',
        crm: '',
        crm_uf: 'SP',
        specialties: [],
        relationship_type: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await doctorsApi.update(editingDoctor.id, formData);
        alert('Médico atualizado com sucesso');
      } else {
        await doctorsApi.create(formData);
        alert('Médico cadastrado com sucesso');
      }
      handleCloseModal();
      loadDoctors();
    } catch (error) {
      console.error('Erro ao salvar médico:', error);
      alert('Não foi possível salvar o médico');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este médico?')) return;

    try {
      await doctorsApi.delete(id);
      alert('Médico excluído com sucesso');
      loadDoctors();
    } catch (error) {
      console.error('Erro ao excluir médico:', error);
      alert('Não foi possível excluir o médico');
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.crm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Médicos</h1>
          <p className="text-gray-600 mt-1">Gerencie o cadastro de médicos</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Médico
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, CRM ou email..."
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
              <p className="text-gray-600 mt-2">Carregando médicos...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-12">
              <UserCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum médico encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">CRM</th>
                    <th className="text-left py-3 px-4">Especialidades</th>
                    <th className="text-left py-3 px-4">Contato</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doctor) => (
                    <tr key={doctor.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{doctor.full_name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">{doctor.crm}/{doctor.crm_uf}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {doctor.specialties.slice(0, 2).join(', ')}
                          {doctor.specialties.length > 2 && ` +${doctor.specialties.length - 2}`}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {doctor.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-3 w-3 mr-1" />
                              {doctor.email}
                            </div>
                          )}
                          {doctor.mobile && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-1" />
                              {doctor.mobile}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          doctor.relationship_type === 'active' ? 'bg-green-100 text-green-800' :
                          doctor.relationship_type === 'prospect' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {doctor.relationship_type === 'active' ? 'Ativo' :
                           doctor.relationship_type === 'prospect' ? 'Prospect' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenModal(doctor)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(doctor.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDoctor ? 'Editar Médico' : 'Novo Médico'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="crm">CRM *</Label>
              <Input
                id="crm"
                value={formData.crm}
                onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="crm_uf">UF *</Label>
              <select
                id="crm_uf"
                value={formData.crm_uf}
                onChange={(e) => setFormData({ ...formData, crm_uf: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                {BRAZILIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="mobile">Celular</Label>
              <Input
                id="mobile"
                value={formData.mobile || ''}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="specialties">Especialidades</Label>
              <select
                id="specialties"
                multiple
                value={formData.specialties}
                onChange={(e) => setFormData({
                  ...formData,
                  specialties: Array.from(e.target.selectedOptions, option => option.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                size={4}
              >
                {SPECIALTIES.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Segure Ctrl/Cmd para selecionar múltiplas</p>
            </div>

            <div className="col-span-2">
              <Label htmlFor="relationship_type">Tipo de Relacionamento</Label>
              <select
                id="relationship_type"
                value={formData.relationship_type}
                onChange={(e) => setFormData({ ...formData, relationship_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="active">Ativo</option>
                <option value="prospect">Prospect</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingDoctor ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
