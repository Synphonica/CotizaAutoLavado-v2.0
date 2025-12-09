"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
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
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Clock,
    DollarSign,
    Package,
    Image as ImageIcon,
    Search,
    Filter,
    ArrowUpDown,
} from "lucide-react";
import { ProviderRoute } from "@/components/ProtectedRoute";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { toast } from "sonner";

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number; // en minutos
    category: string;
    imageUrl?: string;
    status: "ACTIVE" | "INACTIVE";
    bookingsCount: number;
    rating: number;
    createdAt: string;
}

const categories = [
    { value: "EXTERIOR", label: "Lavado Exterior" },
    { value: "INTERIOR", label: "Lavado Interior" },
    { value: "COMPLETE", label: "Lavado Completo" },
    { value: "EXPRESS", label: "Lavado Express" },
    { value: "DETAILING", label: "Detailing" },
    { value: "POLISH", label: "Pulido" },
    { value: "WAX", label: "Encerado" },
    { value: "ENGINE", label: "Lavado de Motor" },
];

function ServicesManagementContent() {
    const { getToken } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        duration: "",
        category: "",
        imageUrl: "",
    });

    // Cargar servicios del proveedor
    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setIsLoading(true);
            const token = await getToken();
            const data = await apiGet<Service[]>("/services/my-services", { token });
            setServices(data);
        } catch (error) {
            console.error("Error loading services:", error);
            toast.error("No se pudieron cargar los servicios");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = (service?: Service) => {
        if (service) {
            setEditingService(service);
            setFormData({
                name: service.name,
                description: service.description,
                price: service.price.toString(),
                duration: service.duration.toString(),
                category: service.category,
                imageUrl: service.imageUrl || "",
            });
        } else {
            setEditingService(null);
            setFormData({
                name: "",
                description: "",
                price: "",
                duration: "",
                category: "",
                imageUrl: "",
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingService(null);
        setFormData({
            name: "",
            description: "",
            price: "",
            duration: "",
            category: "",
            imageUrl: "",
        });
    };

    const handleSubmit = async () => {
        try {
            const token = await getToken();
            const serviceData = {
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                duration: Number(formData.duration),
                category: formData.category,
                imageUrl: formData.imageUrl || undefined,
            };

            if (editingService) {
                // Update existing service
                await apiPut(`/services/${editingService.id}`, serviceData, { token });
                toast.success("Servicio actualizado correctamente");
            } else {
                // Create new service
                await apiPost("/services", serviceData, { token });
                toast.success("Servicio creado correctamente");
            }

            handleCloseDialog();
            loadServices();
        } catch (error) {
            console.error("Error saving service:", error);
            toast.error("No se pudo guardar el servicio");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
            return;
        }

        try {
            const token = await getToken();
            await apiDelete(`/services/${id}`, { token });
            toast.success("Servicio eliminado correctamente");
            loadServices();
        } catch (error) {
            console.error("Error deleting service:", error);
            toast.error("No se pudo eliminar el servicio");
        }
    };

    const toggleStatus = async (id: string) => {
        try {
            const token = await getToken();
            const service = services.find((s) => s.id === id);
            if (!service) return;

            const newStatus = service.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
            await apiPut(`/services/${id}`, { status: newStatus }, { token });

            toast.success(`Servicio ${newStatus === "ACTIVE" ? "activado" : "desactivado"} correctamente`);
            loadServices();
        } catch (error) {
            console.error("Error toggling service status:", error);
            toast.error("No se pudo cambiar el estado del servicio");
        }
    };

    const filteredServices = services.filter((service) => {
        const matchesSearch =
            service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            filterStatus === "ALL" || service.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="container mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Gestión de Servicios
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Administra el catálogo de servicios de tu autolavado
                            </p>
                        </div>
                        <Button onClick={() => handleOpenDialog()} size="lg">
                            <Plus className="w-5 h-5 mr-2" />
                            Agregar Servicio
                        </Button>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total de Servicios
                            </CardTitle>
                            <Package className="w-4 h-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{services.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Servicios Activos
                            </CardTitle>
                            <Eye className="w-4 h-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {services.filter((s) => s.status === "ACTIVE").length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Reservas Totales
                            </CardTitle>
                            <Clock className="w-4 h-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {services.reduce((acc, s) => acc + (s.bookingsCount || 0), 0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Buscar servicios..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select
                                value={filterStatus}
                                onValueChange={(value: any) => setFilterStatus(value)}
                            >
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todos</SelectItem>
                                    <SelectItem value="ACTIVE">Activos</SelectItem>
                                    <SelectItem value="INACTIVE">Inactivos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Services Table */}
                <Card>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Servicio</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Precio</TableHead>
                                    <TableHead>Duración</TableHead>
                                    <TableHead>Reservas</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence>
                                    {filteredServices.map((service) => (
                                        <motion.tr
                                            key={service.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b"
                                        >
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{service.name}</div>
                                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                                        {service.description}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {categories.find((c) => c.value === service.category)?.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(service.price)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                                    {service.duration} min
                                                </div>
                                            </TableCell>
                                            <TableCell>{service.bookingsCount || 0}</TableCell>
                                            <TableCell>
                                                {service.rating && service.rating > 0 ? service.rating.toFixed(1) : "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        service.status === "ACTIVE" ? "default" : "secondary"
                                                    }
                                                    className={
                                                        service.status === "ACTIVE"
                                                            ? "bg-green-500"
                                                            : "bg-gray-500"
                                                    }
                                                >
                                                    {service.status === "ACTIVE" ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => toggleStatus(service.id)}
                                                        title={
                                                            service.status === "ACTIVE"
                                                                ? "Desactivar"
                                                                : "Activar"
                                                        }
                                                    >
                                                        {service.status === "ACTIVE" ? (
                                                            <EyeOff className="w-4 h-4" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenDialog(service)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(service.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>

                        {filteredServices.length === 0 && (
                            <div className="text-center py-12">
                                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No se encontraron servicios</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Service Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingService ? "Editar Servicio" : "Nuevo Servicio"}
                            </DialogTitle>
                            <DialogDescription>
                                Completa la información del servicio. Todos los campos son
                                obligatorios excepto la imagen.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Nombre del Servicio
                                </label>
                                <Input
                                    placeholder="Ej: Lavado Exterior Premium"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Descripción
                                </label>
                                <Textarea
                                    placeholder="Describe qué incluye este servicio..."
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Precio (CLP)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="15000"
                                        value={formData.price}
                                        onChange={(e) =>
                                            setFormData({ ...formData, price: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Duración (minutos)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="45"
                                        value={formData.duration}
                                        onChange={(e) =>
                                            setFormData({ ...formData, duration: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Categoría
                                </label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, category: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    URL de Imagen (opcional)
                                </label>
                                <Input
                                    placeholder="https://..."
                                    value={formData.imageUrl}
                                    onChange={(e) =>
                                        setFormData({ ...formData, imageUrl: e.target.value })
                                    }
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Puedes usar una URL pública o subir desde tu galería
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleCloseDialog}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={
                                    !formData.name ||
                                    !formData.description ||
                                    !formData.price ||
                                    !formData.duration ||
                                    !formData.category
                                }
                            >
                                {editingService ? "Guardar Cambios" : "Crear Servicio"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default function ServicesManagementPage() {
    return (
        <ProviderRoute>
            <ServicesManagementContent />
        </ProviderRoute>
    );
}
