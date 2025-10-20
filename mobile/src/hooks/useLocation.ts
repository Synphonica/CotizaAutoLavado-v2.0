import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Location as LocationType } from '../types';

interface LocationState {
    location: LocationType | null;
    loading: boolean;
    error: string | null;
}

export const useLocation = () => {
    const [state, setState] = useState<LocationState>({
        location: null,
        loading: true,
        error: null,
    });

    const getCurrentLocation = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            // Verificar si los permisos están habilitados
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Permiso de ubicación denegado',
                }));
                return;
            }

            // Obtener la ubicación actual
            const locationResult = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const currentLocation: LocationType = {
                latitude: locationResult.coords.latitude,
                longitude: locationResult.coords.longitude,
            };

            setState({
                location: currentLocation,
                loading: false,
                error: null,
            });

            return currentLocation;
        } catch (error) {
            console.error('Error obteniendo ubicación:', error);
            setState({
                location: null,
                loading: false,
                error: 'Error al obtener la ubicación',
            });
        }
    };

    const watchLocation = () => {
        Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 10000, // 10 segundos
                distanceInterval: 100, // 100 metros
            },
            (locationResult) => {
                const newLocation: LocationType = {
                    latitude: locationResult.coords.latitude,
                    longitude: locationResult.coords.longitude,
                };

                setState(prev => ({
                    ...prev,
                    location: newLocation,
                    loading: false,
                    error: null,
                }));
            }
        );
    };

    useEffect(() => {
        getCurrentLocation();
    }, []);

    return {
        location: state.location,
        loading: state.loading,
        error: state.error,
        refetch: getCurrentLocation,
        watchLocation,
    };
};