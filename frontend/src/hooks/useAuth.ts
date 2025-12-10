"use client";

import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { apiPost } from '@/lib/api';

type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN' | null;

export function useAuth() {
  // Check if Clerk is available
  let user: any = null;
  let userLoaded = true;
  let signOut: any = null;
  let getToken: any = null;

  try {
    const clerkUser = useUser();
    const clerkAuth = useClerkAuth();
    user = clerkUser.user;
    userLoaded = clerkUser.isLoaded;
    signOut = clerkAuth.signOut;
    getToken = clerkAuth.getToken;
  } catch (error) {
    // ClerkProvider not available (e.g., during SSR or missing keys)
    console.log('[useAuth] Clerk not available:', error);
  }

  const router = useRouter();
  const [role, setRole] = useState<UserRole>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const isAuthenticated = userLoaded && !!user;
  const isLoading = !userLoaded || roleLoading;

  // Función para sincronizar rol desde el backend
  const syncRoleFromBackend = useCallback(async () => {
    if (!user || !getToken) return null;

    try {
      const token = await getToken();
      if (!token) return null;

      console.log('[useAuth] Syncing role from backend...');

      const response = await apiPost<{ role: string; user: any }>('/auth/clerk/sync-user', {
        clerkId: user.id,
        userData: {
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.primaryPhoneNumber?.phoneNumber || null,
        }
      }, { token });

      if (response && response.user?.role) {
        console.log('[useAuth] Role synced from backend:', response.user.role);

        // Retornar el rol inmediatamente, el backend ya actualizó Clerk
        return response.user.role as UserRole;
      }

      return null;
    } catch (error) {
      console.error('[useAuth] Error syncing role from backend:', error);
      // No mostrar error al usuario, solo loggear
      return null;
    }
  }, [user, getToken, role]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setRoleLoading(false);
        return;
      }

      try {
        // Obtener el rol desde publicMetadata de Clerk
        const clerkRole = user.publicMetadata?.role as string;

        console.log('[useAuth] User loaded:', user.id);
        console.log('[useAuth] Email:', user.primaryEmailAddress?.emailAddress);
        console.log('[useAuth] Public metadata:', user.publicMetadata);
        console.log('[useAuth] Role from Clerk:', clerkRole);

        if (clerkRole && ['ADMIN', 'PROVIDER', 'CUSTOMER'].includes(clerkRole)) {
          console.log('[useAuth] Setting role to:', clerkRole);
          setRole(clerkRole as UserRole);
        } else {
          // Si no hay rol válido, intentar sincronizar desde el backend
          console.warn('[useAuth] No valid role in metadata, syncing from backend...');
          const backendRole = await syncRoleFromBackend();

          if (backendRole) {
            setRole(backendRole);
          } else {
            setRole('CUSTOMER');
          }
        }
      } catch (error) {
        console.error('[useAuth] Error fetching user role:', error);
        setRole('CUSTOMER');
      } finally {
        setRoleLoading(false);
      }
    };

    fetchUserRole();
  }, [user, syncRoleFromBackend]);

  const logout = async () => {
    try {
      if (signOut) {
        await signOut();
      }
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const redirectToSignIn = () => {
    router.push('/sign-in');
  };

  const redirectToSignUp = () => {
    router.push('/sign-up');
  };

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
    isLoaded: userLoaded,
    logout,
    redirectToSignIn,
    redirectToSignUp,
  };
}

// Hook para proteger rutas
export function useRequireAuth() {
  const { isAuthenticated, isLoading, redirectToSignIn } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirectToSignIn();
    }
  }, [isAuthenticated, isLoading, redirectToSignIn]);

  return { isAuthenticated, isLoading };
}
