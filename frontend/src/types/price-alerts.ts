// Types for Price Alerts

export interface PriceAlert {
    id: string;
    userId: string;
    serviceId: string;
    targetPrice: number | null;
    percentageOff: number | null;
    isActive: boolean;
    notifyEmail: boolean;
    notifyInApp: boolean;
    lastNotifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
    triggeredCount: number;
    service: {
        id: string;
        name: string;
        price: number;
        discountedPrice: number | null;
        provider: {
            id: string;
            businessName: string;
            city: string;
        };
    };
}

export interface CreatePriceAlertData {
    serviceId: string;
    targetPrice?: number;
    percentageOff?: number;
    notifyEmail?: boolean;
    notifyInApp?: boolean;
}

export interface UpdatePriceAlertData {
    targetPrice?: number;
    percentageOff?: number;
    notifyEmail?: boolean;
    notifyInApp?: boolean;
    isActive?: boolean;
}

export interface PriceHistoryEntry {
    id: string;
    serviceId: string;
    price: number;
    oldPrice: number | null;
    changeType: string | null;
    recordedAt: string;
}
