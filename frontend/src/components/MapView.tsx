"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Star, Clock, Phone } from "lucide-react";
import { ServiceItem } from "./ServiceCard";

interface MapViewProps {
  services: ServiceItem[];
  center?: { lat: number; lng: number };
  onServiceSelect?: (service: ServiceItem) => void;
  selectedService?: ServiceItem;
}

export function MapView({ services, center, onServiceSelect, selectedService }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Coordenadas por defecto (Santiago, Chile)
  const defaultCenter = { lat: -33.4489, lng: -70.6693 };

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        const { Loader } = await import("@googlemaps/js-api-loader");
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
          version: "weekly",
          libraries: ["places", "geometry"]
        });

        const map = await loader.load();
        
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: center || defaultCenter,
          zoom: 13,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        mapInstanceRef.current = mapInstance;

        // Obtener ubicación del usuario
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setUserLocation(userPos);
              mapInstance.setCenter(userPos);
            },
            () => {
              console.log("No se pudo obtener la ubicación");
            }
          );
        }

        // Crear markers para servicios
        services.forEach((service, index) => {
          const marker = new google.maps.Marker({
            position: {
              lat: defaultCenter.lat + (Math.random() - 0.5) * 0.1,
              lng: defaultCenter.lng + (Math.random() - 0.5) * 0.1
            },
            map: mapInstance,
            title: service.name,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" stroke-width="3"/>
                  <text x="20" y="26" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${index + 1}</text>
                </svg>
              `)}`,
              scaledSize: new google.maps.Size(40, 40)
            }
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-4 max-w-xs">
                <h3 class="font-semibold text-lg mb-2">${service.name}</h3>
                <p class="text-gray-600 text-sm mb-2">${service.provider.businessName}</p>
                <p class="text-blue-600 font-bold text-lg">$${service.price.toLocaleString()}</p>
                ${service.rating ? `<div class="flex items-center mt-2"><span class="text-yellow-500">★</span> <span class="ml-1 text-sm">${service.rating}</span></div>` : ''}
                <button onclick="selectService('${service.id}')" class="mt-3 w-full bg-blue-600 text-white px-3 py-1 rounded text-sm">Ver detalle</button>
              </div>
            `
          });

          marker.addListener("click", () => {
            infoWindow.open(mapInstance, marker);
            onServiceSelect?.(service);
          });

          markersRef.current.push(marker);
        });

        // Agregar función global para seleccionar servicio
        (window as any).selectService = (serviceId: string) => {
          const service = services.find(s => s.id === serviceId);
          if (service) onServiceSelect?.(service);
        };

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setIsLoading(false);
      }
    };

    initMap();
  }, [services, center, onServiceSelect]);

  return (
    <div className="relative h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Cargando mapa...</p>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Controles del mapa */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (userLocation && mapInstanceRef.current) {
              mapInstanceRef.current.setCenter(userLocation);
              mapInstanceRef.current.setZoom(15);
            }
          }}
          className="shadow-lg"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {/* Lista de servicios cercanos */}
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute bottom-4 left-4 right-4"
      >
        <Card className="max-h-48 overflow-y-auto">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Servicios cercanos ({services.length})
            </h3>
            <div className="space-y-2">
              {services.slice(0, 3).map((service) => (
                <motion.div
                  key={service.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedService?.id === service.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onServiceSelect?.(service)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{service.name}</h4>
                      <p className="text-xs text-gray-600">{service.provider.businessName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-blue-600">${service.price.toLocaleString()}</p>
                      {service.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{service.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
