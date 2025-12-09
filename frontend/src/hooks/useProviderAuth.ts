'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Provider {
    id: string;
    businessName: string;
    email: string;
    status: string;
}

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

export function useProviderAuth() {
    const router = useRouter();
    const [provider, setProvider] = useState<Provider | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('userRole');

            if (!token || userRole !== 'PROVIDER') {
                setLoading(false);
                return;
            }

            // Obtener perfil del usuario
            const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api'}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!userResponse.ok) {
                throw new Error('No autorizado');
            }

            const userData = await userResponse.json();
            setUser(userData.user);

            // Obtener datos del proveedor
            const providerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api'}/providers/my-provider`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }); if (providerResponse.ok) {
                const providerData = await providerResponse.json();
                setProvider(providerData);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error al verificar autenticación:', err);
            setError(err instanceof Error ? err.message : 'Error de autenticación');
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api'}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al iniciar sesión');
            }

            const { accessToken, user } = await response.json();

            if (user.role !== 'PROVIDER') {
                throw new Error('Esta cuenta no es de proveedor');
            }

            localStorage.setItem('token', accessToken);
            localStorage.setItem('userRole', 'PROVIDER');
            localStorage.setItem('userId', user.id);

            await checkAuth();
            return { success: true };
        } catch (err) {
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        setProvider(null);
        setUser(null);
        router.push('/provider/login');
    };

    const register = async (userData: any) => {
        try {
            // 1. Registrar usuario
            const registerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api'}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...userData,
                    role: 'PROVIDER',
                }),
            });

            if (!registerResponse.ok) {
                const error = await registerResponse.json();
                throw new Error(error.message || 'Error al registrar');
            }

            const { accessToken } = await registerResponse.json();

            // 2. Crear perfil de proveedor
            const providerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api'}/providers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(userData.providerData),
            });

            if (!providerResponse.ok) {
                const error = await providerResponse.json();
                throw new Error(error.message || 'Error al crear perfil');
            }

            localStorage.setItem('token', accessToken);
            localStorage.setItem('userRole', 'PROVIDER');

            await checkAuth();
            return { success: true };
        } catch (err) {
            throw err;
        }
    };

    return {
        provider,
        user,
        loading,
        error,
        login,
        logout,
        register,
        checkAuth,
        isAuthenticated: !!user && !!provider,
    };
}
