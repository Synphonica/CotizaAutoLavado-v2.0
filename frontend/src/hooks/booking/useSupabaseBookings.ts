'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/supabase-client';
import type { Booking } from '@/types/booking';

interface UseSupabaseBookingsOptions {
    autoFetch?: boolean;
    filters?: {
        status?: string;
        startDate?: string;
        endDate?: string;
    };
}

export function useSupabaseBookings(options: UseSupabaseBookingsOptions = {}) {
    const { autoFetch = true, filters = {} } = options;
    const { isSignedIn, userId } = useAuth();
    const supabase = useSupabaseClient();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = useCallback(async () => {
        if (!isSignedIn || !userId) {
            setBookings([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('bookings')
                .select(`
                    *,
                    service:services(name, price, duration),
                    provider:providers(businessName, address, phone)
                `)
                .order('startTime', { ascending: false });

            // Apply filters
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            if (filters.startDate) {
                query = query.gte('startTime', filters.startDate);
            }
            if (filters.endDate) {
                query = query.lte('startTime', filters.endDate);
            }

            const { data, error: supabaseError } = await query;

            if (supabaseError) {
                throw new Error(supabaseError.message);
            }

            setBookings(data || []);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar reservas';
            setError(errorMessage);
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    }, [isSignedIn, userId, supabase, filters]);

    const cancelBooking = useCallback(async (bookingId: string, reason?: string) => {
        if (!isSignedIn) return;

        try {
            setLoading(true);
            setError(null);

            const { error: supabaseError } = await supabase
                .from('bookings')
                .update({
                    status: 'CANCELLED',
                    cancellationReason: reason,
                    updatedAt: new Date().toISOString(),
                })
                .eq('id', bookingId);

            if (supabaseError) {
                throw new Error(supabaseError.message);
            }

            // Refresh bookings
            await fetchBookings();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cancelar reserva';
            setError(errorMessage);
            console.error('Error cancelling booking:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [isSignedIn, supabase, fetchBookings]);

    const getUpcomingBookings = useCallback(() => {
        const now = new Date().toISOString();
        return bookings.filter(
            (booking) =>
                booking.startTime >= now &&
                booking.status !== 'CANCELLED' &&
                booking.status !== 'COMPLETED'
        );
    }, [bookings]);

    const getPastBookings = useCallback(() => {
        const now = new Date().toISOString();
        return bookings.filter(
            (booking) =>
                booking.startTime < now ||
                booking.status === 'COMPLETED'
        );
    }, [bookings]);

    const getCancelledBookings = useCallback(() => {
        return bookings.filter((booking) => booking.status === 'CANCELLED');
    }, [bookings]);

    useEffect(() => {
        if (autoFetch && isSignedIn) {
            fetchBookings();
        }
    }, [autoFetch, isSignedIn, fetchBookings]);

    return {
        bookings,
        loading,
        error,
        fetchBookings,
        cancelBooking,
        getUpcomingBookings,
        getPastBookings,
        getCancelledBookings,
    };
}
