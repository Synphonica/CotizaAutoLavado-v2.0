import { apiGet, apiPost, apiPut, apiDelete } from './api';

// Tipos para la API
export interface Service {
    id: string;
    name: string;
    description?: string;
    price: number;
    duration?: number;
    category?: string;
    provider: Provider;
    rating?: number;
    reviewCount?: number;
    discount?: number;
    images?: string[];
    available?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Provider {
    id: string;
    businessName: string;
    description?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
    images?: string[];
    rating?: number;
    reviewCount?: number;
    verified?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Review {
    id: string;
    rating: number;
    comment?: string;
    userId: string;
    serviceId: string;
    providerResponse?: string;
    createdAt: string;
    updatedAt: string;
    user: {
        firstName?: string;
        lastName?: string;
    };
}

export interface SearchFilters {
    query?: string;
    city?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    available?: boolean;
    lat?: number;
    lng?: number;
    radius?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Servicios API
export class ServicesAPI {
    // Buscar servicios
    static async searchServices(filters: SearchFilters = {}, page = 1, limit = 20): Promise<PaginatedResponse<Service>> {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        params.append('page', page.toString());
        params.append('limit', limit.toString());

        return await apiGet(`/services/search?${params.toString()}`);
    }

    // Obtener servicio por ID
    static async getService(id: string): Promise<Service> {
        return await apiGet(`/services/${id}`);
    }

    // Obtener servicios por proveedor
    static async getServicesByProvider(providerId: string): Promise<Service[]> {
        return await apiGet(`/services/provider/${providerId}`);
    }

    // Obtener categorías
    static async getCategories(): Promise<string[]> {
        return await apiGet('/services/categories');
    }
}

export class ProvidersAPI {
    // Obtener proveedor por ID
    static async getProvider(id: string): Promise<Provider> {
        return await apiGet(`/providers/${id}`);
    }

    // Buscar proveedores
    static async searchProviders(query?: string, city?: string): Promise<Provider[]> {
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (city) params.append('city', city);

        return await apiGet(`/providers/search?${params.toString()}`);
    }

    // Obtener proveedores destacados
    static async getFeaturedProviders(): Promise<Provider[]> {
        return await apiGet('/providers/featured');
    }
}

export class ReviewsAPI {
    // Obtener reseñas de un servicio
    static async getServiceReviews(serviceId: string, page = 1, limit = 10): Promise<PaginatedResponse<Review>> {
        return await apiGet(`/reviews/service/${serviceId}?page=${page}&limit=${limit}`);
    }

    // Obtener reseñas de un proveedor
    static async getProviderReviews(providerId: string, page = 1, limit = 10): Promise<PaginatedResponse<Review>> {
        return await apiGet(`/reviews/provider/${providerId}?page=${page}&limit=${limit}`);
    }

    // Crear reseña
    static async createReview(data: { serviceId: string; rating: number; comment?: string }): Promise<Review> {
        return await apiPost('/reviews', data);
    }

    // Obtener mis reseñas
    static async getMyReviews(): Promise<Review[]> {
        return await apiGet('/reviews/my');
    }
}

export class FavoritesAPI {
    // Obtener mis favoritos
    static async getFavorites(): Promise<Service[]> {
        return await apiGet('/favorites/my');
    }

    // Agregar a favoritos
    static async addFavorite(serviceId: string): Promise<void> {
        await apiPost('/favorites', { serviceId });
    }

    // Quitar de favoritos
    static async removeFavorite(serviceId: string): Promise<void> {
        await apiDelete(`/favorites/${serviceId}`);
    }

    // Verificar si es favorito
    static async isFavorite(serviceId: string): Promise<boolean> {
        try {
            await apiGet(`/favorites/${serviceId}`);
            return true;
        } catch {
            return false;
        }
    }
}

export class SearchAPI {
    // Guardar búsqueda
    static async saveSearch(filters: SearchFilters): Promise<void> {
        await apiPost('/search/save', filters);
    }

    // Obtener historial de búsquedas
    static async getSearchHistory(): Promise<SearchFilters[]> {
        return await apiGet('/search/history');
    }

    // Obtener búsquedas populares
    static async getPopularSearches(): Promise<string[]> {
        return await apiGet('/search/popular');
    }
}

// Utilidades
export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(price);
};

export const formatRating = (rating: number): string => {
    return rating.toFixed(1);
};

export const calculateDiscountedPrice = (price: number, discount?: number): number => {
    if (!discount) return price;
    return price - (price * discount / 100);
};

export const getImageUrl = (imagePath?: string, bucket = 'alto-carwash-images'): string => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;

    // URL de Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${imagePath}`;
};