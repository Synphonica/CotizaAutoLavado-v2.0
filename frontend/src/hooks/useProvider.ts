'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { useAuth } from '@clerk/nextjs';

export interface Provider {
    id: string;
    userId: string;
    businessName: string;
    businessType: string;
    description?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL' | 'VERIFIED';
    phone: string;
    email: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    address: string;
    latitude: number;
    longitude: number;
    city: string;
    region: string;
    postalCode?: string;
    operatingHours: Record<string, any>;
    acceptsBookings: boolean;
    minAdvanceBooking: number;
    maxAdvanceBooking: number;
    rating: number;
    totalReviews: number;
    totalBookings: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProviderDto {
    businessName: string;
    businessType: string;
    description?: string;
    phone: string;
    email: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    address: string;
    latitude: number;
    longitude: number;
    city: string;
    region: string;
    postalCode?: string;
    operatingHours: Record<string, any>;
    acceptsBookings?: boolean;
    minAdvanceBooking?: number;
    maxAdvanceBooking?: number;
}

export interface UpdateProviderDto {
    businessName?: string;
    businessType?: string;
    description?: string;
    phone?: string;
    email?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    city?: string;
    region?: string;
    postalCode?: string;
    operatingHours?: Record<string, any>;
    acceptsBookings?: boolean;
    minAdvanceBooking?: number;
    maxAdvanceBooking?: number;
}

/**
 * Hook para gestionar el proveedor del usuario autenticado
 */
export function useProvider() {
    const { isSignedIn } = useAuth();
    const api = useApi();
    const [provider, setProvider] = useState<Provider | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Obtener el proveedor del usuario autenticado
     */
    const fetchMyProvider = useCallback(async () => {
        if (!isSignedIn) {
            setProvider(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await api.get<Provider>('/providers/my-provider');
            setProvider(data);
        } catch (err: any) {
            console.error('Error fetching provider:', err);
            if (err.statusCode === 404) {
                // El usuario no tiene un proveedor registrado
                setProvider(null);
            } else {
                setError(err.message || 'Error al obtener el proveedor');
            }
        } finally {
            setLoading(false);
        }
    }, [api, isSignedIn]);

    /**
     * Crear un nuevo proveedor
     */
    const createProvider = useCallback(async (data: CreateProviderDto): Promise<Provider> => {
        try {
            setLoading(true);
            setError(null);
            const newProvider = await api.post<Provider>('/providers', data);
            setProvider(newProvider);
            return newProvider;
        } catch (err: any) {
            console.error('Error creating provider:', err);
            setError(err.message || 'Error al crear el proveedor');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api]);

    /**
     * Actualizar el proveedor
     */
    const updateProvider = useCallback(async (data: UpdateProviderDto): Promise<Provider> => {
        try {
            setLoading(true);
            setError(null);
            const updatedProvider = await api.patch<Provider>('/providers/my-provider', data);
            setProvider(updatedProvider);
            return updatedProvider;
        } catch (err: any) {
            console.error('Error updating provider:', err);
            setError(err.message || 'Error al actualizar el proveedor');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api]);

    /**
     * Refrescar los datos del proveedor
     */
    const refresh = useCallback(() => {
        return fetchMyProvider();
    }, [fetchMyProvider]);

    // Cargar el proveedor al montar el componente
    useEffect(() => {
        fetchMyProvider();
    }, [fetchMyProvider]);

    return {
        provider,
        loading,
        error,
        createProvider,
        updateProvider,
        refresh,
        hasProvider: !!provider,
    };
}
