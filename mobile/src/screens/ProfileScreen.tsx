import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface ProfileScreenProps {
    navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    const menuItems = [
        {
            id: 'favorites',
            title: 'Favoritos',
            icon: 'heart-outline',
            onPress: () => navigation.navigate('Favorites'),
        },
        {
            id: 'history',
            title: 'Historial de búsquedas',
            icon: 'time-outline',
            onPress: () => navigation.navigate('History'),
        },
        {
            id: 'notifications',
            title: 'Notificaciones',
            icon: 'notifications-outline',
            onPress: () => { },
        },
        {
            id: 'settings',
            title: 'Configuración',
            icon: 'settings-outline',
            onPress: () => navigation.navigate('Settings'),
        },
        {
            id: 'help',
            title: 'Ayuda y soporte',
            icon: 'help-circle-outline',
            onPress: () => { },
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Perfil</Text>
                </View>

                {/* Profile Info */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https://via.placeholder.com/80x80/2563EB/FFFFFF?text=U' }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editAvatarButton}>
                            <Ionicons name="camera" size={16} color={Colors.background} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.userName}>Usuario</Text>
                    <Text style={styles.userEmail}>usuario@email.com</Text>

                    <TouchableOpacity style={styles.editProfileButton}>
                        <Text style={styles.editProfileText}>Editar perfil</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={styles.statsSection}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>Búsquedas</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>5</Text>
                        <Text style={styles.statLabel}>Favoritos</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>3</Text>
                        <Text style={styles.statLabel}>Reseñas</Text>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={item.onPress}
                        >
                            <View style={styles.menuItemLeft}>
                                <Ionicons
                                    name={item.icon as any}
                                    size={24}
                                    color={Colors.textSecondary}
                                />
                                <Text style={styles.menuItemText}>{item.title}</Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors.textSecondary}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* App Info */}
                <View style={styles.appInfoSection}>
                    <Text style={styles.appName}>Alto Carwash</Text>
                    <Text style={styles.appVersion}>Versión 1.0.0</Text>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color={Colors.error} />
                    <Text style={styles.logoutText}>Cerrar sesión</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.background,
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 20,
    },
    editProfileButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    editProfileText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '500',
    },
    statsSection: {
        flexDirection: 'row',
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: Colors.surface,
        marginHorizontal: 20,
        borderRadius: 12,
        marginBottom: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: Colors.border,
        marginHorizontal: 20,
    },
    menuSection: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        marginLeft: 16,
        fontSize: 16,
        color: Colors.text,
    },
    appInfoSection: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    appName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
        marginBottom: 4,
    },
    appVersion: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginHorizontal: 20,
        marginBottom: 30,
        borderRadius: 8,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.error,
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 16,
        color: Colors.error,
        fontWeight: '500',
    },
});

export default ProfileScreen;