"use client";

import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut } = useClerkAuth();
  const router = useRouter();

  const isAuthenticated = userLoaded && !!user;
  const isLoading = !userLoaded;

  const logout = async () => {
    try {
      await signOut();
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
    isAuthenticated,
    isLoading,
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
