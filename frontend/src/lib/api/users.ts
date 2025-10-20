// ============================================
// USERS API - Endpoints para usuarios
// ============================================

import { apiClient } from './client';
import { User, UpdateUserDto } from '@/types/api.types';

/**
 * Servicio para manejar operaciones con usuarios
 */
export const usersApi = {
    /**
     * Obtener el perfil del usuario actual
     */
    getMe: async (): Promise<User> => {
        return apiClient.get<User>('/users/me');
    },

    /**
     * Obtener un usuario por ID
     */
    getById: async (id: string): Promise<User> => {
        return apiClient.get<User>(`/users/${id}`);
    },

    /**
     * Actualizar el perfil del usuario actual
     */
    updateMe: async (data: UpdateUserDto): Promise<User> => {
        return apiClient.patch<User>('/users/me', data);
    },

    /**
     * Actualizar un usuario específico (admin)
     */
    update: async (id: string, data: UpdateUserDto): Promise<User> => {
        return apiClient.patch<User>(`/users/${id}`, data);
    },

    /**
     * Eliminar cuenta del usuario actual
     */
    deleteMe: async (): Promise<void> => {
        return apiClient.delete<void>('/users/me');
    },

    /**
     * Sincronizar usuario con Clerk
     */
    syncWithClerk: async (): Promise<User> => {
        return apiClient.post<User>('/users/sync-clerk');
    },
};
