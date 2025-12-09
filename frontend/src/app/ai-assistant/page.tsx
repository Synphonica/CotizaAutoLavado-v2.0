'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Search,
    Sparkles,
    MapPin,
    DollarSign,
    Star,
    TrendingUp,
    Calendar,
    Lightbulb
} from 'lucide-react';
import { ModernNavbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Recommendation {
    id: string;
    emoji: string;
    title: string;
    description: string;
    icon: any;
    query: string;
    badge?: string;
    badgeColor?: string;
}

export default function AIAssistantPage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [services, setServices] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);

    const exampleSearches = [
        'lavado completo bajo $20000 en Las Condes',
        'mejor autolavado cerca de mí que haga detailing',
        'lavado express económico abierto hoy domingo'
    ];

    const recommendations: Recommendation[] = [
        {
            id: '1',
            emoji: '🌟',
            title: 'Mejores Calificados',
            description: 'Autolavados con las mejores reseñas de clientes',
            icon: Star,
            query: 'sortBy=rating&sortOrder=desc',
            badge: 'Popular',
            badgeColor: 'bg-blue-500'
        },
        {
            id: '2',
            emoji: '📍',
            title: 'Más Cercanos',
            description: 'Autolavados en Santiago',
            icon: MapPin,
            query: 'city=Santiago',
            badge: 'Cerca',
            badgeColor: 'bg-blue-500'
        },
        {
            id: '3',
            emoji: '🔥',
            title: 'Mejor Relación Calidad-Precio',
            description: 'Servicios económicos con excelentes calificaciones',
            icon: TrendingUp,
            query: 'sortBy=price&sortOrder=asc&minRating=4',
            badge: 'Ahorro',
            badgeColor: 'bg-blue-500'
        }
    ];

    const features = [
        {
            icon: '📝',
            title: 'Analiza tu historial de reservas y favoritos',
            description: 'para darte recomendaciones personalizadas'
        },
        {
            icon: '🔍',
            title: 'Comprende búsquedas en lenguaje natural',
            description: '(sin necesidad de filtros complicados)'
        },
        {
            icon: '⚖️',
            title: 'Considera múltiples factores:',
            description: 'precio, ubicación, calidad, disponibilidad y más'
        },
        {
            icon: '⏰',
            title: 'Aprende de tus preferencias',
            description: 'para mejorar las recomendaciones con el tiempo'
        }
    ];

    const handleSearch = async (query?: string) => {
        const searchText = query || searchQuery;
        if (!searchText.trim()) return;

        setIsLoading(true);
        setShowResults(false);
        setAiResponse(null);
        setServices([]);

        try {
            const token = await getToken();
            console.log('Enviando búsqueda a IA:', searchText);
            console.log('API Base:', process.env.NEXT_PUBLIC_API_BASE);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/ai-insights/smart-search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ query: searchText }),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Error al buscar: ${response.status}`);
            }

            const data = await response.json();
            console.log('Datos recibidos:', data);

            setAiResponse(data.recommendations);
            setServices(data.services || []);
            setShowResults(true);
        } catch (error) {
            console.error('Error en búsqueda con IA:', error);
            alert('Error al conectar con la IA. Por favor intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecommendationClick = (query: string) => {
        router.push(`/results?${query}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50">
            <ModernNavbar />

            <div className="flex justify-center items-start min-h-screen lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
                <div className="container mx-auto px-6 py-12 max-w-5xl w-full">
                    {/* Header Section with Search */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-10 mb-10 shadow-xl border border-teal-100"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Búsqueda Inteligente</h1>
                        </div>
                        <p className="text-gray-600 text-base mb-6">
                            Describe lo que buscas y la IA encontrará los mejores resultados
                        </p>

                        {/* Search Bar */}
                        <div className="relative mb-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    type="text"
                                    placeholder="Ej: Necesito un lavado completo económico cerca de Providencia que tenga buenas reseñas y esté abierto los domingos..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-12 pr-44 py-6 text-base rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                                />
                                <Button
                                    onClick={() => handleSearch()}
                                    disabled={isLoading || !searchQuery.trim()}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Buscando...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Buscar con IA
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Example Searches */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            <span className="text-sm text-gray-600 font-medium">Ejemplos:</span>
                            {exampleSearches.map((example, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setSearchQuery(example);
                                        handleSearch(example);
                                    }}
                                    className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full transition-colors border border-teal-200"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* AI Results Section */}
                    {showResults && aiResponse && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-10"
                        >
                            <Card className="bg-white border border-teal-100 shadow-xl">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl flex items-center justify-center">
                                            <Sparkles className="w-6 h-6 text-white animate-pulse" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">Recomendaciones de IA</h3>
                                    </div>

                                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 mb-6">
                                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                            {aiResponse}
                                        </p>
                                    </div>

                                    {/* Services Grid */}
                                    {services.length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <Search className="w-5 h-5 text-teal-600" />
                                                Servicios Disponibles ({services.length})
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {services.slice(0, 6).map((service) => (
                                                    <div
                                                        key={service.id}
                                                        className="bg-white border border-gray-200 rounded-xl p-4 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer"
                                                        onClick={() => router.push(`/providers/${service.provider?.id}`)}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h5 className="font-semibold text-gray-900">{service.name}</h5>
                                                            <span className="text-teal-600 font-bold text-lg">
                                                                ${service.price?.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {service.provider?.name}
                                                        </p>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                                {service.provider?.rating?.toFixed(1) || 'N/A'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {service.duration} min
                                                            </span>
                                                            {service.provider?.address && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {service.provider.address.split(',')[0]}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {services.length > 6 && (
                                                <Button
                                                    onClick={() => router.push(`/results?q=${encodeURIComponent(searchQuery)}`)}
                                                    className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white"
                                                >
                                                    Ver todos los {services.length} servicios
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Recommendations Section */}
                    {!showResults && (
                        <div className="mb-10">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Recomendaciones para Ti</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {recommendations.map((rec, index) => (
                                    <motion.div
                                        key={rec.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card
                                            className="cursor-pointer hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-teal-300 group bg-white h-full"
                                            onClick={() => handleRecommendationClick(rec.query)}
                                        >
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center">
                                                        <rec.icon className="w-7 h-7 text-teal-600" />
                                                    </div>
                                                    {rec.badge && (
                                                        <Badge className="bg-blue-500 text-white border-0 px-3 py-1 text-xs">
                                                            {rec.badge}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-bold mb-2 text-gray-900 flex items-center gap-2">
                                                    <span>{rec.emoji}</span>
                                                    <span>{rec.title}</span>
                                                </h3>
                                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{rec.description}</p>

                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <span className="text-teal-600 hover:text-teal-700 font-medium text-sm group-hover:underline inline-flex items-center gap-1">
                                                        <span>"{rec.title === 'Mejores Calificados' ? '"mejores autolavados cerca de mí"' : rec.title === 'Más Cercanos' ? '"autolavados en Santiago"' : '"lavado económico con buenas reseñas"'}</span>
                                                    </span>
                                                </div>

                                                <Button className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl py-3">
                                                    <Search className="w-4 h-4 mr-2" />
                                                    Buscar ahora
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* How it works */}
                    <Card className="bg-white border border-teal-100 shadow-lg">
                        <CardContent className="p-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-md">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">¿Cómo funciona el Asistente IA?</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                {features.map((feature, idx) => (
                                    <div key={idx} className="text-left">
                                        <div className="text-5xl mb-4">{feature.icon}</div>
                                        <p className="text-sm font-semibold text-gray-900 mb-2 leading-tight">{feature.title}</p>
                                        <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}