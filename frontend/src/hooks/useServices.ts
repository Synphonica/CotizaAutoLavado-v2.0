// ============================================
// USE SERVICES - Hook para manejar servicios
// ============================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '@/lib/api/services';
import { queryKeys } from '@/lib/providers/react-query-provider';
import type {
    Service,
    CreateServiceDto,
    UpdateServiceDto,
    QueryServicesDto,
    PaginatedResponse,
} from '@/types/api.types';

/**
 * Hook para obtener todos los servicios con filtros
 */
export function useServices(params?: QueryServicesDto) {
    return useQuery({
        queryKey: queryKeys.services.list(params || {}),
        queryFn: () => servicesApi.getAll(params),
    });
}

/**
 * Hook para obtener un servicio por ID
 */
export function useService(id: string, enabled: boolean = true) {
    return useQuery({
        queryKey: queryKeys.services.detail(id),
        queryFn: () => servicesApi.getById(id),
        enabled: enabled && !!id,
    });
}

/**
 * Hook para obtener servicios de un proveedor
 */
export function useServicesByProvider(providerId: string, params?: QueryServicesDto) {
    return useQuery({
        queryKey: queryKeys.services.byProvider(providerId),
        queryFn: () => servicesApi.getByProvider(providerId, params),
        enabled: !!providerId,
    });
}

/**
 * Hook para obtener servicios populares
 */
export function usePopularServices(limit: number = 10) {
    return useQuery({
        queryKey: queryKeys.services.popular(),
        queryFn: () => servicesApi.getPopular(limit),
        staleTime: 10 * 60 * 1000, // 10 minutos
    });
}

/**
 * Hook para obtener servicios por categoría
 */
export function useServicesByCategory(category: string, params?: QueryServicesDto) {
    return useQuery({
        queryKey: queryKeys.services.byCategory(category),
        queryFn: () => servicesApi.getByCategory(category, params),
        enabled: !!category,
    });
}

/**
 * Hook para crear un servicio
 */
export function useCreateService() {
    const queryClient = useQueryClient();

    return useMutation<Service, Error, CreateServiceDto>({
        mutationFn: (data: CreateServiceDto) => servicesApi.create(data),
        onSuccess: (newService: Service) => {
            // Invalidar cache de servicios
            queryClient.invalidateQueries({ queryKey: queryKeys.services.all });

            // Invalidar servicios del proveedor
            if (newService.providerId) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.services.byProvider(newService.providerId),
                });
            }
        },
    });
}

/**
 * Hook para actualizar un servicio
 */
export function useUpdateService() {
    const queryClient = useQueryClient();

    return useMutation<Service, Error, { id: string; data: UpdateServiceDto }>({
        mutationFn: ({ id, data }: { id: string; data: UpdateServiceDto }) =>
            servicesApi.update(id, data),
        onSuccess: (updatedService: Service) => {
            // Invalidar cache del servicio específico
            queryClient.invalidateQueries({
                queryKey: queryKeys.services.detail(updatedService.id),
            });

            // Invalidar listas
            queryClient.invalidateQueries({ queryKey: queryKeys.services.lists() });

            // Invalidar servicios del proveedor
            if (updatedService.providerId) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.services.byProvider(updatedService.providerId),
                });
            }
        },
    });
}

/**
 * Hook para eliminar un servicio
 */
export function useDeleteService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => servicesApi.delete(id),
        onSuccess: (_, deletedId) => {
            // Invalidar todas las listas de servicios
            queryClient.invalidateQueries({ queryKey: queryKeys.services.all });

            // Remover del cache específico
            queryClient.removeQueries({ queryKey: queryKeys.services.detail(deletedId) });
        },
    });
}
