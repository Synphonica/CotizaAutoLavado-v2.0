import api from './api';
import { API_ENDPOINTS } from '../constants/API';
import {
    SearchRequest,
    SearchResponse,
    Provider,
    Service,
    APIResponse,
} from '../types';

export const searchService = {
    searchProviders: async (searchParams: SearchRequest): Promise<SearchResponse> => {
        const response = await api.post<APIResponse<SearchResponse>>(
            API_ENDPOINTS.SERVICES.SEARCH,
            searchParams
        );
        return response.data.data;
    },

    getNearbyProviders: async (
        latitude: number,
        longitude: number,
        radius: number = 10
    ): Promise<Provider[]> => {
        const response = await api.get<APIResponse<Provider[]>>(
            `${API_ENDPOINTS.PROVIDERS.NEARBY}?lat=${latitude}&lng=${longitude}&radius=${radius}`
        );
        return response.data.data;
    },

    getProviderDetails: async (providerId: string): Promise<Provider> => {
        const response = await api.get<APIResponse<Provider>>(
            `${API_ENDPOINTS.PROVIDERS.DETAILS}/${providerId}`
        );
        return response.data.data;
    },

    getServiceDetails: async (serviceId: string): Promise<Service> => {
        const response = await api.get<APIResponse<Service>>(
            `${API_ENDPOINTS.SERVICES.DETAILS}/${serviceId}`
        );
        return response.data.data;
    },

    getCategories: async (): Promise<string[]> => {
        const response = await api.get<APIResponse<string[]>>(
            API_ENDPOINTS.SERVICES.CATEGORIES
        );
        return response.data.data;
    },
};