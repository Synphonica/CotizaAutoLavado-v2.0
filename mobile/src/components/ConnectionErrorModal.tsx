import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface ConnectionErrorModalProps {
    visible: boolean;
    onClose: () => void;
    onOpenSettings: () => void;
}

const ConnectionErrorModal: React.FC<ConnectionErrorModalProps> = ({
    visible,
    onClose,
    onOpenSettings,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="wifi-outline" size={48} color={Colors.error} />
                    </View>

                    <Text style={styles.title}>Error de conexión</Text>
                    <Text style={styles.message}>
                        No se pudo conectar al servidor. Esto puede deberse a:
                    </Text>

                    <View style={styles.reasonsList}>
                        <Text style={styles.reasonItem}>• El backend no está ejecutándose</Text>
                        <Text style={styles.reasonItem}>• La IP configurada es incorrecta</Text>
                        <Text style={styles.reasonItem}>• No estás en la misma red WiFi</Text>
                        <Text style={styles.reasonItem}>• El firewall bloquea la conexión</Text>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.settingsButton} onPress={onOpenSettings}>
                            <Ionicons name="settings" size={20} color={Colors.background} />
                            <Text style={styles.settingsText}>Configurar IP</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modal: {
        backgroundColor: Colors.background,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    iconContainer: {
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 22,
    },
    reasonsList: {
        marginBottom: 24,
    },
    reasonItem: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 8,
        lineHeight: 18,
    },
    actions: {
        gap: 12,
    },
    settingsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    settingsText: {
        color: Colors.background,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    closeButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    closeText: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
});

export default ConnectionErrorModal;