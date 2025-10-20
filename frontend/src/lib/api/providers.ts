// ============================================
// PROVIDERS API - Endpoints para proveedores
// ============================================

import { apiClient } from './client';
import {
    Provider,
    CreateProviderDto,
    UpdateProviderDto,
    QueryProvidersDto,
    NearbyProvidersDto,
    PaginatedResponse,
} from '@/types/api.types';

/**
 * Servicio para manejar operaciones con proveedores
 */
export const providersApi = {
    /**
     * Obtener todos los proveedores con filtros
     */
    getAll: async (params?: QueryProvidersDto): Promise<PaginatedResponse<Provider>> => {
        return apiClient.get<PaginatedResponse<Provider>>('/providers', { params });
    },

    /**
     * Obtener un proveedor por ID
     */
    getById: async (id: string): Promise<Provider> => {
        return apiClient.get<Provider>(`/providers/${id}`);
    },

    /**
     * Obtener proveedores cercanos
     */
    getNearby: async (params: NearbyProvidersDto): Promise<Provider[]> => {
        return apiClient.get<Provider[]>('/providers/nearby', { params });
    },

    /**
     * Crear un nuevo proveedor (registro)
     */
    create: async (data: CreateProviderDto): Promise<Provider> => {
        return apiClient.post<Provider>('/providers', data);
    },

    /**
     * Actualizar un proveedor
     */
    update: async (id: string, data: UpdateProviderDto): Promise<Provider> => {
        return apiClient.patch<Provider>(`/providers/${id}`, data);
    },

    /**
     * Eliminar un proveedor
     */
    delete: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/providers/${id}`);
    },

    /**
     * Obtener el perfil del proveedor actual (el usuario logueado)
     */
    getMyProfile: async (): Promise<Provider> => {
        return apiClient.get<Provider>('/providers/me');
    },

    /**
     * Verificar disponibilidad de un proveedor
     */
    checkAvailability: async (id: string, date: string): Promise<{ available: boolean; slots: string[] }> => {
        return apiClient.get(`/providers/${id}/availability`, { params: { date } });
    },

    /**
     * Obtener estadísticas de un proveedor
     */
    getStats: async (id: string): Promise<any> => {
        return apiClient.get(`/providers/${id}/stats`);
    },
};
