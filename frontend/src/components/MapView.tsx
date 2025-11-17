"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Star, Clock, Phone, Crosshair, ExternalLink } from "lucide-react";
import { ServiceItem } from "./ServiceCard";

// Declarar tipos de Google Maps para TypeScript
declare global {
  interface Window {
    google: typeof google;
    selectService: (serviceId: string) => void;
    openDirections: (lat: number, lng: number) => void;
  }
}

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
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const searchMarkerRef = useRef<google.maps.Marker | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [centeringToUser, setCenteringToUser] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Coordenadas por defecto (Santiago, Chile)
  const defaultCenter = { lat: -33.4489, lng: -70.6693 };

  // Función para buscar dirección usando Geocoding
  const searchAddress = async () => {
    if (!searchQuery.trim()) {
      setLocationError('Por favor ingresa una dirección');
      return;
    }

    console.log('🔍 Buscando dirección:', searchQuery);
    setLocationError(null);

    try {
      // Usar la API de Geocoding de Google Maps
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode(
        {
          address: searchQuery,
          componentRestrictions: { country: 'CL' }
        },
        (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          console.log('📡 Respuesta del geocoder:', status);

          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            const userPos = {
              lat: location.lat(),
              lng: location.lng()
            };

            console.log('✅ Dirección encontrada:', results[0].formatted_address);
            console.log('   Coordenadas:', userPos);

            setUserLocation(userPos);
            setLocationError(null);

            if (mapInstanceRef.current) {
              mapInstanceRef.current.setCenter(userPos);
              mapInstanceRef.current.setZoom(15);

              // Eliminar marcador de búsqueda anterior si existe
              if (searchMarkerRef.current) {
                searchMarkerRef.current.setMap(null);
              }

              // Crear marcador ROJO para la búsqueda
              const searchMarker = new google.maps.Marker({
                position: userPos,
                map: mapInstanceRef.current,
                title: results[0].formatted_address,
                icon: {
                  url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  scaledSize: new google.maps.Size(40, 40)
                },
                zIndex: 1000
              });

              searchMarkerRef.current = searchMarker;

              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div class="p-2">
                    <p class="font-bold text-red-600 mb-1">📍 ${results[0].formatted_address}</p>
                    <p class="text-xs text-gray-600">Tu ubicación buscada</p>
                  </div>
                `
              });

              searchMarker.addListener("click", () => {
                infoWindow.open(mapInstanceRef.current!, searchMarker);
              });

              setShowSearchBox(false);
              setSearchQuery('');
            }
          } else if (status === 'ZERO_RESULTS') {
            console.error('❌ No se encontró la dirección');
            setLocationError(`No se encontró "${searchQuery}". Intenta con: Maipú, Las Condes, o una dirección completa.`);
          } else if (status === 'REQUEST_DENIED') {
            console.error('❌ API key no autorizada para Geocoding');
            setLocationError('Error de configuración. La API de Geocoding no está habilitada.');
          } else {
            console.error('❌ Error del geocoder:', status);
            setLocationError('Error al buscar. Intenta con otra dirección.');
          }
        }
      );
    } catch (error) {
      console.error('❌ Error buscando dirección:', error);
      setLocationError('Error al buscar la dirección');
    }
  };

  // Función para abrir Google Maps con direcciones
  const openGoogleMapsDirections = (service: ServiceItem) => {
    const { latitude, longitude, address } = service.provider;

    // Si tenemos la ubicación del usuario, abrir con direcciones
    if (userLocation && latitude && longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${latitude},${longitude}&travelmode=driving`;
      window.open(url, '_blank');
    }
    // Si no, solo abrir la ubicación del autolavado
    else if (latitude && longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      window.open(url, '_blank');
    }
    // Como último recurso, buscar por dirección
    else if (address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      window.open(url, '_blank');
    }
  };

  // Función para centrar en la ubicación del usuario
  const centerOnUser = () => {
    console.log('🎯 Botón clickeado. Usuario location actual:', userLocation);
    console.log('📍 Map instance disponible:', !!mapInstanceRef.current);

    setLocationError(null);

    if (!navigator.geolocation) {
      const error = 'Tu navegador no soporta geolocalización.';
      console.error('❌', error);
      setLocationError(error);
      alert(error);
      return;
    }

    setCenteringToUser(true);
    console.log('📡 Solicitando ubicación actual al navegador...');
    console.log('⏱️ Timeout: 30 segundos');
    console.log('🎯 Precisión alta: sí (puede tardar más)');

    // SIEMPRE solicitar ubicación fresca, no confiar en la guardada
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        console.log('✅ UBICACIÓN OBTENIDA:');
        console.log('   Latitud:', userPos.lat);
        console.log('   Longitud:', userPos.lng);
        console.log('   Precisión:', position.coords.accuracy, 'metros');
        console.log('   Timestamp:', new Date(position.timestamp).toLocaleString());

        setUserLocation(userPos);

        if (mapInstanceRef.current) {
          console.log('🗺️ Centrando mapa en las coordenadas obtenidas...');

          // Centrar el mapa
          mapInstanceRef.current.setCenter(userPos);
          mapInstanceRef.current.setZoom(17); // Zoom más cercano

          // Actualizar o crear marcador del usuario
          if (userMarkerRef.current) {
            console.log('🔄 Actualizando posición del marcador existente');
            userMarkerRef.current.setPosition(userPos);
            userMarkerRef.current.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => {
              userMarkerRef.current?.setAnimation(null);
            }, 2000);
          } else {
            console.log('➕ Creando nuevo marcador de usuario');
            const userMarker = new google.maps.Marker({
              position: userPos,
              map: mapInstanceRef.current,
              title: "Tu ubicación actual",
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 4,
              },
              zIndex: 1000,
              animation: google.maps.Animation.BOUNCE
            });

            userMarkerRef.current = userMarker;

            const userInfoWindow = new google.maps.InfoWindow({
              content: `
                <div class="p-3">
                  <p class="font-bold text-blue-600 mb-2">📍 Tu ubicación actual</p>
                  <p class="text-xs text-gray-600">Lat: ${userPos.lat.toFixed(6)}</p>
                  <p class="text-xs text-gray-600">Lng: ${userPos.lng.toFixed(6)}</p>
                  <p class="text-xs text-gray-500 mt-1">Precisión: ${position.coords.accuracy.toFixed(0)}m</p>
                </div>
              `
            });

            userMarker.addListener("click", () => {
              userInfoWindow.open(mapInstanceRef.current!, userMarker);
            });

            setTimeout(() => {
              userMarker.setAnimation(null);
            }, 2000);
          }

          console.log('✅ Mapa centrado correctamente');
        } else {
          console.error('❌ No hay instancia del mapa disponible');
        }

        setCenteringToUser(false);
      },
      (error) => {
        let errorMsg = '';
        let suggestion = '';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Permiso de ubicación denegado';
            suggestion = 'Por favor, habilita el permiso de ubicación en la configuración del navegador:\n\n1. Haz clic en el ícono del candado en la barra de direcciones\n2. Selecciona "Configuración del sitio"\n3. Permite el acceso a la ubicación';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Ubicación no disponible';
            suggestion = 'No se pudo determinar tu ubicación. Verifica que:\n\n- Tu dispositivo tenga GPS activado\n- Estés en un lugar con buena señal\n- El navegador tenga acceso a los servicios de ubicación';
            break;
          case error.TIMEOUT:
            errorMsg = 'Tiempo de espera agotado';
            suggestion = 'La solicitud de ubicación tardó demasiado. Esto puede deberse a:\n\n- GPS desactivado en tu dispositivo\n- Mala señal GPS (intenta salir al exterior)\n- Servicios de ubicación deshabilitados\n\n¿Quieres intentar con una precisión más baja (más rápido pero menos exacto)?';
            break;
          default:
            errorMsg = 'Error desconocido';
            suggestion = 'Ocurrió un error inesperado al obtener tu ubicación.';
        }

        console.error('❌ ERROR DE GEOLOCALIZACIÓN:', errorMsg);
        console.error('   Código:', error.code);
        console.error('   Mensaje:', error.message);
        console.error('   Sugerencia:', suggestion);

        setLocationError(errorMsg);

        // Si es timeout, ofrecer reintentar con menor precisión
        if (error.code === error.TIMEOUT) {
          const retry = confirm(suggestion);
          if (retry) {
            console.log('🔄 Reintentando con precisión baja...');
            retryWithLowAccuracy();
          } else {
            setCenteringToUser(false);
          }
        } else {
          alert(`${errorMsg}\n\n${suggestion}`);
          setCenteringToUser(false);
        }
      },
      {
        enableHighAccuracy: true,  // Usar GPS si está disponible
        timeout: 30000,            // Esperar hasta 30 segundos
        maximumAge: 0              // No usar caché, siempre nueva ubicación
      }
    );
  };

  // Función para reintentar con baja precisión (más rápido)
  const retryWithLowAccuracy = () => {
    console.log('🔄 Reintentando con baja precisión (más rápido)...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        console.log('✅ Ubicación obtenida (baja precisión):', userPos);
        console.log('   Precisión:', position.coords.accuracy, 'metros');

        setUserLocation(userPos);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(userPos);
          mapInstanceRef.current.setZoom(15);

          if (userMarkerRef.current) {
            userMarkerRef.current.setPosition(userPos);
          } else {
            const userMarker = new google.maps.Marker({
              position: userPos,
              map: mapInstanceRef.current,
              title: "Tu ubicación aproximada",
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: "#FFA500",
                fillOpacity: 0.8,
                strokeColor: "#ffffff",
                strokeWeight: 4,
              },
              zIndex: 1000
            });

            userMarkerRef.current = userMarker;
          }

          alert(`Ubicación aproximada obtenida.\n\nPrecisión: ${position.coords.accuracy.toFixed(0)} metros\n\nNota: Para mayor precisión, activa el GPS de tu dispositivo.`);
        }

        setCenteringToUser(false);
      },
      (error) => {
        console.error('❌ Falló también con baja precisión:', error.message);
        alert('No se pudo obtener tu ubicación incluso con baja precisión.\n\nVerifica que los servicios de ubicación estén habilitados en tu dispositivo.');
        setCenteringToUser(false);
      },
      {
        enableHighAccuracy: false,  // No usar GPS, más rápido
        timeout: 10000,             // Solo 10 segundos
        maximumAge: 60000           // Aceptar ubicación de hasta 1 minuto atrás
      }
    );
  };

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

        // Obtener ubicación del usuario y crear marcador (SIN TIMEOUT PARA EVITAR ERRORES)
        // El usuario puede buscar manualmente su ubicación si lo prefiere
        if (navigator.geolocation && !center) {
          console.log('🌍 Intentando obtener ubicación del usuario (opcional)...');
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              console.log('✅ Ubicación obtenida:', userPos);
              setUserLocation(userPos);
              mapInstance.setCenter(userPos);

              // Crear marcador azul
              const userMarker = new google.maps.Marker({
                position: userPos,
                map: mapInstance,
                title: "Tu ubicación detectada",
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 12,
                  fillColor: "#4285F4",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 4,
                },
                zIndex: 1000
              });

              userMarkerRef.current = userMarker;
            },
            (error) => {
              console.log('ℹ️ No se pudo detectar ubicación automática, usa el buscador');
              // No mostrar error, el usuario puede buscar manualmente
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        }

        // Crear markers para servicios con coordenadas reales
        console.log('📍 Creando marcadores para', services.length, 'servicios');

        services.forEach((service: ServiceItem) => {
          // Solo crear marcador si el servicio tiene coordenadas válidas
          if (!service.provider.latitude || !service.provider.longitude) {
            console.log('⚠️ Servicio sin coordenadas:', service.name);
            return;
          }

          const position = {
            lat: service.provider.latitude,
            lng: service.provider.longitude
          };

          console.log('✅ Marcador creado:', service.name, position);

          const marker = new google.maps.Marker({
            position,
            map: mapInstance,
            title: service.name,
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new google.maps.Size(32, 32)
            },
            animation: google.maps.Animation.DROP
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-3 max-w-xs">
                <h3 class="font-semibold text-base mb-1 text-[#073642]">${service.name}</h3>
                <p class="text-gray-600 text-sm mb-1">${service.provider.businessName}</p>
                ${service.provider.city ? `<p class="text-gray-500 text-xs mb-1">📍 ${service.provider.city}</p>` : ''}
                ${service.provider.address ? `<p class="text-gray-500 text-xs mb-2">${service.provider.address}</p>` : ''}
                <div class="flex items-center justify-between mb-2">
                  <p class="text-[#0F9D58] font-bold text-lg">$${service.price.toLocaleString()}</p>
                  ${service.rating ? `<div class="flex items-center"><span class="text-[#FFD166]">★</span> <span class="ml-1 text-sm font-medium">${service.rating}</span></div>` : ''}
                </div>
                ${service.duration ? `<p class="text-gray-500 text-xs">⏱️ ${service.duration} min</p>` : ''}
                <div class="flex gap-2 mt-3">
                  <button onclick="window.selectService('${service.id}')" class="flex-1 bg-[#0F9D58] text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-[#0F9D58]/90">Ver más</button>
                  <button onclick="window.openDirections(${service.provider.latitude}, ${service.provider.longitude})" class="bg-[#FFD166] text-[#073642] px-3 py-1.5 rounded text-xs font-medium hover:bg-[#FFD166]/90" title="Cómo llegar">🗺️</button>
                </div>
              </div>
            `
          });

          marker.addListener("click", () => {
            infoWindow.open(mapInstance, marker);
            onServiceSelect?.(service);
          });

          markersRef.current.push(marker);
        });

        console.log('✅ Total marcadores creados:', markersRef.current.length);

        // Agregar funciones globales para los botones del info window
        (window as any).selectService = (serviceId: string) => {
          const service = services.find((s: ServiceItem) => s.id === serviceId);
          if (service) onServiceSelect?.(service);
        };

        (window as any).openDirections = (lat: number, lng: number) => {
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
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

      {/* Error de ubicación */}
      {locationError && !showSearchBox && (
        <div className="absolute top-4 left-4 bg-red-50 border border-red-200 rounded-lg shadow-lg p-3 z-50 max-w-xs">
          <p className="text-red-800 text-sm font-semibold mb-1">⚠️ Error de ubicación</p>
          <p className="text-red-600 text-xs">{locationError}</p>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
}
