// ============================================
// COMPARISON API - Endpoints para comparación
// ============================================

import { apiClient } from './client';
import { ComparisonRequest, ComparisonResult } from '@/types/api.types';

/**
 * Servicio para manejar operaciones de comparación
 */
export const comparisonApi = {
    /**
     * Comparar servicios de diferentes proveedores
     */
    compare: async (request: ComparisonRequest): Promise<ComparisonResult> => {
        return apiClient.post<ComparisonResult>('/comparison/compare', request);
    },

    /**
     * Comparar proveedores específicos
     */
    compareProviders: async (providerIds: string[], serviceCategory?: string): Promise<ComparisonResult> => {
        return apiClient.post<ComparisonResult>('/comparison/providers', {
            providerIds,
            serviceCategory,
        });
    },

    /**
     * Obtener comparación guardada
     */
    getSavedComparison: async (id: string): Promise<ComparisonResult> => {
        return apiClient.get<ComparisonResult>(`/comparison/${id}`);
    },

    /**
     * Guardar una comparación
     */
    saveComparison: async (data: ComparisonRequest): Promise<{ id: string; comparison: ComparisonResult }> => {
        return apiClient.post('/comparison/save', data);
    },

    /**
     * Obtener historial de comparaciones del usuario
     */
    getHistory: async (limit: number = 10): Promise<ComparisonResult[]> => {
        return apiClient.get<ComparisonResult[]>('/comparison/history', { params: { limit } });
    },
};
