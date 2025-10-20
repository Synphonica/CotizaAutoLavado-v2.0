// ============================================
// SERVICES API - Endpoints para servicios
// ============================================

import { apiClient } from './client';
import {
    Service,
    CreateServiceDto,
    UpdateServiceDto,
    QueryServicesDto,
    PaginatedResponse,
} from '@/types/api.types';

/**
 * Servicio para manejar operaciones con servicios
 */
export const servicesApi = {
    /**
     * Obtener todos los servicios con filtros
     */
    getAll: async (params?: QueryServicesDto): Promise<PaginatedResponse<Service>> => {
        return apiClient.get<PaginatedResponse<Service>>('/services', { params });
    },

    /**
     * Obtener un servicio por ID
     */
    getById: async (id: string): Promise<Service> => {
        return apiClient.get<Service>(`/services/${id}`);
    },

    /**
     * Obtener servicios de un proveedor específico
     */
    getByProvider: async (providerId: string, params?: QueryServicesDto): Promise<PaginatedResponse<Service>> => {
        return apiClient.get<PaginatedResponse<Service>>(`/services/provider/${providerId}`, { params });
    },

    /**
     * Crear un nuevo servicio (solo proveedores)
     */
    create: async (data: CreateServiceDto): Promise<Service> => {
        return apiClient.post<Service>('/services', data);
    },

    /**
     * Actualizar un servicio
     */
    update: async (id: string, data: UpdateServiceDto): Promise<Service> => {
        return apiClient.patch<Service>(`/services/${id}`, data);
    },

    /**
     * Eliminar un servicio
     */
    delete: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/services/${id}`);
    },

    /**
     * Obtener servicios populares
     */
    getPopular: async (limit: number = 10): Promise<Service[]> => {
        return apiClient.get<Service[]>('/services/popular', { params: { limit } });
    },

    /**
     * Obtener servicios por categoría
     */
    getByCategory: async (category: string, params?: QueryServicesDto): Promise<PaginatedResponse<Service>> => {
        return apiClient.get<PaginatedResponse<Service>>(`/services/category/${category}`, { params });
    },
};
