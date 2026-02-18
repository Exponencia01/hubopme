// Script de debug temporário para verificar configuração do Supabase

export const checkSupabaseConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.group('🔍 Supabase Configuration Check');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ NÃO configurado');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Configurado' : '❌ NÃO configurado');
  
  if (!supabaseUrl) {
    console.error('❌ VITE_SUPABASE_URL não encontrado no arquivo .env');
  }
  
  if (!supabaseAnonKey) {
    console.error('❌ VITE_SUPABASE_ANON_KEY não encontrado no arquivo .env');
  }
  
  if (supabaseUrl && supabaseAnonKey) {
    console.log('✅ Configuração OK - Supabase deve funcionar');
  } else {
    console.error('❌ Configure o arquivo .env com as credenciais do Supabase');
    console.log('Exemplo:');
    console.log('VITE_SUPABASE_URL=https://seu-projeto.supabase.co');
    console.log('VITE_SUPABASE_ANON_KEY=sua-chave-aqui');
  }
  
  console.groupEnd();
  
  return {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isConfigured: !!(supabaseUrl && supabaseAnonKey)
  };
};
