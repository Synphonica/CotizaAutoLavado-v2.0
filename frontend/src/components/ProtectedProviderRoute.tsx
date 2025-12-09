'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProviderAuth } from '@/hooks/useProviderAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedProviderRouteProps {
    children: React.ReactNode;
}

export function ProtectedProviderRoute({ children }: ProtectedProviderRouteProps) {
    const router = useRouter();
    const { user, provider, loading, isAuthenticated } = useProviderAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/provider/login');
        }
    }, [loading, isAuthenticated, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#0F9D58]" />
                    <p className="text-gray-600">Verificando autenticación...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
