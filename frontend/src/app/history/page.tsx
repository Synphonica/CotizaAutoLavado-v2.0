"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ModernNavbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceCard, ServiceItem } from "@/components/ServiceCard";
import Link from "next/link";
import {
    History,
    Clock,
    Trash2,
    Star,
    MapPin,
    Calendar,
    Eye,
    Search,
    Filter
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { SearchResultsSkeleton } from "@/components/ui/loading-skeletons";

interface HistoryItem {
    service: ServiceItem;
    viewedAt: string;
}

// Guardar historial en localStorage
const HISTORY_KEY = 'alto_carwash_history';

export const addToHistory = (service: ServiceItem) => {
    if (typeof window === 'undefined') return;

    const history = getHistory();

    // Remover si ya existe para evitar duplicados
    const filtered = history.filter(item => item.service.id !== service.id);

    // Agregar al inicio
    const newHistory: HistoryItem[] = [
        { service, viewedAt: new Date().toISOString() },
        ...filtered
    ].slice(0, 50); // Máximo 50 items

    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
};

export const getHistory = (): HistoryItem[] => {
    if (typeof window === 'undefined') return [];

    try {
        const data = localStorage.getItem(HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

export const clearHistory = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(HISTORY_KEY);
};

export const removeFromHistory = (serviceId: string) => {
    if (typeof window === 'undefined') return;

    const history = getHistory();
    const filtered = history.filter(item => item.service.id !== serviceId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
};

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Hace un momento";
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    return date.toLocaleDateString('es-CL');
};

const groupByDate = (items: HistoryItem[]): { [key: string]: HistoryItem[] } => {
    const groups: { [key: string]: HistoryItem[] } = {};

    items.forEach(item => {
        const date = new Date(item.viewedAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let key: string;
        if (date.toDateString() === today.toDateString()) {
            key = 'Hoy';
        } else if (date.toDateString() === yesterday.toDateString()) {
            key = 'Ayer';
        } else {
            key = date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
        }

        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
    });

    return groups;
};

export default function HistoryPage() {
    const { user, isLoaded } = useUser();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        // Cargar historial desde localStorage
        const loadHistory = () => {
            const data = getHistory();
            setHistory(data);
            setLoading(false);
        };

        loadHistory();

        // Escuchar cambios en localStorage
        const handleStorage = () => loadHistory();
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const handleClearHistory = () => {
        if (confirm('¿Estás seguro de que quieres borrar todo el historial?')) {
            clearHistory();
            setHistory([]);
        }
    };

    const handleRemoveItem = (serviceId: string) => {
        removeFromHistory(serviceId);
        setHistory(prev => prev.filter(item => item.service.id !== serviceId));
    };

    const filteredHistory = history.filter(item =>
        item.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.service.provider.businessName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedHistory = groupByDate(filteredHistory);

    if (!isLoaded || loading) {
        return (
            <>
                <ModernNavbar />
                <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white lg:ml-72 transition-all duration-300 p-8">
                    <SearchResultsSkeleton count={6} />
                </div>
            </>
        );
    }

    return (
        <>
            <ModernNavbar />
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-[#0F9D58]/10 rounded-xl">
                                    <History className="h-8 w-8 text-[#0F9D58]" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-[#073642]">Historial</h1>
                                    <p className="text-[#073642]/60">
                                        {history.length} {history.length === 1 ? 'servicio visto' : 'servicios vistos'}
                                    </p>
                                </div>
                            </div>

                            {history.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={handleClearHistory}
                                    className="text-red-500 border-red-200 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Borrar historial
                                </Button>
                            )}
                        </div>

                        {/* Search */}
                        {history.length > 0 && (
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar en el historial..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-[#0F9D58] focus:border-[#0F9D58] outline-none"
                                />
                            </div>
                        )}
                    </motion.div>

                    {/* Content */}
                    {history.length === 0 ? (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                        >
                            <Card className="border-emerald-100">
                                <CardContent className="p-12 text-center">
                                    <Eye className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                                        No hay historial aún
                                    </h3>
                                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                        Aquí aparecerán los servicios que vayas viendo. Explora autolavados para empezar.
                                    </p>
                                    <Link href="/results">
                                        <Button className="bg-[#0F9D58] hover:bg-[#0F9D58]/90">
                                            <Search className="h-4 w-4 mr-2" />
                                            Explorar servicios
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : filteredHistory.length === 0 ? (
                        <Card className="border-emerald-100">
                            <CardContent className="p-12 text-center">
                                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No se encontraron resultados
                                </h3>
                                <p className="text-gray-600">
                                    No hay servicios que coincidan con "{searchQuery}"
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(groupedHistory).map(([date, items], groupIndex) => (
                                <motion.div
                                    key={date}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: groupIndex * 0.1 }}
                                >
                                    <h2 className="text-lg font-semibold text-[#073642] mb-4 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-[#0F9D58]" />
                                        {date}
                                    </h2>

                                    <div className="space-y-3">
                                        {items.map((item, index) => (
                                            <motion.div
                                                key={`${item.service.id}-${item.viewedAt}`}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Card className="border-emerald-100 hover:shadow-lg transition-all group">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center gap-4">
                                                            {/* Service Image/Icon */}
                                                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                                <Star className="h-8 w-8 text-[#0F9D58]" />
                                                            </div>

                                                            {/* Service Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between">
                                                                    <div>
                                                                        <h3 className="font-semibold text-[#073642] truncate">
                                                                            {item.service.name}
                                                                        </h3>
                                                                        <p className="text-sm text-gray-500">
                                                                            {item.service.provider.businessName}
                                                                        </p>
                                                                        <div className="flex items-center gap-3 mt-1">
                                                                            {item.service.provider.city && (
                                                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                                                    <MapPin className="h-3 w-3" />
                                                                                    {item.service.provider.city}
                                                                                </span>
                                                                            )}
                                                                            {item.service.rating && (
                                                                                <span className="flex items-center gap-1 text-xs">
                                                                                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                                                                    {item.service.rating}
                                                                                </span>
                                                                            )}
                                                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                                                <Clock className="h-3 w-3" />
                                                                                {formatTimeAgo(item.viewedAt)}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Price */}
                                                                    <div className="text-right flex-shrink-0">
                                                                        <p className="text-xl font-bold text-[#0F9D58]">
                                                                            ${item.service.price.toLocaleString()}
                                                                        </p>
                                                                        {item.service.discount && (
                                                                            <Badge className="bg-red-100 text-red-600 text-xs">
                                                                                -{item.service.discount}%
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Link href={`/services/${item.service.id}`}>
                                                                    <Button
                                                                        size="sm"
                                                                        className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642]"
                                                                    >
                                                                        Ver
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveItem(item.service.id)}
                                                                    className="text-red-500 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Info */}
                    {history.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 text-center text-sm text-gray-500"
                        >
                            <p>El historial se guarda localmente en tu navegador</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
}
