"use client";
import { useState, useEffect, use, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ModernNavbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCard, ServiceItem } from "@/components/ServiceCard";
import { apiGet } from "@/lib/api";
import CreateAlertModal from "@/components/alerts/CreateAlertModal";
import { ServiceDetailSkeleton } from "@/components/ui/loading-skeletons";
import { useAuth } from "@clerk/nextjs";
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
  MapPin as MapPinIcon,
  X,
  TrendingUp,
  Bell,
  Globe,
  Instagram,
  Navigation
} from "lucide-react";
import BookingCalendar from "@/components/booking/BookingCalendar";
import TimeSlotPicker from "@/components/booking/TimeSlotPicker";
import BookingForm from "@/components/booking/BookingForm";
import { TimeSlot } from "@/types/booking";

// Tipos locales
interface Review {
  id: string;
  user: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

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

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params usando React.use()
  const { id } = use(params);
  const { getToken } = useAuth();

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [similarServices, setSimilarServices] = useState<ServiceItem[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  // Estados para el modal de agendamiento
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<'calendar' | 'timeslot' | 'form' | 'success'>('calendar');
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [bookingSlot, setBookingSlot] = useState<TimeSlot | null>(null);

  // Estado para el modal de alerta
  const [showAlertModal, setShowAlertModal] = useState(false);

  // Cargar datos del servicio
  useEffect(() => {
    const fetchService = async () => {
      // Validar que el id existe antes de hacer la petición
      if (!id || id === 'undefined') {
        console.warn('Service ID is undefined, skipping fetch');
        return;
      }

      try {
        setLoading(true);
        const token = await getToken();
        const data = await apiGet<any>(`/services/${id}`, { token });

        // Mapear datos de la API a la estructura que espera el componente
        const mappedService = {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          originalPrice: data.discountedPrice ? data.price : undefined,
          rating: data.stats?.averageRating || data.provider?.rating || 0,
          totalReviews: data.stats?.reviewCount || data.provider?.reviewCount || 0,
          duration: `${data.duration} minutos`,
          category: data.category || data.type,
          images: [
            data.imageUrl || '/placeholder-service.svg',
            ...(data.additionalImages || [])
          ],
          provider: {
            id: data.provider?.id || data.providerId,
            businessName: data.provider?.businessName || 'Proveedor',
            businessType: data.provider?.businessType || '',
            city: data.provider?.city || '',
            region: data.provider?.region || '',
            address: data.provider?.address || '',
            phone: data.provider?.phone || '',
            email: data.provider?.email || '',
            website: data.provider?.website || '',
            instagram: data.provider?.instagram || '',
            rating: data.provider?.rating || 0,
            reviewCount: data.provider?.reviewCount || 0,
            acceptsBookings: data.provider?.acceptsBookings || false,
            status: data.provider?.status || 'PENDING_APPROVAL'
          },
          features: data.includedServices || [],
          availability: data.isAvailable
            ? 'Disponible ahora'
            : 'No disponible en este momento',
          includes: data.tags || [],
          reviews: [] // Las reseñas se cargarían desde otro endpoint si están disponibles
        };

        setService(mappedService);

        // Guardar en historial de servicios vistos
        const historyItem = {
          id: mappedService.id,
          name: mappedService.name,
          price: mappedService.price,
          provider: mappedService.provider?.businessName || 'Proveedor',
          rating: mappedService.rating || 0,
          discount: data.discountedPrice ? Math.round((1 - data.discountedPrice / data.price) * 100) : undefined,
          duration: data.duration?.toString() || '',
          viewedAt: new Date().toISOString()
        };

        try {
          const existingHistory = localStorage.getItem('alto-carwash-viewed-services');
          let history = existingHistory ? JSON.parse(existingHistory) : [];

          // Remover si ya existe (para ponerlo al inicio)
          history = history.filter((item: { id: string }) => item.id !== mappedService.id);

          // Agregar al inicio
          history.unshift(historyItem);

          // Limitar a 50 elementos
          if (history.length > 50) {
            history = history.slice(0, 50);
          }

          localStorage.setItem('alto-carwash-viewed-services', JSON.stringify(history));
        } catch (e) {
          console.error('Error saving to history:', e);
        }
      } catch (error) {
        console.error('Error loading service:', error);
        setError('No se pudo cargar el servicio. Por favor intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    // Solo ejecutar si el id está disponible
    if (id && id !== 'undefined') {
      fetchService();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Cargar servicios similares
  useEffect(() => {
    const fetchSimilarServices = async () => {
      // Validar que el id existe antes de hacer la petición
      if (!id || id === 'undefined') {
        console.warn('Service ID is undefined, skipping similar services fetch');
        return;
      }

      try {
        setLoadingSimilar(true);
        const token = await getToken();
        const data = await apiGet<ServiceItem[]>(`/search/similar/${id}?limit=6`, { token });
        setSimilarServices(data);
      } catch (error) {
        console.error('Error loading similar services:', error);
      } finally {
        setLoadingSimilar(false);
      }
    };

    // Solo ejecutar si el id está disponible y el servicio ya se cargó
    if (id && id !== 'undefined' && service) {
      fetchSimilarServices();
    } else {
      setLoadingSimilar(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, service]);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % service.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + service.images.length) % service.images.length);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Funciones para el flujo de agendamiento
  const openBookingModal = () => {
    setShowBookingModal(true);
    setBookingStep('calendar');
    setBookingDate(null);
    setBookingSlot(null);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setBookingStep('calendar');
    setBookingDate(null);
    setBookingSlot(null);
  };

  const handleDateSelect = (date: Date) => {
    setBookingDate(date);
    setBookingStep('timeslot');
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setBookingSlot(slot);
    setBookingStep('form');
  };

  const handleBookingSuccess = (bookingId: string) => {
    setBookingStep('success');
    setTimeout(() => {
      closeBookingModal();
      // Redirigir a la página de confirmación o detalles de la reserva
      window.location.href = `/booking/${bookingId}`;
    }, 3000);
  };

  const handleBackStep = () => {
    if (bookingStep === 'timeslot') {
      setBookingStep('calendar');
      setBookingSlot(null);
    } else if (bookingStep === 'form') {
      setBookingStep('timeslot');
    }
  };

  // Eliminamos la lógica compleja y usamos CSS puro para mejor rendimiento

  // Manejar estados de carga y error
  if (loading) {
    return (
      <>
        <ModernNavbar />
        <ServiceDetailSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar el servicio</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/results" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Volver a resultados
          </a>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-600 text-2xl">🔍</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Servicio no encontrado</h2>
          <p className="text-gray-600 mb-6">El servicio que buscas no existe o ha sido eliminado.</p>
          <a href="/results" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Volver a resultados
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <ModernNavbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
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
                      {service.images.map((_: string, index: number) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${index === selectedImage ? 'bg-white' : 'bg-white/50'
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
                        {service.features.map((feature: string, index: number) => (
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
                              {service.includes.map((item: string, index: number) => (
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
                          {service.reviews.map((review: Review) => (
                            <div key={review.id} className="border-b pb-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold">{review.user}</h4>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_: any, i: number) => (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 ${i < review.rating
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
                              <a
                                href={`tel:${service.provider.phone}`}
                                className="hover:text-blue-600 transition-colors"
                              >
                                {service.provider.phone}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <a
                                href={`mailto:${service.provider.email}`}
                                className="hover:text-blue-600 transition-colors"
                              >
                                {service.provider.email}
                              </a>
                            </div>
                            {service.provider.website && (
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-gray-500" />
                                <a
                                  href={service.provider.website.startsWith('http') ? service.provider.website : `https://${service.provider.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  Sitio web
                                </a>
                              </div>
                            )}
                            {service.provider.instagram && (
                              <div className="flex items-center gap-2">
                                <Instagram className="h-4 w-4 text-gray-500" />
                                <a
                                  href={service.provider.instagram.startsWith('http') ? service.provider.instagram : `https://instagram.com/${service.provider.instagram.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  @{service.provider.instagram.replace('https://instagram.com/', '').replace('@', '')}
                                </a>
                              </div>
                            )}
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
                    {service.provider.acceptsBookings && service.provider.status === 'VERIFIED' ? (
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg py-6 shadow-lg"
                        onClick={openBookingModal}
                      >
                        <Calendar className="h-5 w-5 mr-2" />
                        Agendar servicio
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-gray-400 text-lg py-6 shadow-lg cursor-not-allowed"
                        disabled
                      >
                        <Shield className="h-5 w-5 mr-2" />
                        Proveedor no disponible para agendamiento
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full text-base py-3 border-2 border-blue-200 hover:bg-blue-50"
                      onClick={() => setShowAlertModal(true)}
                    >
                      <Bell className="h-5 w-5 mr-2" />
                      Crear Alerta de Precio
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="text-base py-3"
                        onClick={() => {
                          const phone = service.provider.phone || "Teléfono no disponible";
                          const message = `Hola, estoy interesado en el servicio "${service.name}" que vi en Alto Carwash. ¿Podrían darme más información?`;
                          const whatsappUrl = `https://wa.me/56${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Contactar
                      </Button>

                      <Button
                        variant="outline"
                        className="text-base py-3"
                        onClick={() => {
                          // Obtener coordenadas o dirección del proveedor
                          const lat = service.provider.latitude;
                          const lng = service.provider.longitude;
                          const address = service.provider.address;

                          // Si hay coordenadas, abrir Google Maps con navegación directa
                          if (lat && lng) {
                            // Abrir Google Maps con ruta de navegación
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
                            window.open(url, '_blank');
                          } else if (address) {
                            // Si no hay coordenadas, buscar por dirección
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address + ', Chile')}&travelmode=driving`;
                            window.open(url, '_blank');
                          } else {
                            // Fallback: ir a la página del mapa interno
                            const encodedAddress = encodeURIComponent(service.provider.address || 'Santiago, Chile');
                            window.location.href = `/map?address=${encodedAddress}&provider=${encodeURIComponent(service.provider.businessName)}`;
                          }
                        }}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Cómo llegar
                      </Button>
                    </div>

                    {/* Información de contacto adicional */}
                    <div className="pt-4 border-t border-gray-200 space-y-2">
                      <h4 className="font-medium text-gray-900 mb-3">Información de contacto</h4>

                      {service.provider.phone && (
                        <a
                          href={`tel:${service.provider.phone}`}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                          {service.provider.phone}
                        </a>
                      )}

                      {service.provider.email && (
                        <a
                          href={`mailto:${service.provider.email}`}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors break-all"
                        >
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          {service.provider.email}
                        </a>
                      )}

                      {service.provider.website && (
                        <a
                          href={service.provider.website.startsWith('http') ? service.provider.website : `https://${service.provider.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Globe className="h-4 w-4" />
                          Sitio web
                        </a>
                      )}

                      {service.provider.instagram && (
                        <a
                          href={service.provider.instagram.startsWith('http') ? service.provider.instagram : `https://instagram.com/${service.provider.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Instagram className="h-4 w-4" />
                          @{service.provider.instagram.replace('https://instagram.com/', '').replace('@', '')}
                        </a>
                      )}
                    </div>
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

          {/* Servicios Similares para Comparar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  Compara con servicios similares
                </h2>
                <p className="text-gray-600 mt-1">
                  Otros proveedores ofrecen servicios parecidos - compara precios y elige el mejor
                </p>
              </div>
            </div>

            {loadingSimilar ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : similarServices.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarServices.map((item, index) => (
                  <ServiceCard key={item.id} item={item} index={index} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border-dashed">
                <CardContent>
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No hay servicios similares disponibles</h3>
                  <p className="text-gray-600">
                    Por el momento no encontramos otros servicios similares para comparar.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 rounded-full p-2">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">¿Por qué comparar?</h4>
                  <p className="text-sm text-blue-800">
                    Alto Carwash te muestra servicios similares del mismo tipo y rango de precio
                    para que puedas comparar y elegir la mejor opción según ubicación, precio y calificaciones.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Modal de Agendamiento */}
          <AnimatePresence>
            {showBookingModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={closeBookingModal}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header del Modal */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold mb-1">Agendar Servicio</h2>
                      <p className="text-sm sm:text-base text-blue-100">{service.name}</p>
                    </div>
                    <button
                      onClick={closeBookingModal}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Progress Steps */}
                  {bookingStep !== 'success' && (
                    <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 bg-gray-50 border-b">
                      <div className="flex items-center justify-center gap-2 sm:gap-4">
                        {/* Step 1 */}
                        <div className="flex items-center">
                          <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-colors ${bookingStep === 'calendar'
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : bookingDate
                              ? 'bg-green-600 border-green-600 text-white'
                              : 'border-gray-300 text-gray-400'
                            }`}>
                            {bookingDate ? (
                              <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                            ) : (
                              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </div>
                          <span className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden sm:inline ${bookingStep === 'calendar' || bookingDate ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                            Fecha
                          </span>
                        </div>

                        {/* Connector */}
                        <div className={`w-8 sm:w-16 h-0.5 ${bookingDate ? 'bg-green-600' : 'bg-gray-300'
                          }`} />

                        {/* Step 2 */}
                        <div className="flex items-center">
                          <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-colors ${bookingStep === 'timeslot'
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : bookingSlot
                              ? 'bg-green-600 border-green-600 text-white'
                              : 'border-gray-300 text-gray-400'
                            }`}>
                            {bookingSlot ? (
                              <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                            ) : (
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </div>
                          <span className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden sm:inline ${bookingStep === 'timeslot' || bookingSlot ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                            Horario
                          </span>
                        </div>

                        {/* Connector */}
                        <div className={`w-8 sm:w-16 h-0.5 ${bookingSlot ? 'bg-green-600' : 'bg-gray-300'
                          }`} />

                        {/* Step 3 */}
                        <div className="flex items-center">
                          <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-colors ${bookingStep === 'form'
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 text-gray-400'
                            }`}>
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden sm:inline ${bookingStep === 'form' ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                            Confirmar
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contenido del Modal */}
                  <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-4 sm:p-6">
                    {/* Step 1: Calendario */}
                    {bookingStep === 'calendar' && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                          Selecciona una Fecha
                        </h3>
                        <BookingCalendar
                          selectedDate={bookingDate}
                          onSelectDate={handleDateSelect}
                          minDate={new Date()}
                          disabledDates={[]}
                        />
                      </motion.div>
                    )}

                    {/* Step 2: Horarios */}
                    {bookingStep === 'timeslot' && bookingDate && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              Selecciona un Horario
                            </h3>
                            <p className="text-gray-600">
                              {bookingDate.toLocaleDateString('es-CL', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBackStep}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Volver
                          </Button>
                        </div>
                        <TimeSlotPicker
                          providerId={service.provider.id}
                          date={bookingDate}
                          duration={parseInt(service.duration.split('-')[0])}
                          selectedSlot={bookingSlot}
                          onSelectSlot={handleSlotSelect}
                        />
                      </motion.div>
                    )}

                    {/* Step 3: Formulario */}
                    {bookingStep === 'form' && bookingDate && bookingSlot && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-900">
                            Confirma tu Reserva
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBackStep}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Volver
                          </Button>
                        </div>
                        <BookingForm
                          providerId={service.provider.id}
                          providerName={service.provider.businessName}
                          serviceId={service.id}
                          serviceName={service.name}
                          servicePrice={service.price}
                          serviceDuration={parseInt(service.duration.split('-')[0])}
                          selectedDate={bookingDate}
                          selectedSlot={bookingSlot}
                          onSuccess={handleBookingSuccess}
                          onCancel={closeBookingModal}
                        />
                      </motion.div>
                    )}

                    {/* Step 4: Éxito */}
                    {bookingStep === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                      >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">
                          ¡Reserva Exitosa!
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Tu reserva ha sido confirmada. Recibirás un email con los detalles y un recordatorio antes de tu cita.
                        </p>
                        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Redirigiendo...
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal de Alerta de Precio */}
          {showAlertModal && service && (
            <CreateAlertModal
              isOpen={showAlertModal}
              serviceId={service.id}
              serviceName={service.name}
              currentPrice={service.price}
              onClose={() => setShowAlertModal(false)}
            />
          )}
        </div>
      </div>
    </>
  );
}
