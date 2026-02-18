import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Clock, Building2 } from 'lucide-react';
import { invitationsApi } from '@/lib/invitations';
import { supabase } from '@/lib/supabase';
import type { UserInvitation } from '@/lib/types';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<UserInvitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token de convite não fornecido');
      setIsLoading(false);
      return;
    }

    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      const data = await invitationsApi.getInvitationByToken(token!);
      if (!data) {
        setError('Convite inválido, expirado ou já utilizado');
      } else {
        setInvitation(data);
      }
    } catch (err) {
      console.error('Erro ao carregar convite:', err);
      setError('Erro ao carregar convite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!invitation) return;

    setIsAccepting(true);
    setError('');

    try {
      // Verificar se usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirecionar para login com o token
        navigate(`/login?invitation=${token}`);
        return;
      }

      // Verificar se email corresponde
      if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
        setError(`Este convite é para ${invitation.email}. Você está logado como ${user.email}. Por favor, faça login com o email correto.`);
        setIsAccepting(false);
        return;
      }

      // Aceitar convite
      const result = await invitationsApi.acceptInvitation(token!);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(result.error || 'Erro ao aceitar convite');
      }
    } catch (err) {
      console.error('Erro ao aceitar convite:', err);
      setError(err instanceof Error ? err.message : 'Erro ao aceitar convite');
    } finally {
      setIsAccepting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Carregando convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Convite Aceito!</h2>
            <p className="text-gray-600 mb-4">
              Bem-vindo à equipe! Você será redirecionado em instantes...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Convite Inválido</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/login')}>
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center border-b pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            {invitation.full_name.charAt(0).toUpperCase()}
          </div>
          <CardTitle className="text-3xl">Você foi convidado!</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <Building2 className="h-8 w-8 text-blue-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Detalhes do Convite</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Nome:</span> {invitation.full_name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {invitation.email}
                    </p>
                    <p>
                      <span className="font-medium">Função:</span>{' '}
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {invitation.role === 'admin' && 'Administrador'}
                        {invitation.role === 'buyer' && 'Comprador'}
                        {invitation.role === 'specialist' && 'Especialista'}
                        {invitation.role === 'reviewer' && 'Revisor'}
                        {invitation.role === 'supplier_admin' && 'Admin Fornecedor'}
                        {invitation.role === 'supplier_user' && 'Usuário Fornecedor'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                Convite enviado em {formatDate(invitation.invited_at)}
              </span>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                Expira em {formatDate(invitation.expires_at)}
              </span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <Button
                onClick={handleAccept}
                disabled={isAccepting}
                className="w-full"
                size="lg"
              >
                {isAccepting ? 'Aceitando...' : 'Aceitar Convite'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>

            <p className="text-xs text-center text-gray-500">
              Ao aceitar este convite, você concorda em fazer parte da organização
              e terá acesso ao sistema conforme a função atribuída.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
