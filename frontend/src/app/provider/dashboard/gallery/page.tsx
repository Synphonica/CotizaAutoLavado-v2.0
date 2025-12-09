"use client";

import { useState, useRef } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ProviderRoute } from "@/components/ProtectedRoute";
import {
    Upload,
    X,
    Image as ImageIcon,
    AlertCircle,
    Check,
    GripVertical,
    Trash2,
    Eye,
    Info,
} from "lucide-react";

interface Photo {
    id: string;
    url: string;
    fileName: string;
    fileSize: number;
    order: number;
    uploadedAt: string;
}

const mockPhotos: Photo[] = [
    {
        id: "1",
        url: "/api/placeholder/800/600",
        fileName: "fachada-principal.jpg",
        fileSize: 2.4 * 1024 * 1024,
        order: 0,
        uploadedAt: "2024-11-15",
    },
    {
        id: "2",
        url: "/api/placeholder/800/600",
        fileName: "zona-lavado.jpg",
        fileSize: 1.8 * 1024 * 1024,
        order: 1,
        uploadedAt: "2024-11-15",
    },
    {
        id: "3",
        url: "/api/placeholder/800/600",
        fileName: "sala-espera.jpg",
        fileSize: 2.1 * 1024 * 1024,
        order: 2,
        uploadedAt: "2024-11-15",
    },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PHOTOS = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function GalleryManagement() {
    const [photos, setPhotos] = useState<Photo[]>(mockPhotos);
    const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        processFiles(files);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        processFiles(files);
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
    };

    const processFiles = (files: File[]) => {
        const newErrors: string[] = [];

        // Validar cantidad total
        if (photos.length + files.length > MAX_PHOTOS) {
            newErrors.push(`Solo puedes tener un máximo de ${MAX_PHOTOS} fotos`);
            setErrors(newErrors);
            return;
        }

        // Validar cada archivo
        const validFiles = files.filter((file) => {
            if (!ALLOWED_TYPES.includes(file.type)) {
                newErrors.push(`${file.name}: Formato no permitido (solo JPG, PNG, WebP)`);
                return false;
            }
            if (file.size > MAX_FILE_SIZE) {
                newErrors.push(
                    `${file.name}: Archivo muy grande (máximo 10MB)`
                );
                return false;
            }
            return true;
        });

        if (newErrors.length > 0) {
            setErrors(newErrors);
            setTimeout(() => setErrors([]), 5000);
        }

        if (validFiles.length > 0) {
            uploadFiles(validFiles);
        }
    };

    const uploadFiles = async (files: File[]) => {
        setUploadingFiles(files);

        for (const file of files) {
            // Simular progreso de carga
            const fileId = `temp-${Date.now()}-${Math.random()}`;
            setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

            // Simular upload con progreso
            for (let progress = 0; progress <= 100; progress += 10) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
            }

            // Crear URL temporal para preview
            const tempUrl = URL.createObjectURL(file);

            // Agregar foto a la lista
            const newPhoto: Photo = {
                id: fileId,
                url: tempUrl,
                fileName: file.name,
                fileSize: file.size,
                order: photos.length,
                uploadedAt: new Date().toISOString(),
            };

            setPhotos((prev) => [...prev, newPhoto]);
            setUploadProgress((prev) => {
                const newProgress = { ...prev };
                delete newProgress[fileId];
                return newProgress;
            });
        }

        setUploadingFiles([]);
    };

    const handleDelete = (id: string) => {
        if (confirm("¿Estás seguro de que deseas eliminar esta foto?")) {
            setPhotos(photos.filter((p) => p.id !== id));
        }
    };

    const handleReorder = (newOrder: Photo[]) => {
        setPhotos(newOrder.map((photo, index) => ({ ...photo, order: index })));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const totalSize = photos.reduce((acc, photo) => acc + photo.fileSize, 0);

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
                                Galería de Fotos
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Gestiona las fotos de tu establecimiento ({photos.length}/
                                {MAX_PHOTOS})
                            </p>
                        </div>
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            size="lg"
                            disabled={photos.length >= MAX_PHOTOS}
                        >
                            <Upload className="w-5 h-5 mr-2" />
                            Subir Fotos
                        </Button>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Fotos Subidas
                            </CardTitle>
                            <ImageIcon className="w-4 h-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{photos.length}</div>
                            <Progress
                                value={(photos.length / MAX_PHOTOS) * 100}
                                className="mt-2"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Espacio Usado
                            </CardTitle>
                            <ImageIcon className="w-4 h-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Cupos Disponibles
                            </CardTitle>
                            <ImageIcon className="w-4 h-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{MAX_PHOTOS - photos.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Error Messages */}
                <AnimatePresence>
                    {errors.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6"
                        >
                            <Card className="border-red-300 bg-red-50 dark:bg-red-900/20">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-red-800 dark:text-red-200 mb-2">
                                                Se encontraron errores
                                            </p>
                                            <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
                                                {errors.map((error, index) => (
                                                    <li key={index}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setErrors([])}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Upload Area */}
                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium mb-2">
                                Arrastra fotos aquí o haz clic para seleccionar
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                Formatos permitidos: JPG, PNG, WebP (máximo 10MB por foto)
                            </p>
                            {uploadingFiles.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {uploadingFiles.map((file, index) => {
                                        const fileId = `temp-${Date.now()}-${index}`;
                                        const progress = uploadProgress[fileId] || 0;
                                        return (
                                            <div key={index} className="text-left">
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <span>{file.name}</span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <Progress value={progress} />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={ALLOWED_TYPES.join(",")}
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-gray-600">
                                <p className="font-medium mb-1">Consejos para mejores fotos</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Usa fotos de buena calidad y bien iluminadas</li>
                                    <li>Muestra diferentes ángulos de tu establecimiento</li>
                                    <li>Incluye fotos de tus servicios en acción</li>
                                    <li>La primera foto será la imagen principal de tu perfil</li>
                                    <li>Puedes reordenar las fotos arrastrándolas</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Photos Grid */}
                {photos.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tus Fotos</CardTitle>
                            <p className="text-sm text-gray-500">
                                Arrastra para reordenar. La primera foto será la imagen principal.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <Reorder.Group
                                axis="y"
                                values={photos}
                                onReorder={handleReorder}
                                className="space-y-4"
                            >
                                {photos.map((photo, index) => (
                                    <Reorder.Item
                                        key={photo.id}
                                        value={photo}
                                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Drag Handle */}
                                            <div className="cursor-grab active:cursor-grabbing">
                                                <GripVertical className="w-5 h-5 text-gray-400" />
                                            </div>

                                            {/* Preview */}
                                            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                                <img
                                                    src={photo.url}
                                                    alt={photo.fileName}
                                                    className="w-full h-full object-cover"
                                                />
                                                {index === 0 && (
                                                    <Badge
                                                        className="absolute top-1 left-1 bg-blue-500 text-xs"
                                                    >
                                                        Principal
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1">
                                                <div className="font-medium">{photo.fileName}</div>
                                                <div className="text-sm text-gray-500">
                                                    {formatFileSize(photo.fileSize)} •{" "}
                                                    {new Date(photo.uploadedAt).toLocaleDateString("es-CL")}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setPreviewImage(photo.url)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDelete(photo.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">
                                No tienes fotos subidas aún
                            </p>
                            <Button onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-4 h-4 mr-2" />
                                Subir Primera Foto
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Preview Dialog */}
                <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Vista Previa</DialogTitle>
                        </DialogHeader>
                        <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
                            {previewImage && (
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
