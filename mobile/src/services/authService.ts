import api from './api';
import { API_ENDPOINTS } from '../constants/API';
import {
    AuthRequest,
    AuthResponse,
    User,
    APIResponse,
} from '../types';

export const authService = {
    login: async (credentials: AuthRequest): Promise<AuthResponse> => {
        const response = await api.post<APIResponse<AuthResponse>>(
            API_ENDPOINTS.AUTH.LOGIN,
            credentials
        );
        return response.data.data;
    },

    register: async (userData: AuthRequest): Promise<AuthResponse> => {
        const response = await api.post<APIResponse<AuthResponse>>(
            API_ENDPOINTS.AUTH.REGISTER,
            userData
        );
        return response.data.data;
    },

    getProfile: async (): Promise<User> => {
        const response = await api.get<APIResponse<User>>(
            API_ENDPOINTS.AUTH.PROFILE
        );
        return response.data.data;
    },

    refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
        const response = await api.post<APIResponse<AuthResponse>>(
            API_ENDPOINTS.AUTH.REFRESH,
            { refresh_token: refreshToken }
        );
        return response.data.data;
    },
};