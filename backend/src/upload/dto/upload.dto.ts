import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum FileType {
    IMAGE = 'image',
    DOCUMENT = 'document',
    AVATAR = 'avatar',
    PROVIDER_LOGO = 'provider_logo',
    SERVICE_IMAGE = 'service_image',
    PROVIDER_IMAGE = 'provider_image'
}

export enum ImageFormat {
    JPEG = 'jpeg',
    JPG = 'jpg',
    PNG = 'png',
    WEBP = 'webp'
}

export class UploadFileDto {
    @ApiProperty({ description: 'Tipo de archivo', enum: FileType })
    @IsEnum(FileType)
    fileType!: FileType;

    @ApiPropertyOptional({ description: 'ID del proveedor (para imágenes de proveedor)' })
    @IsOptional()
    @IsUUID()
    providerId?: string;

    @ApiPropertyOptional({ description: 'ID del servicio (para imágenes de servicio)' })
    @IsOptional()
    @IsUUID()
    serviceId?: string;

    @ApiPropertyOptional({ description: 'ID del usuario (para avatar)' })
    @IsOptional()
    @IsUUID()
    userId?: string;

    @ApiPropertyOptional({ description: 'Descripción del archivo' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'Es imagen principal', example: false })
    @IsOptional()
    isMain?: boolean = false;

    @ApiPropertyOptional({ description: 'Orden de visualización', example: 0 })
    @IsOptional()
    displayOrder?: number = 0;
}

export class UploadResponseDto {
    @ApiProperty({ description: 'ID del archivo subido' })
    id!: string;

    @ApiProperty({ description: 'Nombre original del archivo' })
    originalName!: string;

    @ApiProperty({ description: 'Nombre del archivo en el servidor' })
    filename!: string;

    @ApiProperty({ description: 'URL pública del archivo' })
    url!: string;

    @ApiProperty({ description: 'Tipo de archivo', enum: FileType })
    fileType!: FileType;

    @ApiProperty({ description: 'Tipo MIME del archivo' })
    mimeType!: string;

    @ApiProperty({ description: 'Tamaño del archivo en bytes' })
    size!: number;

    @ApiProperty({ description: 'Dimensiones de la imagen (si aplica)' })
    dimensions?: {
        width: number;
        height: number;
    };

    @ApiProperty({ description: 'URLs de diferentes tamaños (si es imagen)' })
    variants?: {
        thumbnail: string;
        small: string;
        medium: string;
        large: string;
    };

    @ApiProperty({ description: 'Metadatos del archivo' })
    metadata!: {
        providerId?: string;
        serviceId?: string;
        userId?: string;
        description?: string;
        isMain: boolean;
        displayOrder: number;
    };

    @ApiProperty({ description: 'Fecha de subida' })
    uploadedAt!: string;
}

export class MultipleUploadResponseDto {
    @ApiProperty({ description: 'Archivos subidos exitosamente' })
    successful!: UploadResponseDto[];

    @ApiProperty({ description: 'Archivos que fallaron al subir' })
    failed!: Array<{
        filename: string;
        error: string;
    }>;

    @ApiProperty({ description: 'Total de archivos procesados' })
    total!: number;

    @ApiProperty({ description: 'Archivos subidos exitosamente' })
    successCount!: number;

    @ApiProperty({ description: 'Archivos que fallaron' })
    failureCount!: number;
}

export class DeleteFileDto {
    @ApiProperty({ description: 'ID del archivo a eliminar' })
    @IsUUID()
    fileId!: string;
}

export class DeleteFileResponseDto {
    @ApiProperty({ description: 'ID del archivo eliminado' })
    fileId!: string;

    @ApiProperty({ description: 'Mensaje de confirmación' })
    message!: string;

    @ApiProperty({ description: 'Archivos relacionados eliminados' })
    relatedFilesDeleted!: number;
}

export class FileListQueryDto {
    @ApiPropertyOptional({ description: 'Tipo de archivo', enum: FileType })
    @IsOptional()
    @IsEnum(FileType)
    fileType?: FileType;

    @ApiPropertyOptional({ description: 'ID del proveedor' })
    @IsOptional()
    @IsUUID()
    providerId?: string;

    @ApiPropertyOptional({ description: 'ID del servicio' })
    @IsOptional()
    @IsUUID()
    serviceId?: string;

    @ApiPropertyOptional({ description: 'ID del usuario' })
    @IsOptional()
    @IsUUID()
    userId?: string;

    @ApiPropertyOptional({ description: 'Página', example: 1, minimum: 1 })
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Límite por página', example: 20, minimum: 1, maximum: 100 })
    limit?: number = 20;
}

export class FileListResponseDto {
    @ApiProperty({ description: 'Archivos encontrados' })
    files!: UploadResponseDto[];

    @ApiProperty({ description: 'Página actual' })
    page!: number;

    @ApiProperty({ description: 'Límite por página' })
    limit!: number;

    @ApiProperty({ description: 'Total de archivos' })
    total!: number;

    @ApiProperty({ description: 'Total de páginas' })
    totalPages!: number;
}

export class ImageOptimizationDto {
    @ApiProperty({ description: 'Calidad de compresión (1-100)', example: 80, minimum: 1, maximum: 100 })
    quality!: number;

    @ApiProperty({ description: 'Ancho máximo en píxeles', example: 1920, minimum: 100 })
    maxWidth!: number;

    @ApiProperty({ description: 'Alto máximo en píxeles', example: 1080, minimum: 100 })
    maxHeight!: number;

    @ApiProperty({ description: 'Formato de salida', enum: ImageFormat })
    format!: ImageFormat;

    @ApiProperty({ description: 'Generar variantes de tamaño', example: true })
    generateVariants!: boolean;
}
