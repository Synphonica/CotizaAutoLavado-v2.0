export interface Location {
    latitude: number;
    longitude: number;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: Location;
}

export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Provider {
    id: string;
    name: string;
    description: string;
    email: string;
    phone: string;
    address: Address;
    logo?: string;
    images: string[];
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    operatingHours: OperatingHours[];
    services: Service[];
    createdAt: string;
    updatedAt: string;
}

export interface Service {
    id: string;
    providerId: string;
    name: string;
    description: string;
    category: string;
    subcategory?: string;
    price: number;
    duration: number; // en minutos
    images: string[];
    isActive: boolean;
    features: string[];
    createdAt: string;
    updatedAt: string;
}

export interface OperatingHours {
    dayOfWeek: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    openTime: string; // formato "HH:mm"
    closeTime: string; // formato "HH:mm"
    isOpen: boolean;
}

export interface Review {
    id: string;
    userId: string;
    providerId: string;
    rating: number;
    comment: string;
    images?: string[];
    response?: string;
    createdAt: string;
    user: {
        name: string;
        avatar?: string;
    };
}

export interface SearchFilters {
    category?: string;
    subcategory?: string;
    minPrice?: number;
    maxPrice?: number;
    radius?: number; // en km
    rating?: number;
    sortBy?: 'distance' | 'price' | 'rating' | 'newest';
    sortOrder?: 'asc' | 'desc';
}

export interface SearchRequest {
    query?: string;
    location: Location;
    filters?: SearchFilters;
    page?: number;
    limit?: number;
}

export interface SearchResponse {
    providers: Provider[];
    services: Service[];
    total: number;
    page: number;
    totalPages: number;
}

export interface AuthRequest {
    email: string;
    password: string;
    name?: string;
}

export interface AuthResponse {
    user: User;
    access_token: string;
    refresh_token: string;
}

export interface APIResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

export interface APIError {
    message: string;
    statusCode: number;
    error?: string;
}