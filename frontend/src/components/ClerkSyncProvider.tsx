'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

/**
 * Componente para sincronizar automáticamente usuarios de Clerk con Supabase
 * Se ejecuta cuando el usuario inicia sesión
 */
export function ClerkSyncProvider({ children }: { children: React.ReactNode }) {
    const { isSignedIn, userId } = useAuth();
    const { user } = useUser();

    useEffect(() => {
        if (isSignedIn && user && userId) {
            syncUserWithBackend();
        }
    }, [isSignedIn, user, userId]);

    const syncUserWithBackend = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/clerk/sync-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clerkId: userId,
                    userData: {
                        email: user?.emailAddresses[0]?.emailAddress,
                        firstName: user?.firstName || 'Usuario',
                        lastName: user?.lastName || 'Nuevo',
                        phone: user?.phoneNumbers[0]?.phoneNumber || null,
                        role: user?.publicMetadata?.role || 'CUSTOMER',
                    },
                }),
            });

            if (response.ok) {
                console.log('✅ Usuario sincronizado con Supabase');
            } else {
                console.error('❌ Error al sincronizar usuario:', await response.text());
            }
        } catch (error) {
            console.error('❌ Error en sincronización:', error);
        }
    };

    return <>{children}</>;
}
