'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Flag, MessageSquare, ChevronDown, ChevronUp, Star, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Helper function to format relative time in Spanish
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'hace unos segundos';
    if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
    }
    if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
    }
    const years = Math.floor(diffInSeconds / 31536000);
    return `hace ${years} ${years === 1 ? 'año' : 'años'}`;
}

interface ReviewImage {
    id: string;
    url: string;
    filename?: string;
    order: number;
}

interface ReviewUser {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
}

interface Review {
    id: string;
    userId: string;
    rating: number;
    title?: string;
    comment?: string;
    serviceQuality?: number;
    cleanliness?: number;
    valueForMoney?: number;
    staffFriendliness?: number;
    createdAt: string;
    publishedAt?: string;
    providerResponse?: string;
    providerResponseAt?: string;
    helpfulCount: number;
    notHelpfulCount: number;
    reportCount: number;
    isHidden: boolean;
    user?: ReviewUser;
    images?: ReviewImage[];
    currentUserVote?: { isHelpful: boolean } | null;
}

interface ReviewCardProps {
    review: Review;
    currentUserId?: string;
    isProvider?: boolean;
    providerId?: string;
    onVote?: (reviewId: string, isHelpful: boolean) => Promise<void>;
    onReport?: (reviewId: string, reason: string, details?: string) => Promise<void>;
    onProviderResponse?: (reviewId: string, response: string) => Promise<void>;
    onUpdateProviderResponse?: (reviewId: string, response: string) => Promise<void>;
    onDeleteProviderResponse?: (reviewId: string) => Promise<void>;
}

const REPORT_REASONS = [
    { value: 'SPAM', label: 'Spam o publicidad' },
    { value: 'OFFENSIVE', label: 'Contenido ofensivo' },
    { value: 'FAKE', label: 'Reseña falsa' },
    { value: 'IRRELEVANT', label: 'No relacionado con el servicio' },
    { value: 'HARASSMENT', label: 'Acoso o amenazas' },
    { value: 'PERSONAL_INFO', label: 'Contiene información personal' },
    { value: 'OTHER', label: 'Otra razón' },
];

export function ReviewCard({
    review,
    currentUserId,
    isProvider = false,
    providerId,
    onVote,
    onReport,
    onProviderResponse,
    onUpdateProviderResponse,
    onDeleteProviderResponse,
}: ReviewCardProps) {
    const toast = useToast();
    const [showFullComment, setShowFullComment] = useState(false);
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [showResponseDialog, setShowResponseDialog] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDetails, setReportDetails] = useState('');
    const [responseText, setResponseText] = useState(review.providerResponse || '');
    const [isVoting, setIsVoting] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const [isResponding, setIsResponding] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const isOwnReview = currentUserId === review.userId;
    const canRespond = isProvider && !review.providerResponse;
    const canEditResponse = isProvider && review.providerResponse;
    const hasLongComment = review.comment && review.comment.length > 300;

    const handleVote = async (isHelpful: boolean) => {
        if (!onVote || isOwnReview) return;

        setIsVoting(true);
        try {
            await onVote(review.id, isHelpful);
            toast.success(isHelpful ? 'Marcaste esta reseña como útil' : 'Marcaste esta reseña como no útil');
        } catch (error) {
            toast.error('No se pudo registrar tu voto');
        } finally {
            setIsVoting(false);
        }
    };

    const handleReport = async () => {
        if (!onReport || !reportReason) return;

        setIsReporting(true);
        try {
            await onReport(review.id, reportReason, reportDetails);
            toast.success('Reporte enviado. Gracias por ayudarnos a mantener la calidad de las reseñas');
            setShowReportDialog(false);
            setReportReason('');
            setReportDetails('');
        } catch (error) {
            toast.error('No se pudo enviar el reporte');
        } finally {
            setIsReporting(false);
        }
    };

    const handleProviderResponse = async () => {
        if (!responseText.trim()) return;

        setIsResponding(true);
        try {
            if (review.providerResponse) {
                await onUpdateProviderResponse?.(review.id, responseText);
                toast.success('Respuesta actualizada');
            } else {
                await onProviderResponse?.(review.id, responseText);
                toast.success('Respuesta publicada');
            }
            setShowResponseDialog(false);
        } catch (error) {
            toast.error('No se pudo guardar la respuesta');
        } finally {
            setIsResponding(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                            }`}
                    />
                ))}
            </div>
        );
    };

    if (review.isHidden) {
        return (
            <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-gray-500 text-sm italic">
                    Esta reseña ha sido ocultada por el equipo de moderación.
                </p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg p-4 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={review.user?.avatar} />
                        <AvatarFallback>
                            {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">
                            {review.user?.firstName} {review.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                            {formatRelativeTime(review.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    {renderStars(review.rating)}
                    {isOwnReview && (
                        <Badge variant="secondary" className="text-xs">Tu reseña</Badge>
                    )}
                </div>
            </div>

            {/* Title */}
            {review.title && (
                <h4 className="font-semibold text-lg">{review.title}</h4>
            )}

            {/* Comment */}
            {review.comment && (
                <div>
                    <p className={`text-gray-700 ${!showFullComment && hasLongComment ? 'line-clamp-3' : ''}`}>
                        {review.comment}
                    </p>
                    {hasLongComment && (
                        <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto mt-1"
                            onClick={() => setShowFullComment(!showFullComment)}
                        >
                            {showFullComment ? (
                                <>Ver menos <ChevronUp className="h-4 w-4 ml-1" /></>
                            ) : (
                                <>Ver más <ChevronDown className="h-4 w-4 ml-1" /></>
                            )}
                        </Button>
                    )}
                </div>
            )}

            {/* Category Ratings */}
            {(review.serviceQuality || review.cleanliness || review.valueForMoney || review.staffFriendliness) && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                    {review.serviceQuality && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Calidad del servicio:</span>
                            <span className="font-medium">{review.serviceQuality}/5</span>
                        </div>
                    )}
                    {review.cleanliness && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Limpieza:</span>
                            <span className="font-medium">{review.cleanliness}/5</span>
                        </div>
                    )}
                    {review.valueForMoney && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Precio-calidad:</span>
                            <span className="font-medium">{review.valueForMoney}/5</span>
                        </div>
                    )}
                    {review.staffFriendliness && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Atención:</span>
                            <span className="font-medium">{review.staffFriendliness}/5</span>
                        </div>
                    )}
                </div>
            )}

            {/* Images */}
            {review.images && review.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {review.images.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => setSelectedImageIndex(index)}
                            className="flex-shrink-0 relative group"
                        >
                            <img
                                src={image.url}
                                alt={image.filename || `Foto ${index + 1}`}
                                className="h-20 w-20 object-cover rounded-lg border hover:opacity-90 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 rounded-lg transition-opacity">
                                <ImageIcon className="h-6 w-6 text-white" />
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Provider Response */}
            {review.providerResponse && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Respuesta del proveedor</span>
                        {review.providerResponseAt && (
                            <span className="text-xs text-blue-600">
                                • {formatRelativeTime(review.providerResponseAt)}
                            </span>
                        )}
                    </div>
                    <p className="text-blue-800 text-sm">{review.providerResponse}</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4">
                    {/* Vote Buttons */}
                    {!isOwnReview && currentUserId && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">¿Útil?</span>
                            <Button
                                variant={review.currentUserVote?.isHelpful === true ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleVote(true)}
                                disabled={isVoting}
                                className="gap-1"
                            >
                                <ThumbsUp className="h-4 w-4" />
                                <span>{review.helpfulCount}</span>
                            </Button>
                            <Button
                                variant={review.currentUserVote?.isHelpful === false ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleVote(false)}
                                disabled={isVoting}
                                className="gap-1"
                            >
                                <ThumbsDown className="h-4 w-4" />
                                <span>{review.notHelpfulCount}</span>
                            </Button>
                        </div>
                    )}

                    {/* Read-only vote counts for guests or own review */}
                    {(isOwnReview || !currentUserId) && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{review.helpfulCount} útil</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Report Button */}
                    {!isOwnReview && currentUserId && (
                        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-500">
                                    <Flag className="h-4 w-4 mr-1" />
                                    Reportar
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Reportar reseña</DialogTitle>
                                    <DialogDescription>
                                        Ayúdanos a mantener la calidad de las reseñas reportando contenido inapropiado.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Razón del reporte</label>
                                        <Select value={reportReason} onValueChange={setReportReason}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una razón" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {REPORT_REASONS.map((reason) => (
                                                    <SelectItem key={reason.value} value={reason.value}>
                                                        {reason.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Detalles adicionales (opcional)</label>
                                        <Textarea
                                            value={reportDetails}
                                            onChange={(e) => setReportDetails(e.target.value)}
                                            placeholder="Proporciona más detalles sobre el reporte..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleReport} disabled={!reportReason || isReporting}>
                                        {isReporting ? 'Enviando...' : 'Enviar reporte'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Provider Response Button */}
                    {(canRespond || canEditResponse) && (
                        <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    {canRespond ? 'Responder' : 'Editar respuesta'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {canRespond ? 'Responder a la reseña' : 'Editar respuesta'}
                                    </DialogTitle>
                                    <DialogDescription>
                                        Tu respuesta será visible públicamente junto a la reseña.
                                    </DialogDescription>
                                </DialogHeader>
                                <div>
                                    <Textarea
                                        value={responseText}
                                        onChange={(e) => setResponseText(e.target.value)}
                                        placeholder="Escribe tu respuesta (10-500 caracteres)..."
                                        rows={4}
                                        minLength={10}
                                        maxLength={500}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {responseText.length}/500 caracteres
                                    </p>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleProviderResponse}
                                        disabled={responseText.length < 10 || responseText.length > 500 || isResponding}
                                    >
                                        {isResponding ? 'Guardando...' : 'Publicar'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Image Lightbox */}
            {selectedImageIndex !== null && review.images && (
                <Dialog open={selectedImageIndex !== null} onOpenChange={() => setSelectedImageIndex(null)}>
                    <DialogContent className="max-w-3xl">
                        <img
                            src={review.images[selectedImageIndex].url}
                            alt={review.images[selectedImageIndex].filename || `Foto ${selectedImageIndex + 1}`}
                            className="w-full h-auto max-h-[70vh] object-contain"
                        />
                        {review.images.length > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {review.images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-colors ${index === selectedImageIndex ? 'bg-primary' : 'bg-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
