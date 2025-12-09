'use client';

import { useState, useRef } from 'react';
import { Star, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormData {
    rating: number;
    title?: string;
    comment?: string;
    serviceQuality?: number;
    cleanliness?: number;
    valueForMoney?: number;
    staffFriendliness?: number;
    images?: File[];
}

interface ReviewFormProps {
    providerId: string;
    serviceId?: string;
    onSubmit: (data: ReviewFormData) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
}

export function ReviewForm({
    providerId,
    serviceId,
    onSubmit,
    onCancel,
    isLoading = false,
}: ReviewFormProps) {
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [serviceQuality, setServiceQuality] = useState<number | undefined>();
    const [cleanliness, setCleanliness] = useState<number | undefined>();
    const [valueForMoney, setValueForMoney] = useState<number | undefined>();
    const [staffFriendliness, setStaffFriendliness] = useState<number | undefined>();
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [showDetailedRatings, setShowDetailedRatings] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Validar cantidad de imágenes
        if (images.length + files.length > 5) {
            toast.error('Solo puedes subir hasta 5 imágenes');
            return;
        }

        // Validar tamaño y tipo
        const validFiles = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} excede el límite de 5MB`);
                return false;
            }
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                toast.error(`${file.name} no es un formato de imagen válido`);
                return false;
            }
            return true;
        });

        setImages(prev => [...prev, ...validFiles]);

        // Crear previews
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Por favor selecciona una calificación de estrellas');
            return;
        }

        try {
            await onSubmit({
                rating,
                title: title || undefined,
                comment: comment || undefined,
                serviceQuality,
                cleanliness,
                valueForMoney,
                staffFriendliness,
                images,
            });
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    const renderStars = () => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110"
                    >
                        <Star
                            className={`h-8 w-8 transition-colors ${star <= (hoverRating || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                                }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    const renderSliderRating = (
        label: string,
        value: number | undefined,
        onChange: (value: number) => void
    ) => {
        return (
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label className="text-sm">{label}</Label>
                    <span className="text-sm font-medium">{value || '-'}/5</span>
                </div>
                <Slider
                    value={[value || 0]}
                    onValueChange={(vals) => onChange(vals[0] || 0)}
                    max={5}
                    min={0}
                    step={1}
                    className="w-full"
                />
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div className="space-y-2">
                <Label className="text-base font-medium">Calificación general *</Label>
                <div className="flex items-center gap-4">
                    {renderStars()}
                    <span className="text-lg font-semibold text-gray-700">
                        {rating > 0 ? `${rating}/5` : 'Selecciona'}
                    </span>
                </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title">Título de la reseña (opcional)</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Resume tu experiencia en una frase..."
                    maxLength={100}
                />
            </div>

            {/* Comment */}
            <div className="space-y-2">
                <Label htmlFor="comment">Tu comentario (opcional)</Label>
                <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Cuéntanos más sobre tu experiencia..."
                    rows={4}
                    maxLength={1000}
                />
                <p className="text-xs text-gray-500 text-right">{comment.length}/1000</p>
            </div>

            {/* Detailed Ratings Toggle */}
            <div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDetailedRatings(!showDetailedRatings)}
                    className="w-full"
                >
                    {showDetailedRatings ? 'Ocultar calificaciones detalladas' : 'Agregar calificaciones detalladas'}
                </Button>
            </div>

            {/* Detailed Ratings */}
            {showDetailedRatings && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    {renderSliderRating('Calidad del servicio', serviceQuality, setServiceQuality)}
                    {renderSliderRating('Limpieza', cleanliness, setCleanliness)}
                    {renderSliderRating('Relación precio-calidad', valueForMoney, setValueForMoney)}
                    {renderSliderRating('Atención del personal', staffFriendliness, setStaffFriendliness)}
                </div>
            )}

            {/* Image Upload */}
            <div className="space-y-2">
                <Label>Fotos (opcional, máximo 5)</Label>

                <div className="flex flex-wrap gap-2">
                    {/* Preview images */}
                    {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="h-20 w-20 object-cover rounded-lg border"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}

                    {/* Upload button */}
                    {images.length < 5 && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-gray-400 transition-colors"
                        >
                            <Upload className="h-5 w-5 text-gray-400" />
                            <span className="text-xs text-gray-400">Subir</span>
                        </button>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                />

                <p className="text-xs text-gray-500">
                    Formatos: JPG, PNG, WebP. Máximo 5MB por imagen.
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                        Cancelar
                    </Button>
                )}
                <Button type="submit" disabled={rating === 0 || isLoading} className="flex-1">
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Publicando...
                        </>
                    ) : (
                        'Publicar reseña'
                    )}
                </Button>
            </div>
        </form>
    );
}
