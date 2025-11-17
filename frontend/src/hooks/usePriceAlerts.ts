'use client';

import { useState, useEffect } from 'react';
import {
    getPriceAlerts,
    createPriceAlert,
    updatePriceAlert,
    deletePriceAlert,
    getPriceHistory
} from '@/lib/price-alerts';
import type {
    PriceAlert,
    CreatePriceAlertData,
    UpdatePriceAlertData,
    PriceHistoryEntry
} from '@/types/price-alerts';

/**
 * Hook para obtener todas las alertas del usuario
 */
export function usePriceAlerts() {
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPriceAlerts();
            setAlerts(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar las alertas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    return { alerts, loading, error, refetch: fetchAlerts };
}

/**
 * Hook para gestionar alertas (CRUD operations)
 */
export function usePriceAlertActions() {
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = async (data: CreatePriceAlertData): Promise<PriceAlert | null> => {
        try {
            setCreating(true);
            setError(null);
            const alert = await createPriceAlert(data);
            return alert;
        } catch (err: any) {
            setError(err.message || 'Error al crear la alerta');
            return null;
        } finally {
            setCreating(false);
        }
    };

    const update = async (
        id: string,
        data: UpdatePriceAlertData
    ): Promise<PriceAlert | null> => {
        try {
            setUpdating(true);
            setError(null);
            const alert = await updatePriceAlert(id, data);
            return alert;
        } catch (err: any) {
            setError(err.message || 'Error al actualizar la alerta');
            return null;
        } finally {
            setUpdating(false);
        }
    };

    const remove = async (id: string): Promise<boolean> => {
        try {
            setDeleting(true);
            setError(null);
            await deletePriceAlert(id);
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al eliminar la alerta');
            return false;
        } finally {
            setDeleting(false);
        }
    };

    return {
        create,
        update,
        remove,
        creating,
        updating,
        deleting,
        error,
    };
}

/**
 * Hook para obtener el historial de precios de un servicio
 */
export function usePriceHistory(serviceId: string | null) {
    const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!serviceId) return;

        const fetchHistory = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getPriceHistory(serviceId);
                setHistory(data);
            } catch (err: any) {
                setError(err.message || 'Error al cargar el historial');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [serviceId]);

    return { history, loading, error };
}
