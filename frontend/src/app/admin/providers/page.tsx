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
    Building2,
    CheckCircle,
    XCircle,
    RefreshCw,
    Eye,
    Ban,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Star,
    Phone,
    Mail,
    ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface Provider {
    id: string;
    businessName: string;
    businessType: string;
    description: string | null;
    address: string | null;
    city: string | null;
    region: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    rating: number;
    reviewCount: number;
    status: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";
    createdAt: string;
    user?: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
    };
    _count?: {
        services: number;
    };
}

export default function AdminProvidersPage() {
    const { get, patch, delete: del } = useApi();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [dialogType, setDialogType] = useState<"view" | "status" | "delete" | null>(null);
    const [newStatus, setNewStatus] = useState<string>("");

    useEffect(() => {
        loadProviders();
    }, [page, statusFilter]);

    const loadProviders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
            });

            if (statusFilter && statusFilter !== "all") {
                params.append("status", statusFilter);
            }

            const response = await get<any>(`/providers?${params.toString()}`);

            if (response) {
                setProviders(response.data || response.providers || []);
                setTotal(response.total || 0);
                setTotalPages(response.totalPages || Math.ceil((response.total || 0) / 10));
            }
        } catch (error) {
            console.error("Error loading providers:", error);
            toast.error("Error al cargar proveedores");
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = async () => {
        if (!selectedProvider || !newStatus) return;

        try {
            await patch(`/providers/${selectedProvider.id}/status`, { status: newStatus });
            toast.success(`Estado actualizado a ${newStatus}`);
            setDialogType(null);
            setSelectedProvider(null);
            loadProviders();
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Error al actualizar el estado");
        }
    };

    const handleDeleteProvider = async () => {
        if (!selectedProvider) return;

        try {
            await del(`/providers/${selectedProvider.id}`);
            toast.success("Proveedor eliminado correctamente");
            setDialogType(null);
            setSelectedProvider(null);
            loadProviders();
        } catch (error) {
            console.error("Error deleting provider:", error);
            toast.error("Error al eliminar el proveedor");
        }
    };

    const filteredProviders = providers.filter(provider => {
        const matchesSearch =
            provider.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            provider.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            provider.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { className: string; label: string }> = {
            ACTIVE: { className: "bg-green-100 text-green-700", label: "Activo" },
            INACTIVE: { className: "bg-gray-100 text-gray-700", label: "Inactivo" },
            PENDING: { className: "bg-yellow-100 text-yellow-700", label: "Pendiente" },
            SUSPENDED: { className: "bg-red-100 text-red-700", label: "Suspendido" },
        };
        const config = statusConfig[status] || statusConfig.INACTIVE;
        return <Badge variant="secondary" className={config.className}>{config.label}</Badge>;
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
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Proveedores</h1>
                        <p className="text-gray-600 mt-1">Administra los autolavados de la plataforma</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={loadProviders}>
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
                    className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
                >
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Building2 className="h-5 w-5 text-blue-600" />
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
                                    <p className="text-2xl font-bold">{providers.filter(p => p.status === 'ACTIVE').length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-yellow-100 p-2 rounded-lg">
                                    <Building2 className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Pendientes</p>
                                    <p className="text-2xl font-bold">{providers.filter(p => p.status === 'PENDING').length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 p-2 rounded-lg">
                                    <Ban className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Suspendidos</p>
                                    <p className="text-2xl font-bold">{providers.filter(p => p.status === 'SUSPENDED').length}</p>
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
                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar por nombre, ciudad, email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px] md:w-[200px]">
                                        <SelectValue placeholder="Filtrar por estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los estados</SelectItem>
                                        <SelectItem value="ACTIVE">Activo</SelectItem>
                                        <SelectItem value="INACTIVE">Inactivo</SelectItem>
                                        <SelectItem value="PENDING">Pendiente</SelectItem>
                                        <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Providers Table */}
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
                                    {/* Mobile view - Cards */}
                                    <div className="block md:hidden space-y-3 p-4">
                                        {filteredProviders.length === 0 ? (
                                            <p className="text-center py-8 text-gray-500">No se encontraron proveedores</p>
                                        ) : (
                                            filteredProviders.map((provider) => (
                                                <motion.div
                                                    key={provider.id}
                                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedProvider(provider);
                                                        setDialogType("view");
                                                    }}
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate">{provider.businessName}</p>
                                                            <p className="text-sm text-gray-500">{provider.businessType}</p>
                                                        </div>
                                                        {getStatusBadge(provider.status)}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <MapPin className="h-3 w-3 flex-shrink-0" />
                                                            <span className="truncate">{provider.city || 'Sin ubicación'}, {provider.region || ''}</span>
                                                        </div>
                                                        {provider.email && (
                                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                                <Mail className="h-3 w-3 flex-shrink-0" />
                                                                <span className="truncate">{provider.email}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                                <span className="font-medium">{provider.rating?.toFixed(1) || '0.0'}</span>
                                                                <span className="text-gray-400 text-sm">({provider.reviewCount || 0})</span>
                                                            </div>
                                                            <span className="text-sm text-gray-500">
                                                                {new Date(provider.createdAt).toLocaleDateString('es-CL')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>

                                    {/* Desktop view - Table */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Proveedor</TableHead>
                                                    <TableHead>Ubicación</TableHead>
                                                    <TableHead>Contacto</TableHead>
                                                    <TableHead>Rating</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead>Fecha registro</TableHead>
                                                    <TableHead className="text-right">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredProviders.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                            No se encontraron proveedores
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredProviders.map((provider) => (
                                                        <TableRow key={provider.id}>
                                                            <TableCell>
                                                                <div>
                                                                    <p className="font-medium">{provider.businessName}</p>
                                                                    <p className="text-sm text-gray-500">{provider.businessType}</p>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1 text-gray-600">
                                                                    <MapPin className="h-4 w-4" />
                                                                    <span className="text-sm">{provider.city || 'Sin ubicación'}, {provider.region || ''}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="space-y-1">
                                                                    {provider.email && (
                                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                                            <Mail className="h-3 w-3" />
                                                                            <span className="truncate max-w-[150px]">{provider.email}</span>
                                                                        </div>
                                                                    )}
                                                                    {provider.phone && (
                                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                                            <Phone className="h-3 w-3" />
                                                                            <span>{provider.phone}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                                    <span className="font-medium">{provider.rating?.toFixed(1) || '0.0'}</span>
                                                                    <span className="text-gray-400 text-sm">({provider.reviewCount || 0})</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>{getStatusBadge(provider.status)}</TableCell>
                                                            <TableCell className="text-gray-600">
                                                                {new Date(provider.createdAt).toLocaleDateString('es-CL')}
                                                            </TableCell>
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
                                                                                setSelectedProvider(provider);
                                                                                setDialogType("view");
                                                                            }}
                                                                        >
                                                                            <Eye className="h-4 w-4 mr-2" />
                                                                            Ver detalles
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setSelectedProvider(provider);
                                                                                setNewStatus(provider.status);
                                                                                setDialogType("status");
                                                                            }}
                                                                        >
                                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                                            Cambiar estado
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            className="text-red-600"
                                                                            onClick={() => {
                                                                                setSelectedProvider(provider);
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
                                    </div>

                                    {/* Pagination */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t">
                                        <p className="text-sm text-gray-600">
                                            Mostrando {filteredProviders.length} de {total} proveedores
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
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Detalles del Proveedor</DialogTitle>
                        </DialogHeader>
                        {selectedProvider && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Nombre del negocio</p>
                                        <p className="text-lg font-semibold">{selectedProvider.businessName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Tipo</p>
                                        <p>{selectedProvider.businessType}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email</p>
                                        <p>{selectedProvider.email || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Teléfono</p>
                                        <p>{selectedProvider.phone || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Dirección</p>
                                        <p>{selectedProvider.address || 'No especificada'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Ciudad/Región</p>
                                        <p>{selectedProvider.city}, {selectedProvider.region}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Rating</p>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            <span>{selectedProvider.rating?.toFixed(1)} ({selectedProvider.reviewCount} reseñas)</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Estado</p>
                                        {getStatusBadge(selectedProvider.status)}
                                    </div>
                                </div>
                                {selectedProvider.description && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Descripción</p>
                                        <p className="text-gray-700">{selectedProvider.description}</p>
                                    </div>
                                )}
                                {selectedProvider.website && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Sitio web</p>
                                        <a href={selectedProvider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 flex items-center gap-1">
                                            {selectedProvider.website}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                )}
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
                            <DialogTitle>Cambiar Estado del Proveedor</DialogTitle>
                            <DialogDescription>
                                Cambiar el estado de {selectedProvider?.businessName}
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
                                    <SelectItem value="SUSPENDED">Suspendido</SelectItem>
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
                            <DialogTitle>Eliminar Proveedor</DialogTitle>
                            <DialogDescription>
                                ¿Estás seguro de que deseas eliminar a {selectedProvider?.businessName}? Esta acción no se puede deshacer.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogType(null)}>
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteProvider}>
                                Eliminar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminRoute>
    );
}
