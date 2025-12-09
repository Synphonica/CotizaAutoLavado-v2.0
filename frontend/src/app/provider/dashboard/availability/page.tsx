"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
    Calendar as CalendarIcon,
    Clock,
    Plus,
    Trash2,
    AlertTriangle,
    Info,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { ProviderRoute } from "@/components/ProtectedRoute";

interface BlockedPeriod {
    id: string;
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    reason: string;
    type: "vacation" | "maintenance" | "other";
}

const mockBlockedPeriods: BlockedPeriod[] = [
    {
        id: "1",
        startDate: new Date("2024-12-24"),
        endDate: new Date("2024-12-26"),
        startTime: "00:00",
        endTime: "23:59",
        reason: "Vacaciones de Navidad",
        type: "vacation",
    },
    {
        id: "2",
        startDate: new Date("2025-01-15"),
        endDate: new Date("2025-01-15"),
        startTime: "14:00",
        endTime: "18:00",
        reason: "Mantención de equipos",
        type: "maintenance",
    },
];

const blockTypes = [
    { value: "vacation", label: "Vacaciones", color: "blue" },
    { value: "maintenance", label: "Mantención", color: "orange" },
    { value: "other", label: "Otro", color: "gray" },
];

function AvailabilityManagementContent() {
    const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>(mockBlockedPeriods);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [formData, setFormData] = useState({
        startTime: "09:00",
        endTime: "18:00",
        reason: "",
        type: "vacation" as "vacation" | "maintenance" | "other",
    });

    const handleOpenDialog = () => {
        setIsDialogOpen(true);
        setSelectedDates([]);
        setFormData({
            startTime: "09:00",
            endTime: "18:00",
            reason: "",
            type: "vacation",
        });
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;

        const dateStr = date.toDateString();
        const existingIndex = selectedDates.findIndex(
            (d) => d.toDateString() === dateStr
        );

        if (existingIndex >= 0) {
            setSelectedDates(selectedDates.filter((_, i) => i !== existingIndex));
        } else {
            setSelectedDates([...selectedDates, date]);
        }
    };

    const handleSubmit = () => {
        if (selectedDates.length === 0 || !formData.reason) return;

        const sortedDates = selectedDates.sort((a, b) => a.getTime() - b.getTime());
        const newBlock: BlockedPeriod = {
            id: Date.now().toString(),
            startDate: sortedDates[0],
            endDate: sortedDates[sortedDates.length - 1],
            startTime: formData.startTime,
            endTime: formData.endTime,
            reason: formData.reason,
            type: formData.type,
        };

        setBlockedPeriods([...blockedPeriods, newBlock]);
        setIsDialogOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm("¿Estás seguro de que deseas eliminar este bloqueo?")) {
            setBlockedPeriods(blockedPeriods.filter((b) => b.id !== id));
        }
    };

    const formatDateRange = (start: Date, end: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric",
        };

        if (start.toDateString() === end.toDateString()) {
            return start.toLocaleDateString("es-CL", options);
        }

        return `${start.toLocaleDateString("es-CL", options)} - ${end.toLocaleDateString(
            "es-CL",
            options
        )}`;
    };

    const getTypeColor = (type: string) => {
        const typeConfig = blockTypes.find((t) => t.value === type);
        return typeConfig?.color || "gray";
    };

    const getTypeLabel = (type: string) => {
        const typeConfig = blockTypes.find((t) => t.value === type);
        return typeConfig?.label || type;
    };

    // Generar opciones de tiempo
    const generateTimeOptions = () => {
        const times = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute of [0, 30]) {
                const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                times.push(timeString);
            }
        }
        return times;
    };

    const timeOptions = generateTimeOptions();

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
                                Gestión de Disponibilidad
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Bloquea períodos de tiempo cuando no estés disponible
                            </p>
                        </div>
                        <Button onClick={handleOpenDialog} size="lg">
                            <Plus className="w-5 h-5 mr-2" />
                            Bloquear Período
                        </Button>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Bloqueos Activos
                            </CardTitle>
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {blockedPeriods.filter((b) => b.endDate >= new Date()).length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Próximo Bloqueo
                            </CardTitle>
                            <CalendarIcon className="w-4 h-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium">
                                {blockedPeriods.length > 0
                                    ? blockedPeriods[0].startDate.toLocaleDateString("es-CL")
                                    : "Ninguno"}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Días Bloqueados
                            </CardTitle>
                            <Clock className="w-4 h-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {blockedPeriods.reduce((acc, period) => {
                                    const days = Math.ceil(
                                        (period.endDate.getTime() - period.startDate.getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    ) + 1;
                                    return acc + days;
                                }, 0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Blocked Periods List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Períodos Bloqueados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {blockedPeriods.length === 0 ? (
                            <div className="text-center py-12">
                                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">
                                    No hay períodos bloqueados registrados
                                </p>
                                <Button onClick={handleOpenDialog} variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Agregar Primer Bloqueo
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {blockedPeriods
                                    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
                                    .map((period, index) => (
                                        <motion.div
                                            key={period.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge
                                                            variant="outline"
                                                            className={`bg-${getTypeColor(period.type)}-100 text-${getTypeColor(period.type)}-700`}
                                                        >
                                                            {getTypeLabel(period.type)}
                                                        </Badge>
                                                        {period.endDate < new Date() && (
                                                            <Badge variant="secondary">Pasado</Badge>
                                                        )}
                                                    </div>
                                                    <h3 className="font-medium mb-1">{period.reason}</h3>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <CalendarIcon className="w-4 h-4" />
                                                            {formatDateRange(period.startDate, period.endDate)}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {period.startTime} - {period.endTime}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(period.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="mt-6">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-gray-600">
                                <p className="font-medium mb-1">Acerca de los bloqueos</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>
                                        Los períodos bloqueados evitarán que los clientes agenden en
                                        esas fechas y horarios
                                    </li>
                                    <li>
                                        Puedes bloquear desde unas horas hasta semanas completas
                                    </li>
                                    <li>
                                        Los agendamientos existentes no se verán afectados por los
                                        bloqueos
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Bloquear Período de Disponibilidad</DialogTitle>
                            <DialogDescription>
                                Selecciona las fechas y horarios en los que no estarás disponible
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Calendar */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Selecciona las fechas *
                                </label>
                                <div className="flex justify-center">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDates[0]}
                                        onSelect={handleDateSelect}
                                        className="rounded-md border"
                                        disabled={(date: Date) => date < new Date()}
                                    />
                                </div>
                                {selectedDates.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {selectedDates
                                            .sort((a, b) => a.getTime() - b.getTime())
                                            .map((date, index) => (
                                                <Badge key={index} variant="secondary">
                                                    {date.toLocaleDateString("es-CL")}
                                                </Badge>
                                            ))}
                                    </div>
                                )}
                            </div>

                            {/* Time Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Hora de inicio *
                                    </label>
                                    <select
                                        value={formData.startTime}
                                        onChange={(e) =>
                                            setFormData({ ...formData, startTime: e.target.value })
                                        }
                                        className="w-full p-2 border rounded-md"
                                    >
                                        {timeOptions.map((time) => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Hora de fin *
                                    </label>
                                    <select
                                        value={formData.endTime}
                                        onChange={(e) =>
                                            setFormData({ ...formData, endTime: e.target.value })
                                        }
                                        className="w-full p-2 border rounded-md"
                                    >
                                        {timeOptions.map((time) => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Type */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Tipo *</label>
                                <div className="flex gap-2">
                                    {blockTypes.map((type) => (
                                        <Button
                                            key={type.value}
                                            type="button"
                                            variant={
                                                formData.type === type.value ? "default" : "outline"
                                            }
                                            onClick={() =>
                                                setFormData({
                                                    ...formData,
                                                    type: type.value as any,
                                                })
                                            }
                                        >
                                            {type.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Motivo del bloqueo *
                                </label>
                                <Textarea
                                    placeholder="Ej: Vacaciones de verano, Mantención de equipos, etc."
                                    value={formData.reason}
                                    onChange={(e) =>
                                        setFormData({ ...formData, reason: e.target.value })
                                    }
                                    rows={3}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={selectedDates.length === 0 || !formData.reason}
                            >
                                Bloquear Período
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default function AvailabilityManagementPage() {
    return (
        <ProviderRoute>
            <AvailabilityManagementContent />
        </ProviderRoute>
    );
}
