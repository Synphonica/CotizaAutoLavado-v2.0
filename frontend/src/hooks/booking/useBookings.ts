'use client';

import { useState, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
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
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api]);

    const createBooking = useCallback(async (bookingData: CreateBookingData): Promise<Booking> => {
        setLoading(true);
        setError(null);

        try {
            const newBooking = await api.post<Booking>('/bookings', bookingData);
            setBookings((prev) => [...prev, newBooking]);
            return newBooking;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api]);

    const updateBooking = useCallback(async (id: string, updates: Partial<Booking>): Promise<Booking> => {
        setLoading(true);
        setError(null);

        try {
            const updatedBooking = await api.patch<Booking>(`/bookings/${id}`, updates);
            setBookings((prev) =>
                prev.map((booking) => (booking.id === id ? updatedBooking : booking))
            );
            return updatedBooking;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api]);

    const cancelBooking = useCallback(async (id: string, reason?: string): Promise<Booking> => {
        setLoading(true);
        setError(null);

        try {
            const cancelledBooking = await api.post<Booking>(`/bookings/${id}/cancel`, { reason });
            setBookings((prev) =>
                prev.map((booking) => (booking.id === id ? cancelledBooking : booking))
            );
            return cancelledBooking;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api]);

    const rescheduleBooking = useCallback(
        async (id: string, rescheduleData: RescheduleData): Promise<Booking> => {
            setLoading(true);
            setError(null);

            try {
                const rescheduledBooking = await api.post<Booking>(`/bookings/${id}/reschedule`, rescheduleData);
                setBookings((prev) =>
                    prev.map((booking) => (booking.id === id ? rescheduledBooking : booking))
                );
                return rescheduledBooking;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [api]
    );

    const deleteBooking = useCallback(async (id: string): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            await api.delete(`/bookings/${id}`);
            setBookings((prev) => prev.filter((booking) => booking.id !== id));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api]);

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

export function useBooking(id: string) {
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const api = useApi();

    const fetchBooking = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const data = await api.get<Booking>(`/bookings/${id}`);
            setBooking(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [id, api]);

    return {
        booking,
        loading,
        error,
        fetchBooking,
        refetch: fetchBooking,
    };
}

export function useAvailability() {
    const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const api = useApi();

    const checkAvailability = useCallback(
        async (providerId: string, date: string, serviceId?: string): Promise<AvailabilityResponse> => {
            setLoading(true);
            setError(null);

            try {
                const data = await api.post<AvailabilityResponse>('/bookings/check-availability', {
                    providerId,
                    date,
                    serviceId,
                });
                setAvailability(data);
                return data;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [api]
    );

    return {
        availability,
        loading,
        error,
        checkAvailability,
    };
}

export function useBookingStats(providerId: string) {
    const [stats, setStats] = useState<BookingStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const api = useApi();

    const fetchStats = useCallback(
        async (startDate?: string, endDate?: string) => {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                if (startDate) params.append('startDate', startDate);
                if (endDate) params.append('endDate', endDate);

                const data = await api.get<BookingStats>(
                    `/bookings/stats/${providerId}?${params.toString()}`
                );
                setStats(data);
                return data;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [providerId, api]
    );

    return {
        stats,
        loading,
        error,
        fetchStats,
    };
}
