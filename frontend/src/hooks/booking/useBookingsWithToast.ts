'use client';

import { useState, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/useToast';
import {
    Booking,
    CreateBookingData,
    BookingFilters,
    RescheduleData,
    AvailabilityResponse,
    BookingStats,
} from '@/types/booking';

export function useBookings(initialFilters?: BookingFilters) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const api = useApi();
    const { showToast } = useToast();

    const fetchBookings = useCallback(async (filters?: BookingFilters) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (filters?.userId) params.append('userId', filters.userId);
            if (filters?.providerId) params.append('providerId', filters.providerId);
            if (filters?.serviceId) params.append('serviceId', filters.serviceId);
            if (filters?.status) params.append('status', filters.status);
            if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
            if (filters?.startDate) params.append('startDate', filters.startDate);
            if (filters?.endDate) params.append('endDate', filters.endDate);

            const data = await api.get<Booking[]>(`/bookings?${params.toString()}`);
            setBookings(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            showToast({
                type: 'error',
                message: 'Error al cargar reservas',
                description: errorMessage,
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api, showToast]);

    const createBooking = useCallback(async (bookingData: CreateBookingData): Promise<Booking> => {
        setLoading(true);
        setError(null);

        try {
            const newBooking = await api.post<Booking>('/bookings', { data: bookingData });
            setBookings((prev) => [newBooking, ...prev]);
            showToast({
                type: 'success',
                message: '¡Reserva creada!',
                description: 'Tu reserva ha sido confirmada exitosamente.',
            });
            return newBooking;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            showToast({
                type: 'error',
                message: 'Error al crear reserva',
                description: errorMessage,
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api, showToast]);

    const updateBooking = useCallback(async (id: string, updates: Partial<Booking>): Promise<Booking> => {
        setLoading(true);
        setError(null);

        try {
            const updatedBooking = await api.patch<Booking>(`/bookings/${id}`, { data: updates });
            setBookings((prev) =>
                prev.map((booking) => (booking.id === id ? updatedBooking : booking))
            );
            showToast({
                type: 'success',
                message: 'Reserva actualizada',
                description: 'Los cambios se han guardado correctamente.',
            });
            return updatedBooking;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            showToast({
                type: 'error',
                message: 'Error al actualizar reserva',
                description: errorMessage,
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api, showToast]);

    const cancelBooking = useCallback(async (id: string): Promise<Booking> => {
        setLoading(true);
        setError(null);

        try {
            const canceledBooking = await api.post<Booking>(`/bookings/${id}/cancel`);
            setBookings((prev) =>
                prev.map((booking) => (booking.id === id ? canceledBooking : booking))
            );
            showToast({
                type: 'success',
                message: 'Reserva cancelada',
                description: 'Tu reserva ha sido cancelada.',
            });
            return canceledBooking;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            showToast({
                type: 'error',
                message: 'Error al cancelar reserva',
                description: errorMessage,
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api, showToast]);

    const rescheduleBooking = useCallback(async (id: string, data: RescheduleData): Promise<Booking> => {
        setLoading(true);
        setError(null);

        try {
            const rescheduledBooking = await api.post<Booking>(`/bookings/${id}/reschedule`, { data });
            setBookings((prev) =>
                prev.map((booking) => (booking.id === id ? rescheduledBooking : booking))
            );
            showToast({
                type: 'success',
                message: 'Reserva reagendada',
                description: 'Tu reserva ha sido reagendada exitosamente.',
            });
            return rescheduledBooking;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            showToast({
                type: 'error',
                message: 'Error al reagendar reserva',
                description: errorMessage,
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api, showToast]);

    const deleteBooking = useCallback(async (id: string): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            await api.delete(`/bookings/${id}`);
            setBookings((prev) => prev.filter((booking) => booking.id !== id));
            showToast({
                type: 'success',
                message: 'Reserva eliminada',
                description: 'La reserva ha sido eliminada permanentemente.',
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            showToast({
                type: 'error',
                message: 'Error al eliminar reserva',
                description: errorMessage,
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api, showToast]);

    return {
        bookings,
        loading,
        error,
        fetchBookings,
        createBooking,
        updateBooking,
        cancelBooking,
        rescheduleBooking,
        deleteBooking,
    };
}

export function useAvailability() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const api = useApi();
    const { showToast } = useToast();

    const checkAvailability = useCallback(async (
        providerId: string,
        date: string,
        serviceId?: string
    ): Promise<AvailabilityResponse> => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({ date });
            if (serviceId) params.append('serviceId', serviceId);

            return await api.get<AvailabilityResponse>(
                `/bookings/availability/${providerId}?${params.toString()}`
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            showToast({
                type: 'error',
                message: 'Error al verificar disponibilidad',
                description: errorMessage,
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api, showToast]);

    return {
        checkAvailability,
        loading,
        error,
    };
}

export function useBookingStats(userId: string) {
    const [stats, setStats] = useState<BookingStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const api = useApi();
    const { showToast } = useToast();

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await api.get<BookingStats>(`/bookings/stats/${userId}`);
            setStats(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            showToast({
                type: 'error',
                message: 'Error al cargar estadísticas',
                description: errorMessage,
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId, api, showToast]);

    return {
        stats,
        fetchStats,
        loading,
        error,
    };
}
