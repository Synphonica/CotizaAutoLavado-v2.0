"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ProviderRoute } from "@/components/ProtectedRoute";
import {
    Plus,
    Edit,
    Trash2,
    Tag,
    Calendar,
    Percent,
    DollarSign,
    TrendingUp,
    AlertCircle,
} from "lucide-react";

interface Promotion {
    id: string;
    title: string;
    description: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    startDate: string;
    endDate: string;
    applicableServices: string[];
    isActive: boolean;
    usageCount: number;
    createdAt: string;
}

const mockPromotions: Promotion[] = [
    {
        id: "1",
        title: "Descuento Verano 2024",
        description: "20% de descuento en todos los servicios de lavado completo",
        discountType: "percentage",
        discountValue: 20,
        startDate: "2024-12-01",
        endDate: "2025-02-28",
        applicableServices: ["1", "2"],
        isActive: true,
        usageCount: 45,
        createdAt: "2024-11-15",
    },
    {
        id: "2",
        title: "Promo Express",
        description: "$2.000 de descuento en lavado express",
        discountType: "fixed",
        discountValue: 2000,
        startDate: "2024-12-15",
        endDate: "2024-12-31",
        applicableServices: ["3"],
        isActive: true,
        usageCount: 12,
        createdAt: "2024-12-01",
    },
];

const mockServices = [
    { id: "1", name: "Lavado Exterior Premium" },
    { id: "2", name: "Lavado Completo + Encerado" },
    { id: "3", name: "Lavado Express" },
    { id: "4", name: "Detailing Completo" },
    { id: "5", name: "Pulido de Pintura" },
];

function PromotionsManagementContent() {
    const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        discountType: "percentage" as "percentage" | "fixed",
        discountValue: "",
        startDate: "",
        endDate: "",
        applicableServices: [] as string[],
    });

    const handleOpenDialog = (promotion?: Promotion) => {
        if (promotion) {
            setEditingPromotion(promotion);
            setFormData({
                title: promotion.title,
                description: promotion.description,
                discountType: promotion.discountType,
                discountValue: promotion.discountValue.toString(),
                startDate: promotion.startDate,
                endDate: promotion.endDate,
                applicableServices: promotion.applicableServices,
            });
        } else {
            setEditingPromotion(null);
            setFormData({
                title: "",
                description: "",
                discountType: "percentage",
                discountValue: "",
                startDate: "",
                endDate: "",
                applicableServices: [],
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingPromotion(null);
    };

    const handleSubmit = () => {
        if (editingPromotion) {
            setPromotions(
                promotions.map((p) =>
                    p.id === editingPromotion.id
                        ? {
                            ...p,
                            title: formData.title,
                            description: formData.description,
                            discountType: formData.discountType,
                            discountValue: Number(formData.discountValue),
                            startDate: formData.startDate,
                            endDate: formData.endDate,
                            applicableServices: formData.applicableServices,
                        }
                        : p
                )
            );
        } else {
            const newPromotion: Promotion = {
                id: Date.now().toString(),
                title: formData.title,
                description: formData.description,
                discountType: formData.discountType,
                discountValue: Number(formData.discountValue),
                startDate: formData.startDate,
                endDate: formData.endDate,
                applicableServices: formData.applicableServices,
                isActive: true,
                usageCount: 0,
                createdAt: new Date().toISOString(),
            };
            setPromotions([...promotions, newPromotion]);
        }
        handleCloseDialog();
    };

    const handleDelete = (id: string) => {
        if (confirm("¿Estás seguro de que deseas eliminar esta promoción?")) {
            setPromotions(promotions.filter((p) => p.id !== id));
        }
    };

    const toggleStatus = (id: string) => {
        setPromotions(
            promotions.map((p) =>
                p.id === id ? { ...p, isActive: !p.isActive } : p
            )
        );
    };

    const formatDiscount = (promo: Promotion) => {
        if (promo.discountType === "percentage") {
            return `${promo.discountValue}%`;
        }
        return `$${promo.discountValue.toLocaleString()}`;
    };

    const isPromotionActive = (promo: Promotion) => {
        const now = new Date();
        const start = new Date(promo.startDate);
        const end = new Date(promo.endDate);
        return promo.isActive && now >= start && now <= end;
    };

    const totalSavings = promotions.reduce((acc, promo) => {
        if (promo.discountType === "fixed") {
            return acc + promo.discountValue * promo.usageCount;
        }
        return acc;
    }, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Gestión de Promociones
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Crea y administra descuentos y promociones especiales
                            </p>
                        </div>
                        <Button onClick={() => handleOpenDialog()} size="lg">
                            <Plus className="w-5 h-5 mr-2" />
                            Nueva Promoción
                        </Button>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Promociones
                            </CardTitle>
                            <Tag className="w-4 h-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{promotions.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Activas</CardTitle>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {promotions.filter((p) => isPromotionActive(p)).length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Usos Totales</CardTitle>
                            <Percent className="w-4 h-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {promotions.reduce((acc, p) => acc + p.usageCount, 0)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Descuentos Otorgados
                            </CardTitle>
                            <DollarSign className="w-4 h-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${totalSavings.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Promotions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {promotions.map((promotion, index) => {
                            const active = isPromotionActive(promotion);
                            return (
                                <motion.div
                                    key={promotion.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card
                                        className={`${active
                                            ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                                            : ""
                                            }`}
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge
                                                            variant={active ? "default" : "secondary"}
                                                            className={active ? "bg-green-500" : ""}
                                                        >
                                                            {active ? "Activa" : "Inactiva"}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {formatDiscount(promotion)}
                                                        </Badge>
                                                    </div>
                                                    <CardTitle className="text-lg">
                                                        {promotion.title}
                                                    </CardTitle>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenDialog(promotion)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(promotion.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-sm text-gray-600">
                                                {promotion.description}
                                            </p>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span>
                                                        {new Date(promotion.startDate).toLocaleDateString(
                                                            "es-CL"
                                                        )}{" "}
                                                        -{" "}
                                                        {new Date(promotion.endDate).toLocaleDateString(
                                                            "es-CL"
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Tag className="w-4 h-4 text-gray-400" />
                                                    <span>
                                                        {promotion.applicableServices.length === 0
                                                            ? "Todos los servicios"
                                                            : `${promotion.applicableServices.length} servicio(s)`}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t">
                                                <div className="text-sm">
                                                    <span className="text-gray-500">Usos: </span>
                                                    <span className="font-medium">
                                                        {promotion.usageCount}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => toggleStatus(promotion.id)}
                                                >
                                                    {promotion.isActive ? "Desactivar" : "Activar"}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {promotions.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">
                                No tienes promociones creadas aún
                            </p>
                            <Button onClick={() => handleOpenDialog()} variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Primera Promoción
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingPromotion ? "Editar Promoción" : "Nueva Promoción"}
                            </DialogTitle>
                            <DialogDescription>
                                Configura los detalles de la promoción
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Título de la Promoción *
                                </label>
                                <Input
                                    placeholder="Ej: Descuento Verano 2024"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Descripción *
                                </label>
                                <Textarea
                                    placeholder="Describe los términos y condiciones de la promoción..."
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
                                        Tipo de Descuento *
                                    </label>
                                    <Select
                                        value={formData.discountType}
                                        onValueChange={(value: any) =>
                                            setFormData({ ...formData, discountType: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                                            <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Valor del Descuento *
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder={
                                            formData.discountType === "percentage" ? "20" : "5000"
                                        }
                                        value={formData.discountValue}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                discountValue: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Fecha de Inicio *
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) =>
                                            setFormData({ ...formData, startDate: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Fecha de Fin *
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) =>
                                            setFormData({ ...formData, endDate: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Servicios Aplicables
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    Deja vacío para aplicar a todos los servicios
                                </p>
                                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                                    {mockServices.map((service) => (
                                        <div
                                            key={service.id}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={service.id}
                                                checked={formData.applicableServices.includes(
                                                    service.id
                                                )}
                                                onCheckedChange={(checked: boolean) => {
                                                    if (checked) {
                                                        setFormData({
                                                            ...formData,
                                                            applicableServices: [
                                                                ...formData.applicableServices,
                                                                service.id,
                                                            ],
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            applicableServices:
                                                                formData.applicableServices.filter(
                                                                    (id) => id !== service.id
                                                                ),
                                                        });
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor={service.id}
                                                className="text-sm cursor-pointer"
                                            >
                                                {service.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-gray-600">
                                    <p className="font-medium mb-1">Importante</p>
                                    <p>
                                        Las promociones se aplicarán automáticamente durante el
                                        período especificado. Los descuentos se mostrarán en la
                                        página de búsqueda y detalles del servicio.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleCloseDialog}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={
                                    !formData.title ||
                                    !formData.description ||
                                    !formData.discountValue ||
                                    !formData.startDate ||
                                    !formData.endDate
                                }
                            >
                                {editingPromotion ? "Guardar Cambios" : "Crear Promoción"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default function PromotionsManagementPage() {
    return (
        <ProviderRoute>
            <PromotionsManagementContent />
        </ProviderRoute>
    );
}
