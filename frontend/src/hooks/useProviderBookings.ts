'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';

export interface Booking {
    id: string;
    providerId: string;
    serviceId: string;
    userId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    scheduledDate: string;
    scheduledTime: string;
    status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
    totalPrice: number;
    notes?: string;
    cancellationReason?: string;
    createdAt: string;
    updatedAt: string;
    service?: {
        id: string;
        name: string;
        type: string;
        duration: number;
    };
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export interface BookingStats {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
}

/**
 * Hook para gestionar las reservas de un proveedor
 */
export function useProviderBookings(providerId?: string) {
    const api = useApi();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState<BookingStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Obtener todas las reservas del proveedor
     */
    const fetchBookings = useCallback(async (filters?: {
        status?: string;
        startDate?: string;
        endDate?: string;
    }) => {
        if (!providerId) {
            setBookings([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                providerId,
                ...(filters?.status && { status: filters.status }),
                ...(filters?.startDate && { startDate: filters.startDate }),
                ...(filters?.endDate && { endDate: filters.endDate }),
            });

            const data = await api.get<Booking[]>(`/bookings?${params}`);
            setBookings(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Error fetching bookings:', err);
            setError(err.message || 'Error al obtener las reservas');
        } finally {
            setLoading(false);
        }
    }, [api, providerId]);

    /**
     * Obtener estadísticas de reservas
     */
    const fetchStats = useCallback(async (startDate?: string, endDate?: string) => {
        if (!providerId) return;

        try {
            const params = new URLSearchParams({
                ...(startDate && { startDate }),
                ...(endDate && { endDate }),
            });

            const data = await api.get<BookingStats>(
                `/bookings/stats/${providerId}?${params}`
            );
            setStats(data);
        } catch (err: any) {
            console.error('Error fetching booking stats:', err);
        }
    }, [api, providerId]);

    /**
     * Actualizar el estado de una reserva
     */
    const updateBookingStatus = useCallback(async (
        bookingId: string,
        status: Booking['status'],
        notes?: string
    ): Promise<Booking> => {
        try {
            setLoading(true);
            setError(null);
            const updatedBooking = await api.patch<Booking>(`/bookings/${bookingId}`, {
                status,
                ...(notes && { notes }),
            });
            setBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));
            return updatedBooking;
        } catch (err: any) {
            console.error('Error updating booking:', err);
            setError(err.message || 'Error al actualizar la reserva');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api]);

    /**
     * Confirmar una reserva
     */
    const confirmBooking = useCallback(async (bookingId: string): Promise<Booking> => {
        return updateBookingStatus(bookingId, 'CONFIRMED');
    }, [updateBookingStatus]);

    /**
     * Completar una reserva
     */
    const completeBooking = useCallback(async (bookingId: string): Promise<Booking> => {
        return updateBookingStatus(bookingId, 'COMPLETED');
    }, [updateBookingStatus]);

    /**
     * Cancelar una reserva
     */
    const cancelBooking = useCallback(async (
        bookingId: string,
        reason: string
    ): Promise<Booking> => {
        try {
            setLoading(true);
            setError(null);
            const updatedBooking = await api.post<Booking>(`/bookings/${bookingId}/cancel`, {
                reason,
            });
            setBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));
            return updatedBooking;
        } catch (err: any) {
            console.error('Error cancelling booking:', err);
            setError(err.message || 'Error al cancelar la reserva');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api]);

    /**
     * Obtener una reserva específica
     */
    const getBooking = useCallback(async (bookingId: string): Promise<Booking> => {
        try {
            setLoading(true);
            setError(null);
            return await api.get<Booking>(`/bookings/${bookingId}`);
        } catch (err: any) {
            console.error('Error fetching booking:', err);
            setError(err.message || 'Error al obtener la reserva');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api]);

    /**
     * Refrescar reservas y estadísticas
     */
    const refresh = useCallback(() => {
        return Promise.all([
            fetchBookings(),
            fetchStats(),
        ]);
    }, [fetchBookings, fetchStats]);

    // Cargar datos cuando cambie el providerId
    useEffect(() => {
        if (providerId) {
            fetchBookings();
            fetchStats();
        }
    }, [providerId, fetchBookings, fetchStats]);

    return {
        bookings,
        stats,
        loading,
        error,
        fetchBookings,
        fetchStats,
        updateBookingStatus,
        confirmBooking,
        completeBooking,
        cancelBooking,
        getBooking,
        refresh,
    };
}
