import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW, FONT_SIZE } from '../constants/theme';
import { ProviderCard } from '../components/ProviderCard';
import { ServiceCard } from '../components/ServiceCard';
import api from '../config/api';
import { Provider, Service } from '../types';

export const HomeScreen = () => {
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [featuredProviders, setFeaturedProviders] = useState<Provider[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [providersRes, servicesRes] = await Promise.all([
                api.get('/providers?limit=10&status=ACTIVE'),
                api.get('/services?limit=8&isActive=true'),
            ]);

            setProviders(providersRes.data.data || []);
            setServices(servicesRes.data.data || []);

            // Featured providers (mejor rating)
            const featured = [...(providersRes.data.data || [])]
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5);
            setFeaturedProviders(featured);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleSearch = () => {
        navigation.navigate('Search', { query: searchQuery });
    };

    const handleProviderPress = (provider: Provider) => {
        navigation.navigate('ProviderDetail', { providerId: provider.id });
    };

    const handleServicePress = (service: Service) => {
        navigation.navigate('ServiceDetail', { serviceId: service.id });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Ionicons name="car-sport" size={32} color={COLORS.primary} />
                    <Text style={styles.logoText}>Cotiza Auto Lavado</Text>
                </View>
            </View>

            {/* Hero Section */}
            <View style={styles.heroSection}>
                <Text style={styles.heroTitle}>
                    Encuentra el mejor{'\n'}
                    <Text style={styles.heroHighlight}>autolavado</Text>
                </Text>
                <Text style={styles.heroSubtitle}>
                    Compara precios y servicios cerca de ti
                </Text>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color={COLORS.gray[500]} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar autolavados, servicios..."
                        placeholderTextColor={COLORS.gray[400]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={COLORS.gray[400]} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('Map')}
                    >
                        <Ionicons name="map-outline" size={24} color={COLORS.white} />
                        <Text style={styles.quickActionText}>Mapa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('Compare')}
                    >
                        <Ionicons name="git-compare-outline" size={24} color={COLORS.white} />
                        <Text style={styles.quickActionText}>Comparar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('Bookings')}
                    >
                        <Ionicons name="calendar-outline" size={24} color={COLORS.white} />
                        <Text style={styles.quickActionText}>Reservas</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Featured Providers */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>⭐ Destacados</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                        <Text style={styles.seeAllText}>Ver todos</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                >
                    {featuredProviders.map((provider) => (
                        <View key={provider.id} style={styles.featuredCard}>
                            <ProviderCard
                                provider={provider}
                                onPress={() => handleProviderPress(provider)}
                            />
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Popular Services */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>🔥 Servicios Populares</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Services')}>
                        <Text style={styles.seeAllText}>Ver todos</Text>
                    </TouchableOpacity>
                </View>
                {services.map((service) => (
                    <ServiceCard
                        key={service.id}
                        service={service}
                        onPress={() => handleServicePress(service)}
                        showProvider
                    />
                ))}
            </View>

            {/* Info Cards */}
            <View style={styles.infoSection}>
                <View style={styles.infoCard}>
                    <Ionicons name="shield-checkmark" size={32} color={COLORS.success} />
                    <Text style={styles.infoTitle}>Pago Seguro</Text>
                    <Text style={styles.infoText}>
                        Reserva y paga de forma segura
                    </Text>
                </View>
                <View style={styles.infoCard}>
                    <Ionicons name="star" size={32} color={COLORS.accent} />
                    <Text style={styles.infoTitle}>Calidad Garantizada</Text>
                    <Text style={styles.infoText}>
                        Solo los mejores autolavados
                    </Text>
                </View>
            </View>

            {/* Bottom Spacing */}
            <View style={{ height: SPACING.xxl }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    contentContainer: {
        paddingBottom: SPACING.xl,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.gray[50],
    },
    header: {
        paddingTop: SPACING.xl,
        paddingHorizontal: SPACING.lg,
        backgroundColor: COLORS.white,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: FONT_SIZE['2xl'],
        fontWeight: '700',
        color: COLORS.dark,
        marginLeft: SPACING.md,
    },
    heroSection: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
        ...SHADOW.md,
    },
    heroTitle: {
        fontSize: FONT_SIZE['4xl'],
        fontWeight: '900',
        color: COLORS.dark,
        marginBottom: SPACING.sm,
        lineHeight: 44,
    },
    heroHighlight: {
        color: COLORS.primary,
    },
    heroSubtitle: {
        fontSize: FONT_SIZE.lg,
        color: COLORS.gray[600],
        marginBottom: SPACING.xl,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray[100],
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        marginBottom: SPACING.lg,
    },
    searchInput: {
        flex: 1,
        fontSize: FONT_SIZE.base,
        color: COLORS.dark,
        marginLeft: SPACING.sm,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: SPACING.md,
    },
    quickActionButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.lg,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        ...SHADOW.sm,
    },
    quickActionText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.white,
        marginTop: SPACING.xs,
    },
    section: {
        marginTop: SPACING.xl,
        paddingHorizontal: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '700',
        color: COLORS.dark,
    },
    seeAllText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.primary,
    },
    horizontalScroll: {
        paddingRight: SPACING.lg,
    },
    featuredCard: {
        width: 320,
        marginRight: SPACING.md,
    },
    infoSection: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.xl,
        gap: SPACING.md,
    },
    infoCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        alignItems: 'center',
        ...SHADOW.sm,
    },
    infoTitle: {
        fontSize: FONT_SIZE.base,
        fontWeight: '600',
        color: COLORS.dark,
        marginTop: SPACING.sm,
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    infoText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray[600],
        textAlign: 'center',
    },
});
