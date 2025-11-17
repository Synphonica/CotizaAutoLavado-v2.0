import { apiGet, apiPost, apiPut, apiDelete } from './api';
import type {
    PriceAlert,
    CreatePriceAlertData,
    UpdatePriceAlertData,
    PriceHistoryEntry
} from '@/types/price-alerts';

const PRICE_ALERTS_ENDPOINT = '/price-alerts';

/**
 * Obtener todas las alertas del usuario autenticado
 */
export async function getPriceAlerts(): Promise<PriceAlert[]> {
    return apiGet<PriceAlert[]>(PRICE_ALERTS_ENDPOINT);
}

/**
 * Obtener una alerta específica
 */
export async function getPriceAlert(id: string): Promise<PriceAlert> {
    return apiGet<PriceAlert>(`${PRICE_ALERTS_ENDPOINT}/${id}`);
}

/**
 * Crear una nueva alerta de precio
 */
export async function createPriceAlert(data: CreatePriceAlertData): Promise<PriceAlert> {
    return apiPost<PriceAlert>(PRICE_ALERTS_ENDPOINT, data);
}

/**
 * Actualizar una alerta existente
 */
export async function updatePriceAlert(
    id: string,
    data: UpdatePriceAlertData
): Promise<PriceAlert> {
    return apiPut<PriceAlert>(`${PRICE_ALERTS_ENDPOINT}/${id}`, data);
}

/**
 * Eliminar una alerta
 */
export async function deletePriceAlert(id: string): Promise<{ message: string }> {
    return apiDelete<{ message: string }>(`${PRICE_ALERTS_ENDPOINT}/${id}`);
}

/**
 * Obtener el historial de precios de un servicio
 */
export async function getPriceHistory(serviceId: string): Promise<PriceHistoryEntry[]> {
    return apiGet<PriceHistoryEntry[]>(
        `${PRICE_ALERTS_ENDPOINT}/service/${serviceId}/history`
    );
}
