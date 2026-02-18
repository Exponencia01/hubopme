import { useState, useEffect } from 'react';
import { Plus, Mail, UserCheck, UserX, Clock, XCircle, RefreshCw, Copy, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { invitationsApi, usersApi } from '@/lib/invitations';
import type { UserInvitation, UserProfile } from '@/lib/types';
import InviteUserModal from '@/components/users/InviteUserModal';

export default function UsersSettings() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'invitations'>('users');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, invitationsData] = await Promise.all([
        usersApi.getOrganizationUsers(),
        invitationsApi.getOrganizationInvitations(),
      ]);
      setUsers(usersData);
      setInvitations(invitationsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteSuccess = () => {
    setShowInviteModal(false);
    loadData();
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este convite?')) return;
    
    try {
      await invitationsApi.cancelInvitation(invitationId, 'Cancelado pelo administrador');
      loadData();
    } catch (error) {
      console.error('Erro ao cancelar convite:', error);
      alert('Erro ao cancelar convite');
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await invitationsApi.resendInvitation(invitationId);
      alert('Convite reenviado com sucesso!');
      loadData();
    } catch (error) {
      console.error('Erro ao reenviar convite:', error);
      alert('Erro ao reenviar convite');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await usersApi.updateUserStatus(userId, !currentStatus);
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do usuário');
    }
  };

  const handleCopyInvitationLink = async (invitation: UserInvitation) => {
    const baseUrl = window.location.origin;
    const invitationLink = `${baseUrl}/accept-invitation?token=${invitation.invitation_token}`;
    
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopiedId(invitation.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      alert('Erro ao copiar link. Por favor, copie manualmente: ' + invitationLink);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      supplier_admin: 'bg-purple-100 text-purple-800',
      buyer: 'bg-blue-100 text-blue-800',
      specialist: 'bg-green-100 text-green-800',
      reviewer: 'bg-yellow-100 text-yellow-800',
      supplier_user: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      supplier_admin: 'Admin Fornecedor',
      buyer: 'Comprador',
      specialist: 'Especialista',
      reviewer: 'Revisor',
      supplier_user: 'Usuário Fornecedor',
    };
    return labels[role] || role;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: 'Aceito', color: 'bg-green-100 text-green-800' },
      expired: { label: 'Expirado', color: 'bg-red-100 text-red-800' },
      cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' },
    };
    const badge = badges[status] || badges.pending;
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Gerencie usuários e convites da sua organização
              </CardDescription>
            </div>
            <Button onClick={() => setShowInviteModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Convidar Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 border-b mb-6">
            <button
              onClick={() => setActiveSubTab('users')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeSubTab === 'users'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Usuários Ativos ({users.length})
            </button>
            <button
              onClick={() => setActiveSubTab('invitations')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeSubTab === 'invitations'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Convites ({invitations.filter(i => i.status === 'pending').length})
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : activeSubTab === 'users' ? (
            <div className="space-y-4">
              {users.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-500">Nenhum usuário encontrado</p>
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{user.full_name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                            {user.is_active ? (
                              <Badge className="bg-green-100 text-green-800">
                                <UserCheck className="h-3 w-3 mr-1" />
                                Ativo
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                <UserX className="h-3 w-3 mr-1" />
                                Inativo
                              </Badge>
                            )}
                          </div>
                          {user.phone && (
                            <p className="text-sm text-gray-600 mt-1">{user.phone}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                        >
                          {user.is_active ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-500">Nenhum convite encontrado</p>
                </div>
              ) : (
                invitations.map((invitation) => (
                  <div key={invitation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white">
                          <Mail className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{invitation.full_name}</h3>
                          <p className="text-sm text-gray-600">{invitation.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getRoleBadgeColor(invitation.role)}>
                              {getRoleLabel(invitation.role)}
                            </Badge>
                            {getStatusBadge(invitation.status)}
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Enviado em {formatDate(invitation.invited_at)}
                            </span>
                            <span>Expira em {formatDate(invitation.expires_at)}</span>
                          </div>
                        </div>
                      </div>
                      {invitation.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyInvitationLink(invitation)}
                            className={copiedId === invitation.id ? 'bg-green-50 border-green-300' : ''}
                          >
                            {copiedId === invitation.id ? (
                              <>
                                <CheckCheck className="h-4 w-4 mr-1 text-green-600" />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-1" />
                                Copiar Link
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendInvitation(invitation.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Reenviar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelInvitation(invitation.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
    </div>
  );
}
