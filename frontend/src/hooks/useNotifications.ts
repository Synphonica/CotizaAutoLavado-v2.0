'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationsApi, type Notification, type UnreadCountResponse } from '@/lib/api/notifications';
import { useAuth } from '@clerk/nextjs';

/**
 * Hook para gestionar notificaciones con polling automático
 */
export function useNotifications(pollInterval: number = 30000) {
    const { isSignedIn } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cargar notificaciones
    const fetchNotifications = useCallback(async () => {
        if (!isSignedIn) return;

        try {
            setError(null);
            const response = await notificationsApi.getMyNotifications(1, 50);
            setNotifications(response.notifications || []);
        } catch (err: any) {
            console.error('Error cargando notificaciones:', err);
            setError(err.message || 'Error al cargar notificaciones');
        } finally {
            setLoading(false);
        }
    }, [isSignedIn]);

    // Obtener contador de no leídas
    const fetchUnreadCount = useCallback(async () => {
        if (!isSignedIn) return;

        try {
            const response = await notificationsApi.getUnreadCount();
            setUnreadCount(response.unreadCount);
        } catch (err: any) {
            console.error('Error obteniendo contador:', err);
        }
    }, [isSignedIn]);

    // Cargar notificaciones al montar
    useEffect(() => {
        if (isSignedIn) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [isSignedIn, fetchNotifications, fetchUnreadCount]);

    // Polling para actualizar contador
    useEffect(() => {
        if (!isSignedIn || pollInterval <= 0) return;

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, pollInterval);

        return () => clearInterval(interval);
    }, [isSignedIn, pollInterval, fetchUnreadCount]);

    // Marcar como leída
    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            await notificationsApi.markAsRead([notificationId]);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err: any) {
            console.error('Error marcando como leída:', err);
            throw err;
        }
    }, []);

    // Marcar todas como leídas
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err: any) {
            console.error('Error marcando todas como leídas:', err);
            throw err;
        }
    }, []);

    // Eliminar notificación
    const deleteNotification = useCallback(async (notificationId: string) => {
        try {
            await notificationsApi.deleteNotification(notificationId);
            const deletedNotification = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            if (deletedNotification && !deletedNotification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err: any) {
            console.error('Error eliminando notificación:', err);
            throw err;
        }
    }, [notifications]);

    // Eliminar todas
    const deleteAllNotifications = useCallback(async () => {
        try {
            await notificationsApi.deleteAllMyNotifications();
            setNotifications([]);
            setUnreadCount(0);
        } catch (err: any) {
            console.error('Error eliminando todas las notificaciones:', err);
            throw err;
        }
    }, []);

    // Refrescar
    const refresh = useCallback(() => {
        setLoading(true);
        fetchNotifications();
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        refresh
    };
}

/**
 * Hook simple para obtener solo el contador de no leídas
 */
export function useUnreadCount(pollInterval: number = 30000) {
    const { isSignedIn } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        if (!isSignedIn) {
            setUnreadCount(0);
            return;
        }

        try {
            const response = await notificationsApi.getUnreadCount();
            setUnreadCount(response.unreadCount);
        } catch (err: any) {
            console.error('Error obteniendo contador:', err);
        }
    }, [isSignedIn]);

    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    useEffect(() => {
        if (!isSignedIn || pollInterval <= 0) return;

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, pollInterval);

        return () => clearInterval(interval);
    }, [isSignedIn, pollInterval, fetchUnreadCount]);

    return { unreadCount, refresh: fetchUnreadCount };
}
