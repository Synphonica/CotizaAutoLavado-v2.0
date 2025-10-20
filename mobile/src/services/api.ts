import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../constants/API';
import { APIError, APIResponse } from '../types';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor para agregar token de autenticación
api.interceptors.request.use(
    async (config) => {
        // Aquí podrías obtener el token del storage
        // const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor para manejo de errores
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        let apiError: APIError = {
            message: 'Error desconocido',
            statusCode: 500,
        };

        if (error.response) {
            // Error del servidor con respuesta
            const responseData = error.response.data as any;
            apiError = {
                message: responseData.message || 'Error del servidor',
                statusCode: error.response.status,
                error: responseData.error,
            };
        } else if (error.request) {
            // Error de red
            apiError = {
                message: 'Error de conexión. Verifica tu conexión a internet.',
                statusCode: 0,
            };
        } else {
            // Error de configuración
            apiError = {
                message: error.message,
                statusCode: 500,
            };
        }

        return Promise.reject(apiError);
    }
);

export default api;