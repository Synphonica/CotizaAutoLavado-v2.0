"use client";

import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Loader2, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback,
  allowedRoles,
  redirectTo = "/"
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      console.log('[ProtectedRoute] Auth check:', { isAuthenticated, role, allowedRoles });

      // Si no está autenticado, redirigir a login
      if (!isAuthenticated) {
        console.log('[ProtectedRoute] Not authenticated, redirecting to sign-in');
        router.push("/sign-in");
        return;
      }

      // Si se especificaron roles permitidos, verificar
      if (allowedRoles) {
        if (!role) {
          console.log('[ProtectedRoute] Role is null, waiting...');
          return; // Esperar a que el rol se cargue
        }

        if (!allowedRoles.includes(role)) {
          console.log('[ProtectedRoute] Role not allowed. User role:', role, 'Allowed:', allowedRoles);
          router.push(redirectTo);
          return;
        }
      }

      console.log('[ProtectedRoute] Access granted');
      setIsAuthorized(true);
    }
  }, [isLoading, isAuthenticated, role, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verificando acceso...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-semibold mb-2">Acceso requerido</h1>
          <p className="text-gray-600">Necesitas iniciar sesión para acceder a esta página.</p>
        </motion.div>
      </div>
    );
  }

  // Si se requieren roles específicos pero aún no se ha autorizado, mostrar loading
  if (!isAuthorized && allowedRoles && !role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando permisos...</p>
        </motion.div>
      </div>
    );
  }

  // Si el rol ya se cargó pero no está autorizado, mostrar denegado
  if (!isAuthorized && allowedRoles && role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md p-8"
        >
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta sección.
          </p>
          <button
            onClick={() => router.push(redirectTo)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * HOC para proteger rutas de admin
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']} redirectTo="/">
      {children}
    </ProtectedRoute>
  );
}

/**
 * HOC para proteger rutas de proveedor
 */
export function ProviderRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['PROVIDER']} redirectTo="/">
      {children}
    </ProtectedRoute>
  );
}

/**
 * HOC para proteger rutas que requieren autenticación (cualquier rol)
 */
export function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'PROVIDER', 'ADMIN']} redirectTo="/sign-in">
      {children}
    </ProtectedRoute>
  );
}

