"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ModernNavbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { motion } from "framer-motion";
import {
    Heart,
    Star,
    MapPin,
    DollarSign,
    TrendingDown,
    Trash2,
    GitCompare,
    CheckCircle,
    ExternalLink,
    Calendar,
} from "lucide-react";
import { apiGet, apiDelete, apiPost } from "@/lib/api";

interface FavoriteService {
    id: string;
    serviceId: string;
    serviceName: string;
    providerName: string;
    price: number;
    rating: number;
    reviewCount: number;
    distance?: number;
    discount?: number;
    city: string;
    imageUrl?: string;
    addedAt: string;
}

export default function FavoritesPage() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();
    const [favorites, setFavorites] = useState<FavoriteService[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            loadFavorites();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadFavorites = async () => {
        try {
            setLoading(true);

            const token = await getToken();
            if (!token) {
                console.error("No token available");
                setLoading(false);
                return;
            }

            const data = await apiGet<FavoriteService[]>("/favorites", { token });
            setFavorites(data);
        } catch (error) {
            console.error("Error loading favorites:", error);
            // Si el backend no está listo, mostrar array vacío en lugar de error
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (favoriteId: string) => {
        try {
            const token = await getToken();
            await apiDelete(`/favorites/${favoriteId}`, { token });
            setFavorites(favorites.filter(f => f.id !== favoriteId));
            setSelectedForCompare(selectedForCompare.filter(id => id !== favoriteId));
        } catch (error) {
            console.error("Error removing favorite:", error);
        }
    };

    const toggleCompareSelection = (serviceId: string) => {
        if (selectedForCompare.includes(serviceId)) {
            setSelectedForCompare(selectedForCompare.filter(id => id !== serviceId));
        } else if (selectedForCompare.length < 4) {
            setSelectedForCompare([...selectedForCompare, serviceId]);
        } else {
            alert("Solo puedes comparar hasta 4 servicios a la vez");
        }
    };

    const handleCompare = () => {
        if (selectedForCompare.length < 2) {
            alert("Selecciona al menos 2 servicios para comparar");
            return;
        }
        router.push(`/compare?services=${selectedForCompare.join(",")}`);
    };

    const FavoriteCard = ({ favorite }: { favorite: FavoriteService }) => {
        const isSelected = selectedForCompare.includes(favorite.serviceId);

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Card className={`hover:shadow-lg transition-all ${isSelected ? "ring-2 ring-blue-500" : ""}`}>
                    <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{favorite.serviceName}</h3>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {favorite.providerName} • {favorite.city}
                                </p>
                            </div>
                            <button
                                onClick={() => handleRemoveFavorite(favorite.id)}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            >
                                <Heart className="h-5 w-5 fill-current" />
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium text-gray-900">
                                    {favorite.rating}
                                </span>
                                <span className="text-xs text-gray-500">({favorite.reviewCount})</span>
                            </div>

                            {favorite.distance && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm text-gray-700">{favorite.distance} km</span>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-semibold text-gray-900">
                                    ${favorite.price.toLocaleString("es-CL")}
                                </span>
                            </div>

                            {favorite.discount && (
                                <div className="flex items-center gap-2">
                                    <TrendingDown className="h-4 w-4 text-orange-500" />
                                    <Badge variant="destructive" className="bg-orange-500">
                                        -{favorite.discount}%
                                    </Badge>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t">
                            <Button
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                className="flex-1"
                                onClick={() => toggleCompareSelection(favorite.serviceId)}
                            >
                                {isSelected ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Seleccionado
                                    </>
                                ) : (
                                    <>
                                        <GitCompare className="h-4 w-4 mr-2" />
                                        Comparar
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/services/${favorite.serviceId}`)}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/booking?service=${favorite.serviceId}`)}
                            >
                                <Calendar className="h-4 w-4 mr-2" />
                                Reservar
                            </Button>
                        </div>

                        {/* Added Date */}
                        <p className="text-xs text-gray-500 mt-3 text-center">
                            Agregado el {new Date(favorite.addedAt).toLocaleDateString("es-CL")}
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    return (
        <ProtectedRoute>
            <ModernNavbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Favoritos</h1>
                                <p className="text-gray-600">
                                    {favorites.length} {favorites.length === 1 ? "servicio guardado" : "servicios guardados"}
                                </p>
                            </div>

                            {selectedForCompare.length >= 2 && (
                                <Button onClick={handleCompare} size="lg" className="gap-2">
                                    <GitCompare className="h-5 w-5" />
                                    Comparar {selectedForCompare.length} Servicios
                                </Button>
                            )}
                        </div>
                    </motion.div>

                    {/* Stats Cards */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                    >
                        <Card className="bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Favoritos</p>
                                        <p className="text-3xl font-bold text-pink-600">{favorites.length}</p>
                                    </div>
                                    <Heart className="h-10 w-10 text-pink-600 fill-current" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Precio Promedio</p>
                                        <p className="text-3xl font-bold text-blue-600">
                                            ${Math.round(favorites.reduce((sum, f) => sum + f.price, 0) / favorites.length || 0).toLocaleString("es-CL")}
                                        </p>
                                    </div>
                                    <DollarSign className="h-10 w-10 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Rating Promedio</p>
                                        <p className="text-3xl font-bold text-yellow-600">
                                            {(favorites.reduce((sum, f) => sum + f.rating, 0) / favorites.length || 0).toFixed(1)}
                                        </p>
                                    </div>
                                    <Star className="h-10 w-10 text-yellow-600 fill-current" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Favorites Grid */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-600 mt-4">Cargando favoritos...</p>
                            </div>
                        ) : favorites.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        No tienes servicios favoritos
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Explora servicios de lavado y guarda tus favoritos para acceder rápidamente
                                    </p>
                                    <Button onClick={() => router.push("/results")}>
                                        Buscar Servicios
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {favorites.map((favorite) => (
                                    <FavoriteCard key={favorite.id} favorite={favorite} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
