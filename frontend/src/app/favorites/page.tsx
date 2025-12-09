"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ModernNavbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceCard, ServiceItem } from "@/components/ServiceCard";
import {
    Heart,
    HeartOff,
    Trash2,
    Star,
    MapPin,
    Clock,
    Filter,
    SortAsc,
    Grid,
    List
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { apiGet, apiDelete } from "@/lib/api";
import { SearchResultsSkeleton } from "@/components/ui/loading-skeletons";

// Mock favorites data
const mockFavorites: ServiceItem[] = [
    {
        id: "1",
        name: "Lavado Exterior Premium",
        price: 15000,
        provider: {
            id: "p1",
            businessName: "AutoClean Pro",
            city: "Providencia",
        },
        rating: 4.8,
        discount: 20,
        duration: 45,
        description: "Lavado exterior completo con productos premium",
        category: "exterior"
    },
    {
        id: "2",
        name: "Detailing Completo",
        price: 45000,
        provider: {
            id: "p2",
            businessName: "DetailMaster",
            city: "Las Condes",
        },
        rating: 4.9,
        duration: 180,
        description: "Servicio de detailing profesional interior y exterior",
        category: "detailing"
    },
    {
        id: "3",
        name: "Lavado Express",
        price: 8000,
        provider: {
            id: "p3",
            businessName: "Quick Shine",
            city: "Ñuñoa",
        },
        rating: 4.5,
        duration: 20,
        description: "Lavado rápido exterior para cuando tienes poco tiempo",
        category: "express"
    },
];

export default function FavoritesPage() {
    const { user, isLoaded } = useUser();
    const [favorites, setFavorites] = useState<ServiceItem[]>(mockFavorites);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'recent' | 'price' | 'rating'>('recent');

    useEffect(() => {
        // Simular carga de favoritos
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const removeFromFavorites = (serviceId: string) => {
        setFavorites(prev => prev.filter(f => f.id !== serviceId));
    };

    const clearAllFavorites = () => {
        if (confirm('¿Estás seguro de que quieres eliminar todos los favoritos?')) {
            setFavorites([]);
        }
    };

    const sortedFavorites = [...favorites].sort((a, b) => {
        switch (sortBy) {
            case 'price':
                return a.price - b.price;
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            default:
                return 0;
        }
    });

    if (!isLoaded) {
        return (
            <>
                <ModernNavbar />
                <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white lg:ml-72 transition-all duration-300 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F9D58]"></div>
                </div>
            </>
        );
    }

    if (!user) {
        return (
            <>
                <ModernNavbar />
                <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white lg:ml-72 transition-all duration-300 flex items-center justify-center">
                    <Card className="max-w-md mx-auto">
                        <CardContent className="p-8 text-center">
                            <HeartOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Inicia sesión</h2>
                            <p className="text-gray-600 mb-6">Debes iniciar sesión para ver tus favoritos</p>
                            <Button
                                onClick={() => window.location.href = '/sign-in'}
                                className="bg-[#0F9D58] hover:bg-[#0F9D58]/90"
                            >
                                Iniciar sesión
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <ModernNavbar />
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-100 rounded-xl">
                                    <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-[#073642]">Mis Favoritos</h1>
                                    <p className="text-[#073642]/60">{favorites.length} servicios guardados</p>
                                </div>
                            </div>

                            {favorites.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={clearAllFavorites}
                                    className="text-red-500 border-red-200 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar todos
                                </Button>
                            )}
                        </div>

                        {/* Controls */}
                        {favorites.length > 0 && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Ordenar por:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as 'recent' | 'price' | 'rating')}
                                        className="px-3 py-1.5 rounded-lg border border-emerald-200 text-sm focus:ring-2 focus:ring-[#0F9D58] focus:border-[#0F9D58]"
                                    >
                                        <option value="recent">Más recientes</option>
                                        <option value="price">Precio (menor a mayor)</option>
                                        <option value="rating">Mejor valorados</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className={viewMode === 'grid' ? 'bg-[#0F9D58] hover:bg-[#0F9D58]/90' : 'border-emerald-200'}
                                    >
                                        <Grid className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className={viewMode === 'list' ? 'bg-[#0F9D58] hover:bg-[#0F9D58]/90' : 'border-emerald-200'}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Content */}
                    {loading ? (
                        <SearchResultsSkeleton count={6} />
                    ) : favorites.length === 0 ? (
                        <Card className="border-emerald-100">
                            <CardContent className="p-12 text-center">
                                <HeartOff className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                                    No tienes favoritos aún
                                </h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    Explora servicios y haz clic en el corazón para guardarlos aquí
                                </p>
                                <Button
                                    onClick={() => window.location.href = '/results'}
                                    className="bg-[#0F9D58] hover:bg-[#0F9D58]/90"
                                >
                                    Explorar servicios
                                </Button>
                            </CardContent>
                        </Card>
                    ) : viewMode === 'grid' ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedFavorites.map((service, index) => (
                                <motion.div
                                    key={service.id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative group"
                                >
                                    <ServiceCard item={service} index={index} />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFromFavorites(service.id)}
                                        className="absolute top-4 right-4 h-10 w-10 p-0 bg-white/90 hover:bg-red-50 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedFavorites.map((service, index) => (
                                <motion.div
                                    key={service.id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="border-emerald-100 hover:shadow-lg transition-all">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-xl flex items-center justify-center">
                                                    <Star className="h-10 w-10 text-[#0F9D58]" />
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-[#073642]">{service.name}</h3>
                                                            <p className="text-sm text-gray-500">{service.provider.businessName}</p>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <span className="flex items-center gap-1 text-sm text-gray-500">
                                                                    <MapPin className="h-3 w-3" />
                                                                    {service.provider.city}
                                                                </span>
                                                                {service.duration && (
                                                                    <span className="flex items-center gap-1 text-sm text-gray-500">
                                                                        <Clock className="h-3 w-3" />
                                                                        {service.duration} min
                                                                    </span>
                                                                )}
                                                                {service.rating && (
                                                                    <span className="flex items-center gap-1 text-sm">
                                                                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                                                        {service.rating}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-[#0F9D58]">
                                                                ${service.price.toLocaleString()}
                                                            </p>
                                                            {service.discount && (
                                                                <Badge className="bg-red-100 text-red-600">
                                                                    -{service.discount}%
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        onClick={() => window.location.href = `/services/${service.id}`}
                                                        className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642]"
                                                    >
                                                        Ver detalles
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => removeFromFavorites(service.id)}
                                                        className="border-red-200 text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
