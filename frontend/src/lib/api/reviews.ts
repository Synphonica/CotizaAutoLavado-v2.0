// ============================================
// REVIEWS API - Endpoints para reseñas
// ============================================

import { apiClient } from './client';
import {
    Review,
    CreateReviewDto,
    UpdateReviewDto,
    PaginatedResponse,
} from '@/types/api.types';

/**
 * Servicio para manejar operaciones con reseñas
 */
export const reviewsApi = {
    /**
     * Obtener todas las reseñas de un servicio
     */
    getByService: async (serviceId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Review>> => {
        return apiClient.get<PaginatedResponse<Review>>(`/reviews/service/${serviceId}`, {
            params: { page, limit },
        });
    },

    /**
     * Obtener todas las reseñas de un proveedor
     */
    getByProvider: async (providerId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Review>> => {
        return apiClient.get<PaginatedResponse<Review>>(`/reviews/provider/${providerId}`, {
            params: { page, limit },
        });
    },

    /**
     * Obtener una reseña por ID
     */
    getById: async (id: string): Promise<Review> => {
        return apiClient.get<Review>(`/reviews/${id}`);
    },

    /**
     * Crear una nueva reseña
     */
    create: async (data: CreateReviewDto): Promise<Review> => {
        return apiClient.post<Review>('/reviews', data);
    },

    /**
     * Actualizar una reseña
     */
    update: async (id: string, data: UpdateReviewDto): Promise<Review> => {
        return apiClient.patch<Review>(`/reviews/${id}`, data);
    },

    /**
     * Eliminar una reseña
     */
    delete: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/reviews/${id}`);
    },

    /**
     * Obtener reseñas del usuario actual
     */
    getMyReviews: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Review>> => {
        return apiClient.get<PaginatedResponse<Review>>('/reviews/me', {
            params: { page, limit },
        });
    },
};
