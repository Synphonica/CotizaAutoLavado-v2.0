"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleRedirectProps {
    children: React.ReactNode;
    redirectRoles?: {
        ADMIN?: string;
        PROVIDER?: string;
        CUSTOMER?: string;
    };
}

/**
 * Componente que redirige automáticamente según el rol del usuario
 * Útil para la página principal que debe redirigir a diferentes dashboards
 */
export function RoleRedirect({ children, redirectRoles }: RoleRedirectProps) {
    const { role, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && role && redirectRoles) {
            const redirectPath = redirectRoles[role];
            if (redirectPath) {
                router.push(redirectPath);
            }
        }
    }, [role, isLoading, redirectRoles, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return <>{children}</>;
}

/**
 * Hook para obtener la ruta del dashboard según el rol
 */
export function useRoleDashboard() {
    const { role } = useAuth();

    const getDashboardPath = () => {
        switch (role) {
            case 'ADMIN':
                return '/admin';
            case 'PROVIDER':
                return '/provider/dashboard';
            case 'CUSTOMER':
            default:
                return '/';
        }
    };

    return getDashboardPath();
}
