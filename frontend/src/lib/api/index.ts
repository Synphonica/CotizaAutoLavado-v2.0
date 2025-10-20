// ============================================
// API INDEX - Exportaciones centralizadas
// ============================================

// Exportar cliente
export * from './client';

// Importar APIs
import { servicesApi } from './services';
import { providersApi } from './providers';
import { searchApi } from './search';
import { reviewsApi } from './reviews';
import { favoritesApi } from './favorites';
import { comparisonApi } from './comparison';
import { usersApi } from './users';

// Re-exportar APIs individualmente
export { servicesApi } from './services';
export { providersApi } from './providers';
export { searchApi } from './search';
export { reviewsApi } from './reviews';
export { favoritesApi } from './favorites';
export { comparisonApi } from './comparison';
export { usersApi } from './users';

/**
 * API centralizada - todas las APIs en un solo objeto
 */
export const api = {
    services: servicesApi,
    providers: providersApi,
    search: searchApi,
    reviews: reviewsApi,
    favorites: favoritesApi,
    comparison: comparisonApi,
    users: usersApi,
};

// Export default para uso directo
export default api;
