export interface CarWashData {
    name: string;
    address: string;
    comuna: string;
    region: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
    services: string[];
    prices?: {
        serviceName: string;
        price: number;
        duration?: number;
    }[];
    rating?: number;
    reviewCount?: number;
    latitude?: number;
    longitude?: number;
    openingHours?: {
        day: string;
        open: string;
        close: string;
    }[];
    images?: string[];
    source: 'google' | 'yapo' | 'mercadolibre' | 'facebook' | 'manual' | 'google_puppeteer';
    sourceUrl: string;
    scrapedAt: Date;
}

export interface ScraperConfig {
    maxResults: number;
    delayBetweenRequests: number;
    region: string;
    comuna: string;
    searchQuery: string;
}

export interface ScraperResult {
    success: boolean;
    data: CarWashData[];
    errors: string[];
    totalFound: number;
    totalScraped: number;
}