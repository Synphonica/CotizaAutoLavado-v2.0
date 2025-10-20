// ============================================
// FAVORITES API - Endpoints para favoritos
// ============================================

import { apiClient } from './client';
import { Favorite, Provider } from '@/types/api.types';

/**
 * Servicio para manejar operaciones con favoritos
 */
export const favoritesApi = {
    /**
     * Obtener todos los favoritos del usuario
     */
    getAll: async (): Promise<Favorite[]> => {
        return apiClient.get<Favorite[]>('/favorites');
    },

    /**
     * Agregar un proveedor a favoritos
     */
    add: async (providerId: string): Promise<Favorite> => {
        return apiClient.post<Favorite>('/favorites', { providerId });
    },

    /**
     * Eliminar un proveedor de favoritos
     */
    remove: async (providerId: string): Promise<void> => {
        return apiClient.delete<void>(`/favorites/${providerId}`);
    },

    /**
     * Verificar si un proveedor está en favoritos
     */
    isFavorite: async (providerId: string): Promise<boolean> => {
        try {
            const favorites = await apiClient.get<Favorite[]>('/favorites');
            return favorites.some(fav => fav.providerId === providerId);
        } catch (error) {
            return false;
        }
    },

    /**
     * Toggle favorito (agregar o eliminar)
     */
    toggle: async (providerId: string): Promise<{ isFavorite: boolean }> => {
        const isFav = await favoritesApi.isFavorite(providerId);
        if (isFav) {
            await favoritesApi.remove(providerId);
            return { isFavorite: false };
        } else {
            await favoritesApi.add(providerId);
            return { isFavorite: true };
        }
    },
};
