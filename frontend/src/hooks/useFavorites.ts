// ============================================
// USE FAVORITES - Hook para manejar favoritos
// ============================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '@/lib/api/favorites';
import { queryKeys } from '@/lib/providers/react-query-provider';
import type { Favorite } from '@/types/api.types';

/**
 * Hook para obtener todos los favoritos
 */
export function useFavorites() {
    return useQuery({
        queryKey: queryKeys.favorites.list(),
        queryFn: () => favoritesApi.getAll(),
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
}

/**
 * Hook para verificar si un proveedor está en favoritos
 */
export function useIsFavorite(providerId: string) {
    return useQuery({
        queryKey: queryKeys.favorites.check(providerId),
        queryFn: () => favoritesApi.isFavorite(providerId),
        enabled: !!providerId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook para agregar a favoritos
 */
export function useAddFavorite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (providerId: string) => favoritesApi.add(providerId),
        onSuccess: (_, providerId) => {
            // Invalidar lista de favoritos
            queryClient.invalidateQueries({ queryKey: queryKeys.favorites.list() });

            // Actualizar check de favorito
            queryClient.invalidateQueries({ queryKey: queryKeys.favorites.check(providerId) });
        },
    });
}

/**
 * Hook para remover de favoritos
 */
export function useRemoveFavorite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (providerId: string) => favoritesApi.remove(providerId),
        onSuccess: (_, providerId) => {
            // Invalidar lista de favoritos
            queryClient.invalidateQueries({ queryKey: queryKeys.favorites.list() });

            // Actualizar check de favorito
            queryClient.invalidateQueries({ queryKey: queryKeys.favorites.check(providerId) });
        },
    });
}

/**
 * Hook para toggle favorito (agregar/remover)
 */
export function useToggleFavorite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (providerId: string) => favoritesApi.toggle(providerId),
        onSuccess: (_, providerId) => {
            // Invalidar lista de favoritos
            queryClient.invalidateQueries({ queryKey: queryKeys.favorites.list() });

            // Actualizar check de favorito
            queryClient.invalidateQueries({ queryKey: queryKeys.favorites.check(providerId) });
        },
    });
}
