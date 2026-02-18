import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, getUserProfile } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Quotations from '@/pages/Quotations';
import QuotationDetail from '@/pages/QuotationDetail';
import Suppliers from '@/pages/Suppliers';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import AcceptInvitation from '@/pages/AcceptInvitation';

function App() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        getUserProfile(session.user.id).then((profile) => {
          setUser(profile);
        }).catch(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getUserProfile(session.user.id).then((profile) => {
          setUser(profile);
        }).catch(() => {
          setUser(null);
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  // Mostrar loading enquanto verifica sessão
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route for invitation acceptance */}
        <Route path="/accept-invitation" element={<AcceptInvitation />} />
        
        {/* Login route */}
        {!user && <Route path="*" element={<Login />} />}
        
        {/* Protected routes */}
        {user && (
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="quotations" element={<Quotations />} />
            <Route path="quotations/:id" element={<QuotationDetail />} />
            <Route path="customers" element={<Suppliers />} />
            <Route path="products" element={<Dashboard />} />
            <Route path="pricing" element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
