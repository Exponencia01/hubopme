import { useState, useEffect } from 'react';
import { signIn } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Heart } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Verificar se as variáveis de ambiente estão configuradas
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variáveis de ambiente do Supabase não configuradas!');
      console.log('Configure o arquivo .env com:');
      console.log('VITE_SUPABASE_URL=https://seu-projeto.supabase.co');
      console.log('VITE_SUPABASE_ANON_KEY=sua-chave-aqui');
      setError('Erro de configuração: Variáveis de ambiente do Supabase não encontradas. Verifique o arquivo .env');
    } else {
      console.log('✅ Supabase configurado corretamente');
    }
  }, []);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('🔐 Tentando fazer login...');
    console.log('Email:', email);

    if (!validateEmail(email)) {
      setError('Por favor, insira um e-mail válido');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      console.log('📡 Chamando signIn...');
      const result = await signIn(email, password);
      console.log('✅ Login bem-sucedido:', result);
    } catch (err) {
      console.error('❌ Erro no login:', err);
      
      if (err instanceof Error) {
        console.error('Mensagem de erro:', err.message);
        
        if (err.message.includes('Missing Supabase environment variables')) {
          setError('Erro de configuração: Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
        } else if (err.message.includes('Invalid login credentials')) {
          setError('E-mail ou senha incorretos');
        } else if (err.message.includes('Email not confirmed')) {
          setError('Por favor, confirme seu e-mail antes de fazer login');
        } else {
          setError(`Erro ao fazer login: ${err.message}`);
        }
      } else {
        setError('Erro desconhecido ao fazer login. Verifique o console do navegador.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white" fill="white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">HUB OPME</h1>
            <p className="text-gray-600">Plataforma para Fornecedores e Distribuidores OPME</p>
          </div>

          {/* Login Form */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold">Bem-vindo de volta</CardTitle>
              <CardDescription>
                Entre com suas credenciais para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    E-mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Senha
                    </Label>
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => alert('Funcionalidade de recuperação de senha em desenvolvimento')}
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                    Lembrar-me neste dispositivo
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>

              {/* Contact Support */}
              <div className="mt-6 text-center text-sm text-gray-600">
                Problemas para acessar?{' '}
                <button
                  type="button"
                  onClick={() => alert('Entre em contato com o suporte: suporte@opmehub.com')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Contate o suporte
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500">
            Ao entrar, você concorda com nossos{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Termos de Serviço
            </a>{' '}
            e{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Branding/Image */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-white max-w-lg space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold leading-tight">
              Responda cotações e aumente suas vendas
            </h2>
            <p className="text-xl text-blue-100">
              Plataforma completa para fornecedores e distribuidores de OPME gerenciarem cotações, clientes e produtos com eficiência.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Respostas Rápidas</h3>
                <p className="text-blue-100">Responda cotações de hospitais em minutos</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Gestão Completa</h3>
                <p className="text-blue-100">Produtos, preços e clientes em um só lugar</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Integração com Portais</h3>
                <p className="text-blue-100">Conecte-se com OPMEnexo, Inpart e outros</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/20">
            <p className="text-sm text-blue-100">
              Mais de <span className="font-bold text-white">200+ fornecedores</span> usam o HUB OPME
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
