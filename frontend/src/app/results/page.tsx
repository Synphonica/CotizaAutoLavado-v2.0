"use client";
import { apiGet } from "@/lib/api";
import { SearchBar } from "@/components/SearchBar";
import { FilterPill } from "@/components/FilterPill";
import { ServiceCard, type ServiceItem } from "@/components/ServiceCard";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Star, MapPin, Clock, Percent } from "lucide-react";
import { useState, useEffect } from "react";

// Mock data para demostración (fallback)
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

async function fetchResults(q: string | undefined) {
  try {
    if (!q) return mockServices;
    const data = await apiGet<{ services: ServiceItem[] }>(`/search?q=${encodeURIComponent(q)}&limit=10`);
    return data.services || mockServices;
  } catch (error) {
    console.error('Error fetching results:', error);
    return mockServices;
  }
}

export default function Results({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [sp, setSp] = useState<{ q?: string }>({});
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const params = await searchParams;
      setSp(params);
      const results = await fetchResults(params?.q);
      setItems(results);
      setLoading(false);
    };
    loadData();
  }, [searchParams]);

  const filters = [
    { label: "Descuento", icon: Percent },
    { label: "Mejor valorados", icon: Star },
    { label: "24/7", icon: Clock },
    { label: "A domicilio", icon: MapPin }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <SearchBar initialQuery={sp?.q || ""} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Categorías</h4>
                  <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => (
                      <FilterPill 
                        key={filter.label}
                        label={filter.label}
                        icon={filter.icon}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Precio</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Badge variant="secondary" className="mr-2">$</Badge>
                      Menos de $10.000
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Badge variant="secondary" className="mr-2">$$</Badge>
                      $10.000 - $20.000
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Badge variant="secondary" className="mr-2">$$$</Badge>
                      Más de $20.000
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.aside>

          {/* Results */}
          <motion.section
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {sp?.q ? `Resultados para "${sp.q}"` : "Todos los servicios"}
                </h1>
                <p className="text-gray-600">{items.length} servicios encontrados</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Ordenar por precio
                </Button>
                <Button variant="outline" size="sm">
                  Ordenar por rating
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <Card className="p-12 text-center">
                <CardContent>
                  <div className="text-gray-400 mb-4">
                    <Star className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No se encontraron resultados</h3>
                  <p className="text-gray-600">Intenta con otros términos de búsqueda</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, index) => (
                  <ServiceCard key={item.id} item={item} index={index} />
                ))}
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
}


