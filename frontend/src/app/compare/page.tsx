"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ModernNavbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ServiceItem } from "@/components/ServiceCard";
import { Search, Star, MapPin, Clock, TrendingUp, TrendingDown, Minus, Plus, X, Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";

// Backend response types
interface BackendSearchResult {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  duration: number;
  rating: number;
  reviewCount: number;
  discountedPrice?: number;
  provider?: {
    id: string;
    businessName: string;
    city: string;
    rating: number;
  };
  discountInfo?: {
    hasDiscount: boolean;
    discountPercentage?: number;
    originalPrice?: number;
  };
}

interface BackendSearchResponse {
  results: BackendSearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Transform backend result to frontend ServiceItem
function transformToServiceItem(backendResult: BackendSearchResult): ServiceItem {
  const discount = backendResult.discountInfo?.hasDiscount
    ? backendResult.discountInfo.discountPercentage
    : undefined;

  return {
    id: backendResult.id,
    name: backendResult.name,
    price: backendResult.price,
    provider: {
      id: backendResult.provider?.id || '',
      businessName: backendResult.provider?.businessName || 'Sin proveedor',
      city: backendResult.provider?.city
    },
    rating: backendResult.rating,
    discount: discount,
    duration: backendResult.duration,
    description: backendResult.description,
    category: backendResult.category
  };
}

export default function ComparePage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "rating" | "name">("price");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch services from API
  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Fetching services from backend API...');

        // Fetch all services with a large limit to get variety
        const data = await apiGet<BackendSearchResponse>(`/search?q=&page=1&limit=100`);
        console.log('✅ Backend response:', data);

        const transformedServices = data.results.map(transformToServiceItem);
        setServices(transformedServices);
        console.log(`✅ Loaded ${transformedServices.length} services`);
      } catch (error) {
        console.error('❌ Error fetching services:', error);
        setError('Error al cargar los servicios. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.provider.businessName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.price - b.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const addToComparison = (service: ServiceItem) => {
    if (selectedServices.length < 4 && !selectedServices.find(s => s.id === service.id)) {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const removeFromComparison = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };

  const getPriceComparison = () => {
    if (selectedServices.length < 2) return null;

    const prices = selectedServices.map(s => s.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((acc, price) => acc + price, 0) / prices.length;

    return { minPrice, maxPrice, avgPrice };
  };

  const priceComparison = getPriceComparison();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#0F9D58] mx-auto mb-4" />
          <p className="text-xl text-[#073642]">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ModernNavbar />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-br from-[#0F9D58] via-[#2B8EAD] to-[#0F9D58] py-16 px-4 mb-8 overflow-hidden">
          {/* Patrón de fondo decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-[#FFD166] rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-6 border border-white/30">
                <TrendingUp className="h-5 w-5 text-[#FFD166]" />
                <span className="text-white font-medium">{services.length} servicios disponibles de {new Set(services.map(s => s.provider.id)).size} autolavados</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
                Compara precios de autolavados
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-light">
                Selecciona hasta 4 servicios y encuentra la mejor opción para tu vehículo
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-8">

          {/* Búsqueda y filtros mejorados */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8 -mt-16 relative z-20"
          >
            <Card className="border-2 border-emerald-100 shadow-2xl shadow-emerald-200/20 backdrop-blur-sm bg-white/95">
              <CardContent className="p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#0F9D58]" />
                    <Input
                      placeholder="Buscar por nombre de servicio o autolavado..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 h-14 text-lg border-2 border-emerald-100 focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 rounded-xl shadow-sm"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center items-center">
                    <span className="text-sm font-semibold text-[#073642]/70 mr-2">Ordenar por:</span>
                    <Button
                      variant={sortBy === "price" ? "default" : "outline"}
                      size="lg"
                      onClick={() => setSortBy("price")}
                      className={`rounded-full px-6 ${sortBy === "price" ? "bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] border-[#FFD166] shadow-lg shadow-[#FFD166]/30" : "border-2 border-emerald-200 hover:bg-emerald-50 hover:border-[#0F9D58] hover:text-[#0F9D58]"}`}
                    >
                      <TrendingDown className="h-4 w-4 mr-2" />
                      Precio
                    </Button>
                    <Button
                      variant={sortBy === "rating" ? "default" : "outline"}
                      size="lg"
                      onClick={() => setSortBy("rating")}
                      className={`rounded-full px-6 ${sortBy === "rating" ? "bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] border-[#FFD166] shadow-lg shadow-[#FFD166]/30" : "border-2 border-emerald-200 hover:bg-emerald-50 hover:border-[#0F9D58] hover:text-[#0F9D58]"}`}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Rating
                    </Button>
                    <Button
                      variant={sortBy === "name" ? "default" : "outline"}
                      size="lg"
                      onClick={() => setSortBy("name")}
                      className={`rounded-full px-6 ${sortBy === "name" ? "bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] border-[#FFD166] shadow-lg shadow-[#FFD166]/30" : "border-2 border-emerald-200 hover:bg-emerald-50 hover:border-[#0F9D58] hover:text-[#0F9D58]"}`}
                    >
                      Nombre
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Comparación actual */}
          {selectedServices.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-2 border-emerald-200 shadow-lg shadow-emerald-100/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#073642]">
                    <TrendingUp className="h-5 w-5 text-[#0F9D58]" />
                    Comparación actual ({selectedServices.length}/4)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {selectedServices.map((service) => (
                      <motion.div
                        key={service.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                      >
                        <Card className="border-2 border-emerald-200 shadow-md hover:shadow-lg hover:shadow-emerald-100/50 transition-all">
                          <CardContent className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                              onClick={() => removeFromComparison(service.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="pr-6">
                              <h4 className="font-semibold text-sm mb-1 text-[#073642]">{service.name}</h4>
                              <p className="text-xs text-[#073642]/70 mb-2">{service.provider.businessName}</p>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#0F9D58]">${service.price.toLocaleString()}</span>
                                {service.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-[#FFD166] text-[#FFD166]" />
                                    <span className="text-xs">{service.rating}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Estadísticas de comparación */}
                  {priceComparison && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg border-2 border-emerald-100 shadow-md">
                        <div className="text-2xl font-bold text-[#0F9D58]">${priceComparison.minPrice.toLocaleString()}</div>
                        <div className="text-sm text-[#073642]/70">Precio más bajo</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border-2 border-emerald-100 shadow-md">
                        <div className="text-2xl font-bold text-[#2B8EAD]">${Math.round(priceComparison.avgPrice).toLocaleString()}</div>
                        <div className="text-sm text-[#073642]/70">Precio promedio</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border-2 border-emerald-100 shadow-md">
                        <div className="text-2xl font-bold text-[#FFD166]">${priceComparison.maxPrice.toLocaleString()}</div>
                        <div className="text-sm text-[#073642]/70">Precio más alto</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Lista de servicios */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {sortedServices.length === 0 ? (
              <Card className="text-center p-12 border-2 border-emerald-100">
                <CardContent>
                  <Search className="h-16 w-16 text-[#0F9D58]/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#073642] mb-2">
                    No se encontraron servicios
                  </h3>
                  <p className="text-[#073642]/70 mb-4">
                    Intenta con otros términos de búsqueda
                  </p>
                  <Button onClick={() => setSearchQuery("")} variant="outline">
                    Limpiar búsqueda
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedServices.map((service, index) => {
                  const isSelected = selectedServices.find(s => s.id === service.id);
                  const canAdd = selectedServices.length < 4 && !isSelected;

                  return (
                    <motion.div
                      key={service.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="group"
                    >
                      <Card className={`h-full transition-all duration-300 border-2 ${isSelected
                        ? 'border-[#0F9D58] bg-emerald-50 shadow-lg shadow-emerald-100/50'
                        : 'hover:shadow-lg hover:shadow-emerald-100/50 border-emerald-100'
                        }`}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1 text-[#073642]">{service.name}</h3>
                              <div className="flex items-center gap-1 text-sm text-[#073642]/70 mb-2">
                                <MapPin className="h-3 w-3 text-[#0F9D58]" />
                                <span>{service.provider.businessName}</span>
                                {service.provider.city && <span>· {service.provider.city}</span>}
                              </div>
                            </div>
                            {isSelected && (
                              <Badge className="bg-[#FFD166] text-[#073642] hover:bg-[#FFD166]/90 font-semibold shadow-md">Seleccionado</Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-4">
                            {service.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-[#FFD166] text-[#FFD166]" />
                                <span className="text-sm font-medium text-[#073642]">{service.rating}</span>
                              </div>
                            )}
                            <Badge variant="secondary" className="text-xs bg-emerald-100 text-[#0F9D58] border-emerald-200">
                              <Clock className="h-3 w-3 mr-1" />
                              {service.duration || 30} min
                            </Badge>
                            {service.discount && (
                              <Badge className="text-xs bg-[#FFD166] text-[#073642] hover:bg-[#FFD166]/90">
                                -{service.discount}%
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-[#0F9D58]">${service.price.toLocaleString()}</span>
                              {service.discount && (
                                <span className="text-sm text-[#073642]/50 line-through">
                                  ${Math.round(service.price / (1 - service.discount / 100)).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <Button
                            className={`w-full font-semibold transition-all ${isSelected
                              ? 'bg-emerald-100 text-[#0F9D58] cursor-default border-2 border-emerald-200'
                              : canAdd
                                ? 'bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] shadow-lg shadow-[#FFD166]/30'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            disabled={!canAdd && !isSelected}
                            onClick={() => canAdd && addToComparison(service)}
                          >
                            {isSelected ? (
                              "Ya seleccionado"
                            ) : canAdd ? (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar a comparación
                              </>
                            ) : (
                              "Máximo 4 servicios"
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
