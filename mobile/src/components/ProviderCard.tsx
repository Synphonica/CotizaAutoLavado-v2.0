import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW, FONT_SIZE } from '../constants/theme';
import { Provider } from '../types';

interface ProviderCardProps {
    provider: Provider;
    onPress: () => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            {/* Cover Image */}
            {provider.coverImage ? (
                <Image source={{ uri: provider.coverImage }} style={styles.coverImage} />
            ) : (
                <View style={[styles.coverImage, styles.placeholderImage]}>
                    <Ionicons name="car-outline" size={40} color={COLORS.gray[400]} />
                </View>
            )}

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.businessName} numberOfLines={1}>
                            {provider.businessName}
                        </Text>
                        <Text style={styles.businessType} numberOfLines={1}>
                            {provider.businessType}
                        </Text>
                    </View>
                    {provider.logo && (
                        <Image source={{ uri: provider.logo }} style={styles.logo} />
                    )}
                </View>

                {/* Location */}
                {provider.city && (
                    <View style={styles.locationContainer}>
                        <Ionicons name="location-outline" size={16} color={COLORS.gray[500]} />
                        <Text style={styles.locationText} numberOfLines={1}>
                            {provider.city}{provider.region ? `, ${provider.region}` : ''}
                        </Text>
                    </View>
                )}

                {/* Rating */}
                <View style={styles.ratingContainer}>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={16} color={COLORS.accent} />
                        <Text style={styles.ratingText}>
                            {provider.rating.toFixed(1)}
                        </Text>
                    </View>
                    <Text style={styles.reviewCount}>
                        ({provider.reviewCount} reseñas)
                    </Text>
                </View>

                {/* Status Badge */}
                {provider.status === 'ACTIVE' && (
                    <View style={styles.statusBadge}>
                        <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                        <Text style={styles.statusText}>Disponible</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        overflow: 'hidden',
        ...SHADOW.md,
    },
    coverImage: {
        width: '100%',
        height: 160,
        backgroundColor: COLORS.gray[200],
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    titleContainer: {
        flex: 1,
        marginRight: SPACING.sm,
    },
    businessName: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: COLORS.dark,
        marginBottom: 2,
    },
    businessType: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray[500],
    },
    logo: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.gray[200],
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    locationText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray[600],
        marginLeft: SPACING.xs,
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.accent}20`,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.md,
        marginRight: SPACING.sm,
    },
    ratingText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.dark,
        marginLeft: 4,
    },
    reviewCount: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray[500],
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: `${COLORS.success}10`,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
    },
    statusText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
        color: COLORS.success,
        marginLeft: 4,
    },
});
