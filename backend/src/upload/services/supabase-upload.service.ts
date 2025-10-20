import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../../common/supabase/supabase.service';
import {
    UploadFileDto,
    UploadResponseDto,
    MultipleUploadResponseDto,
    DeleteFileResponseDto,
    FileListQueryDto,
    FileListResponseDto,
    FileType,
    ImageFormat
} from '../dto/upload.dto';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import * as path from 'path';

@Injectable()
export class SupabaseUploadService {
    private readonly logger = new Logger(SupabaseUploadService.name);
    private readonly maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB
    private readonly allowedImageTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
    private readonly allowedDocumentTypes = (process.env.ALLOWED_DOCUMENT_TYPES || 'application/pdf').split(',');

    constructor(
        private readonly prisma: PrismaService,
        private readonly supabaseService: SupabaseService
    ) {
        this.logger.log('SupabaseUploadService initialized');
    }

    /**
     * Sube un archivo a Supabase Storage
     */
    async uploadFile(file: Express.Multer.File, uploadData: UploadFileDto): Promise<UploadResponseDto> {
        try {
            // Validar archivo
            this.validateFile(file, uploadData.fileType);

            // Generar ID único
            const fileId = uuidv4();

            // Procesar archivo según tipo
            let processedFile = file;
            let dimensions: any = null;
            let variants: any = null;

            if (this.isImageFile(file.mimetype)) {
                const result = await this.processImageForSupabase(file, uploadData);
                processedFile = result.file;
                dimensions = result.dimensions;
                variants = result.variants;
            }

            // Subir archivo principal a Supabase
            const { url, path: filePath } = await this.supabaseService.uploadFile(
                processedFile,
                uploadData.fileType
            );

            // Crear registro de archivo
            const fileRecord = {
                id: fileId,
                originalName: file.originalname,
                filename: path.basename(filePath),
                url,
                path: filePath,
                fileType: uploadData.fileType,
                mimeType: file.mimetype,
                size: processedFile.size,
                dimensions,
                variants,
                metadata: {
                    providerId: uploadData.providerId,
                    serviceId: uploadData.serviceId,
                    userId: uploadData.userId,
                    description: uploadData.description,
                    isMain: uploadData.isMain || false,
                    displayOrder: uploadData.displayOrder || 0
                },
                uploadedAt: new Date().toISOString()
            };

            this.logger.log(`Archivo subido exitosamente a Supabase: ${url}`);
            return fileRecord;

        } catch (error) {
            this.logger.error('Error al subir archivo a Supabase:', error);
            throw new BadRequestException(`Error al procesar el archivo: ${error.message}`);
        }
    }

    /**
     * Sube múltiples archivos
     */
    async uploadMultipleFiles(files: Express.Multer.File[], uploadData: UploadFileDto): Promise<MultipleUploadResponseDto> {
        const successful: UploadResponseDto[] = [];
        const failed: Array<{ filename: string; error: string }> = [];

        for (const file of files) {
            try {
                const result = await this.uploadFile(file, uploadData);
                successful.push(result);
            } catch (error) {
                failed.push({
                    filename: file.originalname,
                    error: error.message || 'Error desconocido'
                });
            }
        }

        return {
            successful,
            failed,
            total: files.length,
            successCount: successful.length,
            failureCount: failed.length
        };
    }

    /**
     * Elimina un archivo de Supabase
     */
    async deleteFile(fileId: string): Promise<DeleteFileResponseDto> {
        try {
            // Buscar archivo por ID (simulado - en realidad buscarías en BD)
            const fileRecord = await this.getFileById(fileId);

            if (!fileRecord) {
                throw new NotFoundException('Archivo no encontrado');
            }

            // Eliminar archivo de Supabase Storage usando la URL
            const filePath = this.supabaseService.extractPathFromUrl(fileRecord.url);
            await this.supabaseService.deleteFile(filePath);

            // Eliminar variantes si existen
            let relatedDeleted = 0;
            if (fileRecord.variants) {
                const variantPaths = Object.values(fileRecord.variants)
                    .map(url => this.supabaseService.extractPathFromUrl(url));

                if (variantPaths.length > 0) {
                    await this.supabaseService.deleteMultipleFiles(variantPaths);
                    relatedDeleted = variantPaths.length;
                }
            }

            this.logger.log(`Archivo eliminado: ${fileRecord.filename}`);
            return {
                fileId,
                message: 'Archivo eliminado exitosamente',
                relatedFilesDeleted: relatedDeleted
            };

        } catch (error) {
            this.logger.error('Error al eliminar archivo:', error);
            throw new BadRequestException('Error al eliminar el archivo');
        }
    }

    /**
     * Lista archivos desde Supabase Storage
     */
    async listFiles(query: FileListQueryDto): Promise<FileListResponseDto> {
        try {
            // Listar archivos de Supabase Storage
            const files = await this.supabaseService.listFiles(query.fileType || '', query.limit || 20);

            const mappedFiles: UploadResponseDto[] = files.map(file => ({
                id: file.id || uuidv4(),
                originalName: file.name,
                filename: file.name,
                url: this.supabaseService.getPublicUrl(`${query.fileType || ''}/${file.name}`),
                fileType: query.fileType || FileType.IMAGE,
                mimeType: file.metadata?.mimetype || 'application/octet-stream',
                size: file.metadata?.size || 0,
                dimensions: undefined,
                variants: undefined,
                metadata: {
                    isMain: false,
                    displayOrder: 0
                },
                uploadedAt: file.created_at || new Date().toISOString()
            }));

            const total = mappedFiles.length;
            const page = query.page || 1;
            const limit = query.limit || 20;
            const totalPages = Math.ceil(total / limit);

            return {
                files: mappedFiles,
                page,
                limit,
                total,
                totalPages
            };

        } catch (error) {
            this.logger.error('Error al listar archivos:', error);
            throw new BadRequestException('Error al obtener la lista de archivos');
        }
    }

    /**
     * Procesa una imagen para subir a Supabase (optimización y variantes)
     */
    private async processImageForSupabase(
        file: Express.Multer.File,
        uploadData: UploadFileDto
    ): Promise<{ file: Express.Multer.File; dimensions: any; variants: any }> {
        try {
            // Optimizar imagen principal
            const optimizedBuffer = await sharp(file.buffer)
                .jpeg({ quality: 85, progressive: true })
                .resize(1200, 1200, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toBuffer();

            // Obtener dimensiones
            const metadata = await sharp(optimizedBuffer).metadata();
            const dimensions = {
                width: metadata.width,
                height: metadata.height
            };

            // Crear archivo optimizado
            const optimizedFile = {
                ...file,
                buffer: optimizedBuffer,
                size: optimizedBuffer.length
            };

            // Generar variantes (siempre para imágenes)
            let variants: any = undefined;
            if (this.shouldGenerateVariants(uploadData.fileType)) {
                variants = await this.generateImageVariantsForSupabase(file, uploadData.fileType);
            }

            return {
                file: optimizedFile,
                dimensions,
                variants
            };
        } catch (error) {
            this.logger.error('Error processing image for Supabase:', error);
            throw new BadRequestException('Error al procesar la imagen');
        }
    }

    /**
     * Genera variantes de imagen y las sube a Supabase
     */
    private async generateImageVariantsForSupabase(
        file: Express.Multer.File,
        folder: string
    ): Promise<Record<string, string>> {
        const variants: Record<string, string> = {};

        const sizes = [
            { name: 'thumbnail', width: 150, height: 150 },
            { name: 'small', width: 300, height: 300 },
            { name: 'medium', width: 600, height: 600 }
        ];

        for (const size of sizes) {
            try {
                const variantBuffer = await sharp(file.buffer)
                    .resize(size.width, size.height, {
                        fit: 'cover',
                        position: 'center'
                    })
                    .jpeg({ quality: 80 })
                    .toBuffer();

                const variantFile = {
                    ...file,
                    buffer: variantBuffer,
                    size: variantBuffer.length,
                    originalname: `${size.name}_${file.originalname}`
                };

                const { url } = await this.supabaseService.uploadFile(variantFile, `${folder}/variants`);
                variants[size.name] = url;
            } catch (error) {
                this.logger.warn(`Failed to generate ${size.name} variant:`, error);
            }
        }

        return variants;
    }

    /**
     * Valida un archivo según tipo y restricciones
     */
    private validateFile(file: Express.Multer.File, fileType: FileType): void {
        // Validar tamaño
        if (file.size > this.maxFileSize) {
            throw new BadRequestException(
                `Archivo demasiado grande. Tamaño máximo: ${this.maxFileSize / 1024 / 1024}MB`
            );
        }

        // Validar tipo MIME según categoría
        switch (fileType) {
            case 'service_image':
            case 'provider_image':
            case 'provider_logo':
            case 'avatar':
                if (!this.allowedImageTypes.includes(file.mimetype)) {
                    throw new BadRequestException(
                        `Tipo de imagen no permitido. Tipos válidos: ${this.allowedImageTypes.join(', ')}`
                    );
                }
                break;

            case 'document':
                if (!this.allowedDocumentTypes.includes(file.mimetype)) {
                    throw new BadRequestException(
                        `Tipo de documento no permitido. Tipos válidos: ${this.allowedDocumentTypes.join(', ')}`
                    );
                }
                break;

            default:
                // Permitir otros tipos con validación básica
                break;
        }
    }

    /**
     * Verifica si un archivo es una imagen
     */
    private isImageFile(mimeType: string): boolean {
        return mimeType.startsWith('image/');
    }

    /**
     * Determina si se deben generar variantes para un tipo de archivo
     */
    private shouldGenerateVariants(fileType: FileType): boolean {
        return [
            FileType.SERVICE_IMAGE,
            FileType.PROVIDER_IMAGE,
            FileType.PROVIDER_LOGO,
            FileType.IMAGE
        ].includes(fileType);
    }

    /**
     * Obtiene un archivo por ID (simulado - implementar con BD real)
     */
    private async getFileById(fileId: string): Promise<UploadResponseDto | null> {
        // TODO: Implementar búsqueda real en base de datos
        // Por ahora retorna null para simular archivo no encontrado
        this.logger.warn(`getFileById not implemented. FileId: ${fileId}`);
        return null;
    }

    /**
     * Obtiene estadísticas de uso de Supabase Storage
     */
    async getStorageStats(): Promise<{ totalFiles: number; totalSize: number; bucketHealth: any }> {
        try {
            const stats = await this.supabaseService.getStorageStats();
            const bucketHealth = await this.supabaseService.checkBucketHealth();

            return {
                ...stats,
                bucketHealth
            };
        } catch (error) {
            this.logger.error('Error getting storage stats:', error);
            throw new BadRequestException('Error al obtener estadísticas de almacenamiento');
        }
    }
}