import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useLocation } from '../hooks/useLocation';
import { Provider } from '../types';
import { searchService } from '../services/searchService';
import ConnectionErrorModal from '../components/ConnectionErrorModal';

interface MapScreenProps {
    navigation: any;
}

const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
    const mapRef = useRef<MapView>(null);
    const { location, loading: locationLoading, error: locationError } = useLocation();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [showConnectionModal, setShowConnectionModal] = useState(false);

    useEffect(() => {
        if (location) {
            loadNearbyProviders();
        }
    }, [location]);

    const loadNearbyProviders = async () => {
        if (!location) return;

        try {
            setLoading(true);
            const nearbyProviders = await searchService.getNearbyProviders(
                location.latitude,
                location.longitude,
                10 // 10 km radius
            );
            setProviders(nearbyProviders);
        } catch (error: any) {
            console.error('Error cargando proveedores cercanos:', error);
            if (error.statusCode === 0) {
                setShowConnectionModal(true);
            } else {
                Alert.alert('Error', error.message || 'No se pudieron cargar los proveedores cercanos');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMarkerPress = (provider: Provider) => {
        setSelectedProvider(provider);
    };

    const handleProviderDetailPress = () => {
        if (selectedProvider) {
            navigation.navigate('ProviderDetail', { providerId: selectedProvider.id });
        }
    };

    const centerOnUserLocation = () => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
        }
    };

    if (locationLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Obteniendo tu ubicación...</Text>
            </SafeAreaView>
        );
    }

    if (locationError || !location) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Ionicons name="location-outline" size={48} color={Colors.error} />
                <Text style={styles.errorText}>
                    {locationError || 'No se pudo obtener tu ubicación'}
                </Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.retryText}>Volver</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mapa</Text>
                <TouchableOpacity onPress={loadNearbyProviders}>
                    <Ionicons name="refresh" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </SafeAreaView>

            {/* Map */}
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation
                showsMyLocationButton={false}
                onMarkerPress={(event) => {
                    const coordinate = event.nativeEvent.coordinate;
                    const provider = providers.find(p =>
                        p.address.coordinates &&
                        Math.abs(p.address.coordinates.latitude - coordinate.latitude) < 0.0001 &&
                        Math.abs(p.address.coordinates.longitude - coordinate.longitude) < 0.0001
                    );
                    if (provider) {
                        handleMarkerPress(provider);
                    }
                }}
            >
                {/* User Location Marker */}
                <Marker
                    coordinate={location}
                    title="Tu ubicación"
                    pinColor={Colors.primary}
                />

                {/* Provider Markers */}
                {providers.map((provider) => {
                    if (!provider.address.coordinates) return null;

                    return (
                        <Marker
                            key={provider.id}
                            coordinate={provider.address.coordinates}
                            title={provider.name}
                            description={provider.description}
                            pinColor={Colors.secondary}
                        />
                    );
                })}
            </MapView>

            {/* Loading Overlay */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.loadingOverlayText}>Cargando...</Text>
                </View>
            )}

            {/* Provider Details Card */}
            {selectedProvider && (
                <View style={styles.providerCard}>
                    <View style={styles.providerInfo}>
                        <View style={styles.providerHeader}>
                            <Text style={styles.providerName}>{selectedProvider.name}</Text>
                            {selectedProvider.isVerified && (
                                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                            )}
                        </View>
                        <Text style={styles.providerDescription} numberOfLines={2}>
                            {selectedProvider.description}
                        </Text>
                        <View style={styles.providerMeta}>
                            <View style={styles.rating}>
                                <Ionicons name="star" size={16} color={Colors.warning} />
                                <Text style={styles.ratingText}>
                                    {selectedProvider.rating.toFixed(1)} ({selectedProvider.reviewCount})
                                </Text>
                            </View>
                            {selectedProvider.services.length > 0 && (
                                <Text style={styles.servicePrice}>
                                    Desde ${selectedProvider.services[0].price.toLocaleString()}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.providerActions}>
                        <TouchableOpacity
                            style={styles.detailButton}
                            onPress={handleProviderDetailPress}
                        >
                            <Text style={styles.detailButtonText}>Ver detalles</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setSelectedProvider(null)}
                        >
                            <Ionicons name="close" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.locationFab}
                onPress={centerOnUserLocation}
            >
                <Ionicons name="locate" size={24} color={Colors.background} />
            </TouchableOpacity>

            <ConnectionErrorModal
                visible={showConnectionModal}
                onClose={() => setShowConnectionModal(false)}
                onOpenSettings={() => {
                    setShowConnectionModal(false);
                    navigation.navigate('Settings');
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.textSecondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        paddingHorizontal: 20,
    },
    errorText: {
        marginTop: 16,
        marginBottom: 20,
        fontSize: 16,
        color: Colors.error,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: Colors.background,
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        zIndex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    map: {
        flex: 1,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 100,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    loadingOverlayText: {
        marginLeft: 12,
        fontSize: 14,
        color: Colors.textSecondary,
    },
    providerCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.background,
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    providerInfo: {
        marginBottom: 16,
    },
    providerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    providerName: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginRight: 8,
    },
    providerDescription: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 12,
        lineHeight: 20,
    },
    providerMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 14,
        color: Colors.textSecondary,
    },
    servicePrice: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
    },
    providerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    detailButton: {
        flex: 1,
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    detailButtonText: {
        color: Colors.background,
        fontSize: 16,
        fontWeight: '600',
    },
    closeButton: {
        marginLeft: 16,
        padding: 8,
    },
    locationFab: {
        position: 'absolute',
        bottom: 120,
        right: 20,
        backgroundColor: Colors.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
});

export default MapScreen;