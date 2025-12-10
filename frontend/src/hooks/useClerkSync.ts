'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

interface SyncStatus {
    isSynced: boolean;
    isLoading: boolean;
    error: string | null;
}

export function useClerkSync() {
    const { user, isLoaded: userLoaded } = useUser();
    const { getToken } = useAuth();
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        isSynced: false,
        isLoading: true,
        error: null,
    }); useEffect(() => {
        const syncUserWithBackend = async () => {
            if (!userLoaded) return;

            if (!user) {
                setSyncStatus({
                    isSynced: false,
                    isLoading: false,
                    error: null,
                });
                return;
            }

            try {
                setSyncStatus(prev => ({ ...prev, isLoading: true }));

                // Obtener token de Clerk
                const token = await getToken();

                if (!token) {
                    throw new Error('No se pudo obtener el token de autenticación');
                }

                // Obtener el rol desde localStorage (ya no usamos searchParams)
                const roleFromStorage = typeof window !== 'undefined' ? localStorage.getItem('selectedRole') : null;
                const role = roleFromStorage || 'CUSTOMER';

                // Sincronizar con backend
                const apiUrl = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL + '/api' || 'http://localhost:4000/api';
                const response = await fetch(`${apiUrl}/auth/clerk/sync-user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        clerkId: user.id,
                        userData: {
                            email: user.primaryEmailAddress?.emailAddress,
                            firstName: user.firstName || 'Usuario',
                            lastName: user.lastName || 'Nuevo',
                            phone: user.primaryPhoneNumber?.phoneNumber || null,
                            role: role, // Enviar el rol seleccionado
                        },
                    }),
                });

                if (!response.ok) {
                    throw new Error('Error al sincronizar usuario con el backend');
                }

                const data = await response.json();

                setSyncStatus({
                    isSynced: true,
                    isLoading: false,
                    error: null,
                });

                // Guardar datos en localStorage para uso offline
                localStorage.setItem('backendUser', JSON.stringify(data.user));
                // Limpiar el rol guardado
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('selectedRole');
                }
            } catch (error) {
                console.error('Error sincronizando usuario:', error);
                setSyncStatus({
                    isSynced: false,
                    isLoading: false,
                    error: error instanceof Error ? error.message : 'Error desconocido',
                });
            }
        };

        syncUserWithBackend();
    }, [user, userLoaded, getToken, searchParams]);

    return {
        user,
        isLoaded: userLoaded,
        ...syncStatus,
    };
}
