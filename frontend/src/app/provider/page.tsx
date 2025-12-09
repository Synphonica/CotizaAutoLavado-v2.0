"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function ProviderRedirectPage() {
  const { role, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      console.log('[ProviderRedirect] Auth state:', { isAuthenticated, role });

      if (!isAuthenticated) {
        console.log('[ProviderRedirect] Not authenticated, redirecting to sign-in');
        router.push('/provider/sign-in');
        return;
      }

      if (role === 'PROVIDER' || role === 'ADMIN') {
        console.log('[ProviderRedirect] Valid provider role, redirecting to dashboard');
        router.push('/provider/dashboard');
      } else if (role === 'CUSTOMER') {
        console.log('[ProviderRedirect] Customer role, redirecting to customer dashboard');
        router.push('/dashboard');
      } else {
        console.log('[ProviderRedirect] Unknown role, waiting...');
      }
    }
  }, [role, isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#0F9D58]" />
        <p className="text-[#073642] font-medium">Verificando credenciales...</p>
      </div>
    </div>
  );
}
