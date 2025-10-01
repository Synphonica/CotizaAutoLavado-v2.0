import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';
  private readonly baseUrl = process.env.APP_URL || 'http://localhost:4000';

  constructor(private readonly prisma: PrismaService) {
    this.ensureUploadDirectories();
  }

  async uploadFile(file: Express.Multer.File, uploadData: UploadFileDto): Promise<UploadResponseDto> {
    try {
      // Validar archivo
      this.validateFile(file, uploadData.fileType);

      // Generar nombre único
      const fileId = uuidv4();
      const fileExtension = path.extname(file.originalname);
      const filename = `${fileId}${fileExtension}`;

      // Crear directorio si no existe
      const uploadPath = path.join(this.uploadDir, uploadData.fileType);
      await fs.mkdir(uploadPath, { recursive: true });

      // Procesar archivo según tipo
      let processedFile: any = file;
      let dimensions: any = null;
      let variants: any = null;

      if (this.isImageFile(file.mimetype)) {
        const result = await this.processImage(file, uploadPath, filename, uploadData);
        processedFile = result.file;
        dimensions = result.dimensions;
        variants = result.variants;
      } else {
        // Guardar archivo sin procesar
        const filePath = path.join(uploadPath, filename);
        await fs.writeFile(filePath, file.buffer);
      }

      // Guardar metadatos en base de datos (simulado)
      const fileRecord = {
        id: fileId,
        originalName: file.originalname,
        filename,
        url: `${this.baseUrl}/uploads/${uploadData.fileType}/${filename}`,
        fileType: uploadData.fileType,
        mimeType: file.mimetype,
        size: file.size,
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

      this.logger.log(`Archivo subido exitosamente: ${filename}`);
      return fileRecord;

    } catch (error) {
      this.logger.error('Error al subir archivo:', error);
      throw new BadRequestException('Error al procesar el archivo');
    }
  }

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

  async deleteFile(fileId: string): Promise<DeleteFileResponseDto> {
    try {
      // Buscar archivo en base de datos (simulado)
      const fileRecord = await this.findFileById(fileId);

      if (!fileRecord) {
        throw new NotFoundException('Archivo no encontrado');
      }

      // Eliminar archivo físico
      const filePath = path.join(this.uploadDir, fileRecord.fileType, fileRecord.filename);
      await fs.unlink(filePath).catch(() => { }); // Ignorar si no existe

      // Eliminar variantes si es imagen
      if (fileRecord.variants) {
        const variants = Object.values(fileRecord.variants) as string[];
        for (const variant of variants) {
          const variantPath = path.join(this.uploadDir, fileRecord.fileType, path.basename(variant));
          await fs.unlink(variantPath).catch(() => { });
        }
      }

      this.logger.log(`Archivo eliminado: ${fileRecord.filename}`);

      return {
        fileId,
        message: 'Archivo eliminado exitosamente',
        relatedFilesDeleted: fileRecord.variants ? Object.keys(fileRecord.variants).length : 0
      };

    } catch (error) {
      this.logger.error('Error al eliminar archivo:', error);
      throw error;
    }
  }

  async listFiles(query: FileListQueryDto): Promise<FileListResponseDto> {
    try {
      // Simular consulta a base de datos
      const files: UploadResponseDto[] = [];
      const total = 0;
      const page = query.page || 1;
      const limit = query.limit || 20;
      const totalPages = Math.ceil(total / limit);

      return {
        files,
        page,
        limit,
        total,
        totalPages
      };

    } catch (error) {
      this.logger.error('Error al listar archivos:', error);
      throw new BadRequestException('Error al obtener lista de archivos');
    }
  }

  private validateFile(file: Express.Multer.File, fileType: FileType): void {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Validar tamaño máximo (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('El archivo es demasiado grande. Máximo 5MB');
    }

    // Validar tipo de archivo según fileType
    switch (fileType) {
      case FileType.IMAGE:
      case FileType.AVATAR:
      case FileType.PROVIDER_LOGO:
      case FileType.SERVICE_IMAGE:
      case FileType.PROVIDER_IMAGE:
        if (!this.isImageFile(file.mimetype)) {
          throw new BadRequestException('Solo se permiten archivos de imagen (JPEG, PNG, WebP)');
        }
        break;
      case FileType.DOCUMENT:
        if (!this.isDocumentFile(file.mimetype)) {
          throw new BadRequestException('Solo se permiten documentos (PDF, DOC, DOCX)');
        }
        break;
    }
  }

  private isImageFile(mimetype: string): boolean {
    return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(mimetype);
  }

  private isDocumentFile(mimetype: string): boolean {
    return ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mimetype);
  }

  private async processImage(
    file: Express.Multer.File,
    uploadPath: string,
    filename: string,
    uploadData: UploadFileDto
  ): Promise<{ file: any; dimensions: any; variants: any }> {
    const image = sharp(file.buffer);
    const metadata = await image.metadata();

    // Obtener dimensiones
    const dimensions = {
      width: metadata.width || 0,
      height: metadata.height || 0
    };

    // Configuración de optimización
    const quality = 80;
    const maxWidth = 1920;
    const maxHeight = 1080;

    // Redimensionar si es necesario
    if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
      image.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Optimizar imagen principal
    const optimizedBuffer = await image
      .jpeg({ quality })
      .toBuffer();

    const filePath = path.join(uploadPath, filename);
    await fs.writeFile(filePath, optimizedBuffer);

    // Generar variantes para imágenes
    const variants: any = {};
    if (uploadData.fileType === FileType.SERVICE_IMAGE || uploadData.fileType === FileType.PROVIDER_IMAGE) {
      const sizes = [
        { name: 'thumbnail', width: 150, height: 150 },
        { name: 'small', width: 400, height: 300 },
        { name: 'medium', width: 800, height: 600 },
        { name: 'large', width: 1200, height: 900 }
      ];

      for (const size of sizes) {
        const variantFilename = `${path.parse(filename).name}_${size.name}.jpg`;
        const variantPath = path.join(uploadPath, variantFilename);

        await sharp(file.buffer)
          .resize(size.width, size.height, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 75 })
          .toFile(variantPath);

        variants[size.name] = `${this.baseUrl}/uploads/${uploadData.fileType}/${variantFilename}`;
      }
    }

    return {
      file: {
        ...file,
        buffer: optimizedBuffer,
        size: optimizedBuffer.length
      },
      dimensions,
      variants: Object.keys(variants).length > 0 ? variants : null
    };
  }

  private async findFileById(fileId: string): Promise<any> {
    // Simular búsqueda en base de datos
    // En un sistema real, esto consultaría la BD
    return null;
  }

  private async ensureUploadDirectories(): Promise<void> {
    const directories = Object.values(FileType).map(type =>
      path.join(this.uploadDir, type)
    );

    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}
