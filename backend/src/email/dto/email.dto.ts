import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsArray, IsObject, IsBoolean, IsUUID } from 'class-validator';

export enum EmailType {
    WELCOME = 'welcome',
    PASSWORD_RESET = 'password_reset',
    EMAIL_VERIFICATION = 'email_verification',
    PRICE_ALERT = 'price_alert',
    NEW_OFFER = 'new_offer',
    REVIEW_REMINDER = 'review_reminder',
    PROVIDER_APPROVAL = 'provider_approval',
    PROVIDER_REJECTION = 'provider_rejection',
    WEEKLY_DIGEST = 'weekly_digest',
    CUSTOM = 'custom'
}

export enum EmailStatus {
    PENDING = 'pending',
    SENT = 'sent',
    DELIVERED = 'delivered',
    BOUNCED = 'bounced',
    FAILED = 'failed'
}

export class SendEmailDto {
    @ApiProperty({ description: 'Dirección de email del destinatario' })
    @IsEmail()
    to!: string;

    @ApiPropertyOptional({ description: 'Direcciones de email en copia' })
    @IsOptional()
    @IsArray()
    @IsEmail({}, { each: true })
    cc?: string[];

    @ApiPropertyOptional({ description: 'Direcciones de email en copia oculta' })
    @IsOptional()
    @IsArray()
    @IsEmail({}, { each: true })
    bcc?: string[];

    @ApiProperty({ description: 'Asunto del email' })
    @IsString()
    subject!: string;

    @ApiProperty({ description: 'Tipo de email', enum: EmailType })
    @IsEnum(EmailType)
    type!: EmailType;

    @ApiPropertyOptional({ description: 'Contenido HTML del email' })
    @IsOptional()
    @IsString()
    htmlContent?: string;

    @ApiPropertyOptional({ description: 'Contenido de texto plano del email' })
    @IsOptional()
    @IsString()
    textContent?: string;

    @ApiPropertyOptional({ description: 'Variables para el template' })
    @IsOptional()
    @IsObject()
    variables?: Record<string, any>;

    @ApiPropertyOptional({ description: 'ID del usuario relacionado' })
    @IsOptional()
    @IsUUID()
    userId?: string;

    @ApiPropertyOptional({ description: 'ID del proveedor relacionado' })
    @IsOptional()
    @IsUUID()
    providerId?: string;

    @ApiPropertyOptional({ description: 'ID del servicio relacionado' })
    @IsOptional()
    @IsUUID()
    serviceId?: string;

    @ApiPropertyOptional({ description: 'Enviar inmediatamente', example: true })
    @IsOptional()
    @IsBoolean()
    sendImmediately?: boolean = true;

    @ApiPropertyOptional({ description: 'Fecha programada para envío' })
    @IsOptional()
    scheduledAt?: string;
}

export class SendBulkEmailDto {
    @ApiProperty({ description: 'Lista de destinatarios' })
    @IsArray()
    @IsEmail({}, { each: true })
    recipients!: string[];

    @ApiProperty({ description: 'Asunto del email' })
    @IsString()
    subject!: string;

    @ApiProperty({ description: 'Tipo de email', enum: EmailType })
    @IsEnum(EmailType)
    type!: EmailType;

    @ApiPropertyOptional({ description: 'Contenido HTML del email' })
    @IsOptional()
    @IsString()
    htmlContent?: string;

    @ApiPropertyOptional({ description: 'Contenido de texto plano del email' })
    @IsOptional()
    @IsString()
    textContent?: string;

    @ApiPropertyOptional({ description: 'Variables para el template' })
    @IsOptional()
    @IsObject()
    variables?: Record<string, any>;

    @ApiPropertyOptional({ description: 'Enviar inmediatamente', example: true })
    @IsOptional()
    @IsBoolean()
    sendImmediately?: boolean = true;

    @ApiPropertyOptional({ description: 'Fecha programada para envío' })
    @IsOptional()
    scheduledAt?: string;
}

export class EmailResponseDto {
    @ApiProperty({ description: 'ID del email enviado' })
    id!: string;

    @ApiProperty({ description: 'Dirección de email del destinatario' })
    to!: string;

    @ApiProperty({ description: 'Asunto del email' })
    subject!: string;

    @ApiProperty({ description: 'Tipo de email', enum: EmailType })
    type!: EmailType;

    @ApiProperty({ description: 'Estado del email', enum: EmailStatus })
    status!: EmailStatus;

    @ApiProperty({ description: 'Fecha de envío' })
    sentAt!: string;

    @ApiProperty({ description: 'Fecha de creación' })
    createdAt!: string;

    @ApiProperty({ description: 'Metadatos del email' })
    metadata!: {
        userId?: string;
        providerId?: string;
        serviceId?: string;
        variables?: Record<string, any>;
    };
}

export class EmailTemplateDto {
    @ApiProperty({ description: 'Nombre del template' })
    name!: string;

    @ApiProperty({ description: 'Tipo de email', enum: EmailType })
    type!: EmailType;

    @ApiProperty({ description: 'Asunto del template' })
    subject!: string;

    @ApiProperty({ description: 'Contenido HTML del template' })
    htmlContent!: string;

    @ApiProperty({ description: 'Contenido de texto plano del template' })
    textContent!: string;

    @ApiProperty({ description: 'Variables disponibles en el template' })
    variables!: string[];

    @ApiProperty({ description: 'Template activo', example: true })
    isActive!: boolean;
}

export class EmailStatsDto {
    @ApiProperty({ description: 'Total de emails enviados' })
    totalSent!: number;

    @ApiProperty({ description: 'Emails entregados' })
    delivered!: number;

    @ApiProperty({ description: 'Emails rebotados' })
    bounced!: number;

    @ApiProperty({ description: 'Emails fallidos' })
    failed!: number;

    @ApiProperty({ description: 'Tasa de entrega (%)' })
    deliveryRate!: number;

    @ApiProperty({ description: 'Estadísticas por tipo' })
    byType!: Record<EmailType, {
        sent: number;
        delivered: number;
        bounced: number;
        failed: number;
    }>;
}

export class EmailQueryDto {
    @ApiPropertyOptional({ description: 'Tipo de email', enum: EmailType })
    @IsOptional()
    @IsEnum(EmailType)
    type?: EmailType;

    @ApiPropertyOptional({ description: 'Estado del email', enum: EmailStatus })
    @IsOptional()
    @IsEnum(EmailStatus)
    status?: EmailStatus;

    @ApiPropertyOptional({ description: 'ID del usuario' })
    @IsOptional()
    @IsUUID()
    userId?: string;

    @ApiPropertyOptional({ description: 'Fecha de inicio' })
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({ description: 'Fecha de fin' })
    @IsOptional()
    endDate?: string;

    @ApiPropertyOptional({ description: 'Página', example: 1, minimum: 1 })
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Límite por página', example: 20, minimum: 1, maximum: 100 })
    limit?: number = 20;
}

export class EmailListResponseDto {
    @ApiProperty({ description: 'Lista de emails' })
    emails!: EmailResponseDto[];

    @ApiProperty({ description: 'Página actual' })
    page!: number;

    @ApiProperty({ description: 'Límite por página' })
    limit!: number;

    @ApiProperty({ description: 'Total de emails' })
    total!: number;

    @ApiProperty({ description: 'Total de páginas' })
    totalPages!: number;
}

export class TestEmailDto {
    @ApiProperty({ description: 'Dirección de email de prueba' })
    @IsEmail()
    to!: string;

    @ApiProperty({ description: 'Tipo de email a probar', enum: EmailType })
    @IsEnum(EmailType)
    type!: EmailType;

    @ApiPropertyOptional({ description: 'Variables personalizadas para la prueba' })
    @IsOptional()
    @IsObject()
    variables?: Record<string, any>;
}
