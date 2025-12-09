import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW, FONT_SIZE } from '../constants/theme';
import { ServiceCard } from '../components/ServiceCard';
import api from '../config/api';
import { Provider, Service, Review } from '../types';

export const ProviderDetailScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { providerId } = route.params;

    const [loading, setLoading] = useState(true);
    const [provider, setProvider] = useState<Provider | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        loadProviderDetails();
    }, [providerId]);

    const loadProviderDetails = async () => {
        try {
            setLoading(true);
            const [providerRes, servicesRes, reviewsRes] = await Promise.all([
                api.get(`/providers/${providerId}`),
                api.get(`/services?providerId=${providerId}&isActive=true`),
                api.get(`/reviews?providerId=${providerId}&status=ACTIVE&limit=5`),
            ]);

            setProvider(providerRes.data);
            setServices(servicesRes.data.data || []);
            setReviews(reviewsRes.data.data || []);
        } catch (error) {
            console.error('Error loading provider details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCall = () => {
        if (provider?.phone) {
            Linking.openURL(`tel:${provider.phone}`);
        }
    };

    const handleEmail = () => {
        if (provider?.email) {
            Linking.openURL(`mailto:${provider.email}`);
        }
    };

    const handleWebsite = () => {
        if (provider?.website) {
            Linking.openURL(provider.website);
        }
    };

    const handleMap = () => {
        if (provider?.latitude && provider?.longitude) {
            const url = `https://www.google.com/maps/search/?api=1&query=${provider.latitude},${provider.longitude}`;
            Linking.openURL(url);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!provider) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray[400]} />
                <Text style={styles.errorText}>Proveedor no encontrado</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Cover Image */}
            {provider.coverImage ? (
                <Image source={{ uri: provider.coverImage }} style={styles.coverImage} />
            ) : (
                <View style={[styles.coverImage, styles.placeholderCover]}>
                    <Ionicons name="car-outline" size={64} color={COLORS.gray[400]} />
                </View>
            )}

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    {provider.logo ? (
                        <Image source={{ uri: provider.logo }} style={styles.logo} />
                    ) : (
                        <View style={[styles.logo, styles.placeholderLogo]}>
                            <Ionicons name="business-outline" size={32} color={COLORS.gray[400]} />
                        </View>
                    )}
                    <View style={styles.headerInfo}>
                        <Text style={styles.businessName}>{provider.businessName}</Text>
                        <Text style={styles.businessType}>{provider.businessType}</Text>
                    </View>
                </View>

                {/* Rating */}
                <View style={styles.ratingContainer}>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={24} color={COLORS.accent} />
                        <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.reviewCount}>
                        {provider.reviewCount} reseñas
                    </Text>
                </View>

                {/* Contact Buttons */}
                <View style={styles.contactButtons}>
                    {provider.phone && (
                        <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                            <Ionicons name="call-outline" size={20} color={COLORS.white} />
                            <Text style={styles.contactButtonText}>Llamar</Text>
                        </TouchableOpacity>
                    )}
                    {provider.email && (
                        <TouchableOpacity style={[styles.contactButton, styles.secondaryButton]} onPress={handleEmail}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
                            <Text style={[styles.contactButtonText, styles.secondaryButtonText]}>Email</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Info Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información</Text>

                {provider.description && (
                    <Text style={styles.description}>{provider.description}</Text>
                )}

                <View style={styles.infoList}>
                    {provider.address && (
                        <TouchableOpacity style={styles.infoItem} onPress={handleMap}>
                            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.infoText}>
                                {provider.address}, {provider.city}, {provider.region}
                            </Text>
                            <Ionicons name="chevron-forward-outline" size={20} color={COLORS.gray[400]} />
                        </TouchableOpacity>
                    )}

                    {provider.phone && (
                        <View style={styles.infoItem}>
                            <Ionicons name="call-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.infoText}>{provider.phone}</Text>
                        </View>
                    )}

                    {provider.email && (
                        <View style={styles.infoItem}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.infoText}>{provider.email}</Text>
                        </View>
                    )}

                    {provider.website && (
                        <TouchableOpacity style={styles.infoItem} onPress={handleWebsite}>
                            <Ionicons name="globe-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.infoText}>{provider.website}</Text>
                            <Ionicons name="open-outline" size={16} color={COLORS.gray[400]} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Services Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Servicios ({services.length})</Text>
                {services.map((service) => (
                    <ServiceCard
                        key={service.id}
                        service={service}
                        onPress={() => navigation.navigate('ServiceDetail', { serviceId: service.id })}
                    />
                ))}
            </View>

            {/* Reviews Section */}
            {reviews.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Reseñas ({provider.reviewCount})</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>Ver todas</Text>
                        </TouchableOpacity>
                    </View>

                    {reviews.map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <View style={styles.reviewUser}>
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarText}>
                                            {review.user?.firstName?.[0] || 'U'}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.reviewUserName}>
                                            {review.user?.firstName} {review.user?.lastName}
                                        </Text>
                                        <View style={styles.reviewRating}>
                                            {[...Array(5)].map((_, i) => (
                                                <Ionicons
                                                    key={i}
                                                    name={i < review.rating ? 'star' : 'star-outline'}
                                                    size={14}
                                                    color={COLORS.accent}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                </View>
                                <Text style={styles.reviewDate}>
                                    {new Date(review.createdAt).toLocaleDateString('es-CL')}
                                </Text>
                            </View>
                            {review.comment && (
                                <Text style={styles.reviewComment}>{review.comment}</Text>
                            )}
                        </View>
                    ))}
                </View>
            )}

            <View style={{ height: SPACING.xxl }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: FONT_SIZE.lg,
        color: COLORS.gray[500],
        marginTop: SPACING.md,
    },
    coverImage: {
        width: '100%',
        height: 200,
        backgroundColor: COLORS.gray[200],
    },
    placeholderCover: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    headerTop: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.gray[200],
        marginRight: SPACING.md,
    },
    placeholderLogo: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    businessName: {
        fontSize: FONT_SIZE['2xl'],
        fontWeight: '700',
        color: COLORS.dark,
        marginBottom: SPACING.xs,
    },
    businessType: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray[600],
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.accent}20`,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        marginRight: SPACING.md,
    },
    ratingText: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '700',
        color: COLORS.dark,
        marginLeft: SPACING.xs,
    },
    reviewCount: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray[600],
    },
    contactButtons: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    contactButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        gap: SPACING.sm,
    },
    secondaryButton: {
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    contactButtonText: {
        fontSize: FONT_SIZE.base,
        fontWeight: '600',
        color: COLORS.white,
    },
    secondaryButtonText: {
        color: COLORS.primary,
    },
    section: {
        backgroundColor: COLORS.white,
        marginTop: SPACING.md,
        padding: SPACING.lg,
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
        marginBottom: SPACING.md,
    },
    seeAllText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.primary,
    },
    description: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray[700],
        lineHeight: 24,
        marginBottom: SPACING.md,
    },
    infoList: {
        gap: SPACING.md,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    infoText: {
        flex: 1,
        fontSize: FONT_SIZE.base,
        color: COLORS.gray[700],
    },
    reviewCard: {
        padding: SPACING.md,
        backgroundColor: COLORS.gray[50],
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    reviewUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: FONT_SIZE.base,
        fontWeight: '600',
        color: COLORS.white,
    },
    reviewUserName: {
        fontSize: FONT_SIZE.base,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 2,
    },
    reviewRating: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewDate: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray[500],
    },
    reviewComment: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray[700],
        lineHeight: 22,
    },
});
