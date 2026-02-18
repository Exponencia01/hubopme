import { useState } from 'react';
import { X, Mail, User, Phone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { invitationsApi } from '@/lib/invitations';
import type { CreateInvitationPayload } from '@/lib/types';

interface InviteUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteUserModal({ onClose, onSuccess }: InviteUserModalProps) {
  const [formData, setFormData] = useState<CreateInvitationPayload>({
    email: '',
    full_name: '',
    role: 'buyer',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { value: 'admin', label: 'Administrador', description: 'Acesso total ao sistema' },
    { value: 'buyer', label: 'Comprador', description: 'Gerencia cotações e pedidos' },
    { value: 'specialist', label: 'Especialista', description: 'Colabora em respostas técnicas' },
    { value: 'reviewer', label: 'Revisor', description: 'Revisa e aprova respostas' },
    { value: 'supplier_admin', label: 'Admin Fornecedor', description: 'Administrador de fornecedor' },
    { value: 'supplier_user', label: 'Usuário Fornecedor', description: 'Usuário de fornecedor' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('📤 Enviando convite com dados:', formData);
      await invitationsApi.createInvitation(formData);
      console.log('✅ Convite criado com sucesso!');
      onSuccess();
    } catch (err) {
      console.error('❌ Erro completo ao criar convite:', err);
      console.error('❌ Tipo do erro:', typeof err);
      console.error('❌ Erro stringificado:', JSON.stringify(err, null, 2));
      
      let errorMessage = 'Erro ao criar convite';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof CreateInvitationPayload, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle className="text-2xl font-bold">Convidar Novo Usuário</CardTitle>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-medium">
                Nome Completo *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="full_name"
                  type="text"
                  placeholder="João Silva"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-mail *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@empresa.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value.toLowerCase())}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Um convite será enviado para este e-mail
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Telefone
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Função *
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roles.map((role) => (
                  <label
                    key={role.value}
                    className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.role === role.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={(e) => handleChange('role', e.target.value as any)}
                      className="sr-only"
                    />
                    <span className="font-semibold text-sm">{role.label}</span>
                    <span className="text-xs text-gray-600 mt-1">{role.description}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar Convite'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
