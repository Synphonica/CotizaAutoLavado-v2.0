/**
 * Hook para obtener y gestionar historial de precios
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PriceHistoryData {
    id: string;
    serviceId: string;
    price: number;
    oldPrice: number | null;
    changeType: 'increase' | 'decrease' | 'no_change';
    recordedAt: string;
}

interface UsePriceHistoryReturn {
    history: PriceHistoryData[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    stats: {
        current: number;
        min: number;
        max: number;
        avg: number;
        change: number;
        changePercent: number;
    };
}

export function usePriceHistory(serviceId: string): UsePriceHistoryReturn {
    const [history, setHistory] = useState<PriceHistoryData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    const fetchHistory = useCallback(async () => {
        if (!serviceId) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/price-alerts/service/${serviceId}/history`
            );

            if (!response.ok) {
                throw new Error('Error al cargar historial de precios');
            }

            const data: PriceHistoryData[] = await response.json();
            setHistory(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [serviceId, toast]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Calcular estadísticas
    const stats = {
        current: history.length > 0 ? Number(history[0].price) : 0,
        min: history.length > 0 ? Math.min(...history.map((h) => Number(h.price))) : 0,
        max: history.length > 0 ? Math.max(...history.map((h) => Number(h.price))) : 0,
        avg:
            history.length > 0
                ? history.reduce((sum, h) => sum + Number(h.price), 0) / history.length
                : 0,
        change:
            history.length > 1
                ? Number(history[0].price) - Number(history[history.length - 1].price)
                : 0,
        changePercent:
            history.length > 1 && Number(history[history.length - 1].price) > 0
                ? ((Number(history[0].price) - Number(history[history.length - 1].price)) /
                    Number(history[history.length - 1].price)) *
                100
                : 0,
    };

    return {
        history,
        isLoading,
        error,
        refetch: fetchHistory,
        stats,
    };
}
