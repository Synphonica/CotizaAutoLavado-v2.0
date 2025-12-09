"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    Phone,
    Mail,
    MapPin,
    DollarSign,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    Filter,
    Search,
    Calendar as CalendarView,
    List,
    Loader2,
    Car,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { ProviderRoute } from "@/components/ProtectedRoute";

interface Booking {
    id: string;
    userId: string | null;
    providerId: string;
    serviceId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED" | "NO_SHOW" | "RESCHEDULED";
    totalPrice: number;
    customerNotes?: string;
    providerNotes?: string;
    createdAt: string;
    updatedAt: string;
    // Datos del cliente (para reservas sin autenticación)
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    // Información del vehículo
    vehicleInfo?: {
        brand?: string;
        model?: string;
        year?: number;
        plate?: string;
        color?: string;
        type?: string;
    };
    // Usuario autenticado (opcional)
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    };
    service: {
        id: string;
        name: string;
        description?: string;
        duration: number;
        price: number;
    };
}

// Helper functions para obtener datos del cliente
const getCustomerName = (booking: Booking): string => {
    if (booking.user) {
        return `${booking.user.firstName} ${booking.user.lastName}`;
    }
    return booking.customerName || 'Cliente sin nombre';
};

const getCustomerEmail = (booking: Booking): string => {
    if (booking.user) {
        return booking.user.email;
    }
    return booking.customerEmail || 'Sin email';
};

const getCustomerPhone = (booking: Booking): string | undefined => {
    if (booking.user) {
        return booking.user.phone;
    }
    return booking.customerPhone;
}

const statusConfig = {
    PENDING: { label: "Pendiente", color: "bg-yellow-500", icon: AlertCircle },
    CONFIRMED: { label: "Confirmado", color: "bg-blue-500", icon: CheckCircle },
    COMPLETED: { label: "Completado", color: "bg-green-500", icon: CheckCircle },
    CANCELLED: { label: "Cancelado", color: "bg-gray-500", icon: XCircle },
    REJECTED: { label: "Rechazado", color: "bg-red-500", icon: XCircle },
    NO_SHOW: { label: "No Presentado", color: "bg-orange-500", icon: AlertCircle },
    RESCHEDULED: { label: "Reagendado", color: "bg-purple-500", icon: CalendarIcon },
};

export default function BookingsManagement() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<"calendar" | "list">("list");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionReason, setActionReason] = useState("");

    const { get, patch } = useApi();

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setIsLoading(true);
            const data = await get<{ bookings: Booking[] }>("/bookings");
            setBookings(data.bookings || []);
        } catch (error) {
            console.error("Error loading bookings:", error);
            toast.error("Error al cargar las reservas");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (bookingId: string, newStatus: string) => {
        if (!selectedBooking) return;

        setIsActionLoading(true);
        try {
            await patch(`/bookings/${bookingId}`, {
                status: newStatus,
                providerNotes: actionReason || undefined,
            });

            toast.success(`Reserva ${statusConfig[newStatus as keyof typeof statusConfig].label.toLowerCase()}`);

            // Actualizar localmente
            setBookings(prev =>
                prev.map(b => b.id === bookingId ? { ...b, status: newStatus as any } : b)
            );

            setIsDetailsOpen(false);
            setActionReason("");
        } catch (error) {
            console.error("Error updating booking:", error);
            toast.error("Error al actualizar la reserva");
        } finally {
            setIsActionLoading(false);
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesStatus = filterStatus === "ALL" || booking.status === filterStatus;
        const customerName = getCustomerName(booking);
        const matchesSearch = searchTerm === "" ||
            customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.service.name.toLowerCase().includes(searchTerm.toLowerCase());

        if (viewMode === "calendar") {
            return matchesStatus && matchesSearch && isSameDay(parseISO(booking.bookingDate), selectedDate);
        }

        return matchesStatus && matchesSearch;
    });

    const getBookingsForDate = (date: Date) => {
        return bookings.filter(booking => isSameDay(parseISO(booking.bookingDate), date));
    };

    const openBookingDetails = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsDetailsOpen(true);
        setActionReason("");
    };

    return (
        <ProviderRoute>
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
                        <p className="text-gray-600 mt-1">
                            Administra las reservas de tus clientes
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant={viewMode === "list" ? "default" : "outline"}
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-4 w-4 mr-2" />
                            Lista
                        </Button>
                        <Button
                            variant={viewMode === "calendar" ? "default" : "outline"}
                            onClick={() => setViewMode("calendar")}
                        >
                            <CalendarView className="h-4 w-4 mr-2" />
                            Calendario
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar por cliente o servicio..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-full sm:w-[180px] md:w-[200px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todos</SelectItem>
                                    <SelectItem value="PENDING">Pendientes</SelectItem>
                                    <SelectItem value="CONFIRMED">Confirmados</SelectItem>
                                    <SelectItem value="COMPLETED">Completados</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelados</SelectItem>
                                    <SelectItem value="REJECTED">Rechazados</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pendientes</p>
                                    <p className="text-2xl font-bold">
                                        {bookings.filter(b => b.status === "PENDING").length}
                                    </p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Confirmados</p>
                                    <p className="text-2xl font-bold">
                                        {bookings.filter(b => b.status === "CONFIRMED").length}
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Completados</p>
                                    <p className="text-2xl font-bold">
                                        {bookings.filter(b => b.status === "COMPLETED").length}
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Cancelados</p>
                                    <p className="text-2xl font-bold">
                                        {bookings.filter(b => b.status === "CANCELLED").length}
                                    </p>
                                </div>
                                <XCircle className="h-8 w-8 text-gray-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Content */}
                {viewMode === "calendar" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Seleccionar Fecha</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => date && setSelectedDate(date)}
                                    locale={es}
                                    className="rounded-md border"
                                    modifiers={{
                                        hasBookings: (date) => getBookingsForDate(date).length > 0,
                                    }}
                                    modifiersStyles={{
                                        hasBookings: { fontWeight: "bold", textDecoration: "underline" },
                                    }}
                                />
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>
                                    Reservas para {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                    </div>
                                ) : filteredBookings.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No hay reservas para esta fecha
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredBookings
                                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                            .map((booking) => (
                                                <motion.div
                                                    key={booking.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                                                    onClick={() => openBookingDetails(booking)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge className={statusConfig[booking.status].color}>
                                                                    {statusConfig[booking.status].label}
                                                                </Badge>
                                                                <span className="font-medium">
                                                                    {booking.startTime} - {booking.endTime}
                                                                </span>
                                                            </div>
                                                            <p className="font-semibold">
                                                                {getCustomerName(booking)}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                {booking.service.name}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-green-600">
                                                                ${booking.totalPrice.toLocaleString()}
                                                            </p>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="pt-6">
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                </div>
                            ) : filteredBookings.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No se encontraron reservas
                                </div>
                            ) : (
                                <>
                                    {/* Vista móvil - Cards */}
                                    <div className="block md:hidden space-y-3">
                                        {filteredBookings.map((booking) => (
                                            <motion.div
                                                key={booking.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => openBookingDetails(booking)}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge className={statusConfig[booking.status].color}>
                                                                {statusConfig[booking.status].label}
                                                            </Badge>
                                                        </div>
                                                        <p className="font-semibold text-gray-900">
                                                            {getCustomerName(booking)}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {booking.service.name}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-green-600">
                                                            ${booking.totalPrice.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                                                    <div className="flex items-center gap-1">
                                                        <CalendarIcon className="h-4 w-4" />
                                                        {format(parseISO(booking.bookingDate), "dd/MM/yyyy")}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {booking.startTime}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Vista desktop - Tabla */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Fecha</TableHead>
                                                    <TableHead>Hora</TableHead>
                                                    <TableHead>Cliente</TableHead>
                                                    <TableHead>Servicio</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead>Monto</TableHead>
                                                    <TableHead>Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredBookings.map((booking) => (
                                                    <TableRow key={booking.id}>
                                                        <TableCell className="whitespace-nowrap">
                                                            {format(parseISO(booking.bookingDate), "dd/MM/yyyy")}
                                                        </TableCell>
                                                        <TableCell className="whitespace-nowrap">
                                                            {booking.startTime} - {booking.endTime}
                                                        </TableCell>
                                                        <TableCell>
                                                            {getCustomerName(booking)}
                                                        </TableCell>
                                                        <TableCell>{booking.service.name}</TableCell>
                                                        <TableCell>
                                                            <Badge className={statusConfig[booking.status].color}>
                                                                {statusConfig[booking.status].label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="font-bold text-green-600 whitespace-nowrap">
                                                            ${booking.totalPrice.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openBookingDetails(booking)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Booking Details Dialog */}
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Detalles de la Reserva</DialogTitle>
                        </DialogHeader>

                        {selectedBooking && (
                            <div className="space-y-6">
                                {/* Status Badge */}
                                <div className="flex justify-center">
                                    <Badge className={`${statusConfig[selectedBooking.status].color} text-lg px-4 py-2`}>
                                        {statusConfig[selectedBooking.status].label}
                                    </Badge>
                                </div>

                                {/* Client Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Cliente
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {getCustomerName(selectedBooking)}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Email
                                        </h3>
                                        <p className="text-sm text-gray-600">{getCustomerEmail(selectedBooking)}</p>
                                    </div>

                                    {getCustomerPhone(selectedBooking) && (
                                        <div>
                                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                Teléfono
                                            </h3>
                                            <p className="text-sm text-gray-600">{getCustomerPhone(selectedBooking)}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Vehicle Info */}
                                {selectedBooking.vehicleInfo && (
                                    <div>
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <Car className="h-4 w-4" />
                                            Información del Vehículo
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                            {selectedBooking.vehicleInfo.brand && selectedBooking.vehicleInfo.model && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Marca/Modelo:</span>
                                                    <span className="text-sm font-medium">
                                                        {selectedBooking.vehicleInfo.brand} {selectedBooking.vehicleInfo.model}
                                                        {selectedBooking.vehicleInfo.year && ` (${selectedBooking.vehicleInfo.year})`}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedBooking.vehicleInfo.plate && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Patente:</span>
                                                    <span className="text-sm font-medium uppercase">
                                                        {selectedBooking.vehicleInfo.plate}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedBooking.vehicleInfo.color && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Color:</span>
                                                    <span className="text-sm font-medium">
                                                        {selectedBooking.vehicleInfo.color}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedBooking.vehicleInfo.type && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Tipo:</span>
                                                    <span className="text-sm font-medium">
                                                        {selectedBooking.vehicleInfo.type}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Service Info */}
                                <div>
                                    <h3 className="font-semibold mb-2">Servicio</h3>
                                    <p className="text-lg">{selectedBooking.service.name}</p>
                                    {selectedBooking.service.description && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {selectedBooking.service.description}
                                        </p>
                                    )}
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4" />
                                            Fecha
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {format(parseISO(selectedBooking.bookingDate), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Horario
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {selectedBooking.startTime} - {selectedBooking.endTime}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Duración: {selectedBooking.service.duration} min
                                        </p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Monto Total
                                    </h3>
                                    <p className="text-2xl font-bold text-green-600">
                                        ${selectedBooking.totalPrice.toLocaleString()}
                                    </p>
                                </div>

                                {/* Customer Notes */}
                                {selectedBooking.customerNotes && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Notas del Cliente</h3>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                            {selectedBooking.customerNotes}
                                        </p>
                                    </div>
                                )}

                                {/* Provider Notes */}
                                {selectedBooking.providerNotes && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Tus Notas</h3>
                                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                                            {selectedBooking.providerNotes}
                                        </p>
                                    </div>
                                )}

                                {/* Action Reason (for reject/cancel) */}
                                {selectedBooking.status === "PENDING" && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Notas (opcional)</h3>
                                        <Textarea
                                            placeholder="Agregar notas sobre esta reserva..."
                                            value={actionReason}
                                            onChange={(e) => setActionReason(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                )}

                                {/* Actions */}
                                <DialogFooter className="gap-2">
                                    {selectedBooking.status === "PENDING" && (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleStatusChange(selectedBooking.id, "REJECTED")}
                                                disabled={isActionLoading}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Rechazar
                                            </Button>
                                            <Button
                                                onClick={() => handleStatusChange(selectedBooking.id, "CONFIRMED")}
                                                disabled={isActionLoading}
                                            >
                                                {isActionLoading ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                )}
                                                Confirmar
                                            </Button>
                                        </>
                                    )}

                                    {selectedBooking.status === "CONFIRMED" && (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleStatusChange(selectedBooking.id, "CANCELLED")}
                                                disabled={isActionLoading}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Cancelar
                                            </Button>
                                            <Button
                                                onClick={() => handleStatusChange(selectedBooking.id, "COMPLETED")}
                                                disabled={isActionLoading}
                                            >
                                                {isActionLoading ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                )}
                                                Marcar Completado
                                            </Button>
                                        </>
                                    )}
                                </DialogFooter>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </ProviderRoute>
    );
}
