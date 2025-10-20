import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Provider, SearchRequest, Location as LocationType } from '../types';
import { searchService } from '../services/searchService';
import ConnectionErrorModal from '../components/ConnectionErrorModal';

interface ResultsScreenProps {
    navigation: any;
    route: any;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ navigation, route }) => {
    const { query, category, location } = route.params;
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showConnectionModal, setShowConnectionModal] = useState(false);

    useEffect(() => {
        searchProviders();
    }, []);

    const searchProviders = async () => {
        try {
            setLoading(true);
            setError(null);

            const searchRequest: SearchRequest = {
                location: location,
                query: query,
                filters: category ? { category } : undefined,
            };

            const response = await searchService.searchProviders(searchRequest);
            setProviders(response.providers);
        } catch (err: any) {
            console.error('Error buscando proveedores:', err);
            setError(err.message || 'Error al buscar proveedores');
            if (err.statusCode === 0) {
                setShowConnectionModal(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProviderPress = (provider: Provider) => {
        navigation.navigate('ProviderDetail', { providerId: provider.id });
    };

    const renderRating = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? 'star' : 'star-outline'}
                    size={16}
                    color={Colors.warning}
                />
            );
        }
        return stars;
    };

    const calculateDistance = (providerLocation: LocationType) => {
        // Fórmula simple para calcular distancia aproximada
        const lat1 = location.latitude;
        const lon1 = location.longitude;
        const lat2 = providerLocation.latitude;
        const lon2 = providerLocation.longitude;

        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance.toFixed(1);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Buscando proveedores...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={searchProviders}>
                    <Text style={styles.retryText}>Reintentar</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Resultados</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Map')}>
                    <Ionicons name="map" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Search Info */}
            <View style={styles.searchInfo}>
                <Text style={styles.searchQuery}>
                    {query ? `"${query}"` : category}
                </Text>
                <Text style={styles.resultsCount}>
                    {providers.length} proveedores encontrados
                </Text>
            </View>

            {/* Results */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {providers.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search" size={48} color={Colors.textSecondary} />
                        <Text style={styles.emptyTitle}>No se encontraron resultados</Text>
                        <Text style={styles.emptySubtitle}>
                            Intenta con otros términos de búsqueda
                        </Text>
                    </View>
                ) : (
                    providers.map((provider) => (
                        <TouchableOpacity
                            key={provider.id}
                            style={styles.providerCard}
                            onPress={() => handleProviderPress(provider)}
                        >
                            <View style={styles.providerImageContainer}>
                                {provider.logo ? (
                                    <Image source={{ uri: provider.logo }} style={styles.providerImage} />
                                ) : (
                                    <View style={styles.placeholderImage}>
                                        <Ionicons name="business" size={32} color={Colors.textSecondary} />
                                    </View>
                                )}
                            </View>

                            <View style={styles.providerInfo}>
                                <View style={styles.providerHeader}>
                                    <Text style={styles.providerName}>{provider.name}</Text>
                                    {provider.isVerified && (
                                        <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                                    )}
                                </View>

                                <Text style={styles.providerDescription} numberOfLines={2}>
                                    {provider.description}
                                </Text>

                                <View style={styles.providerMeta}>
                                    <View style={styles.rating}>
                                        {renderRating(Math.round(provider.rating))}
                                        <Text style={styles.ratingText}>
                                            {provider.rating.toFixed(1)} ({provider.reviewCount})
                                        </Text>
                                    </View>

                                    {provider.address.coordinates && (
                                        <View style={styles.distance}>
                                            <Ionicons name="location" size={16} color={Colors.textSecondary} />
                                            <Text style={styles.distanceText}>
                                                {calculateDistance(provider.address.coordinates)} km
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {provider.services.length > 0 && (
                                    <View style={styles.servicesPreview}>
                                        <Text style={styles.servicePrice}>
                                            Desde ${provider.services[0].price.toLocaleString()}
                                        </Text>
                                        <Text style={styles.serviceCount}>
                                            {provider.services.length} servicio{provider.services.length !== 1 ? 's' : ''}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            <ConnectionErrorModal
                visible={showConnectionModal}
                onClose={() => setShowConnectionModal(false)}
                onOpenSettings={() => {
                    setShowConnectionModal(false);
                    navigation.navigate('Settings');
                }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
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
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    searchInfo: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: Colors.surface,
    },
    searchQuery: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    resultsCount: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    emptySubtitle: {
        marginTop: 8,
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    providerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: 16,
        marginTop: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    providerImageContainer: {
        marginRight: 12,
    },
    providerImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    placeholderImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    providerInfo: {
        flex: 1,
    },
    providerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    providerName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginRight: 8,
    },
    providerDescription: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 8,
        lineHeight: 18,
    },
    providerMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        marginLeft: 8,
        fontSize: 14,
        color: Colors.textSecondary,
    },
    distance: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    distanceText: {
        marginLeft: 4,
        fontSize: 14,
        color: Colors.textSecondary,
    },
    servicesPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    servicePrice: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
    },
    serviceCount: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
});

export default ResultsScreen;