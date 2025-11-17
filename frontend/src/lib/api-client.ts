/**
 * Cliente API mejorado con manejo de errores, retry logic y tipos
 */

import { auth } from '@clerk/nextjs/server';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";

/**
 * Error personalizado para errores de API
 */
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public details?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Opciones para requests con configuración adicional
 */
interface ApiOptions extends RequestInit {
    token?: string | null;
    retry?: number; // Número de reintentos
    retryDelay?: number; // Delay entre reintentos (ms)
}

/**
 * Obtiene el token de autenticación de Clerk
 */
async function getClerkToken(): Promise<string | null> {
    try {
        // En el servidor, usamos auth() de @clerk/nextjs/server
        if (typeof window === 'undefined') {
            const { getToken } = await auth();
            return await getToken();
        }
        // En el cliente, retornamos null (el token se debe pasar desde el componente)
        return null;
    } catch (error) {
        console.error('Error obteniendo token de Clerk:', error);
        return null;
    }
}

/**
 * Espera un tiempo determinado (para retry logic)
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Función base para hacer requests con autenticación
 */
async function apiRequest<T>(
    path: string,
    init: RequestInit = {},
    customToken?: string | null,
    retries: number = 0,
    retryDelay: number = 1000
): Promise<T> {
    const token = customToken ?? await getClerkToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Agregar headers personalizados
    if (init?.headers) {
        const customHeaders = new Headers(init.headers);
        customHeaders.forEach((value, key) => {
            headers[key] = value;
        });
    }

    // Agregar token de autenticación
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(`${API_BASE}${path}`, {
            ...init,
            headers,
            cache: init.cache || 'no-store',
        });

        // Manejo de respuestas
        if (!res.ok) {
            let errorMessage = `Request failed with status ${res.status}`;
            let errorDetails;

            try {
                const errorData = await res.json();
                errorMessage = errorData.message || errorMessage;
                errorDetails = errorData;
            } catch {
                // Si no es JSON, intentar leer como texto
                const textError = await res.text().catch(() => '');
                if (textError) errorMessage = textError;
            }

            // Retry en errores 5xx (errores del servidor)
            if (res.status >= 500 && retries > 0) {
                console.warn(`Request failed with ${res.status}, retrying in ${retryDelay}ms... (${retries} retries left)`);
                await delay(retryDelay);
                return apiRequest<T>(path, init, customToken, retries - 1, retryDelay * 2);
            }

            throw new ApiError(res.status, errorMessage, errorDetails);
        }

        // Manejo de respuestas vacías (204 No Content)
        if (res.status === 204) {
            return null as T;
        }

        // Parsear JSON
        return await res.json();
    } catch (error) {
        // Re-lanzar ApiError sin modificar
        if (error instanceof ApiError) {
            throw error;
        }

        // Errores de red o fetch
        if (error instanceof TypeError && error.message.includes('fetch')) {
            // Retry en errores de red
            if (retries > 0) {
                console.warn(`Network error, retrying in ${retryDelay}ms... (${retries} retries left)`);
                await delay(retryDelay);
                return apiRequest<T>(path, init, customToken, retries - 1, retryDelay * 2);
            }
            throw new ApiError(0, 'Network error: Unable to connect to server', error);
        }

        // Otros errores
        throw new ApiError(0, error instanceof Error ? error.message : 'Unknown error', error);
    }
}

/**
 * GET request con autenticación
 */
export async function apiGet<T>(path: string, options?: ApiOptions): Promise<T> {
    const { token, retry = 0, retryDelay = 1000, ...init } = options || {};
    return apiRequest<T>(path, { ...init, method: 'GET' }, token, retry, retryDelay);
}

/**
 * POST request con autenticación
 */
export async function apiPost<T>(path: string, data?: any, options?: ApiOptions): Promise<T> {
    const { token, retry = 0, retryDelay = 1000, ...init } = options || {};
    return apiRequest<T>(path, {
        ...init,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    }, token, retry, retryDelay);
}

/**
 * PUT request con autenticación
 */
export async function apiPut<T>(path: string, data?: any, options?: ApiOptions): Promise<T> {
    const { token, retry = 0, retryDelay = 1000, ...init } = options || {};
    return apiRequest<T>(path, {
        ...init,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    }, token, retry, retryDelay);
}

/**
 * PATCH request con autenticación
 */
export async function apiPatch<T>(path: string, data?: any, options?: ApiOptions): Promise<T> {
    const { token, retry = 0, retryDelay = 1000, ...init } = options || {};
    return apiRequest<T>(path, {
        ...init,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
    }, token, retry, retryDelay);
}

/**
 * DELETE request con autenticación
 */
export async function apiDelete<T>(path: string, options?: ApiOptions): Promise<T> {
    const { token, retry = 0, retryDelay = 1000, ...init } = options || {};
    return apiRequest<T>(path, { ...init, method: 'DELETE' }, token, retry, retryDelay);
}

/**
 * Helper para verificar si un error es ApiError
 */
export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

/**
 * Helper para manejar errores de API de forma consistente
 */
export function handleApiError(error: unknown): string {
    if (isApiError(error)) {
        switch (error.statusCode) {
            case 400:
                return error.message || 'Solicitud inválida';
            case 401:
                return 'No autorizado. Por favor, inicia sesión';
            case 403:
                return 'No tienes permisos para realizar esta acción';
            case 404:
                return 'Recurso no encontrado';
            case 409:
                return error.message || 'Conflicto con el estado actual';
            case 422:
                return error.message || 'Datos inválidos';
            case 429:
                return 'Demasiadas solicitudes. Por favor, espera un momento';
            case 500:
            case 502:
            case 503:
                return 'Error del servidor. Por favor, intenta más tarde';
            default:
                return error.message || 'Ha ocurrido un error inesperado';
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'Ha ocurrido un error inesperado';
}
