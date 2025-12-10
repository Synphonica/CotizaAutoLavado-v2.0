// ============================================
// NOTIFICATIONS API - Endpoints para notificaciones
// ============================================

import { apiClient } from './client';

export interface Notification {
    id: string;
    userId: string;
    type: 'PRICE_DROP' | 'NEW_OFFER' | 'NEW_PROVIDER' | 'BOOKING_CONFIRMATION' | 'REVIEW_RESPONSE' | 'SYSTEM_UPDATE' | 'PRICE_ALERT';
    title: string;
    message: string;
    read: boolean;
    data?: Record<string, any>;
    actionUrl?: string;
    providerId?: string;
    serviceId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UnreadCountResponse {
    unreadCount: number;
}

export interface NotificationPreference {
    id: string;
    userId: string;
    type: 'PRICE_DROP' | 'NEW_OFFER' | 'NEW_PROVIDER' | 'SYSTEM_UPDATE';
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationPreferencesResponse {
    preferences: NotificationPreference[];
    allEnabled: boolean;
    enabledCount: number;
    totalCount: number;
}

/**
 * Servicio para manejar operaciones con notificaciones
 */
export const notificationsApi = {
    /**
     * Obtener notificaciones del usuario autenticado
     */
    getMyNotifications: async (page: number = 1, limit: number = 20): Promise<NotificationsResponse> => {
        return apiClient.get<NotificationsResponse>('/notifications/my-notifications', {
            params: { page, limit }
        });
    },

    /**
     * Obtener contador de no leídas
     */
    getUnreadCount: async (): Promise<UnreadCountResponse> => {
        return apiClient.get<UnreadCountResponse>('/notifications/unread-count');
    },

    /**
     * Marcar notificaciones como leídas
     */
    markAsRead: async (notificationIds: string[]): Promise<{ updated: number }> => {
        return apiClient.patch<{ updated: number }>('/notifications/mark-as-read', {
            notificationIds
        });
    },

    /**
     * Marcar todas como leídas
     */
    markAllAsRead: async (): Promise<{ updated: number }> => {
        return apiClient.patch<{ updated: number }>('/notifications/mark-all-as-read', {});
    },

    /**
     * Eliminar una notificación
     */
    deleteNotification: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/notifications/${id}`);
    },

    /**
     * Eliminar todas las notificaciones del usuario
     */
    deleteAllMyNotifications: async (): Promise<{ deleted: number }> => {
        return apiClient.delete<{ deleted: number }>('/notifications/my-notifications');
    },

    /**
     * Obtener una notificación específica
     */
    getNotification: async (id: string): Promise<Notification> => {
        return apiClient.get<Notification>(`/notifications/${id}`);
    },

    // ============================================
    // PREFERENCIAS DE NOTIFICACIONES
    // ============================================

    /**
     * Obtener preferencias de notificación del usuario
     */
    getMyPreferences: async (): Promise<NotificationPreferencesResponse> => {
        return apiClient.get<NotificationPreferencesResponse>('/notifications/preferences');
    },

    /**
     * Actualizar una preferencia específica
     */
    updatePreference: async (type: string, enabled: boolean): Promise<NotificationPreference> => {
        return apiClient.patch<NotificationPreference>(`/notifications/preferences/${type}`, {
            enabled
        });
    },

    /**
     * Actualizar múltiples preferencias
     */
    updatePreferences: async (preferences: Record<string, boolean>): Promise<NotificationPreferencesResponse> => {
        return apiClient.patch<NotificationPreferencesResponse>('/notifications/preferences', {
            preferences
        });
    },

    /**
     * Habilitar todas las notificaciones
     */
    enableAllPreferences: async (): Promise<NotificationPreferencesResponse> => {
        return apiClient.post<NotificationPreferencesResponse>('/notifications/preferences/enable-all', {});
    },

    /**
     * Deshabilitar todas las notificaciones
     */
    disableAllPreferences: async (): Promise<NotificationPreferencesResponse> => {
        return apiClient.post<NotificationPreferencesResponse>('/notifications/preferences/disable-all', {});
    },
};
