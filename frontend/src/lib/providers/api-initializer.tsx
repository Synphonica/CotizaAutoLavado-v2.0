// ============================================
// API INITIALIZER - Inicializa el cliente API con Clerk
// ============================================

'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { initializeApiClient } from '@/lib/api/client';

/**
 * Componente que inicializa el cliente API con el token de Clerk
 * Debe estar dentro del ClerkProvider
 */
export function ApiInitializer({ children }: { children: React.ReactNode }) {
    const { getToken } = useAuth();

    // Inicializar el cliente API con el token provider de Clerk
    useEffect(() => {
        initializeApiClient(async () => {
            try {
                const token = await getToken();
                return token;
            } catch (error) {
                console.error('Error obteniendo token:', error);
                return null;
            }
        });
    }, [getToken]);

    return <>{children}</>;
}
