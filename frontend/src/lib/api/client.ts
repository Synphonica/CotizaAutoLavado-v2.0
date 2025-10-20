// ============================================
// API CLIENT - Cliente HTTP centralizado
// ============================================

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { ApiError } from '@/types/api.types';

/**
 * Configuración base del cliente API
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';
const API_TIMEOUT = 30000; // 30 segundos

/**
 * Clase para manejar errores de API
 */
export class ApiClientError extends Error {
    public statusCode: number;
    public apiError?: ApiError;

    constructor(message: string, statusCode: number, apiError?: ApiError) {
        super(message);
        this.name = 'ApiClientError';
        this.statusCode = statusCode;
        this.apiError = apiError;
    }
}

/**
 * Cliente API singleton
 */
class ApiClient {
    private instance: AxiosInstance;
    private tokenProvider?: () => Promise<string | null>;

    constructor() {
        this.instance = axios.create({
            baseURL: API_BASE_URL,
            timeout: API_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    /**
     * Configurar proveedor de token (Clerk)
     */
    setTokenProvider(provider: () => Promise<string | null>) {
        this.tokenProvider = provider;
    }

    /**
     * Configurar interceptores de request y response
     */
    private setupInterceptors() {
        // Request interceptor
        this.instance.interceptors.request.use(
            async (config) => {
                // Agregar token si existe
                if (this.tokenProvider) {
                    const token = await this.tokenProvider();
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }

                // Log en desarrollo
                if (process.env.NODE_ENV === 'development') {
                    console.log('🚀 API Request:', {
                        method: config.method?.toUpperCase(),
                        url: config.url,
                        params: config.params,
                        data: config.data,
                    });
                }

                return config;
            },
            (error) => {
                console.error('❌ Request Error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.instance.interceptors.response.use(
            (response) => {
                // Log en desarrollo
                if (process.env.NODE_ENV === 'development') {
                    console.log('✅ API Response:', {
                        status: response.status,
                        url: response.config.url,
                        data: response.data,
                    });
                }

                return response;
            },
            (error: AxiosError<ApiError>) => {
                // Manejar errores
                const statusCode = error.response?.status || 500;
                const apiError = error.response?.data;
                const message = apiError?.message || error.message || 'Error desconocido';

                console.error('❌ API Error:', {
                    status: statusCode,
                    message,
                    url: error.config?.url,
                    error: apiError,
                });

                // Lanzar error personalizado
                throw new ApiClientError(message, statusCode, apiError);
            }
        );
    }

    /**
     * GET request
     */
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.get<T>(url, config);
        return response.data;
    }

    /**
     * POST request
     */
    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.post<T>(url, data, config);
        return response.data;
    }

    /**
     * PUT request
     */
    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.put<T>(url, data, config);
        return response.data;
    }

    /**
     * PATCH request
     */
    async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.patch<T>(url, data, config);
        return response.data;
    }

    /**
     * DELETE request
     */
    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.delete<T>(url, config);
        return response.data;
    }

    /**
     * Upload file (multipart/form-data)
     */
    async upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.post<T>(url, formData, {
            ...config,
            headers: {
                ...config?.headers,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
}

// Exportar instancia singleton
export const apiClient = new ApiClient();

// Helper para inicializar el token provider (llamar en layout o provider)
export const initializeApiClient = (tokenProvider: () => Promise<string | null>) => {
    apiClient.setTokenProvider(tokenProvider);
};
