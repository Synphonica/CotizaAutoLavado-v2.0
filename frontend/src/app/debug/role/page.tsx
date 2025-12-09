"use client";

import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield, User, Building2, UserCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function RoleCheckPage() {
    const { role, isLoading, isAuthenticated } = useAuth();
    const { user } = useUser();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            No Autenticado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">
                            Debes iniciar sesión para ver esta información.
                        </p>
                        <Link href="/sign-in">
                            <Button className="w-full">Iniciar Sesión</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const roleIcon = {
        'ADMIN': Shield,
        'PROVIDER': Building2,
        'CUSTOMER': User,
    };

    const roleColor = {
        'ADMIN': 'bg-purple-500',
        'PROVIDER': 'bg-blue-500',
        'CUSTOMER': 'bg-green-500',
    };

    const RoleIcon = role ? roleIcon[role] : UserCircle;
    const color = role ? roleColor[role] : 'bg-gray-500';

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Estado de Autenticación
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Usuario:</span>
                            <span className="text-sm">{user.id}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Email:</span>
                            <span className="text-sm">{user.primaryEmailAddress?.emailAddress}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Nombre:</span>
                            <span className="text-sm">{user.firstName} {user.lastName}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RoleIcon className="h-5 w-5" />
                            Rol Actual
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Rol Detectado:</span>
                            <Badge className={`${color} text-white px-4 py-2 text-lg`}>
                                {role || 'Sin rol'}
                            </Badge>
                        </div>

                        <div className="border-t pt-4">
                            <p className="text-sm font-medium text-gray-600 mb-2">
                                Metadata de Clerk:
                            </p>
                            <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
                                {JSON.stringify(user.publicMetadata, null, 2)}
                            </pre>
                        </div>

                        <div className="border-t pt-4">
                            <p className="text-sm font-medium text-gray-600 mb-3">
                                Accesos Disponibles:
                            </p>
                            <div className="space-y-2">
                                {role === 'ADMIN' && (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-sm">Panel de Administrador</span>
                                    </div>
                                )}
                                {role === 'PROVIDER' && (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-sm">Panel de Proveedor</span>
                                    </div>
                                )}
                                {role === 'CUSTOMER' && (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-sm">Vista de Cliente</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Navegación Rápida</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/">
                            <Button variant="outline" className="w-full">
                                Inicio
                            </Button>
                        </Link>
                        {role === 'ADMIN' && (
                            <Link href="/admin">
                                <Button variant="default" className="w-full">
                                    Panel Admin
                                </Button>
                            </Link>
                        )}
                        {role === 'PROVIDER' && (
                            <Link href="/provider/dashboard">
                                <Button variant="default" className="w-full">
                                    Panel Proveedor
                                </Button>
                            </Link>
                        )}
                        <Link href="/sign-out">
                            <Button variant="destructive" className="w-full">
                                Cerrar Sesión
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <h3 className="font-semibold mb-2">ℹ️ Información</h3>
                        <p className="text-sm text-gray-600">
                            Esta página muestra tu rol actual y los permisos asociados.
                            El rol se obtiene de Clerk <code className="bg-white px-1 py-0.5 rounded">publicMetadata.role</code>.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
