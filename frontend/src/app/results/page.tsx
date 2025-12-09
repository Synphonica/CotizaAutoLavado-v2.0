"use client";
import { apiGet } from "@/lib/api";
import { SearchBar } from "@/components/SearchBar";
import { FilterPill } from "@/components/FilterPill";
import { ServiceCard, type ServiceItem } from "@/components/ServiceCard";
import { motion } from "framer-motion";
import { ModernNavbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Star, MapPin, Clock, Percent, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { SearchResultsSkeleton } from "@/components/ui/loading-skeletons";
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
  images?: Array<{
    id: string;
    url: string;
    alt?: string;
    isMain: boolean;
  }>;
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
  query: string;
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
      region: (backendResult.provider as any)?.region
    },
    rating: backendResult.rating,
    discount: discount,
    duration: backendResult.duration,
    description: backendResult.description,
    images: backendResult.images?.map(img => img.url),
    category: backendResult.category
  };
}

async function fetchResults(q: string | undefined, page: number = 1, limit: number = 20, region?: string, city?: string, token?: string | null) {
  try {
    console.log(`🔍 Fetching results from backend API... (page ${page})`);

    // Construir parámetros de query
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (region && region !== 'all') params.append('region', region);
    if (city && city !== 'all') params.append('city', city);

    const queryString = params.toString();
    const url = `/search${queryString ? `?${queryString}` : ''}`;

    console.log(`📡 Request URL: ${url}`);

    const data = await apiGet<BackendSearchResponse>(url, { token });
    console.log('✅ Backend response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching results from backend:', error);
    throw error; // Propagate error instead of using fallback
  }
}

export default function Results({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { getToken } = useAuth();
  const [sp, setSp] = useState<{ q?: string }>({});
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);

  // Estados para filtros y ordenamiento
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "rating" | "none">("none");
  const [priceRange, setPriceRange] = useState<"low" | "medium" | "high" | "all">("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [regionCityMap, setRegionCityMap] = useState<Record<string, string[]>>({});

  // Cargar ubicaciones globales una vez al montar
  useEffect(() => {
    const loadLocations = async () => {
      try {
        console.log('🔍 Cargando ubicaciones globales...');
        const token = await getToken();
        const data = await apiGet<{
          regions: string[];
          cities: string[];
          regionCityMap: Record<string, string[]>;
        }>('/search/locations', { token });
        console.log('✅ Ubicaciones cargadas:', data);
        setAvailableRegions(data.regions);
        setAvailableCities(data.cities);
        setRegionCityMap(data.regionCityMap);
      } catch (error) {
        console.error('❌ Error loading locations:', error);
      }
    };
    loadLocations();
  }, [getToken]);

  // Extraer ubicaciones de los items como fallback
  useEffect(() => {
    if (items.length > 0 && availableRegions.length === 0) {
      console.log('📍 Extrayendo ubicaciones de los items...');
      const regions = new Set<string>();
      const cities = new Set<string>();
      const regionCityMapTemp: Record<string, Set<string>> = {};

      items.forEach(item => {
        if (item.provider?.region) {
          regions.add(item.provider.region);
          if (!regionCityMapTemp[item.provider.region]) {
            regionCityMapTemp[item.provider.region] = new Set();
          }
          if (item.provider?.city) {
            cities.add(item.provider.city);
            regionCityMapTemp[item.provider.region].add(item.provider.city);
          }
        }
      });

      const regionCityMapArray: Record<string, string[]> = {};
      Object.keys(regionCityMapTemp).forEach(region => {
        regionCityMapArray[region] = Array.from(regionCityMapTemp[region]).sort();
      });

      setAvailableRegions(Array.from(regions).sort());
      setAvailableCities(Array.from(cities).sort());
      setRegionCityMap(regionCityMapArray);
      console.log('✅ Ubicaciones extraídas:', {
        regions: Array.from(regions).sort(),
        cities: Array.from(cities).sort()
      });
    }
  }, [items, availableRegions.length]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = await searchParams;
        setSp(params);
        const token = await getToken();
        const response = await fetchResults(params?.q, currentPage, limit, selectedRegion, selectedCity, token);
        const transformedItems = response.results.map(transformToServiceItem);
        setItems(transformedItems);
        setTotalPages(response.totalPages);
        setTotal(response.total);

        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        console.error('Error loading results:', err);
        setError('No se pudo conectar con el servidor. Por favor verifica que el backend esté corriendo.');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [searchParams, currentPage, limit, selectedRegion, selectedCity, getToken]);

  // Aplicar filtros y ordenamiento LOCALES (no región/ciudad, esos van al backend)
  useEffect(() => {
    let filtered = [...items];

    // Filtrar por descuento
    if (activeFilters.includes("Descuento")) {
      filtered = filtered.filter(item => item.discount && item.discount > 0);
    }

    // Filtrar por mejor valorados (rating >= 4)
    if (activeFilters.includes("Mejor valorados")) {
      filtered = filtered.filter(item => item.rating && item.rating >= 4);
    }

    // Filtrar por rango de precio
    if (priceRange !== "all") {
      if (priceRange === "low") {
        filtered = filtered.filter(item => item.price < 10000);
      } else if (priceRange === "medium") {
        filtered = filtered.filter(item => item.price >= 10000 && item.price <= 20000);
      } else if (priceRange === "high") {
        filtered = filtered.filter(item => item.price > 20000);
      }
    }

    // Ordenar
    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredItems(filtered);
  }, [items, activeFilters, sortBy, priceRange]);
  // Nota: selectedRegion y selectedCity NO están aquí porque se manejan en el backend

  const toggleFilter = (filterLabel: string) => {
    setActiveFilters(prev =>
      prev.includes(filterLabel)
        ? prev.filter(f => f !== filterLabel)
        : [...prev, filterLabel]
    );
  };

  const filters = [
    { label: "Descuento", icon: Percent },
    { label: "Mejor valorados", icon: Star },
    { label: "24/7", icon: Clock },
    { label: "A domicilio", icon: MapPin }
  ];

  return (
    <>
      <ModernNavbar />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <SearchBar initialQuery={sp?.q || ""} />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            {/* Results */}
            <motion.section
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-[#073642] mb-1">
                    {sp?.q ? `Resultados para "${sp.q}"` : "Todos los servicios"}
                  </h1>
                  <p className="text-gray-600">{filteredItems.length} servicios {activeFilters.length > 0 || priceRange !== "all" || sortBy !== "none" || selectedRegion !== "all" || selectedCity !== "all" ? "filtrados" : "encontrados"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page
                    }}
                    className="px-3 py-2 border border-emerald-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0F9D58] bg-white hover:border-[#0F9D58] transition-colors"
                  >
                    <option value={20}>20 por página</option>
                    <option value={40}>40 por página</option>
                    <option value={60}>60 por página</option>
                    <option value={100}>100 por página</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortBy(prev => prev === "price-asc" ? "price-desc" : "price-asc")}
                    className={`border-emerald-200 hover:bg-emerald-50 hover:border-[#0F9D58] hover:text-[#0F9D58] transition-all ${(sortBy === "price-asc" || sortBy === "price-desc") ? "bg-[#FFD166] border-[#FFD166] text-[#073642]" : ""}`}
                  >
                    Ordenar por precio {sortBy === "price-asc" ? "↑" : sortBy === "price-desc" ? "↓" : ""}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortBy(prev => prev === "rating" ? "none" : "rating")}
                    className={`border-emerald-200 hover:bg-emerald-50 hover:border-[#0F9D58] hover:text-[#0F9D58] transition-all ${sortBy === "rating" ? "bg-[#FFD166] border-[#FFD166] text-[#073642]" : ""}`}
                  >
                    Ordenar por rating
                  </Button>
                </div>
              </div>

              {loading ? (
                <SearchResultsSkeleton count={6} />
              ) : error ? (
                <Card className="p-12 text-center border-red-200 bg-red-50">
                  <CardContent>
                    <div className="text-red-400 mb-4">
                      <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-red-900">Error de conexión</h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      Reintentar
                    </Button>
                  </CardContent>
                </Card>
              ) : filteredItems.length === 0 ? (
                <Card className="p-12 text-center">
                  <CardContent>
                    <div className="text-gray-400 mb-4">
                      <Star className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No se encontraron resultados</h3>
                    <p className="text-gray-600 mb-4">Intenta con otros términos de búsqueda o ajusta los filtros</p>
                    {(activeFilters.length > 0 || priceRange !== "all" || selectedRegion !== "all" || selectedCity !== "all") && (
                      <Button
                        onClick={() => {
                          setActiveFilters([]);
                          setPriceRange("all");
                          setSelectedRegion("all");
                          setSelectedCity("all");
                          setSortBy("none");
                        }}
                        className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642]"
                      >
                        Limpiar filtros
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item, index) => (
                      <ServiceCard key={item.id} item={item} index={index} />
                    ))}
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="gap-2 border-emerald-200 hover:bg-[#FFD166] hover:border-[#FFD166] hover:text-[#073642] transition-all disabled:opacity-50 disabled:hover:bg-transparent"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>

                      <div className="flex items-center gap-1">
                        {/* Primera página */}
                        {currentPage > 3 && (
                          <>
                            <Button
                              variant={currentPage === 1 ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(1)}
                              className={currentPage === 1 ? "bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] border-[#FFD166]" : "border-emerald-200 hover:bg-emerald-50 hover:border-[#0F9D58]"}
                            >
                              1
                            </Button>
                            {currentPage > 4 && <span className="px-2 text-gray-500">...</span>}
                          </>
                        )}

                        {/* Páginas cercanas */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            const distance = Math.abs(page - currentPage);
                            return distance <= 2;
                          })
                          .map(page => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={currentPage === page ? "bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] border-[#FFD166]" : "border-emerald-200 hover:bg-emerald-50 hover:border-[#0F9D58]"}
                            >
                              {page}
                            </Button>
                          ))}

                        {/* Última página */}
                        {currentPage < totalPages - 2 && (
                          <>
                            {currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                            <Button
                              variant={currentPage === totalPages ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(totalPages)}
                              className={currentPage === totalPages ? "bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] border-[#FFD166]" : "border-emerald-200 hover:bg-emerald-50 hover:border-[#0F9D58]"}
                            >
                              {totalPages}
                            </Button>
                          </>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="gap-2 border-emerald-200 hover:bg-[#FFD166] hover:border-[#FFD166] hover:text-[#073642] transition-all disabled:opacity-50 disabled:hover:bg-transparent"
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Info de paginación */}
                  {total > 0 && (
                    <div className="mt-4 text-center text-sm text-[#073642]/70 font-medium">
                      Mostrando {((currentPage - 1) * limit) + 1} - {Math.min(currentPage * limit, total)} de {total.toLocaleString()} servicios
                    </div>
                  )}
                </>
              )}
            </motion.section>

            {/* Filters Sidebar */}
            <motion.aside
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-6"
            >
              <Card className="sticky top-24 border-2 border-emerald-100 shadow-lg shadow-emerald-100/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    Filtros
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-[#073642]">Categorías</h4>
                    <div className="flex flex-wrap gap-2">
                      {filters.map((filter) => (
                        <div key={filter.label} onClick={() => toggleFilter(filter.label)}>
                          <FilterPill
                            label={filter.label}
                            icon={filter.icon}
                            active={activeFilters.includes(filter.label)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-[#073642]" >Precio</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPriceRange(prev => prev === "low" ? "all" : "low")}
                        className={`w-full justify-start border-emerald-200 hover:bg-emerald-50 hover:border-[#0F9D58] transition-all ${priceRange === "low" ? "bg-emerald-50 border-[#0F9D58] text-[#0F9D58]" : ""}`}
                      >
                        <Badge variant="secondary" className="mr-2 bg-emerald-100 text-[#0F9D58]">$</Badge>
                        Menos de $10.000
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPriceRange(prev => prev === "medium" ? "all" : "medium")}
                        className={`w-full justify-start border-emerald-200 hover:bg-emerald-50 hover:border-[#0F9D58] transition-all ${priceRange === "medium" ? "bg-emerald-50 border-[#0F9D58] text-[#0F9D58]" : ""}`}
                      >
                        <Badge variant="secondary" className="mr-2 bg-emerald-100 text-[#0F9D58]">$$</Badge>
                        $10.000 - $20.000
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPriceRange(prev => prev === "high" ? "all" : "high")}
                        className={`w-full justify-start border-emerald-200 hover:bg-emerald-50 hover:border-[#0F9D58] transition-all ${priceRange === "high" ? "bg-emerald-50 border-[#0F9D58] text-[#0F9D58]" : ""}`}
                      >
                        <Badge variant="secondary" className="mr-2 bg-emerald-100 text-[#0F9D58]">$$$</Badge>
                        Más de $20.000
                      </Button>
                    </div>
                  </div>

                  {/* Filtro por Región */}
                  <div>
                    <h4 className="font-semibold mb-3 text-[#073642] flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#0F9D58]" />
                      Región
                    </h4>
                    {availableRegions.length > 0 ? (
                      <select
                        value={selectedRegion}
                        onChange={(e) => {
                          setSelectedRegion(e.target.value);
                          setSelectedCity("all"); // Reset ciudad al cambiar región
                        }}
                        className="w-full px-3 py-2 border border-emerald-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0F9D58] bg-white hover:border-[#0F9D58] transition-colors"
                      >
                        <option value="all">Todas las regiones</option>
                        {availableRegions.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-gray-500 italic">Cargando regiones...</div>
                    )}
                  </div>

                  {/* Filtro por Comuna/Ciudad */}
                  <div>
                    <h4 className="font-semibold mb-3 text-[#073642] flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#2B8EAD]" />
                      Comuna
                    </h4>
                    {availableCities.length > 0 ? (
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full px-3 py-2 border border-emerald-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0F9D58] bg-white hover:border-[#0F9D58] transition-colors"
                      >
                        <option value="all">Todas las comunas</option>
                        {(selectedRegion === "all"
                          ? availableCities
                          : regionCityMap[selectedRegion] || []
                        ).map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-gray-500 italic">Cargando comunas...</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.aside>
          </div>
        </div>
      </div>
    </>
  );
}


