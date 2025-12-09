"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { AdminRoute } from "@/components/ProtectedRoute";
import { useApi } from "@/hooks/useApi";
import {
    Search,
    MoreHorizontal,
    Wrench,
    CheckCircle,
    XCircle,
    RefreshCw,
    Eye,
    Ban,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Clock,
    Building2,
    Tag
} from "lucide-react";
import { toast } from "sonner";

interface Service {
    id: string;
    name: string;
    description: string | null;
    price: number;
    discountedPrice: number | null;
    category: string | null;
    type: string | null;
    duration: number | null;
    imageUrl: string | null;
    status: "ACTIVE" | "INACTIVE" | "PENDING";
    createdAt: string;
    provider: {
        id: string;
        businessName: string;
        city: string | null;
    };
}

export default function AdminServicesPage() {
    const { get, patch, delete: del } = useApi();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [dialogType, setDialogType] = useState<"view" | "status" | "delete" | null>(null);
    const [newStatus, setNewStatus] = useState<string>("");
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        loadServices();
    }, [page, statusFilter, categoryFilter]);

    const loadServices = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
            });

            if (statusFilter && statusFilter !== "all") {
                params.append("status", statusFilter);
            }

            if (categoryFilter && categoryFilter !== "all") {
                params.append("category", categoryFilter);
            }

            const response = await get<any>(`/services?${params.toString()}`);

            if (response) {
                setServices(response.data || response.services || []);
                setTotal(response.total || 0);
                setTotalPages(response.totalPages || Math.ceil((response.total || 0) / 10));

                // Extract unique categories
                const uniqueCategories = [...new Set(
                    (response.data || response.services || [])
                        .map((s: Service) => s.category)
                        .filter(Boolean)
                )] as string[];
                setCategories(uniqueCategories);
            }
        } catch (error) {
            console.error("Error loading services:", error);
            toast.error("Error al cargar servicios");
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = async () => {
        if (!selectedService || !newStatus) return;

        try {
            await patch(`/services/${selectedService.id}/status`, { status: newStatus });
            toast.success(`Estado actualizado a ${newStatus}`);
            setDialogType(null);
            setSelectedService(null);
            loadServices();
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Error al actualizar el estado");
        }
    };

    const handleDeleteService = async () => {
        if (!selectedService) return;

        try {
            await del(`/services/${selectedService.id}`);
            toast.success("Servicio eliminado correctamente");
            setDialogType(null);
            setSelectedService(null);
            loadServices();
        } catch (error) {
            console.error("Error deleting service:", error);
            toast.error("Error al eliminar el servicio");
        }
    };

    const filteredServices = services.filter(service => {
        const matchesSearch =
            service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.provider?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.category?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { className: string; label: string }> = {
            ACTIVE: { className: "bg-green-100 text-green-700", label: "Activo" },
            INACTIVE: { className: "bg-gray-100 text-gray-700", label: "Inactivo" },
            PENDING: { className: "bg-yellow-100 text-yellow-700", label: "Pendiente" },
        };
        const config = statusConfig[status] || statusConfig.INACTIVE;
        return <Badge variant="secondary" className={config.className}>{config.label}</Badge>;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <AdminRoute>
            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Servicios</h1>
                        <p className="text-gray-600 mt-1">Administra los servicios de la plataforma</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={loadServices}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualizar
                        </Button>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Wrench className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total</p>
                                    <p className="text-2xl font-bold">{total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Activos</p>
                                    <p className="text-2xl font-bold">{services.filter(s => s.status === 'ACTIVE').length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <Tag className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Categorías</p>
                                    <p className="text-2xl font-bold">{categories.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-100 p-2 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Precio promedio</p>
                                    <p className="text-2xl font-bold">
                                        {formatPrice(services.reduce((acc, s) => acc + s.price, 0) / (services.length || 1))}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar por nombre, proveedor, categoría..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full md:w-[150px]">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="ACTIVE">Activo</SelectItem>
                                        <SelectItem value="INACTIVE">Inactivo</SelectItem>
                                        <SelectItem value="PENDING">Pendiente</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="Categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las categorías</SelectItem>
                                        {categories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Services Table */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Servicio</TableHead>
                                                <TableHead>Proveedor</TableHead>
                                                <TableHead>Categoría</TableHead>
                                                <TableHead>Precio</TableHead>
                                                <TableHead>Duración</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredServices.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                        No se encontraron servicios
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredServices.map((service) => (
                                                    <TableRow key={service.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                {service.imageUrl ? (
                                                                    <img
                                                                        src={service.imageUrl}
                                                                        alt={service.name}
                                                                        className="w-10 h-10 rounded object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                                                                        <Wrench className="h-5 w-5 text-gray-400" />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="font-medium">{service.name}</p>
                                                                    <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                                                        {service.description || 'Sin descripción'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Building2 className="h-4 w-4 text-gray-400" />
                                                                <span className="text-sm">{service.provider?.businessName || 'Sin proveedor'}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {service.category ? (
                                                                <Badge variant="outline">{service.category}</Badge>
                                                            ) : (
                                                                <span className="text-gray-400 text-sm">Sin categoría</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                {service.discountedPrice ? (
                                                                    <>
                                                                        <span className="font-medium text-green-600">{formatPrice(service.discountedPrice)}</span>
                                                                        <span className="text-sm text-gray-400 line-through ml-1">{formatPrice(service.price)}</span>
                                                                    </>
                                                                ) : (
                                                                    <span className="font-medium">{formatPrice(service.price)}</span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {service.duration ? (
                                                                <div className="flex items-center gap-1 text-gray-600">
                                                                    <Clock className="h-4 w-4" />
                                                                    <span>{service.duration} min</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 text-sm">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>{getStatusBadge(service.status)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setSelectedService(service);
                                                                            setDialogType("view");
                                                                        }}
                                                                    >
                                                                        <Eye className="h-4 w-4 mr-2" />
                                                                        Ver detalles
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setSelectedService(service);
                                                                            setNewStatus(service.status);
                                                                            setDialogType("status");
                                                                        }}
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        Cambiar estado
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-red-600"
                                                                        onClick={() => {
                                                                            setSelectedService(service);
                                                                            setDialogType("delete");
                                                                        }}
                                                                    >
                                                                        <Ban className="h-4 w-4 mr-2" />
                                                                        Eliminar
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    <div className="flex items-center justify-between px-4 py-3 border-t">
                                        <p className="text-sm text-gray-600">
                                            Mostrando {filteredServices.length} de {total} servicios
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm text-gray-600">
                                                Página {page} de {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                disabled={page === totalPages}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* View Details Dialog */}
                <Dialog open={dialogType === "view"} onOpenChange={() => setDialogType(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Detalles del Servicio</DialogTitle>
                        </DialogHeader>
                        {selectedService && (
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    {selectedService.imageUrl ? (
                                        <img
                                            src={selectedService.imageUrl}
                                            alt={selectedService.name}
                                            className="w-24 h-24 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <Wrench className="h-10 w-10 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold">{selectedService.name}</h3>
                                        <p className="text-gray-600">{selectedService.description || 'Sin descripción'}</p>
                                    </div>
                                    {getStatusBadge(selectedService.status)}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Proveedor</p>
                                        <p>{selectedService.provider?.businessName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Categoría</p>
                                        <p>{selectedService.category || 'Sin categoría'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Precio</p>
                                        <div>
                                            {selectedService.discountedPrice ? (
                                                <>
                                                    <span className="font-semibold text-green-600">{formatPrice(selectedService.discountedPrice)}</span>
                                                    <span className="text-sm text-gray-400 line-through ml-2">{formatPrice(selectedService.price)}</span>
                                                    <Badge className="ml-2 bg-green-100 text-green-700">
                                                        -{Math.round((1 - selectedService.discountedPrice / selectedService.price) * 100)}%
                                                    </Badge>
                                                </>
                                            ) : (
                                                <span className="font-semibold">{formatPrice(selectedService.price)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Duración</p>
                                        <p>{selectedService.duration ? `${selectedService.duration} minutos` : 'No especificada'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Tipo</p>
                                        <p>{selectedService.type || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Fecha de creación</p>
                                        <p>{new Date(selectedService.createdAt).toLocaleDateString('es-CL')}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogType(null)}>
                                Cerrar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Change Status Dialog */}
                <Dialog open={dialogType === "status"} onOpenChange={() => setDialogType(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cambiar Estado del Servicio</DialogTitle>
                            <DialogDescription>
                                Cambiar el estado de {selectedService?.name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar nuevo estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Activo</SelectItem>
                                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                                    <SelectItem value="PENDING">Pendiente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogType(null)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleChangeStatus}>
                                Guardar cambios
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Dialog */}
                <Dialog open={dialogType === "delete"} onOpenChange={() => setDialogType(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Eliminar Servicio</DialogTitle>
                            <DialogDescription>
                                ¿Estás seguro de que deseas eliminar el servicio "{selectedService?.name}"? Esta acción no se puede deshacer.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogType(null)}>
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteService}>
                                Eliminar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminRoute>
    );
}
