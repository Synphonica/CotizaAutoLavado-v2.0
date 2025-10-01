"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Star, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";

// Mock data para el panel de proveedor
const mockProviderData = {
  businessName: "AutoClean Pro",
  email: "contacto@autocleanpro.cl",
  phone: "+56 9 1234 5678",
  address: "Av. Providencia 1234, Providencia, Santiago",
  rating: 4.8,
  totalServices: 12,
  totalBookings: 156,
  monthlyRevenue: 2340000,
  activeBookings: 8
};

const mockServices = [
  {
    id: "1",
    name: "Lavado Exterior Premium",
    price: 15000,
    originalPrice: 18750,
    discount: 20,
    status: "active",
    bookings: 45,
    rating: 4.8,
    category: "Lavado Exterior"
  },
  {
    id: "2", 
    name: "Lavado Completo + Encerado",
    price: 25000,
    originalPrice: 30000,
    discount: 17,
    status: "active",
    bookings: 32,
    rating: 4.9,
    category: "Lavado Completo"
  },
  {
    id: "3",
    name: "Lavado Express",
    price: 8000,
    originalPrice: 8000,
    discount: 0,
    status: "inactive",
    bookings: 28,
    rating: 4.5,
    category: "Lavado Rápido"
  }
];

const mockBookings = [
  {
    id: "1",
    customerName: "María González",
    service: "Lavado Exterior Premium",
    date: "2024-01-25",
    time: "10:00",
    status: "confirmed",
    price: 15000,
    phone: "+56 9 8765 4321"
  },
  {
    id: "2",
    customerName: "Carlos Rodríguez", 
    service: "Lavado Completo + Encerado",
    date: "2024-01-25",
    time: "14:00",
    status: "pending",
    price: 25000,
    phone: "+56 9 1234 5678"
  },
  {
    id: "3",
    customerName: "Ana Martínez",
    service: "Lavado Express",
    date: "2024-01-26",
    time: "09:00",
    status: "completed",
    price: 8000,
    phone: "+56 9 5555 1234"
  }
];

const mockStats = {
  totalRevenue: 2340000,
  monthlyGrowth: 12.5,
  totalBookings: 156,
  bookingsGrowth: 8.3,
  averageRating: 4.8,
  ratingGrowth: 0.2,
  completionRate: 94.2,
  completionGrowth: 2.1
};

export default function ProviderPage() {
  const [services] = useState(mockServices);
  const [bookings] = useState(mockBookings);
  const [stats] = useState(mockStats);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Panel de Proveedor
              </h1>
              <p className="text-gray-600">
                Gestiona tus servicios, reservas y estadísticas
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuración
              </Button>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Servicio
              </Button>
            </div>
          </div>

          {/* Información del negocio */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{mockProviderData.businessName}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{mockProviderData.address}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{mockProviderData.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{mockProviderData.email}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-bold">{mockProviderData.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600">Rating promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Estadísticas principales */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">+{stats.monthlyGrowth}%</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reservas Totales</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalBookings}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-600">+{stats.bookingsGrowth}%</span>
                  </div>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rating Promedio</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.averageRating}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-purple-600">+{stats.ratingGrowth}</span>
                  </div>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tasa de Completado</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.completionRate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-orange-600">+{stats.completionGrowth}%</span>
                  </div>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-600" />
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
          <Tabs defaultValue="services" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="services" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Servicios
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Reservas
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuración
              </TabsTrigger>
            </TabsList>

            {/* Servicios */}
            <TabsContent value="services" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Mis Servicios
                    </CardTitle>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Agregar Servicio
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, index) => (
                      <motion.div
                        key={service.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="group"
                      >
                        <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {service.category}
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-gray-900">
                                  ${service.price.toLocaleString()}
                                </span>
                                {service.discount > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    -{service.discount}%
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{service.bookings} reservas</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span>{service.rating}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <Badge 
                                  variant={service.status === "active" ? "default" : "secondary"}
                                  className={service.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                                >
                                  {service.status === "active" ? "Activo" : "Inactivo"}
                                </Badge>
                                <Button variant="outline" size="sm">
                                  Editar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reservas */}
            <TabsContent value="bookings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Reservas Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{booking.customerName}</h4>
                            <p className="text-sm text-gray-600">{booking.service}</p>
                            <p className="text-xs text-gray-500">{booking.date} a las {booking.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-lg">${booking.price.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">{booking.phone}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(booking.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(booking.status)}
                                {booking.status === "confirmed" ? "Confirmado" : 
                                 booking.status === "pending" ? "Pendiente" :
                                 booking.status === "completed" ? "Completado" : "Cancelado"}
                              </div>
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ingresos por Mes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Gráfico de ingresos (próximamente)</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Servicios Más Populares</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {services.slice(0, 3).map((service, index) => (
                        <div key={service.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{service.name}</p>
                              <p className="text-sm text-gray-600">{service.bookings} reservas</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${service.price.toLocaleString()}</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{service.rating}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Configuración */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuración del Negocio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre del Negocio</label>
                      <Input defaultValue={mockProviderData.businessName} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input defaultValue={mockProviderData.email} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Teléfono</label>
                      <Input defaultValue={mockProviderData.phone} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Dirección</label>
                      <Input defaultValue={mockProviderData.address} />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Horarios de Atención</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Horario de Apertura</label>
                        <Input type="time" defaultValue="08:00" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Horario de Cierre</label>
                        <Input type="time" defaultValue="20:00" />
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">Guardar Cambios</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
