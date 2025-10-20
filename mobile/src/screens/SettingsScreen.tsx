import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface SettingsScreenProps {
    navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
    const [apiUrl, setApiUrl] = useState('10.0.2.2:4000');  // IP por defecto para emulador Android

    const testConnection = async () => {
        try {
            const response = await fetch(`http://${apiUrl}/health`);
            if (response.ok) {
                Alert.alert('Éxito', 'Conexión establecida correctamente');
            } else {
                Alert.alert('Error', 'No se pudo conectar al servidor');
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo conectar. Verifica la IP y que el backend esté ejecutándose');
        }
    };

    const getLocalIPInstructions = () => {
        Alert.alert(
            'Cómo obtener tu IP local',
            'Para Windows:\n1. Abre CMD\n2. Ejecuta: ipconfig\n3. Busca "Dirección IPv4"\n\nPara Mac/Linux:\n1. Abre Terminal\n2. Ejecuta: ifconfig\n3. Busca inet bajo tu conexión activa\n\nAsegúrate de que tu backend esté ejecutándose en el puerto 4000',
            [{ text: 'Entendido' }]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Configuración de API</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Configuración del Servidor</Text>
                <Text style={styles.description}>
                    Para que la app móvil se conecte al backend, necesitas usar la IP local de tu computadora.
                </Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>IP del servidor:</Text>
                    <TextInput
                        style={styles.input}
                        value={apiUrl}
                        onChangeText={setApiUrl}
                        placeholder="10.0.2.2:4000 (emulador) o 192.168.1.X:4000 (dispositivo)"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <TouchableOpacity style={styles.testButton} onPress={testConnection}>
                    <Ionicons name="wifi" size={20} color={Colors.background} />
                    <Text style={styles.testButtonText}>Probar conexión</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.helpButton} onPress={getLocalIPInstructions}>
                    <Ionicons name="help-circle-outline" size={20} color={Colors.primary} />
                    <Text style={styles.helpButtonText}>¿Cómo obtener mi IP local?</Text>
                </TouchableOpacity>

                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={24} color={Colors.warning} />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>Importante</Text>
                        <Text style={styles.infoText}>
                            • Asegúrate de que el backend esté ejecutándose{'\n'}
                            • Tu dispositivo y computadora deben estar en la misma red WiFi{'\n'}
                            • El firewall debe permitir conexiones al puerto 4000
                        </Text>
                    </View>
                </View>
            </View>
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 24,
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: Colors.text,
        backgroundColor: Colors.surface,
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 16,
    },
    testButtonText: {
        color: Colors.background,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    helpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primary,
        marginBottom: 24,
    },
    helpButtonText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: Colors.warning,
    },
    infoContent: {
        flex: 1,
        marginLeft: 12,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
});

export default SettingsScreen;