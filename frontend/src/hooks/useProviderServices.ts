'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';

export interface Service {
    id: string;
    providerId: string;
    name: string;
    description?: string;
    type: string;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL';
    price: number;
    duration: number;
    currency: string;
    category?: string;
    tags: string[];
    isAvailable: boolean;
    isFeatured: boolean;
    discount?: number;
    displayOrder: number;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateServiceDto {
    providerId: string;
    name: string;
    description?: string;
    type: string;
    price: number;
    duration: number;
    category?: string;
    tags?: string[];
    isAvailable?: boolean;
    isFeatured?: boolean;
    discount?: number;
    displayOrder?: number;
}

export interface UpdateServiceDto {
    name?: string;
    description?: string;
    type?: string;
    price?: number;
    duration?: number;
    category?: string;
    tags?: string[];
    isAvailable?: boolean;
    isFeatured?: boolean;
    discount?: number;
    displayOrder?: number;
}

/**
 * Hook para gestionar los servicios de un proveedor
 */
export function useProviderServices(providerId?: string) {
    const api = useApi();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Obtener todos los servicios del proveedor
     */
    const fetchServices = useCallback(async () => {
        if (!providerId) {
            setServices([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await api.get<{ services: Service[] }>(
                `/services?providerId=${providerId}&limit=100`
            );
            setServices(data.services || []);
        } catch (err: any) {
            console.error('Error fetching services:', err);
            setError(err.message || 'Error al obtener los servicios');
        } finally {
            setLoading(false);
        }
    }, [api, providerId]);

    /**
     * Crear un nuevo servicio
     */
    const createService = useCallback(async (data: CreateServiceDto): Promise<Service> => {
        try {
            setLoading(true);
            setError(null);
            const newService = await api.post<Service>('/services', data);
            setServices(prev => [...prev, newService]);
            return newService;
        } catch (err: any) {
            console.error('Error creating service:', err);
            setError(err.message || 'Error al crear el servicio');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api]);

    /**
     * Actualizar un servicio
     */
    const updateService = useCallback(async (serviceId: string, data: UpdateServiceDto): Promise<Service> => {
        try {
            setLoading(true);
            setError(null);
            const updatedService = await api.patch<Service>(`/services/${serviceId}`, data);
            setServices(prev => prev.map(s => s.id === serviceId ? updatedService : s));
            return updatedService;
        } catch (err: any) {
            console.error('Error updating service:', err);
            setError(err.message || 'Error al actualizar el servicio');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api]);

    /**
     * Eliminar un servicio
     */
    const deleteService = useCallback(async (serviceId: string): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            await api.delete(`/services/${serviceId}`);
            setServices(prev => prev.filter(s => s.id !== serviceId));
        } catch (err: any) {
            console.error('Error deleting service:', err);
            setError(err.message || 'Error al eliminar el servicio');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [api]);

    /**
     * Cambiar el estado de un servicio
     */
    const toggleServiceStatus = useCallback(async (serviceId: string): Promise<Service> => {
        const service = services.find(s => s.id === serviceId);
        if (!service) throw new Error('Servicio no encontrado');

        const newStatus = service.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return updateService(serviceId, { isAvailable: newStatus === 'ACTIVE' });
    }, [services, updateService]);

    /**
     * Refrescar los servicios
     */
    const refresh = useCallback(() => {
        return fetchServices();
    }, [fetchServices]);

    // Cargar servicios cuando cambie el providerId
    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    return {
        services,
        loading,
        error,
        createService,
        updateService,
        deleteService,
        toggleServiceStatus,
        refresh,
    };
}
