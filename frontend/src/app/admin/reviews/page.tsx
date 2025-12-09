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
import { useApi } from "@/hooks/useApi";
import { AdminRoute } from "@/components/ProtectedRoute";
import {
    Search,
    MoreHorizontal,
    MessageSquare,
    CheckCircle,
    XCircle,
    RefreshCw,
    Eye,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Star,
    User,
    Building2,
    Flag,
    ThumbsUp
} from "lucide-react";
import { toast } from "sonner";

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    status: "ACTIVE" | "HIDDEN" | "FLAGGED";
    createdAt: string;
    user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
    };
    provider: {
        id: string;
        businessName: string;
        city: string | null;
    };
}

export default function AdminReviewsPage() {
    const { get, patch, delete: del } = useApi();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [ratingFilter, setRatingFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [dialogType, setDialogType] = useState<"view" | "status" | "delete" | null>(null);
    const [newStatus, setNewStatus] = useState<string>("");

    useEffect(() => {
        loadReviews();
    }, [page, statusFilter, ratingFilter]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
            });

            if (statusFilter && statusFilter !== "all") {
                params.append("status", statusFilter);
            }

            if (ratingFilter && ratingFilter !== "all") {
                params.append("rating", ratingFilter);
            }

            const response = await get<any>(`/reviews?${params.toString()}`);

            if (response) {
                setReviews(response.data || response.reviews || []);
                setTotal(response.total || 0);
                setTotalPages(response.totalPages || Math.ceil((response.total || 0) / 10));
            }
        } catch (error) {
            console.error("Error loading reviews:", error);
            toast.error("Error al cargar reseñas");
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = async () => {
        if (!selectedReview || !newStatus) return;

        try {
            await patch(`/reviews/${selectedReview.id}/status`, { status: newStatus });
            toast.success(`Estado actualizado a ${newStatus}`);
            setDialogType(null);
            setSelectedReview(null);
            loadReviews();
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Error al actualizar el estado");
        }
    };

    const handleDeleteReview = async () => {
        if (!selectedReview) return;

        try {
            await del(`/reviews/${selectedReview.id}`);
            toast.success("Reseña eliminada correctamente");
            setDialogType(null);
            setSelectedReview(null);
            loadReviews();
        } catch (error) {
            console.error("Error deleting review:", error);
            toast.error("Error al eliminar la reseña");
        }
    };

    const filteredReviews = reviews.filter(review => {
        const matchesSearch =
            review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.provider?.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { className: string; label: string; icon: React.ReactNode }> = {
            ACTIVE: { className: "bg-green-100 text-green-700", label: "Activa", icon: <CheckCircle className="h-3 w-3" /> },
            HIDDEN: { className: "bg-gray-100 text-gray-700", label: "Oculta", icon: <XCircle className="h-3 w-3" /> },
            FLAGGED: { className: "bg-red-100 text-red-700", label: "Reportada", icon: <Flag className="h-3 w-3" /> },
        };
        const config = statusConfig[status] || statusConfig.ACTIVE;
        return (
            <Badge variant="secondary" className={`${config.className} flex items-center gap-1`}>
                {config.icon}
                {config.label}
            </Badge>
        );
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

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
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Reseñas</h1>
                        <p className="text-gray-600 mt-1">Modera las reseñas de la plataforma</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={loadReviews}>
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
                                    <MessageSquare className="h-5 w-5 text-blue-600" />
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
                                    <Star className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Rating promedio</p>
                                    <p className="text-2xl font-bold">{averageRating}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <ThumbsUp className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Positivas (4-5★)</p>
                                    <p className="text-2xl font-bold">{reviews.filter(r => r.rating >= 4).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 p-2 rounded-lg">
                                    <Flag className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Reportadas</p>
                                    <p className="text-2xl font-bold">{reviews.filter(r => r.status === 'FLAGGED').length}</p>
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
                                        placeholder="Buscar por comentario, usuario, proveedor..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-[140px] md:w-[150px]">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="ACTIVE">Activa</SelectItem>
                                        <SelectItem value="HIDDEN">Oculta</SelectItem>
                                        <SelectItem value="FLAGGED">Reportada</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                                    <SelectTrigger className="w-full sm:w-[140px] md:w-[150px]">
                                        <SelectValue placeholder="Rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="5">5 estrellas</SelectItem>
                                        <SelectItem value="4">4 estrellas</SelectItem>
                                        <SelectItem value="3">3 estrellas</SelectItem>
                                        <SelectItem value="2">2 estrellas</SelectItem>
                                        <SelectItem value="1">1 estrella</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Reviews Table */}
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
                                        {filteredReviews.length === 0 ? (
                                            <p className="text-center py-8 text-gray-500">No se encontraron reseñas</p>
                                        ) : (
                                            filteredReviews.map((review) => (
                                                <motion.div
                                                    key={review.id}
                                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedReview(review);
                                                        setDialogType("view");
                                                    }}
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            {renderStars(review.rating)}
                                                        </div>
                                                        {getStatusBadge(review.status)}
                                                    </div>
                                                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                                                        {review.comment || 'Sin comentario'}
                                                    </p>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                                            <span className="text-gray-900 truncate">
                                                                {review.user?.firstName || ''} {review.user?.lastName || ''}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                                            <span className="text-gray-600 truncate">{review.provider?.businessName}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                                            <span>{new Date(review.createdAt).toLocaleDateString('es-CL')}</span>
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
                                                    <TableHead>Usuario</TableHead>
                                                    <TableHead>Proveedor</TableHead>
                                                    <TableHead>Rating</TableHead>
                                                    <TableHead>Comentario</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead>Fecha</TableHead>
                                                    <TableHead className="text-right">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredReviews.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                            No se encontraron reseñas
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredReviews.map((review) => (
                                                        <TableRow key={review.id}>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-4 w-4 text-gray-400" />
                                                                    <div>
                                                                        <p className="font-medium text-sm">
                                                                            {review.user?.firstName || ''} {review.user?.lastName || ''}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">{review.user?.email}</p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Building2 className="h-4 w-4 text-gray-400" />
                                                                    <span className="text-sm">{review.provider?.businessName}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>{renderStars(review.rating)}</TableCell>
                                                            <TableCell>
                                                                <p className="text-sm text-gray-600 truncate max-w-[200px]">
                                                                    {review.comment || 'Sin comentario'}
                                                                </p>
                                                            </TableCell>
                                                            <TableCell>{getStatusBadge(review.status)}</TableCell>
                                                            <TableCell className="text-gray-600 text-sm">
                                                                {new Date(review.createdAt).toLocaleDateString('es-CL')}
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
                                                                                setSelectedReview(review);
                                                                                setDialogType("view");
                                                                            }}
                                                                        >
                                                                            <Eye className="h-4 w-4 mr-2" />
                                                                            Ver detalles
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setSelectedReview(review);
                                                                                setNewStatus(review.status);
                                                                                setDialogType("status");
                                                                            }}
                                                                        >
                                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                                            Cambiar estado
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            className="text-red-600"
                                                                            onClick={() => {
                                                                                setSelectedReview(review);
                                                                                setDialogType("delete");
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-2" />
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
                                            Mostrando {filteredReviews.length} de {total} reseñas
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
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Detalles de la Reseña</DialogTitle>
                        </DialogHeader>
                        {selectedReview && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    {renderStars(selectedReview.rating)}
                                    {getStatusBadge(selectedReview.status)}
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-700 italic">
                                        "{selectedReview.comment || 'Sin comentario'}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Usuario</p>
                                        <p>{selectedReview.user?.firstName} {selectedReview.user?.lastName}</p>
                                        <p className="text-sm text-gray-500">{selectedReview.user?.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Proveedor</p>
                                        <p>{selectedReview.provider?.businessName}</p>
                                        <p className="text-sm text-gray-500">{selectedReview.provider?.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Fecha</p>
                                        <p>{new Date(selectedReview.createdAt).toLocaleString('es-CL')}</p>
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
                            <DialogTitle>Cambiar Estado de la Reseña</DialogTitle>
                            <DialogDescription>
                                Cambiar el estado de la reseña
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar nuevo estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Activa</SelectItem>
                                    <SelectItem value="HIDDEN">Oculta</SelectItem>
                                    <SelectItem value="FLAGGED">Reportada</SelectItem>
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
                            <DialogTitle>Eliminar Reseña</DialogTitle>
                            <DialogDescription>
                                ¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogType(null)}>
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteReview}>
                                Eliminar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminRoute>
    );
}
