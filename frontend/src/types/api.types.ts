// ============================================
// TIPOS PRINCIPALES - API TYPES
// ============================================

export interface ApiResponse<T> {
    data: T;
    message?: string;
    success?: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ============================================
// PROVIDER TYPES
// ============================================

export interface Provider {
    id: string;
    userId: string;
    businessName: string;
    email: string;
    phone: string;
    description?: string;
    address: string;
    city: string;
    region: string;
    postalCode?: string;
    latitude: number;
    longitude: number;
    coverageRadius: number;
    openingHours?: string;
    logoUrl?: string;
    imageUrls?: string[];
    averageRating: number;
    totalReviews: number;
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    services?: Service[];
    user?: User;
}

export interface CreateProviderDto {
    businessName: string;
    email: string;
    phone: string;
    description?: string;
    address: string;
    city: string;
    region: string;
    postalCode?: string;
    latitude: number;
    longitude: number;
    coverageRadius?: number;
    openingHours?: string;
    logoUrl?: string;
    imageUrls?: string[];
}

export interface UpdateProviderDto extends Partial<CreateProviderDto> {
    isActive?: boolean;
}

export interface QueryProvidersDto {
    page?: number;
    limit?: number;
    search?: string;
    city?: string;
    region?: string;
    isVerified?: boolean;
    isActive?: boolean;
    minRating?: number;
    sortBy?: 'rating' | 'reviews' | 'name' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export interface NearbyProvidersDto {
    latitude: number;
    longitude: number;
    radius?: number;
    limit?: number;
}

// ============================================
// SERVICE TYPES
// ============================================

export interface Service {
    id: string;
    providerId: string;
    name: string;
    description?: string;
    category: ServiceCategory;
    basePrice: number;
    duration: number;
    includedFeatures?: string[];
    imageUrls?: string[];
    isActive: boolean;
    popularity: number;
    createdAt: string;
    updatedAt: string;
    provider?: Provider;
    reviews?: Review[];
    averageRating?: number;
    totalReviews?: number;
}

export enum ServiceCategory {
    BASIC_WASH = 'BASIC_WASH',
    PREMIUM_WASH = 'PREMIUM_WASH',
    DETAILING = 'DETAILING',
    INTERIOR_CLEANING = 'INTERIOR_CLEANING',
    WAX_POLISH = 'WAX_POLISH',
    ENGINE_CLEANING = 'ENGINE_CLEANING',
    OTHER = 'OTHER'
}

export interface CreateServiceDto {
    providerId: string;
    name: string;
    description?: string;
    category: ServiceCategory;
    basePrice: number;
    duration: number;
    includedFeatures?: string[];
    imageUrls?: string[];
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {
    isActive?: boolean;
}

export interface QueryServicesDto {
    page?: number;
    limit?: number;
    search?: string;
    category?: ServiceCategory;
    minPrice?: number;
    maxPrice?: number;
    providerId?: string;
    isActive?: boolean;
    sortBy?: 'price' | 'rating' | 'popularity' | 'name';
    sortOrder?: 'asc' | 'desc';
}

// ============================================
// SEARCH TYPES
// ============================================

export interface SearchQuery {
    query?: string;
    latitude?: number;
    longitude: number;
    radius?: number;
    category?: ServiceCategory;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: 'price' | 'rating' | 'distance' | 'popularity';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface SearchResult {
    service: Service;
    provider: Provider;
    distance?: number;
    matchScore: number;
}

export interface SearchResponse {
    results: SearchResult[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    searchMetadata: {
        query?: string;
        location?: {
            latitude: number;
            longitude: number;
        };
        filters: {
            category?: ServiceCategory;
            priceRange?: { min?: number; max?: number };
            minRating?: number;
        };
        executionTime: number;
    };
}

export interface SearchSuggestion {
    type: 'service' | 'provider' | 'category' | 'location';
    value: string;
    displayText: string;
    metadata?: any;
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
    id: string;
    userId: string;
    serviceId: string;
    providerId: string;
    rating: number;
    comment?: string;
    imageUrls?: string[];
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    user?: User;
    service?: Service;
    provider?: Provider;
}

export interface CreateReviewDto {
    serviceId: string;
    rating: number;
    comment?: string;
    imageUrls?: string[];
}

export interface UpdateReviewDto {
    rating?: number;
    comment?: string;
    imageUrls?: string[];
}

// ============================================
// USER TYPES
// ============================================

export interface User {
    id: string;
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export enum UserRole {
    USER = 'USER',
    PROVIDER = 'PROVIDER',
    ADMIN = 'ADMIN'
}

export interface UpdateUserDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
}

// ============================================
// FAVORITE TYPES
// ============================================

export interface Favorite {
    id: string;
    userId: string;
    providerId: string;
    createdAt: string;
    provider?: Provider;
}

// ============================================
// COMPARISON TYPES
// ============================================

export interface ComparisonRequest {
    serviceCategory: ServiceCategory;
    latitude?: number;
    longitude?: number;
    radius?: number;
    limit?: number;
}

export interface ComparisonResult {
    category: ServiceCategory;
    providers: Array<{
        provider: Provider;
        service: Service;
        distance?: number;
        savings?: number;
        rank: number;
    }>;
    statistics: {
        averagePrice: number;
        minPrice: number;
        maxPrice: number;
        totalProviders: number;
        averageRating: number;
    };
    recommendations: {
        bestValue: string; // provider ID
        closest: string; // provider ID
        topRated: string; // provider ID
    };
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface ProviderAnalytics {
    totalViews: number;
    totalClicks: number;
    totalFavorites: number;
    totalReviews: number;
    averageRating: number;
    revenueEstimate: number;
    viewsByDate: Array<{ date: string; count: number }>;
    topServices: Array<{ serviceId: string; serviceName: string; views: number }>;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    createdAt: string;
}

export enum NotificationType {
    NEW_REVIEW = 'NEW_REVIEW',
    BOOKING_UPDATE = 'BOOKING_UPDATE',
    PRICE_ALERT = 'PRICE_ALERT',
    SYSTEM = 'SYSTEM'
}

// ============================================
// ERROR TYPES
// ============================================

export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
    timestamp?: string;
    path?: string;
}
