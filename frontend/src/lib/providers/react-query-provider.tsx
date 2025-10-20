// ============================================
// REACT QUERY PROVIDER - Configuración de React Query
// ============================================

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

/**
 * Configuración del QueryClient
 */
const createQueryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Tiempo de cache por defecto: 5 minutos
                staleTime: 5 * 60 * 1000,
                // Tiempo de cache en background: 10 minutos
                gcTime: 10 * 60 * 1000,
                // Reintentar 1 vez en caso de error
                retry: 1,
                // No refetch automático en window focus en desarrollo
                refetchOnWindowFocus: process.env.NODE_ENV === 'production',
                // Refetch en reconexión
                refetchOnReconnect: true,
            },
            mutations: {
                // Reintentar 0 veces en caso de error
                retry: 0,
            },
        },
    });
};

interface ReactQueryProviderProps {
    children: ReactNode;
}

/**
 * Provider de React Query
 * Debe envolver toda la aplicación
 */
export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
    // Crear queryClient en estado para evitar recreación en re-renders
    const [queryClient] = useState(() => createQueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools solo en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}

/**
 * Query Keys - Claves para organizar el cache
 */
export const queryKeys = {
    // Services
    services: {
        all: ['services'] as const,
        lists: () => [...queryKeys.services.all, 'list'] as const,
        list: (filters: Record<string, any>) => [...queryKeys.services.lists(), filters] as const,
        details: () => [...queryKeys.services.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.services.details(), id] as const,
        byProvider: (providerId: string) => [...queryKeys.services.all, 'provider', providerId] as const,
        popular: () => [...queryKeys.services.all, 'popular'] as const,
        byCategory: (category: string) => [...queryKeys.services.all, 'category', category] as const,
    },

    // Providers
    providers: {
        all: ['providers'] as const,
        lists: () => [...queryKeys.providers.all, 'list'] as const,
        list: (filters: Record<string, any>) => [...queryKeys.providers.lists(), filters] as const,
        details: () => [...queryKeys.providers.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.providers.details(), id] as const,
        nearby: (location: { latitude: number; longitude: number }) =>
            [...queryKeys.providers.all, 'nearby', location] as const,
        me: () => [...queryKeys.providers.all, 'me'] as const,
        stats: (id: string) => [...queryKeys.providers.all, 'stats', id] as const,
    },

    // Search
    search: {
        all: ['search'] as const,
        results: (query: Record<string, any>) => [...queryKeys.search.all, query] as const,
        suggestions: (query: string) => [...queryKeys.search.all, 'suggestions', query] as const,
        history: () => [...queryKeys.search.all, 'history'] as const,
    },

    // Reviews
    reviews: {
        all: ['reviews'] as const,
        byService: (serviceId: string) => [...queryKeys.reviews.all, 'service', serviceId] as const,
        byProvider: (providerId: string) => [...queryKeys.reviews.all, 'provider', providerId] as const,
        detail: (id: string) => [...queryKeys.reviews.all, 'detail', id] as const,
        me: () => [...queryKeys.reviews.all, 'me'] as const,
    },

    // Favorites
    favorites: {
        all: ['favorites'] as const,
        list: () => [...queryKeys.favorites.all, 'list'] as const,
        check: (providerId: string) => [...queryKeys.favorites.all, 'check', providerId] as const,
    },

    // Comparison
    comparison: {
        all: ['comparison'] as const,
        result: (params: Record<string, any>) => [...queryKeys.comparison.all, params] as const,
        history: () => [...queryKeys.comparison.all, 'history'] as const,
    },

    // Users
    users: {
        all: ['users'] as const,
        me: () => [...queryKeys.users.all, 'me'] as const,
        detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
    },
};
