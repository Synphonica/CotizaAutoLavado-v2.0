'use client';

import { useClerkSync } from '@/hooks/useClerkSync';
import { useEffect } from 'react';

export function ClerkBackendSync({ children }: { children: React.ReactNode }) {
    const { user, isLoaded, isSynced, isLoading, error } = useClerkSync();

    useEffect(() => {
        if (isLoaded && user && !isSynced && !isLoading && error) {
            console.warn('No se pudo sincronizar con el backend:', error);
        }
    }, [isLoaded, user, isSynced, isLoading, error]);

    // Sincronización silenciosa - no mostrar loading screen
    // La sincronización ocurre en segundo plano sin interrumpir la UX

    return <>{children}</>;
}
