import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useLocation } from '../hooks/useLocation';

interface HomeScreenProps {
    navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { location, loading: locationLoading, error: locationError } = useLocation();

    const categories = [
        { id: 'lavado', name: 'Lavado', icon: 'car' },
        { id: 'encerado', name: 'Encerado', icon: 'sparkles' },
        { id: 'detallado', name: 'Detallado', icon: 'diamond' },
        { id: 'mecanica', name: 'Mecánica', icon: 'construct' },
    ];

    const handleSearch = () => {
        if (!location) {
            Alert.alert('Error', 'No se pudo obtener tu ubicación');
            return;
        }

        if (!searchQuery.trim()) {
            Alert.alert('Error', 'Ingresa un término de búsqueda');
            return;
        }

        navigation.navigate('Results', {
            query: searchQuery,
            location: location,
        });
    };

    const handleCategoryPress = (category: any) => {
        if (!location) {
            Alert.alert('Error', 'No se pudo obtener tu ubicación');
            return;
        }

        navigation.navigate('Results', {
            category: category.id,
            location: location,
        });
    };

    if (locationLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Obteniendo tu ubicación...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.locationContainer}>
                        <Ionicons name="location" size={16} color={Colors.primary} />
                        <Text style={styles.locationText}>
                            {locationError ? 'Ubicación no disponible' : 'Tu ubicación actual'}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <Ionicons name="person-circle" size={32} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Welcome */}
                <View style={styles.welcomeContainer}>
                    <Text style={styles.welcomeTitle}>¡Hola!</Text>
                    <Text style={styles.welcomeSubtitle}>
                        Encuentra y compara los mejores servicios para tu vehículo
                    </Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Ionicons name="search" size={20} color={Colors.textSecondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar servicios..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                    </View>
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <Ionicons name="search" size={20} color={Colors.background} />
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsContainer}>
                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => navigation.navigate('Map')}
                    >
                        <Ionicons name="map" size={24} color={Colors.primary} />
                        <Text style={styles.quickActionText}>Mapa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => navigation.navigate('Favorites')}
                    >
                        <Ionicons name="heart" size={24} color={Colors.primary} />
                        <Text style={styles.quickActionText}>Favoritos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => navigation.navigate('History')}
                    >
                        <Ionicons name="time" size={24} color={Colors.primary} />
                        <Text style={styles.quickActionText}>Historial</Text>
                    </TouchableOpacity>
                </View>

                {/* Categories */}
                <View style={styles.categoriesContainer}>
                    <Text style={styles.sectionTitle}>Categorías populares</Text>
                    <View style={styles.categoriesGrid}>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={styles.categoryCard}
                                onPress={() => handleCategoryPress(category)}
                            >
                                <View style={styles.categoryIcon}>
                                    <Ionicons
                                        name={category.icon as any}
                                        size={32}
                                        color={Colors.primary}
                                    />
                                </View>
                                <Text style={styles.categoryName}>{category.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recent Searches */}
                <View style={styles.recentContainer}>
                    <Text style={styles.sectionTitle}>Búsquedas recientes</Text>
                    <TouchableOpacity style={styles.recentItem}>
                        <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                        <Text style={styles.recentText}>Lavado completo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.recentItem}>
                        <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                        <Text style={styles.recentText}>Encerado premium</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 20,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        marginLeft: 8,
        fontSize: 14,
        color: Colors.textSecondary,
    },
    welcomeContainer: {
        marginBottom: 30,
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 30,
        gap: 12,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: Colors.text,
    },
    searchButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 30,
        paddingVertical: 20,
        backgroundColor: Colors.surface,
        borderRadius: 16,
    },
    quickAction: {
        alignItems: 'center',
    },
    quickActionText: {
        marginTop: 8,
        fontSize: 12,
        color: Colors.text,
        fontWeight: '500',
    },
    categoriesContainer: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 16,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    categoryCard: {
        width: '47%',
        backgroundColor: Colors.surface,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    categoryIcon: {
        marginBottom: 12,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
        textAlign: 'center',
    },
    recentContainer: {
        marginBottom: 20,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    recentText: {
        marginLeft: 12,
        fontSize: 16,
        color: Colors.text,
    },
});

export default HomeScreen;