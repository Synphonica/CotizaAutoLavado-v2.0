'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";

export interface ApiFetchOptions extends RequestInit {
    data?: any;
    retries?: number;
    retryDelay?: number;
}

// Clase personalizada para errores de API
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public data?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Función helper para esperar
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Hook para hacer requests autenticados a la API usando Clerk
 * Solo funciona en componentes del cliente (use client)
 */
export function useApi() {
    const { getToken } = useAuth();

    const apiFetch = useCallback(
        async <T = any>(
            path: string,
            options?: ApiFetchOptions
        ): Promise<T> => {
            const {
                data,
                retries = 3,
                retryDelay = 1000,
                ...fetchOptions
            } = options || {};

            let lastError: Error | null = null;

            // Intentar hacer la request con reintentos
            for (let attempt = 0; attempt <= retries; attempt++) {
                try {
                    // Obtener token de Clerk
                    const token = await getToken();

                    const headers: Record<string, string> = {
                        'Content-Type': 'application/json',
                    };

                    // Agregar headers personalizados
                    if (fetchOptions.headers) {
                        const customHeaders = new Headers(fetchOptions.headers);
                        customHeaders.forEach((value, key) => {
                            headers[key] = value;
                        });
                    }

                    // Agregar token de autenticación
                    if (token) {
                        headers['Authorization'] = `Bearer ${token}`;
                    }

                    const res = await fetch(`${API_BASE}${path}`, {
                        ...fetchOptions,
                        headers,
                        body: data ? JSON.stringify(data) : fetchOptions.body,
                    });

                    // Manejar diferentes códigos de estado
                    if (!res.ok) {
                        let errorData: any;
                        const contentType = res.headers.get('content-type');

                        try {
                            if (contentType?.includes('application/json')) {
                                errorData = await res.json();
                            } else {
                                errorData = { message: await res.text() };
                            }
                        } catch {
                            errorData = { message: `Request failed: ${res.status}` };
                        }

                        const apiError = new ApiError(
                            res.status,
                            errorData.message || `Request failed: ${res.status}`,
                            errorData
                        );

                        // Reintentar en casos específicos
                        if (res.status === 429 || res.status === 503 || res.status >= 500) {
                            if (attempt < retries) {
                                // Calcular delay exponencial
                                const delay = retryDelay * Math.pow(2, attempt);
                                console.warn(
                                    `Request failed with ${res.status}, retrying in ${delay}ms... (attempt ${attempt + 1}/${retries})`
                                );
                                await sleep(delay);
                                continue;
                            }
                        }

                        throw apiError;
                    }

                    // Success - parsear respuesta
                    const contentType = res.headers.get('content-type');
                    if (contentType?.includes('application/json')) {
                        return res.json();
                    }

                    return res.text() as any;

                } catch (error) {
                    lastError = error as Error;

                    // Si no es un ApiError o si ya no hay más reintentos, lanzar el error
                    if (!(error instanceof ApiError) || attempt >= retries) {
                        throw error;
                    }
                }
            }

            // Si llegamos aquí, todos los reintentos fallaron
            throw lastError || new Error('Request failed after all retries');
        },
        [getToken]
    );

    const get = useCallback(
        <T = any>(path: string, options?: Omit<ApiFetchOptions, 'method' | 'data'>): Promise<T> => {
            return apiFetch<T>(path, { ...options, method: 'GET' });
        },
        [apiFetch]
    );

    const post = useCallback(
        <T = any>(path: string, data?: any, options?: Omit<ApiFetchOptions, 'method' | 'data'>): Promise<T> => {
            return apiFetch<T>(path, { ...options, method: 'POST', data });
        },
        [apiFetch]
    );

    const put = useCallback(
        <T = any>(path: string, data?: any, options?: Omit<ApiFetchOptions, 'method' | 'data'>): Promise<T> => {
            return apiFetch<T>(path, { ...options, method: 'PUT', data });
        },
        [apiFetch]
    );

    const patch = useCallback(
        <T = any>(path: string, data?: any, options?: Omit<ApiFetchOptions, 'method' | 'data'>): Promise<T> => {
            return apiFetch<T>(path, { ...options, method: 'PATCH', data });
        },
        [apiFetch]
    );

    const del = useCallback(
        <T = any>(path: string, options?: Omit<ApiFetchOptions, 'method' | 'data'>): Promise<T> => {
            return apiFetch<T>(path, { ...options, method: 'DELETE' });
        },
        [apiFetch]
    );

    return {
        apiFetch,
        get,
        post,
        put,
        patch,
        delete: del,
    };
}
