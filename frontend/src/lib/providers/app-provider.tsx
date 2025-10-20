// ============================================
// APP PROVIDER - Provider principal de la aplicación
// ============================================

'use client';

import { ReactNode } from 'react';
import { ReactQueryProvider } from './react-query-provider';

interface AppProviderProps {
    children: ReactNode;
}

/**
 * Provider principal que envuelve toda la aplicación
 * Solo incluye React Query Provider
 * La inicialización de la API se hace en ApiInitializer
 */
export function AppProvider({ children }: AppProviderProps) {
    return (
        <ReactQueryProvider>
            {children}
        </ReactQueryProvider>
    );
}