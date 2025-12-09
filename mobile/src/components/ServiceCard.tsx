import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW, FONT_SIZE } from '../constants/theme';
import { Service } from '../types';

interface ServiceCardProps {
    service: Service;
    onPress: () => void;
    showProvider?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
    service,
    onPress,
    showProvider = false
}) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(price);
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    };

    const getCategoryIcon = (category: string) => {
        const icons: { [key: string]: any } = {
            'Lavado Exterior': 'water-outline',
            'Lavado Interior': 'home-outline',
            'Lavado Completo': 'car-outline',
            'Encerado': 'sparkles-outline',
            'Pulido': 'diamond-outline',
            'Aspirado': 'trash-outline',
            'Motor': 'cog-outline',
        };
        return icons[category] || 'construct-outline';
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={getCategoryIcon(service.category)}
                        size={24}
                        color={COLORS.primary}
                    />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.serviceName} numberOfLines={1}>
                        {service.name}
                    </Text>
                    <Text style={styles.category} numberOfLines={1}>
                        {service.category}
                    </Text>
                </View>
                {service.isActive ? (
                    <View style={styles.activeBadge}>
                        <View style={styles.activeDot} />
                    </View>
                ) : null}
            </View>

            {service.description && (
                <Text style={styles.description} numberOfLines={2}>
                    {service.description}
                </Text>
            )}

            {showProvider && service.provider && (
                <View style={styles.providerContainer}>
                    <Ionicons name="business-outline" size={14} color={COLORS.gray[500]} />
                    <Text style={styles.providerText} numberOfLines={1}>
                        {service.provider.businessName}
                    </Text>
                </View>
            )}

            <View style={styles.footer}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Precio</Text>
                    <Text style={styles.price}>{formatPrice(service.price)}</Text>
                </View>
                <View style={styles.durationContainer}>
                    <Ionicons name="time-outline" size={16} color={COLORS.gray[500]} />
                    <Text style={styles.duration}>{formatDuration(service.duration)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        ...SHADOW.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: `${COLORS.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    headerInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: FONT_SIZE.base,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 2,
    },
    category: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray[500],
    },
    activeBadge: {
        width: 8,
        height: 8,
        marginLeft: SPACING.sm,
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.success,
    },
    description: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray[600],
        marginBottom: SPACING.md,
        lineHeight: 20,
    },
    providerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[200],
    },
    providerText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray[600],
        marginLeft: SPACING.xs,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[200],
    },
    priceContainer: {
        flex: 1,
    },
    priceLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray[500],
        marginBottom: 2,
    },
    price: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '700',
        color: COLORS.primary,
    },
    durationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray[100],
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
    },
    duration: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.gray[700],
        marginLeft: SPACING.xs,
    },
});
