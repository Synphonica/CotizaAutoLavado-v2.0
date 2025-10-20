// Para desarrollo móvil, necesitas usar la IP local de tu máquina
// Tu IPv4 actual: 192.168.100.8
// Si cambias de red WiFi, actualiza esta IP ejecutando 'ipconfig' en CMD
export const DEFAULT_API_BASE_URL = __DEV__
    ? 'http://192.168.100.8:4000/api'  // IP local para dispositivo físico
    : 'https://api.altocarwash.com/api';

// Esta será reemplazada dinámicamente por el valor almacenado
export let API_BASE_URL = DEFAULT_API_BASE_URL;

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        PROFILE: '/auth/profile',
        REFRESH: '/auth/refresh',
    },
    SERVICES: {
        SEARCH: '/services/search',
        CATEGORIES: '/services/categories',
        DETAILS: '/services',
    },
    PROVIDERS: {
        SEARCH: '/providers/search',
        NEARBY: '/providers/nearby',
        DETAILS: '/providers',
    },
    REVIEWS: {
        BY_PROVIDER: '/reviews/provider',
        CREATE: '/reviews',
    },
    FAVORITES: {
        GET: '/favorites',
        ADD: '/favorites',
        REMOVE: '/favorites',
    },
};

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_PROFILE: 'user_profile',
    SEARCH_HISTORY: 'search_history',
    FAVORITE_PROVIDERS: 'favorite_providers',
};