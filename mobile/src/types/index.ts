export interface Provider {
    id: string;
    businessName: string;
    businessType: string;
    description: string | null;
    address: string | null;
    city: string | null;
    region: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    rating: number;
    reviewCount: number;
    latitude: number | null;
    longitude: number | null;
    logo: string | null;
    coverImage: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
    createdAt: string;
}

export interface Service {
    id: string;
    providerId: string;
    name: string;
    description: string | null;
    category: string;
    price: number;
    duration: number;
    isActive: boolean;
    provider?: Provider;
    createdAt: string;
}

export interface Review {
    id: string;
    providerId: string;
    userId: string;
    rating: number;
    comment: string | null;
    status: 'ACTIVE' | 'HIDDEN' | 'FLAGGED';
    createdAt: string;
    user?: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
    };
}

export interface Booking {
    id: string;
    providerId: string;
    serviceId: string;
    userId: string | null;
    date: string;
    time: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    vehicleInfo: {
        brand: string;
        model: string;
        year: number;
        plate: string;
        color: string;
        type: string;
    } | null;
    notes: string | null;
    provider?: Provider;
    service?: Service;
    createdAt: string;
}

export interface User {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
    status: string;
    avatar: string | null;
    phone: string | null;
    createdAt: string;
}

export interface Location {
    latitude: number;
    longitude: number;
    city?: string;
    region?: string;
}
