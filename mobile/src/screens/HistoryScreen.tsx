import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface HistoryScreenProps {
    navigation: any;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
    const recentSearches = [
        { id: 1, query: 'Lavado completo', date: '2025-10-05', results: 12 },
        { id: 2, query: 'Encerado premium', date: '2025-10-04', results: 8 },
        { id: 3, query: 'Detallado interior', date: '2025-10-03', results: 15 },
    ];

    const handleSearchAgain = (query: string) => {
        navigation.navigate('Results', {
            query: query,
            // Nota: En una implementación real, aquí necesitarías la ubicación actual
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Historial</Text>
                <TouchableOpacity>
                    <Ionicons name="trash-outline" size={24} color={Colors.error} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Búsquedas recientes</Text>

                {recentSearches.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="time-outline" size={64} color={Colors.textSecondary} />
                        <Text style={styles.emptyTitle}>Sin historial</Text>
                        <Text style={styles.emptySubtitle}>
                            Tus búsquedas recientes aparecerán aquí
                        </Text>
                    </View>
                ) : (
                    recentSearches.map((search) => (
                        <TouchableOpacity
                            key={search.id}
                            style={styles.searchItem}
                            onPress={() => handleSearchAgain(search.query)}
                        >
                            <View style={styles.searchIconContainer}>
                                <Ionicons name="time" size={20} color={Colors.textSecondary} />
                            </View>

                            <View style={styles.searchInfo}>
                                <Text style={styles.searchQuery}>{search.query}</Text>
                                <Text style={styles.searchMeta}>
                                    {search.results} resultados • {search.date}
                                </Text>
                            </View>

                            <TouchableOpacity style={styles.searchAgainButton}>
                                <Ionicons name="refresh" size={20} color={Colors.primary} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
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
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginTop: 20,
        marginBottom: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    searchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 8,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchIconContainer: {
        marginRight: 12,
    },
    searchInfo: {
        flex: 1,
    },
    searchQuery: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text,
        marginBottom: 4,
    },
    searchMeta: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    searchAgainButton: {
        padding: 8,
    },
});

export default HistoryScreen;