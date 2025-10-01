"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ServiceItem } from "@/components/ServiceCard";
import { Search, Star, MapPin, Clock, TrendingUp, TrendingDown, Minus, Plus, X } from "lucide-react";

// Mock data para comparación
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

export default function ComparePage() {
  const [services] = useState<ServiceItem[]>(mockServices);
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "rating" | "name">("price");

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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Compara precios de autolavados
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Selecciona hasta 4 servicios para comparar precios, calificaciones y características
            </p>
          </div>

          {/* Búsqueda y filtros */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar servicios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant={sortBy === "price" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("price")}
              >
                Ordenar por precio
              </Button>
              <Button
                variant={sortBy === "rating" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("rating")}
              >
                Ordenar por rating
              </Button>
              <Button
                variant={sortBy === "name" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("name")}
              >
                Ordenar por nombre
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Comparación actual */}
        {selectedServices.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
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
                      <Card className="border-2 border-blue-200">
                        <CardContent className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => removeFromComparison(service.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <div className="pr-6">
                            <h4 className="font-semibold text-sm mb-1">{service.name}</h4>
                            <p className="text-xs text-gray-600 mb-2">{service.provider.businessName}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-blue-600">${service.price.toLocaleString()}</span>
                              {service.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
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
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-green-600">${priceComparison.minPrice.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Precio más bajo</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">${Math.round(priceComparison.avgPrice).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Precio promedio</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-red-600">${priceComparison.maxPrice.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Precio más alto</div>
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
                  <Card className={`h-full transition-all duration-300 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 shadow-lg' 
                      : 'hover:shadow-lg border-gray-200'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                            <MapPin className="h-3 w-3" />
                            <span>{service.provider.businessName}</span>
                            {service.provider.city && <span>· {service.provider.city}</span>}
                          </div>
                        </div>
                        {isSelected && (
                          <Badge className="bg-blue-600">Seleccionado</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        {service.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{service.rating}</span>
                          </div>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          30 min
                        </Badge>
                        {service.discount && (
                          <Badge variant="destructive" className="text-xs">
                            -{service.discount}%
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">${service.price.toLocaleString()}</span>
                          {service.discount && (
                            <span className="text-sm text-gray-500 line-through">
                              ${Math.round(service.price / (1 - service.discount / 100)).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        className={`w-full ${
                          isSelected 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : canAdd 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                              : 'bg-gray-300 cursor-not-allowed'
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
        </motion.div>
      </div>
    </div>
  );
}
