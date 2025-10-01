"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UnifiedMapView } from "@/components/UnifiedMapView";
import { MapProviderToggle } from "@/components/MapProviderToggle";
import { ServiceCard, type ServiceItem } from "@/components/ServiceCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, List, Filter, Navigation } from "lucide-react";

// Mock data para demostración
const mockServices: ServiceItem[] = [
  {
    id: "1",
    name: "Lavado Exterior Premium",
    price: 15000,
    provider: { id: "p1", businessName: "AutoClean Pro", city: "Providencia" },
    rating: 4.8,
    discount: 20
  },
  {
    id: "2", 
    name: "Lavado Completo + Encerado",
    price: 25000,
    provider: { id: "p2", businessName: "Car Spa", city: "Las Condes" },
    rating: 4.9,
    discount: 15
  },
  {
    id: "3",
    name: "Lavado Express",
    price: 8000,
    provider: { id: "p3", businessName: "Quick Wash", city: "Ñuñoa" },
    rating: 4.5
  },
  {
    id: "4",
    name: "Lavado + Aspirado Interior",
    price: 18000,
    provider: { id: "p4", businessName: "Clean Car", city: "Santiago Centro" },
    rating: 4.7,
    discount: 10
  },
  {
    id: "5",
    name: "Lavado Premium + Detailing",
    price: 35000,
    provider: { id: "p5", businessName: "Elite Auto", city: "Vitacura" },
    rating: 4.9
  },
  {
    id: "6",
    name: "Lavado Básico",
    price: 5000,
    provider: { id: "p6", businessName: "Rápido y Limpio", city: "Maipú" },
    rating: 4.3
  }
];

export default function MapPage() {
  const [services] = useState<ServiceItem[]>(mockServices);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [highlightedProvider, setHighlightedProvider] = useState<string | null>(null);

  useEffect(() => {
    // Obtener parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const providerParam = urlParams.get('provider');
    const addressParam = urlParams.get('address');
    
    if (providerParam) {
      setHighlightedProvider(providerParam);
      // Buscar el servicio del proveedor específico
      const providerService = mockServices.find(s => 
        s.provider.businessName.toLowerCase().includes(providerParam.toLowerCase())
      );
      if (providerService) {
        setSelectedService(providerService);
      }
    }

    // Obtener ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          console.log("No se pudo obtener la ubicación");
          // Ubicación por defecto para Santiago
          setUserLocation({
            lat: -33.4489,
            lng: -70.6693
          });
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-blue-600" />
                <p className="text-blue-800 font-medium">
                  Mostrando ubicación de: <span className="font-bold">{highlightedProvider}</span>
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Encuentra autolavados cerca de ti
              </h1>
              <p className="text-gray-600">
                {services.length} servicios disponibles en tu zona
              </p>
            </div>
            <div className="flex items-center gap-3">
              <MapProviderToggle />
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                onClick={() => setViewMode("map")}
                className="flex items-center gap-2"
              >
                <Map className="h-4 w-4" />
                Mapa
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                Lista
              </Button>
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary" className="px-3 py-1">
              <Navigation className="h-3 w-3 mr-1" />
              Más cercanos
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Filter className="h-3 w-3 mr-1" />
              Filtros
            </Badge>
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
                  services={services}
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
                {services.map((service, index) => (
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
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Servicio seleccionado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ServiceCard item={selectedService} />
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-24">
                <CardContent className="p-6 text-center">
                  <Map className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-semibold mb-2">Selecciona un servicio</h3>
                  <p className="text-sm text-gray-600">
                    Haz clic en un marcador del mapa o en un servicio de la lista para ver más detalles
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Servicios disponibles</span>
                  <span className="font-semibold">{services.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio promedio</span>
                  <span className="font-semibold">
                    ${Math.round(services.reduce((acc, s) => acc + s.price, 0) / services.length).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating promedio</span>
                  <span className="font-semibold">
                    {services.filter(s => s.rating).length > 0 
                      ? (services.filter(s => s.rating).reduce((acc, s) => acc + (s.rating || 0), 0) / services.filter(s => s.rating).length).toFixed(1)
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
  );
}
