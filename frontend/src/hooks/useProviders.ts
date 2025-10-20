// ============================================
// USE PROVIDERS - Hook para manejar proveedores
// ============================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providersApi } from '@/lib/api/providers';
import { queryKeys } from '@/lib/providers/react-query-provider';
import type {
    Provider,
    CreateProviderDto,
    UpdateProviderDto,
    QueryProvidersDto,
    NearbyProvidersDto,
} from '@/types/api.types';

/**
 * Hook para obtener todos los proveedores con filtros
 */
export function useProviders(params?: QueryProvidersDto) {
    return useQuery({
        queryKey: queryKeys.providers.list(params || {}),
        queryFn: () => providersApi.getAll(params),
    });
}

/**
 * Hook para obtener un proveedor por ID
 */
export function useProvider(id: string, enabled: boolean = true) {
    return useQuery({
        queryKey: queryKeys.providers.detail(id),
        queryFn: () => providersApi.getById(id),
        enabled: enabled && !!id,
    });
}

/**
 * Hook para obtener proveedores cercanos
 */
export function useNearbyProviders(params: NearbyProvidersDto, enabled: boolean = true) {
    return useQuery({
        queryKey: queryKeys.providers.nearby({
            latitude: params.latitude,
            longitude: params.longitude,
        }),
        queryFn: () => providersApi.getNearby(params),
        enabled: enabled && !!params.latitude && !!params.longitude,
    });
}

/**
 * Hook para obtener el perfil del proveedor actual
 */
export function useMyProviderProfile() {
    return useQuery({
        queryKey: queryKeys.providers.me(),
        queryFn: () => providersApi.getMyProfile(),
        retry: false, // No reintentar si no es proveedor
    });
}

/**
 * Hook para obtener estadísticas de un proveedor
 */
export function useProviderStats(id: string, enabled: boolean = true) {
    return useQuery({
        queryKey: queryKeys.providers.stats(id),
        queryFn: () => providersApi.getStats(id),
        enabled: enabled && !!id,
    });
}

/**
 * Hook para crear un proveedor
 */
export function useCreateProvider() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProviderDto) => providersApi.create(data),
        onSuccess: () => {
            // Invalidar cache de proveedores
            queryClient.invalidateQueries({ queryKey: queryKeys.providers.all });
            // Invalidar perfil de proveedor
            queryClient.invalidateQueries({ queryKey: queryKeys.providers.me() });
        },
    });
}

/**
 * Hook para actualizar un proveedor
 */
export function useUpdateProvider() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProviderDto }) =>
            providersApi.update(id, data),
        onSuccess: (data: Provider) => {
            // Invalidar cache del proveedor específico
            queryClient.invalidateQueries({
                queryKey: queryKeys.providers.detail(data.id),
            });

            // Invalidar listas
            queryClient.invalidateQueries({ queryKey: queryKeys.providers.lists() });

            // Invalidar perfil si es el usuario actual
            queryClient.invalidateQueries({ queryKey: queryKeys.providers.me() });
        },
    });
}

/**
 * Hook para eliminar un proveedor
 */
export function useDeleteProvider() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => providersApi.delete(id),
        onSuccess: (_, deletedId) => {
            // Invalidar todas las listas de proveedores
            queryClient.invalidateQueries({ queryKey: queryKeys.providers.all });

            // Remover del cache específico
            queryClient.removeQueries({ queryKey: queryKeys.providers.detail(deletedId) });
        },
    });
}
