"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Clock, Calendar, AlertCircle, Save, RefreshCw } from "lucide-react";
import { ProviderRoute } from "@/components/ProtectedRoute";

interface DaySchedule {
    day: string;
    dayLabel: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

const initialSchedule: DaySchedule[] = [
    { day: "monday", dayLabel: "Lunes", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: "tuesday", dayLabel: "Martes", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: "wednesday", dayLabel: "Miércoles", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: "thursday", dayLabel: "Jueves", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: "friday", dayLabel: "Viernes", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: "saturday", dayLabel: "Sábado", isOpen: true, openTime: "09:00", closeTime: "14:00" },
    { day: "sunday", dayLabel: "Domingo", isOpen: false, openTime: "09:00", closeTime: "14:00" },
];

const holidays = [
    { date: "2024-12-25", name: "Navidad" },
    { date: "2024-12-31", name: "Fin de Año" },
    { date: "2025-01-01", name: "Año Nuevo" },
    { date: "2025-05-01", name: "Día del Trabajo" },
    { date: "2025-05-21", name: "Día de las Glorias Navales" },
    { date: "2025-09-18", name: "Fiestas Patrias" },
    { date: "2025-09-19", name: "Día del Ejército" },
    { date: "2025-10-12", name: "Día de la Raza" },
    { date: "2025-11-01", name: "Día de Todos los Santos" },
];

// Generar opciones de tiempo en intervalos de 30 minutos
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

function ScheduleManagementContent() {
    const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);
    const [closedHolidays, setClosedHolidays] = useState<string[]>([
        "2024-12-25",
        "2025-01-01",
    ]);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const timeOptions = generateTimeOptions();

    const handleToggleDay = (index: number) => {
        const newSchedule = [...schedule];
        newSchedule[index].isOpen = !newSchedule[index].isOpen;
        setSchedule(newSchedule);
        setHasChanges(true);
    };

    const handleTimeChange = (
        index: number,
        field: "openTime" | "closeTime",
        value: string
    ) => {
        const newSchedule = [...schedule];
        newSchedule[index][field] = value;
        setSchedule(newSchedule);
        setHasChanges(true);
    };

    const handleToggleHoliday = (date: string) => {
        if (closedHolidays.includes(date)) {
            setClosedHolidays(closedHolidays.filter((d) => d !== date));
        } else {
            setClosedHolidays([...closedHolidays, date]);
        }
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        // TODO: Call API to save schedule
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSaving(false);
        setHasChanges(false);
    };

    const handleReset = () => {
        setSchedule(initialSchedule);
        setClosedHolidays(["2024-12-25", "2025-01-01"]);
        setHasChanges(false);
    };

    const isValidSchedule = (day: DaySchedule) => {
        if (!day.isOpen) return true;
        return day.openTime < day.closeTime;
    };

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
                                Gestión de Horarios
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Configura los horarios de atención de tu autolavado
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {hasChanges && (
                                <Button variant="outline" onClick={handleReset}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Descartar
                                </Button>
                            )}
                            <Button
                                onClick={handleSave}
                                disabled={!hasChanges || isSaving}
                                className="min-w-[120px]"
                            >
                                {isSaving ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Guardar
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Weekly Schedule */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Clock className="w-5 h-5 mr-2" />
                                    Horario Semanal
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {schedule.map((day, index) => (
                                    <motion.div
                                        key={day.day}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`p-4 rounded-lg border ${day.isOpen
                                            ? "border-green-200 bg-green-50 dark:bg-green-900/20"
                                            : "border-gray-200 bg-gray-50 dark:bg-gray-800"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            {/* Day Name & Toggle */}
                                            <div className="flex items-center gap-3 min-w-[120px]">
                                                <Switch
                                                    checked={day.isOpen}
                                                    onCheckedChange={() => handleToggleDay(index)}
                                                />
                                                <span className="font-medium">{day.dayLabel}</span>
                                            </div>

                                            {/* Time Selectors */}
                                            {day.isOpen ? (
                                                <div className="flex items-center gap-3 flex-1">
                                                    <Select
                                                        value={day.openTime}
                                                        onValueChange={(value) =>
                                                            handleTimeChange(index, "openTime", value)
                                                        }
                                                    >
                                                        <SelectTrigger className="w-[120px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {timeOptions.map((time) => (
                                                                <SelectItem key={time} value={time}>
                                                                    {time}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>

                                                    <span className="text-gray-500">hasta</span>

                                                    <Select
                                                        value={day.closeTime}
                                                        onValueChange={(value) =>
                                                            handleTimeChange(index, "closeTime", value)
                                                        }
                                                    >
                                                        <SelectTrigger className="w-[120px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {timeOptions.map((time) => (
                                                                <SelectItem key={time} value={time}>
                                                                    {time}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>

                                                    {!isValidSchedule(day) && (
                                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                                    )}
                                                </div>
                                            ) : (
                                                <Badge variant="secondary" className="ml-auto">
                                                    Cerrado
                                                </Badge>
                                            )}
                                        </div>

                                        {!isValidSchedule(day) && (
                                            <p className="text-sm text-red-500 mt-2">
                                                La hora de apertura debe ser anterior a la hora de cierre
                                            </p>
                                        )}
                                    </motion.div>
                                ))}

                                {/* Quick Actions */}
                                <div className="flex gap-2 pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newSchedule = schedule.map((day) => ({
                                                ...day,
                                                isOpen: true,
                                                openTime: "09:00",
                                                closeTime: "18:00",
                                            }));
                                            setSchedule(newSchedule);
                                            setHasChanges(true);
                                        }}
                                    >
                                        Abrir todos 9:00 - 18:00
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newSchedule = schedule.map((day, index) => ({
                                                ...day,
                                                isOpen: index < 5, // Lunes a Viernes
                                                openTime: "09:00",
                                                closeTime: "18:00",
                                            }));
                                            setSchedule(newSchedule);
                                            setHasChanges(true);
                                        }}
                                    >
                                        Solo Lunes a Viernes
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newSchedule = schedule.map((day) => ({
                                                ...day,
                                                isOpen: false,
                                            }));
                                            setSchedule(newSchedule);
                                            setHasChanges(true);
                                        }}
                                    >
                                        Cerrar todos
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Holidays */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    Días Festivos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">
                                    Selecciona los días festivos en los que permanecerás cerrado
                                </p>
                                <div className="space-y-3">
                                    {holidays.map((holiday) => {
                                        const isClosed = closedHolidays.includes(holiday.date);
                                        return (
                                            <div
                                                key={holiday.date}
                                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${isClosed
                                                    ? "border-red-300 bg-red-50 dark:bg-red-900/20"
                                                    : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                                onClick={() => handleToggleHoliday(holiday.date)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">
                                                            {holiday.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {new Date(holiday.date).toLocaleDateString("es-CL", {
                                                                weekday: "long",
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            })}
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={isClosed}
                                                        onCheckedChange={() => handleToggleHoliday(holiday.date)}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Info Card */}
                        <Card className="mt-6">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium mb-1">Importante</p>
                                        <p>
                                            Los cambios en los horarios afectarán la disponibilidad de
                                            agendamiento. Los clientes solo podrán reservar en los
                                            horarios configurados como abiertos.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ScheduleManagementPage() {
    return (
        <ProviderRoute>
            <ScheduleManagementContent />
        </ProviderRoute>
    );
}
