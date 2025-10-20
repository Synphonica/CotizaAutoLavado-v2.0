import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL_KEY = 'api_base_url';

// URL por defecto para emulador Android (10.0.2.2 = localhost de la máquina host)
const DEFAULT_API_URL = 'http://10.0.2.2:4000';

export const ApiConfig = {
    async getApiUrl(): Promise<string> {
        try {
            const storedUrl = await AsyncStorage.getItem(API_URL_KEY);
            return storedUrl || DEFAULT_API_URL;
        } catch (error) {
            console.error('Error getting API URL:', error);
            return DEFAULT_API_URL;
        }
    },

    async setApiUrl(url: string): Promise<void> {
        try {
            await AsyncStorage.setItem(API_URL_KEY, url);
        } catch (error) {
            console.error('Error setting API URL:', error);
        }
    },

    async resetToDefault(): Promise<void> {
        try {
            await AsyncStorage.removeItem(API_URL_KEY);
        } catch (error) {
            console.error('Error resetting API URL:', error);
        }
    }
};