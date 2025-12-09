'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModernNavbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  User,
  Car,
  CreditCard,
  Download,
  Share2,
  Loader2
} from 'lucide-react';
import { apiGet } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';

interface BookingDetail {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalPrice: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceName: string;
  serviceDuration: number;
  customerNotes?: string;
  vehicleInfo?: {
    brand?: string;
    model?: string;
    year?: number;
    plate?: string;
    color?: string;
    type?: string;
  };
  provider: {
    id: string;
    businessName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    region: string;
  };
}

export default function BookingConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getToken } = useAuth();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const data = await apiGet<BookingDetail>(`/bookings/${id}`, { token });
        setBooking(data);
      } catch (err) {
        console.error('Error loading booking:', err);
        setError('No se pudo cargar la información de la reserva');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBooking();
    }
  }, [id, getToken]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PENDING: { label: 'Pendiente', variant: 'secondary' },
      CONFIRMED: { label: 'Confirmada', variant: 'default' },
      IN_PROGRESS: { label: 'En Progreso', variant: 'outline' },
      COMPLETED: { label: 'Completada', variant: 'outline' },
      CANCELLED: { label: 'Cancelada', variant: 'destructive' },
      REJECTED: { label: 'Rechazada', variant: 'destructive' },
      NO_SHOW: { label: 'No Asistió', variant: 'destructive' },
      RESCHEDULED: { label: 'Reagendada', variant: 'secondary' },
    };

    const config = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleShare = () => {
    if (navigator.share && booking) {
      navigator.share({
        title: `Reserva en ${booking.provider.businessName}`,
        text: `Mi reserva para ${booking.serviceName} el ${new Date(booking.bookingDate).toLocaleDateString('es-CL')}`,
        url: window.location.href,
      }).catch(() => {
        // Fallback: copiar al portapapeles
        navigator.clipboard.writeText(window.location.href);
        alert('Enlace copiado al portapapeles');
      });
    } else if (booking) {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  if (loading) {
    return (
      <>
        <ModernNavbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando reserva...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <ModernNavbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300 flex items-center justify-center">
          <Card className="max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{error || 'Reserva no encontrada'}</p>
              <Button onClick={() => router.push('/results')}>
                Volver a resultados
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <ModernNavbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header de Éxito */}
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Reserva Confirmada!
              </h1>
              <p className="text-gray-600 mb-4">
                Tu reserva ha sido creada exitosamente. Recibirás un correo de confirmación pronto.
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-gray-500">ID de reserva:</span>
                <code className="px-2 py-1 bg-white rounded text-sm font-mono">
                  {booking.id.slice(0, 8)}
                </code>
                {getStatusBadge(booking.status)}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Información del Servicio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Detalles de la Reserva
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Servicio</p>
                  <p className="font-semibold text-gray-900">{booking.serviceName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Fecha</p>
                    <p className="font-medium text-gray-900">
                      {new Date(booking.bookingDate).toLocaleDateString('es-CL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Horario</p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <p className="font-medium text-gray-900">
                        {new Date(booking.startTime).toLocaleTimeString('es-CL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        -{' '}
                        {new Date(booking.endTime).toLocaleTimeString('es-CL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Duración</p>
                  <p className="font-medium text-gray-900">{booking.serviceDuration} minutos</p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${booking.totalPrice.toLocaleString('es-CL')} {booking.currency}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Método de pago: {booking.paymentMethod}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Información del Proveedor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Información del Proveedor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Proveedor</p>
                  <p className="font-semibold text-gray-900">{booking.provider.businessName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Dirección</p>
                  <p className="text-gray-900">{booking.provider.address}</p>
                  <p className="text-sm text-gray-600">
                    {booking.provider.city}, {booking.provider.region}
                  </p>
                </div>

                <div className="space-y-2">
                  <a
                    href={`tel:${booking.provider.phone}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Phone className="h-4 w-4" />
                    {booking.provider.phone}
                  </a>

                  <a
                    href={`mailto:${booking.provider.email}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Mail className="h-4 w-4" />
                    {booking.provider.email}
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Información del Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Tus Datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium text-gray-900">{booking.customerName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium text-gray-900">{booking.customerPhone}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{booking.customerEmail}</p>
                </div>

                {booking.customerNotes && (
                  <div>
                    <p className="text-sm text-gray-600">Notas</p>
                    <p className="text-gray-900">{booking.customerNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información del Vehículo */}
            {booking.vehicleInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-blue-600" />
                    Información del Vehículo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {booking.vehicleInfo.brand && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Marca</p>
                        <p className="font-medium text-gray-900">{booking.vehicleInfo.brand}</p>
                      </div>
                      {booking.vehicleInfo.model && (
                        <div>
                          <p className="text-sm text-gray-600">Modelo</p>
                          <p className="font-medium text-gray-900">{booking.vehicleInfo.model}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {booking.vehicleInfo.plate && (
                    <div>
                      <p className="text-sm text-gray-600">Patente</p>
                      <p className="font-medium text-gray-900 uppercase">{booking.vehicleInfo.plate}</p>
                    </div>
                  )}

                  {(booking.vehicleInfo.year || booking.vehicleInfo.color) && (
                    <div className="grid grid-cols-2 gap-4">
                      {booking.vehicleInfo.year && (
                        <div>
                          <p className="text-sm text-gray-600">Año</p>
                          <p className="font-medium text-gray-900">{booking.vehicleInfo.year}</p>
                        </div>
                      )}
                      {booking.vehicleInfo.color && (
                        <div>
                          <p className="text-sm text-gray-600">Color</p>
                          <p className="font-medium text-gray-900">{booking.vehicleInfo.color}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Acciones */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex-1 min-w-[200px]"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir Reserva
                </Button>

                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="flex-1 min-w-[200px]"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Imprimir/Guardar PDF
                </Button>

                <Button
                  onClick={() => router.push('/results')}
                  className="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700"
                >
                  Volver a Buscar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Información Importante</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Recibirás un email de confirmación con todos los detalles de tu reserva.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Te enviaremos un recordatorio 24 horas antes de tu cita.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Si necesitas cancelar o reagendar, por favor contacta directamente al proveedor.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Te recomendamos llegar 5-10 minutos antes de tu horario reservado.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
