"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    FileText,
    CheckCircle,
    XCircle,
    RefreshCw,
    Eye,
    Clock,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Phone,
    Mail,
    Building2,
    User,
    Calendar,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface ProviderRequest {
    id: string;
    businessName: string;
    businessType: string;
    description: string | null;
    address: string;
    city: string;
    region: string;
    phone: string;
    email: string;
    website: string | null;
    status: "PENDING_APPROVAL" | "ACTIVE" | "INACTIVE" | "VERIFIED";
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
    };
}

export default function AdminRequestsPage() {
    const { get, patch } = useApi();
    const [requests, setRequests] = useState<ProviderRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("PENDING_APPROVAL");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedRequest, setSelectedRequest] = useState<ProviderRequest | null>(null);
    const [dialogType, setDialogType] = useState<"view" | "approve" | "reject" | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadRequests();
    }, [page, statusFilter]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
            });

            if (statusFilter && statusFilter !== "all") {
                params.append("status", statusFilter);
            }

            const response = await get<any>(`/providers/requests?${params.toString()}`);

            if (response) {
                setRequests(response.data || []);
                setTotal(response.total || 0);
                setTotalPages(response.totalPages || Math.ceil((response.total || 0) / 10));
            }
        } catch (error) {
            console.error("Error loading requests:", error);
            toast.error("Error al cargar solicitudes");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        try {
            setProcessing(true);
            await patch(`/providers/${selectedRequest.id}/status`, {
                status: "ACTIVE"
            });
            toast.success("Solicitud aprobada. El proveedor ahora está activo.");
            setDialogType(null);
            setSelectedRequest(null);
            loadRequests();
        } catch (error) {
            console.error("Error approving request:", error);
            toast.error("Error al aprobar la solicitud");
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectionReason.trim()) {
            toast.error("Debes proporcionar un motivo de rechazo");
            return;
        }

        try {
            setProcessing(true);
            await patch(`/providers/${selectedRequest.id}/status`, {
                status: "INACTIVE",
                rejectionReason: rejectionReason.trim()
            });
            toast.success("Solicitud rechazada");
            setDialogType(null);
            setSelectedRequest(null);
            setRejectionReason("");
            loadRequests();
        } catch (error) {
            console.error("Error rejecting request:", error);
            toast.error("Error al rechazar la solicitud");
        } finally {
            setProcessing(false);
        }
    };

    const filteredRequests = requests.filter(request => {
        const matchesSearch =
            request.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { className: string; label: string; icon: React.ReactNode }> = {
            PENDING_APPROVAL: { className: "bg-yellow-100 text-yellow-700", label: "Pendiente", icon: <Clock className="h-3 w-3" /> },
            ACTIVE: { className: "bg-green-100 text-green-700", label: "Activo", icon: <CheckCircle className="h-3 w-3" /> },
            INACTIVE: { className: "bg-red-100 text-red-700", label: "Inactivo", icon: <XCircle className="h-3 w-3" /> },
            VERIFIED: { className: "bg-blue-100 text-blue-700", label: "Verificado", icon: <CheckCircle className="h-3 w-3" /> },
        };
        const config = statusConfig[status] || statusConfig.PENDING_APPROVAL;
        return (
            <Badge variant="secondary" className={`${config.className} flex items-center gap-1`}>
                {config.icon}
                {config.label}
            </Badge>
        );
    };

    const pendingCount = requests.filter(r => r.status === 'PENDING_APPROVAL').length;

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
                        <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Proveedor</h1>
                        <p className="text-gray-600 mt-1">Revisa y gestiona las solicitudes de nuevos proveedores</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={loadRequests}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualizar
                        </Button>
                    </div>
                </motion.div>

                {/* Alert for pending requests */}
                {pendingCount > 0 && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.05 }}
                    >
                        <Card className="border-orange-200 bg-orange-50">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 text-orange-600" />
                                    <p className="text-orange-800">
                                        Tienes <span className="font-bold">{pendingCount}</span> solicitudes pendientes de revisión
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

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
                                    <FileText className="h-5 w-5 text-blue-600" />
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
                                <div className="bg-yellow-100 p-2 rounded-lg">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Pendientes</p>
                                    <p className="text-2xl font-bold">{pendingCount}</p>
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
                                    <p className="text-2xl font-bold">{requests.filter(r => r.status === 'ACTIVE').length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 p-2 rounded-lg">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Inactivos</p>
                                    <p className="text-2xl font-bold">{requests.filter(r => r.status === 'INACTIVE').length}</p>
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
                                        <SelectItem value="PENDING_APPROVAL">Pendientes</SelectItem>
                                        <SelectItem value="ACTIVE">Activos</SelectItem>
                                        <SelectItem value="INACTIVE">Inactivos</SelectItem>
                                        <SelectItem value="VERIFIED">Verificados</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Requests Table */}
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
                                        {filteredRequests.length === 0 ? (
                                            <p className="text-center py-8 text-gray-500">No se encontraron solicitudes</p>
                                        ) : (
                                            filteredRequests.map((request) => (
                                                <motion.div
                                                    key={request.id}
                                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate">{request.businessName}</p>
                                                            <p className="text-sm text-gray-500">{request.businessType}</p>
                                                        </div>
                                                        {getStatusBadge(request.status)}
                                                    </div>
                                                    <div className="space-y-2 mb-3">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                                            <span className="text-gray-900 truncate">
                                                                {request.user?.firstName || ''} {request.user?.lastName || ''}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                                            <span className="text-gray-600 truncate">{request.city}, {request.region}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {new Date(request.createdAt).toLocaleDateString('es-CL')}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1"
                                                            onClick={() => {
                                                                setSelectedRequest(request);
                                                                setDialogType("view");
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Ver
                                                        </Button>
                                                        {request.status === "PENDING_APPROVAL" && (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                    onClick={() => {
                                                                        setSelectedRequest(request);
                                                                        setDialogType("approve");
                                                                    }}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    Aprobar
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => {
                                                                        setSelectedRequest(request);
                                                                        setDialogType("reject");
                                                                    }}
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
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
                                                    <TableHead>Negocio</TableHead>
                                                    <TableHead>Solicitante</TableHead>
                                                    <TableHead>Ubicación</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead>Fecha solicitud</TableHead>
                                                    <TableHead className="text-right">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredRequests.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                            No se encontraron solicitudes
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredRequests.map((request) => (
                                                        <TableRow key={request.id}>
                                                            <TableCell>
                                                                <div>
                                                                    <p className="font-medium">{request.businessName}</p>
                                                                    <p className="text-sm text-gray-500">{request.businessType}</p>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div>
                                                                    <p className="font-medium">
                                                                        {request.user?.firstName || ''} {request.user?.lastName || ''}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500">{request.user?.email}</p>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1 text-gray-600">
                                                                    <MapPin className="h-4 w-4" />
                                                                    <span className="text-sm">{request.city}, {request.region}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                                                            <TableCell className="text-gray-600">
                                                                {new Date(request.createdAt).toLocaleDateString('es-CL')}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setSelectedRequest(request);
                                                                            setDialogType("view");
                                                                        }}
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                    {request.status === "PENDING_APPROVAL" && (
                                                                        <>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                                onClick={() => {
                                                                                    setSelectedRequest(request);
                                                                                    setDialogType("approve");
                                                                                }}
                                                                            >
                                                                                <CheckCircle className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                                onClick={() => {
                                                                                    setSelectedRequest(request);
                                                                                    setDialogType("reject");
                                                                                }}
                                                                            >
                                                                                <XCircle className="h-4 w-4" />
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                </div>
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
                                            Mostrando {filteredRequests.length} de {total} solicitudes
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
                            <DialogTitle>Detalles de la Solicitud</DialogTitle>
                        </DialogHeader>
                        {selectedRequest && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">{selectedRequest.businessName}</h3>
                                    {getStatusBadge(selectedRequest.status)}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                            <Building2 className="h-4 w-4" /> Tipo de negocio
                                        </p>
                                        <p>{selectedRequest.businessType}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                            <User className="h-4 w-4" /> Solicitante
                                        </p>
                                        <p>{selectedRequest.user?.firstName} {selectedRequest.user?.lastName}</p>
                                        <p className="text-sm text-gray-500">{selectedRequest.user?.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                            <Mail className="h-4 w-4" /> Email del negocio
                                        </p>
                                        <p>{selectedRequest.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                            <Phone className="h-4 w-4" /> Teléfono
                                        </p>
                                        <p>{selectedRequest.phone}</p>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                            <MapPin className="h-4 w-4" /> Dirección
                                        </p>
                                        <p>{selectedRequest.address}</p>
                                        <p className="text-sm text-gray-500">{selectedRequest.city}, {selectedRequest.region}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                            <Calendar className="h-4 w-4" /> Fecha de solicitud
                                        </p>
                                        <p>{new Date(selectedRequest.createdAt).toLocaleString('es-CL')}</p>
                                    </div>
                                    {selectedRequest.website && (
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-500">Sitio web</p>
                                            <a href={selectedRequest.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                {selectedRequest.website}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {selectedRequest.description && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Descripción</p>
                                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRequest.description}</p>
                                    </div>
                                )}

                                {selectedRequest.rejectionReason && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-red-600">Motivo de rechazo</p>
                                        <p className="text-red-700 bg-red-50 p-3 rounded-lg">{selectedRequest.rejectionReason}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            {selectedRequest?.status === "PENDING_APPROVAL" && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="text-red-600"
                                        onClick={() => {
                                            setDialogType("reject");
                                        }}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Rechazar
                                    </Button>
                                    <Button
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => {
                                            setDialogType("approve");
                                        }}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Aprobar
                                    </Button>
                                </>
                            )}
                            {selectedRequest?.status !== "PENDING_APPROVAL" && (
                                <Button variant="outline" onClick={() => setDialogType(null)}>
                                    Cerrar
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Approve Dialog */}
                <Dialog open={dialogType === "approve"} onOpenChange={() => setDialogType(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Aprobar Solicitud</DialogTitle>
                            <DialogDescription>
                                ¿Estás seguro de que deseas aprobar la solicitud de <span className="font-semibold">{selectedRequest?.businessName}</span>?
                                <br /><br />
                                Esto creará automáticamente un perfil de proveedor para el usuario y cambiará su rol a PROVIDER.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogType(null)} disabled={processing}>
                                Cancelar
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={handleApprove}
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Aprobar
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reject Dialog */}
                <Dialog open={dialogType === "reject"} onOpenChange={() => setDialogType(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Rechazar Solicitud</DialogTitle>
                            <DialogDescription>
                                Proporciona un motivo para rechazar la solicitud de <span className="font-semibold">{selectedRequest?.businessName}</span>.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Textarea
                                placeholder="Escribe el motivo del rechazo..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogType(null)} disabled={processing}>
                                Cancelar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={processing || !rejectionReason.trim()}
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Rechazar
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminRoute>
    );
}
