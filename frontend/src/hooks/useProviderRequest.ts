import { useState, useCallback } from 'react';
import { useApi } from './useApi';

export interface ProviderRequest {
    id: string;
    userId: string;
    businessName: string;
    businessType: string;
    email: string;
    phone: string;
    address?: string;
    city: string;
    region: string;
    description?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
    requestedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    rejectionReason?: string;
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    reviewer?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}

export interface CreateProviderRequestDto {
    businessName: string;
    businessType: string;
    email: string;
    phone: string;
    address?: string;
    city: string;
    region: string;
    description?: string;
    reason?: string;
}

export function useProviderRequest() {
    const { get, post, patch } = useApi();
    const [request, setRequest] = useState<ProviderRequest | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Obtener mi solicitud más reciente
     */
    const fetchMyRequest = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await get<ProviderRequest>('/provider-requests/my-request');
            setRequest(data);
            return data;
        } catch (err: any) {
            const errorMessage = err?.message || 'Error al obtener la solicitud';
            setError(errorMessage);
            setRequest(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, [get]);

    /**
     * Crear una nueva solicitud para convertirse en proveedor
     */
    const createRequest = useCallback(
        async (data: CreateProviderRequestDto) => {
            setLoading(true);
            setError(null);
            try {
                const newRequest = await post<ProviderRequest>(
                    '/provider-requests',
                    data,
                );
                setRequest(newRequest);
                return newRequest;
            } catch (err: any) {
                const errorMessage =
                    err?.message || 'Error al crear la solicitud';
                setError(errorMessage);
                throw new Error(errorMessage);
            } finally {
                setLoading(false);
            }
        },
        [post],
    );

    /**
     * Cancelar mi solicitud
     */
    const cancelRequest = useCallback(
        async (requestId: string) => {
            setLoading(true);
            setError(null);
            try {
                await patch(`/provider-requests/${requestId}/cancel`, {});
                await fetchMyRequest();
            } catch (err: any) {
                const errorMessage =
                    err?.message || 'Error al cancelar la solicitud';
                setError(errorMessage);
                throw new Error(errorMessage);
            } finally {
                setLoading(false);
            }
        },
        [patch, fetchMyRequest],
    );

    /**
     * Verificar si el usuario tiene una solicitud pendiente
     */
    const hasPendingRequest = useCallback(() => {
        return request?.status === 'PENDING' || request?.status === 'UNDER_REVIEW';
    }, [request]);

    /**
     * Verificar si el usuario fue aprobado como proveedor
     */
    const wasApproved = useCallback(() => {
        return request?.status === 'APPROVED';
    }, [request]);

    /**
     * Verificar si el usuario fue rechazado
     */
    const wasRejected = useCallback(() => {
        return request?.status === 'REJECTED';
    }, [request]);

    /**
     * Obtener el color del estado
     */
    const getStatusColor = useCallback((status: ProviderRequest['status']) => {
        switch (status) {
            case 'PENDING':
                return 'yellow';
            case 'UNDER_REVIEW':
                return 'blue';
            case 'APPROVED':
                return 'green';
            case 'REJECTED':
                return 'red';
            default:
                return 'gray';
        }
    }, []);

    /**
     * Obtener el texto del estado
     */
    const getStatusText = useCallback((status: ProviderRequest['status']) => {
        switch (status) {
            case 'PENDING':
                return 'Pendiente';
            case 'UNDER_REVIEW':
                return 'En Revisión';
            case 'APPROVED':
                return 'Aprobada';
            case 'REJECTED':
                return 'Rechazada';
            default:
                return 'Desconocido';
        }
    }, []);

    /**
     * Refrescar la solicitud
     */
    const refresh = useCallback(async () => {
        return fetchMyRequest();
    }, [fetchMyRequest]);

    return {
        request,
        loading,
        error,
        fetchMyRequest,
        createRequest,
        cancelRequest,
        hasPendingRequest,
        wasApproved,
        wasRejected,
        getStatusColor,
        getStatusText,
        refresh,
    };
}
