"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceItem } from "@/components/ServiceCard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { apiGet } from "@/lib/api";
import { 
  Heart, 
  History, 
  Star, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Settings, 
  Bell,
  User,
  Car,
  Award,
  Calendar
} from "lucide-react";

// Mock data para el dashboard
const mockFavorites: ServiceItem[] = [
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
  }
];

const mockHistory = [
  {
    id: "1",
    service: "Lavado Express",
    provider: "Quick Wash",
    date: "2024-01-15",
    price: 8000,
    rating: 4.5
  },
  {
    id: "2",
    service: "Lavado Premium",
    provider: "Elite Auto",
    date: "2024-01-10",
    price: 35000,
    rating: 4.9
  }
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<ServiceItem[]>(mockFavorites);
  const [history, setHistory] = useState(mockHistory);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Sincronizar usuario con el backend
        try {
          const syncResponse = await apiGet('/auth/clerk-profile');
          console.log('Usuario sincronizado:', syncResponse);
        } catch (syncError) {
          console.log('Error sincronizando usuario (esto es normal si no está autenticado):', syncError);
        }
        
        // Aquí cargarías los datos reales del usuario
        // const userFavorites = await apiGet<ServiceItem[]>('/favorites');
        // const userHistory = await apiGet<any[]>('/history');
        // setFavorites(userFavorites);
        // setHistory(userHistory);
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadUserData();
    }
  }, [user]);

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Hola, {user?.firstName || 'Usuario'}!
              </h1>
              <p className="text-gray-600">
                Gestiona tus servicios favoritos, historial y preferencias
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuración
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificaciones
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas rápidas */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Servicios favoritos</p>
                  <p className="text-2xl font-bold text-blue-600">{favorites.length}</p>
                </div>
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Servicios usados</p>
                  <p className="text-2xl font-bold text-green-600">{history.length}</p>
                </div>
                <History className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ahorro total</p>
                  <p className="text-2xl font-bold text-purple-600">$12.000</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rating promedio</p>
                  <p className="text-2xl font-bold text-orange-600">4.7</p>
                </div>
                <Star className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contenido principal */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Tabs defaultValue="favorites" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Favoritos
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Historial
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuración
              </TabsTrigger>
            </TabsList>

            {/* Favoritos */}
            <TabsContent value="favorites" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Mis servicios favoritos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {favorites.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">No tienes favoritos aún</h3>
                      <p className="text-gray-600 mb-4">Explora servicios y marca tus favoritos</p>
                      <Button>Explorar servicios</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favorites.map((service, index) => (
                        <motion.div
                          key={service.id}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          whileHover={{ y: -5, scale: 1.02 }}
                        >
                          <Card className="h-full border-2 border-red-200 bg-red-50">
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
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                  <Heart className="h-4 w-4 fill-current" />
                                </Button>
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

                              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                                Ver detalles
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Historial */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Historial de servicios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">No hay historial aún</h3>
                      <p className="text-gray-600 mb-4">Cuando uses servicios, aparecerán aquí</p>
                      <Button>Explorar servicios</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {history.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Car className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{item.service}</h4>
                              <p className="text-sm text-gray-600">{item.provider}</p>
                              <p className="text-xs text-gray-500">{item.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">${item.price.toLocaleString()}</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{item.rating}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Perfil */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Mi perfil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{user?.firstName} {user?.lastName}</h3>
                      <p className="text-gray-600">{user?.emailAddresses?.[0]?.emailAddress}</p>
                      <Badge variant="secondary" className="mt-1">
                        <Award className="h-3 w-3 mr-1" />
                        Usuario Premium
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre</label>
                      <Input defaultValue={user?.firstName || ''} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input defaultValue={user?.emailAddresses?.[0]?.emailAddress || ''} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Teléfono</label>
                      <Input defaultValue="+56 9 1234 5678" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ciudad</label>
                      <Input defaultValue="Santiago" />
                    </div>
                  </div>

                  <Button className="w-full">Guardar cambios</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configuración */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuración
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Notificaciones por email</h4>
                        <p className="text-sm text-gray-600">Recibe alertas de precios y ofertas</p>
                      </div>
                      <Button variant="outline" size="sm">Activar</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Ubicación automática</h4>
                        <p className="text-sm text-gray-600">Usa tu ubicación para búsquedas</p>
                      </div>
                      <Button variant="outline" size="sm">Activar</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Modo oscuro</h4>
                        <p className="text-sm text-gray-600">Cambiar tema de la aplicación</p>
                      </div>
                      <Button variant="outline" size="sm">Desactivar</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
