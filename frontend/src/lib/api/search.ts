// ============================================
// SEARCH API - Endpoints para búsqueda
// ============================================

import { apiClient } from './client';
import {
    SearchQuery,
    SearchResponse,
    SearchSuggestion,
} from '@/types/api.types';

/**
 * Servicio para manejar operaciones de búsqueda
 */
export const searchApi = {
    /**
     * Búsqueda principal de servicios
     */
    search: async (query: SearchQuery): Promise<SearchResponse> => {
        return apiClient.post<SearchResponse>('/search', query);
    },

    /**
     * Búsqueda rápida por query string
     */
    quickSearch: async (q: string, params?: Partial<SearchQuery>): Promise<SearchResponse> => {
        return apiClient.get<SearchResponse>('/search', { params: { q, ...params } });
    },

    /**
     * Obtener sugerencias de búsqueda
     */
    getSuggestions: async (query: string, limit: number = 5): Promise<SearchSuggestion[]> => {
        return apiClient.get<SearchSuggestion[]>('/search/suggestions', { params: { query, limit } });
    },

    /**
     * Búsqueda cercana (por ubicación)
     */
    searchNearby: async (latitude: number, longitude: number, params?: Partial<SearchQuery>): Promise<SearchResponse> => {
        return apiClient.post<SearchResponse>('/search/nearby', {
            latitude,
            longitude,
            ...params,
        });
    },

    /**
     * Búsqueda por categoría
     */
    searchByCategory: async (category: string, params?: Partial<SearchQuery>): Promise<SearchResponse> => {
        return apiClient.get<SearchResponse>(`/search/category/${category}`, { params });
    },

    /**
     * Guardar historial de búsqueda
     */
    saveSearchHistory: async (query: string): Promise<void> => {
        return apiClient.post<void>('/search/history', { query });
    },

    /**
     * Obtener historial de búsqueda del usuario
     */
    getSearchHistory: async (limit: number = 10): Promise<string[]> => {
        return apiClient.get<string[]>('/search/history', { params: { limit } });
    },
};
