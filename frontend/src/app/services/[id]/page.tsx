"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceItem } from "@/components/ServiceCard";
import { 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Heart, 
  Share2, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Shield,
  Award,
  Users,
  Clock as ClockIcon,
  MapPin as MapPinIcon
} from "lucide-react";

// Mock data para el servicio detallado
const mockServiceDetail = {
  id: "1",
  name: "Lavado Exterior Premium",
  description: "Servicio completo de lavado exterior con productos premium, encerado y detallado. Incluye lavado de llantas, limpieza de vidrios y aplicación de cera de alta calidad.",
  price: 15000,
  originalPrice: 18750,
  discount: 20,
  provider: {
    id: "p1",
    businessName: "AutoClean Pro",
    city: "Providencia",
    address: "Av. Providencia 1234, Providencia, Santiago",
    phone: "+56 9 1234 5678",
    email: "contacto@autocleanpro.cl",
    rating: 4.8,
    reviews: 127,
    yearsExperience: 8
  },
  rating: 4.8,
  totalReviews: 127,
  images: [
    "/api/placeholder/800/600",
    "/api/placeholder/800/600", 
    "/api/placeholder/800/600",
    "/api/placeholder/800/600"
  ],
  features: [
    "Lavado con champú premium",
    "Encerado con cera de carnaúba",
    "Limpieza de llantas y neumáticos",
    "Limpieza de vidrios interior y exterior",
    "Aspirado básico",
    "Secado con microfibra"
  ],
  duration: "45-60 minutos",
  availability: "Lunes a Domingo 8:00 - 20:00",
  includes: [
    "Productos premium",
    "Personal especializado",
    "Garantía de satisfacción",
    "Certificado de calidad"
  ],
  reviews: [
    {
      id: "1",
      user: "María González",
      rating: 5,
      date: "2024-01-15",
      comment: "Excelente servicio, mi auto quedó impecable. El personal muy profesional y los productos de primera calidad.",
      helpful: 12
    },
    {
      id: "2", 
      user: "Carlos Rodríguez",
      rating: 4,
      date: "2024-01-10",
      comment: "Muy buen servicio, el precio está justo para la calidad que ofrecen. Lo recomiendo.",
      helpful: 8
    },
    {
      id: "3",
      user: "Ana Martínez",
      rating: 5,
      date: "2024-01-08",
      comment: "Increíble atención al detalle. Mi auto nunca había quedado tan limpio. Definitivamente volveré.",
      helpful: 15
    }
  ]
};

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  const [service, setService] = useState(mockServiceDetail);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % service.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + service.images.length) % service.images.length);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Eliminamos la lógica compleja y usamos CSS puro para mejor rendimiento

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
        {/* Breadcrumb */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-blue-600">Inicio</a>
            <span>/</span>
            <a href="/results" className="hover:text-blue-600">Resultados</a>
            <span>/</span>
            <span className="text-gray-900">{service.name}</span>
          </nav>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Galería de imágenes */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="overflow-hidden">
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={service.images[selectedImage]}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Controles de imagen */}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* Indicadores */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {service.images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === selectedImage ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={() => setSelectedImage(index)}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Información del servicio */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
                      <div className="flex items-center gap-4 text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{service.rating}</span>
                          <span>({service.totalReviews} reseñas)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{service.provider.businessName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={toggleFavorite}>
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-6">{service.description}</p>

                  {/* Características */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">¿Qué incluye?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tabs de información adicional */}
                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="info">Información</TabsTrigger>
                      <TabsTrigger value="reviews">Reseñas</TabsTrigger>
                      <TabsTrigger value="provider">Proveedor</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="info" className="mt-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Disponibilidad</h4>
                          <p className="text-gray-600">{service.availability}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Garantías</h4>
                          <div className="space-y-2">
                            {service.includes.map((item, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-500" />
                                <span className="text-sm">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="reviews" className="mt-6">
                      <div className="space-y-4">
                        {service.reviews.map((review) => (
                          <div key={review.id} className="border-b pb-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold">{review.user}</h4>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">{review.date}</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Heart className="h-4 w-4" />
                                {review.helpful}
                              </Button>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="provider" className="mt-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <Award className="h-8 w-8 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold">{service.provider.businessName}</h4>
                            <p className="text-gray-600">{service.provider.address}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{service.provider.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{service.provider.yearsExperience} años de experiencia</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{service.provider.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span>{service.provider.email}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Panel lateral de información y contacto */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="sticky top-6 space-y-6 h-fit overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 3rem)' }}
          >
            {/* Información del proveedor y contacto */}
            <Card>
              <CardHeader>
                <CardTitle>Información del servicio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-gray-900">${service.price.toLocaleString()}</span>
                    {service.discount > 0 && (
                      <>
                        <span className="text-lg text-gray-500 line-through">${service.originalPrice.toLocaleString()}</span>
                        <Badge variant="destructive">-{service.discount}%</Badge>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Precio informativo</p>
                </div>

                <div className="space-y-3 text-sm bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duración:</span>
                    <span className="font-medium">{service.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Disponibilidad:</span>
                    <span className="font-medium text-green-600">Disponible</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Calificación:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{service.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg py-3"
                    onClick={() => {
                      const phone = service.provider.phone || "Teléfono no disponible";
                      const message = `Hola, estoy interesado en el servicio "${service.name}" que vi en Alto Carwash. ¿Podrían darme más información?`;
                      const whatsappUrl = `https://wa.me/56${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Contactar proveedor
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full text-lg py-3"
                    onClick={() => {
                      const address = encodeURIComponent(service.provider.address || 'Santiago, Chile');
                      window.location.href = `/map?address=${address}&provider=${service.provider.businessName}`;
                    }}
                  >
                    <MapPin className="h-5 w-5 mr-2" />
                    Ver ubicación
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Precios pueden variar - confirma con el proveedor
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información importante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <ClockIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Duración</h4>
                    <p className="text-sm text-gray-600">{service.duration}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Ubicación</h4>
                    <p className="text-sm text-gray-600">{service.provider.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Calificación</h4>
                    <p className="text-sm text-gray-600">{service.rating}/5 ({service.totalReviews} reseñas)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer del comparador */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Alto Carwash es un comparador</h4>
                  <p className="text-sm text-gray-600">
                    Los precios mostrados son informativos. Para contratar el servicio debes contactar directamente con el proveedor. 
                    Los precios y disponibilidad pueden variar.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
