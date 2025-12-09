"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ModernNavbar } from "@/components/Navbar";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    Building2,
    FileText,
    Wrench,
    MessageSquare,
    Settings,
    Shield,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        description: "Vista general y estadísticas"
    },
    {
        title: "Usuarios",
        href: "/admin/users",
        icon: Users,
        description: "Gestionar usuarios"
    },
    {
        title: "Proveedores",
        href: "/admin/providers",
        icon: Building2,
        description: "Gestionar proveedores"
    },
    {
        title: "Solicitudes",
        href: "/admin/requests",
        icon: FileText,
        description: "Solicitudes de proveedor"
    },
    {
        title: "Servicios",
        href: "/admin/services",
        icon: Wrench,
        description: "Gestionar servicios"
    },
    {
        title: "Reseñas",
        href: "/admin/reviews",
        icon: MessageSquare,
        description: "Moderar reseñas"
    },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoaded, role } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        if (isLoaded && !hasChecked) {
            console.log('[AdminLayout] Auth check:', {
                isLoaded,
                hasUser: !!user,
                role,
                userEmail: user?.primaryEmailAddress?.emailAddress
            });

            // Verificar si el usuario es admin
            if (!user) {
                console.log('[AdminLayout] No user, redirecting to sign-in');
                setHasChecked(true);
                router.push("/sign-in");
                return;
            }

            // Esperar a que el rol se cargue antes de redirigir
            if (role === null) {
                console.log('[AdminLayout] Role is null, waiting for role to load...');
                return;
            }

            // Marcar que ya verificamos
            setHasChecked(true);

            if (role !== "ADMIN") {
                console.log('[AdminLayout] Not ADMIN role, redirecting to home. Current role:', role);
                router.push("/");
                return;
            }

            console.log('[AdminLayout] Access granted');
            setIsAuthorized(true);
        }
    }, [isLoaded, user, role, router, hasChecked]);

    if (!isLoaded || role === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
                    <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ModernNavbar />
            <div className="min-h-screen bg-gray-50 pt-16">
                {/* Main Content */}
                <main className="p-6 max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </>
    );
}
