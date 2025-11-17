'use client';

import { useClerkSync } from '@/hooks/useClerkSync';
import { useEffect } from 'react';

export function ClerkBackendSync({ children }: { children: React.ReactNode }) {
    const { user, isLoaded, isSynced, isLoading, error } = useClerkSync();

    useEffect(() => {
        if (isLoaded && user && !isSynced && !isLoading && error) {
            console.warn('No se pudo sincronizar con el backend:', error);
            // Puedes mostrar un toast o notificación aquí
        }
    }, [isLoaded, user, isSynced, isLoading, error]);

    // Mostrar loading mientras se sincroniza (opcional)
    if (isLoaded && user && isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FBFDFF] via-emerald-50 to-cyan-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-[#0F9D58] border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Sincronizando tu cuenta...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
