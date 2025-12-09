"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ModernNavbar } from "@/components/Navbar";
import { UnifiedMapView } from "@/components/UnifiedMapView";
import { MapProviderToggle } from "@/components/MapProviderToggle";
import { ServiceCard, type ServiceItem } from "@/components/ServiceCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, List, Filter, Navigation, Loader2, MapPin, Crosshair } from "lucide-react";
import { apiGet } from "@/lib/api";
import { MapSkeleton, ServiceCardSkeleton } from "@/components/ui/loading-skeletons";
import { useAuth } from "@clerk/nextjs";

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
    latitude?: number;
    longitude?: number;
    address?: string;
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
      city: backendResult.provider?.city,
      latitude: backendResult.provider?.latitude,
      longitude: backendResult.provider?.longitude,
      address: backendResult.provider?.address
    },
    rating: backendResult.rating,
    discount: discount,
    duration: backendResult.duration,
    description: backendResult.description,
    category: backendResult.category
  };
}

export default function MapPage() {
  const { getToken } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [nearbyServices, setNearbyServices] = useState<ServiceItem[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [highlightedProvider, setHighlightedProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(5);

  // Estados para búsqueda de dirección
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Función para obtener dirección desde coordenadas (reverse geocoding)
  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results[0]) {
        // Extraer componentes de la dirección
        const addressComponents = data.results[0].address_components;
        let street = '';
        let commune = '';

        for (const component of addressComponents) {
          if (component.types.includes('route')) {
            street = component.long_name;
          }
          if (component.types.includes('locality') || component.types.includes('administrative_area_level_3')) {
            commune = component.long_name;
          }
        }

        // Si encontramos comuna y calle, mostrar ambas
        if (commune && street) {
          setLocationAddress(`${street}, ${commune}`);
        } else if (commune) {
          setLocationAddress(commune);
        } else {
          // Fallback: usar dirección formateada
          setLocationAddress(data.results[0].formatted_address.split(',')[0]);
        }
      }
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
      setLocationAddress('Ubicación detectada');
    }
  };

  // Función para buscar dirección con geocoding
  const searchAddress = async () => {
    if (!searchQuery.trim()) return;

    setLocationError(null);
    setLoadingLocation(true);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&components=country:CL&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results[0]) {
        const location = data.results[0].geometry.location;
        setUserLocation({ lat: location.lat, lng: location.lng });
        await getAddressFromCoords(location.lat, location.lng);
        setShowSearchBox(false);
        setSearchQuery('');
      } else {
        setLocationError('No se pudo encontrar esa dirección. Intenta con otra.');
      }
    } catch (error) {
      setLocationError('Error al buscar la dirección. Intenta nuevamente.');
    } finally {
      setLoadingLocation(false);
    }
  };

  // Función para detectar ubicación GPS
  const detectUserLocation = () => {
    setLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        await getAddressFromCoords(lat, lng);
        setLoadingLocation(false);
      },
      (error) => {
        setLocationError('No se pudo obtener tu ubicación. Verifica los permisos.');
        setLoadingLocation(false);
      }
    );
  };

  // Fetch all services
  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Fetching all services...');

        const token = await getToken();
        const data = await apiGet<BackendSearchResponse>(`/search?q=&page=1&limit=200`, { token });
        console.log('✅ Services loaded:', data.results.length);

        const transformedServices = data.results.map(transformToServiceItem);
        setServices(transformedServices);
      } catch (error) {
        console.error('❌ Error fetching services:', error);
        setError('Error al cargar los servicios');
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [getToken]);

  // Get user location and fetch nearby services
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const providerParam = urlParams.get('provider');

    if (providerParam) {
      setHighlightedProvider(providerParam);
    }

    // Obtener ubicación del usuario
    if (navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setLoadingLocation(false);

          // Fetch nearby services using the backend API
          try {
            console.log('📍 Fetching nearby services...', location);
            const token = await getToken();
            const data = await apiGet<BackendSearchResponse>(
              `/search/nearby?lat=${location.lat}&lng=${location.lng}&radius=${radiusKm}&limit=50`,
              { token }
            );
            console.log('✅ Nearby services:', data.results.length);
            const transformedNearby = data.results.map(transformToServiceItem);
            setNearbyServices(transformedNearby);

            // Set first nearby service as selected if provider param exists
            if (providerParam && transformedNearby.length > 0) {
              const providerService = transformedNearby.find(s =>
                s.provider.businessName.toLowerCase().includes(providerParam.toLowerCase())
              );
              if (providerService) {
                setSelectedService(providerService);
              }
            }
          } catch (error) {
            console.error('❌ Error fetching nearby services:', error);
          }
        },
        (error) => {
          console.log("No se pudo obtener la ubicación:", error);
          setLoadingLocation(false);
          // Ubicación por defecto para Santiago
          setUserLocation({
            lat: -33.4489,
            lng: -70.6693
          });
        }
      );
    } else {
      // Ubicación por defecto si no hay geolocalización
      setUserLocation({
        lat: -33.4489,
        lng: -70.6693
      });
    }
  }, [radiusKm]);

  // Loading state with skeletons
  if (loading) {
    return (
      <>
        <ModernNavbar />
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white lg:ml-72 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header skeleton */}
            <div className="mb-8">
              <div className="h-10 w-96 bg-emerald-100 rounded-lg mb-2 animate-pulse"></div>
              <div className="h-5 w-64 bg-emerald-50 rounded animate-pulse"></div>
            </div>
            {/* Map and list skeleton */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MapSkeleton />
              </div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
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

  const displayedServices = nearbyServices.length > 0 ? nearbyServices : services;

  return (
    <>
      <ModernNavbar />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            {/* Notificación cuando viene de un enlace específico */}
            {highlightedProvider && (
              <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-2 border-emerald-200 rounded-lg p-4 mb-6 shadow-md">
                <div className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-[#0F9D58]" />
                  <p className="text-[#073642] font-medium">
                    Mostrando ubicación de: <span className="font-bold text-[#0F9D58]">{highlightedProvider}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Notificación de ubicación del usuario */}
            {userLocation && nearbyServices.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-2 border-emerald-200 rounded-lg p-4 mb-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#0F9D58]" />
                    <p className="text-[#073642] font-medium">
                      {nearbyServices.length} autolavados encontrados en un radio de {radiusKm} km
                    </p>
                  </div>
                  {loadingLocation && (
                    <Loader2 className="h-4 w-4 animate-spin text-[#0F9D58]" />
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-[#073642] mb-2">
                  Encuentra autolavados cerca de ti
                </h1>
                <p className="text-[#073642]/70">
                  {displayedServices.length} servicios disponibles {nearbyServices.length > 0 ? 'cerca de ti' : 'en Santiago'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <MapProviderToggle />
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-2 ${viewMode === "map" ? "bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] border-[#FFD166] shadow-lg shadow-[#FFD166]/30" : "border-emerald-200 hover:bg-emerald-50 hover:border-[#0F9D58] hover:text-[#0F9D58]"}`}
                >
                  <Map className="h-4 w-4" />
                  Mapa
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-2 ${viewMode === "list" ? "bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] border-[#FFD166] shadow-lg shadow-[#FFD166]/30" : "border-emerald-200 hover:bg-emerald-50 hover:border-[#0F9D58] hover:text-[#0F9D58]"}`}
                >
                  <List className="h-4 w-4" />
                  Lista
                </Button>
              </div>
            </div>

            {/* Filtros rápidos */}
            <div className="flex flex-wrap gap-2 mb-6">
              {userLocation && (
                <>
                  <Badge
                    variant={radiusKm === 2 ? "default" : "secondary"}
                    className={`px-3 py-1 cursor-pointer transition-all ${radiusKm === 2 ? "bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] border-[#FFD166] shadow-md" : "bg-emerald-100 text-[#0F9D58] border-emerald-200 hover:bg-emerald-200"}`}
                    onClick={() => setRadiusKm(2)}
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    2 km
                  </Badge>
                  <Badge
                    variant={radiusKm === 5 ? "default" : "secondary"}
                    className={`px-3 py-1 cursor-pointer transition-all ${radiusKm === 5 ? "bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] border-[#FFD166] shadow-md" : "bg-emerald-100 text-[#0F9D58] border-emerald-200 hover:bg-emerald-200"}`}
                    onClick={() => setRadiusKm(5)}
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    5 km
                  </Badge>
                  <Badge
                    variant={radiusKm === 10 ? "default" : "secondary"}
                    className={`px-3 py-1 cursor-pointer transition-all ${radiusKm === 10 ? "bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] border-[#FFD166] shadow-md" : "bg-emerald-100 text-[#0F9D58] border-emerald-200 hover:bg-emerald-200"}`}
                    onClick={() => setRadiusKm(10)}
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    10 km
                  </Badge>
                </>
              )}
              <Badge variant="outline" className="px-3 py-1 border-2 border-emerald-200 text-[#073642] bg-white">
                <Filter className="h-3 w-3 mr-1" />
                {displayedServices.length} resultados
              </Badge>
            </div>

            {/* Controles de búsqueda y ubicación */}
            <div className="flex flex-wrap gap-2 mb-6">
              {/* Buscador de dirección */}
              <div className="w-auto max-w-md">
                {showSearchBox ? (
                  <div className="bg-white rounded-lg shadow-md p-3 border-2 border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-[#0F9D58]" />
                      <p className="font-medium text-sm text-[#073642]">¿Dónde estás?</p>
                      <button
                        onClick={() => {
                          setShowSearchBox(false);
                          setSearchQuery('');
                          setLocationError(null);
                        }}
                        className="ml-auto text-gray-400 hover:text-gray-600 text-lg leading-none"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ej: Maipú, Av. Libertador..."
                        className="flex-1 px-2 py-1.5 border border-emerald-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F9D58] text-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            searchAddress();
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={searchAddress}
                        disabled={!searchQuery.trim() || loadingLocation}
                        className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] disabled:bg-gray-300 font-medium text-xs px-3 h-auto py-1.5"
                      >
                        {loadingLocation ? '...' : 'Buscar'}
                      </Button>
                    </div>
                    {locationError && (
                      <div className="mt-1.5 p-1.5 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                        {locationError}
                      </div>
                    )}
                  </div>
                ) : userLocation ? (
                  <div className="bg-white rounded-lg shadow-md px-2.5 py-1.5 border-2 border-emerald-200 flex items-center justify-between w-auto">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#0F9D58]" />
                      <span className="text-[10px] font-medium text-[#073642]">
                        {locationAddress || 'Ubicación detectada'}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowSearchBox(true)}
                      className="text-[#0F9D58] hover:text-[#0F9D58]/80 text-[10px] underline font-medium ml-3"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSearchBox(true)}
                    className="bg-white hover:bg-emerald-50 rounded-lg shadow-md p-2 text-sm font-medium text-[#073642] flex items-center gap-2 transition-all border-2 border-emerald-200 w-auto"
                  >
                    <MapPin className="h-4 w-4 text-[#0F9D58]" />
                    <span className="text-xs">Buscar dirección</span>
                  </button>
                )}
              </div>

              {/* Botón GPS - Mi ubicación */}
              <Button
                variant="secondary"
                onClick={detectUserLocation}
                disabled={loadingLocation}
                className="shadow-md bg-white hover:bg-emerald-50 text-[#073642] border-2 border-emerald-200 hover:border-[#0F9D58] px-2.5 py-1.5 h-auto"
                title="Detectar mi ubicación con GPS"
              >
                {loadingLocation ? (
                  <div className="animate-spin h-3.5 w-3.5 border-2 border-[#0F9D58] border-t-transparent rounded-full" />
                ) : (
                  <Crosshair className="h-3.5 w-3.5 text-[#0F9D58]" />
                )}
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Mapa o Lista */}
            <div className="lg:col-span-2">
              {viewMode === "map" ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="h-[600px] rounded-lg overflow-hidden shadow-lg"
                >
                  <UnifiedMapView
                    services={displayedServices}
                    center={userLocation || undefined}
                    onServiceSelect={setSelectedService}
                    selectedService={selectedService || undefined}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="grid sm:grid-cols-2 gap-6"
                >
                  {displayedServices.map((service, index) => (
                    <ServiceCard key={service.id} item={service} index={index} />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Panel lateral */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-6"
            >
              {/* Servicio seleccionado */}
              {selectedService ? (
                <Card className="sticky top-24 border-2 border-emerald-200 shadow-lg shadow-emerald-100/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#073642]">
                      <Navigation className="h-5 w-5 text-[#0F9D58]" />
                      Servicio seleccionado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ServiceCard item={selectedService} />
                  </CardContent>
                </Card>
              ) : (
                <Card className="sticky top-24 border-2 border-emerald-100">
                  <CardContent className="p-6 text-center">
                    <Map className="h-12 w-12 mx-auto mb-4 text-[#0F9D58]/50" />
                    <h3 className="font-semibold mb-2 text-[#073642]">Selecciona un servicio</h3>
                    <p className="text-sm text-[#073642]/70">
                      Haz clic en un marcador del mapa o en un servicio de la lista para ver más detalles
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Estadísticas */}
              <Card className="border-2 border-emerald-100 shadow-md">
                <CardHeader>
                  <CardTitle className="text-[#073642]">Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[#073642]/70">Servicios disponibles</span>
                    <span className="font-semibold text-[#0F9D58]">{displayedServices.length}</span>
                  </div>
                  {nearbyServices.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#073642]/70">Radio de búsqueda</span>
                      <span className="font-semibold text-[#2B8EAD]">{radiusKm} km</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#073642]/70">Precio promedio</span>
                    <span className="font-semibold text-[#0F9D58]">
                      ${displayedServices.length > 0 ? Math.round(displayedServices.reduce((acc, s) => acc + s.price, 0) / displayedServices.length).toLocaleString() : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#073642]/70">Rating promedio</span>
                    <span className="font-semibold text-[#FFD166]">
                      {displayedServices.filter(s => s.rating).length > 0
                        ? (displayedServices.filter(s => s.rating).reduce((acc, s) => acc + (s.rating || 0), 0) / displayedServices.filter(s => s.rating).length).toFixed(1)
                        : 'N/A'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
