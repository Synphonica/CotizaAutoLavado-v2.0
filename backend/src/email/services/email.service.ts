import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Resend } from 'resend';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { v4 as uuidv4 } from 'uuid';
import {
  SendEmailDto,
  SendBulkEmailDto,
  EmailResponseDto,
  EmailStatsDto,
  EmailQueryDto,
  EmailListResponseDto,
  TestEmailDto,
  EmailType,
  EmailStatus
} from '../dto/email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly appUrl: string;
  private readonly templatesPath: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');

    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    } else {
      this.logger.warn('RESEND_API_KEY not configured. Email service will run in development mode.');
      // En modo desarrollo, no inicializamos Resend
      this.resend = null as any;
    }

    this.fromEmail = this.configService.get<string>('FROM_EMAIL') || 'noreply@altocarwash.cl';
    this.appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:4000';
    this.templatesPath = path.join(__dirname, '..', 'templates');
  }

  async sendEmail(sendEmailDto: SendEmailDto): Promise<EmailResponseDto> {
    try {
      const emailId = uuidv4();

      // Generar contenido del email
      const { htmlContent, textContent } = await this.generateEmailContent(
        sendEmailDto.type,
        sendEmailDto.variables || {}
      );

      // Si no hay API key configurada, simular envío
      if (!this.resend) {
        this.logger.log(`[DEV MODE] Email would be sent to: ${sendEmailDto.to}`);
        this.logger.log(`[DEV MODE] Subject: ${sendEmailDto.subject}`);
        this.logger.log(`[DEV MODE] Type: ${sendEmailDto.type}`);

        // Retornar respuesta simulada
        const emailRecord: EmailResponseDto = {
          id: emailId,
          to: sendEmailDto.to,
          subject: sendEmailDto.subject,
          type: sendEmailDto.type,
          status: EmailStatus.SENT,
          sentAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          metadata: {
            userId: sendEmailDto.userId,
            providerId: sendEmailDto.providerId,
            serviceId: sendEmailDto.serviceId,
            variables: sendEmailDto.variables
          }
        };

        this.logger.log(`[DEV MODE] Email simulated successfully: ${emailId} to ${sendEmailDto.to}`);
        return emailRecord;
      }

      // Preparar datos para Resend
      const emailData = {
        from: this.fromEmail,
        to: [sendEmailDto.to],
        cc: sendEmailDto.cc,
        bcc: sendEmailDto.bcc,
        subject: sendEmailDto.subject,
        html: htmlContent,
        text: textContent,
        tags: [
          { name: 'type', value: sendEmailDto.type },
          { name: 'emailId', value: emailId }
        ]
      };

      // Enviar email
      const result = await this.resend.emails.send(emailData);

      if (result.error) {
        throw new InternalServerErrorException(`Error sending email: ${result.error.message}`);
      }

      // Guardar en base de datos (simulado)
      const emailRecord: EmailResponseDto = {
        id: emailId,
        to: sendEmailDto.to,
        subject: sendEmailDto.subject,
        type: sendEmailDto.type,
        status: EmailStatus.SENT,
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        metadata: {
          userId: sendEmailDto.userId,
          providerId: sendEmailDto.providerId,
          serviceId: sendEmailDto.serviceId,
          variables: sendEmailDto.variables
        }
      };

      this.logger.log(`Email sent successfully: ${emailId} to ${sendEmailDto.to}`);
      return emailRecord;

    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendBulkEmail(sendBulkEmailDto: SendBulkEmailDto): Promise<EmailResponseDto[]> {
    const results: EmailResponseDto[] = [];
    const errors: string[] = [];

    for (const recipient of sendBulkEmailDto.recipients) {
      try {
        const emailDto: SendEmailDto = {
          to: recipient,
          subject: sendBulkEmailDto.subject,
          type: sendBulkEmailDto.type,
          htmlContent: sendBulkEmailDto.htmlContent,
          textContent: sendBulkEmailDto.textContent,
          variables: sendBulkEmailDto.variables,
          sendImmediately: sendBulkEmailDto.sendImmediately,
          scheduledAt: sendBulkEmailDto.scheduledAt
        };

        const result = await this.sendEmail(emailDto);
        results.push(result);
      } catch (error) {
        errors.push(`${recipient}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      this.logger.warn(`Bulk email errors: ${errors.join(', ')}`);
    }

    return results;
  }

  async sendWelcomeEmail(userEmail: string, userName: string, userId?: string): Promise<EmailResponseDto> {
    const emailDto: SendEmailDto = {
      to: userEmail,
      subject: '¡Bienvenido a Alto Carwash!',
      type: EmailType.WELCOME,
      variables: {
        userName,
        appUrl: this.appUrl
      },
      userId
    };

    return this.sendEmail(emailDto);
  }

  async sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string, userId?: string): Promise<EmailResponseDto> {
    const resetUrl = `${this.appUrl}/reset-password?token=${resetToken}`;

    const emailDto: SendEmailDto = {
      to: userEmail,
      subject: 'Restablecer tu contraseña - Alto Carwash',
      type: EmailType.PASSWORD_RESET,
      variables: {
        userName,
        resetToken,
        resetUrl
      },
      userId
    };

    return this.sendEmail(emailDto);
  }

  async sendWeeklyDigest(
    userEmail: string,
    userName: string,
    digestData: any,
    userId?: string
  ): Promise<EmailResponseDto> {
    const emailDto: SendEmailDto = {
      to: userEmail,
      subject: 'Resumen semanal - Las mejores ofertas de lavado',
      type: EmailType.WEEKLY_DIGEST,
      variables: {
        userName,
        appUrl: this.appUrl,
        offers: digestData.offers || [],
        newProviders: digestData.newProviders || [],
        popularServices: digestData.popularServices || [],
        unsubscribeUrl: `${this.appUrl}/unsubscribe?email=${userEmail}`
      },
      userId
    };

    return this.sendEmail(emailDto);
  }

  async getEmailStats(query: EmailQueryDto): Promise<EmailStatsDto> {
    try {
      // Simular estadísticas de base de datos
      const stats: EmailStatsDto = {
        totalSent: 0,
        delivered: 0,
        bounced: 0,
        failed: 0,
        deliveryRate: 0,
        byType: {} as any
      };

      // En un sistema real, esto consultaría la base de datos
      // const emailStats = await this.prisma.emailLog.aggregate({...});

      return stats;
    } catch (error) {
      this.logger.error('Error getting email stats:', error);
      throw new InternalServerErrorException('Failed to get email statistics');
    }
  }

  async listEmails(query: EmailQueryDto): Promise<EmailListResponseDto> {
    try {
      // Simular consulta a base de datos
      const emails: EmailResponseDto[] = [];
      const total = 0;
      const page = query.page || 1;
      const limit = query.limit || 20;
      const totalPages = Math.ceil(total / limit);

      return {
        emails,
        page,
        limit,
        total,
        totalPages
      };
    } catch (error) {
      this.logger.error('Error listing emails:', error);
      throw new InternalServerErrorException('Failed to list emails');
    }
  }

  async testEmail(testEmailDto: TestEmailDto): Promise<EmailResponseDto> {
    const emailDto: SendEmailDto = {
      to: testEmailDto.to,
      subject: `[TEST] ${testEmailDto.type} - Alto Carwash`,
      type: testEmailDto.type,
      variables: testEmailDto.variables || {}
    };

    return this.sendEmail(emailDto);
  }

  /**
   * Enviar email de alerta de precio
   */
  async sendPriceAlertEmail(data: {
    to: string;
    userName: string;
    serviceName: string;
    providerName: string;
    currentPrice: number;
    oldPrice: number;
    discountPercent: number;
    serviceUrl: string;
  }): Promise<EmailResponseDto> {
    const emailDto: SendEmailDto = {
      to: data.to,
      subject: `🔔 ¡Alerta de Precio! ${data.serviceName} bajó ${data.discountPercent > 0 ? `${data.discountPercent}%` : ''}`,
      type: EmailType.PRICE_ALERT,
      variables: {
        userName: data.userName,
        serviceName: data.serviceName,
        providerName: data.providerName,
        currentPrice: data.currentPrice.toLocaleString('es-CL'),
        oldPrice: data.oldPrice.toLocaleString('es-CL'),
        discountPercent: data.discountPercent,
        savings: (data.oldPrice - data.currentPrice).toLocaleString('es-CL'),
        serviceUrl: data.serviceUrl,
        appUrl: this.appUrl,
      },
    };

    return this.sendEmail(emailDto);
  }

  private async generateEmailContent(type: EmailType, variables: Record<string, any>): Promise<{ htmlContent: string; textContent: string }> {
    try {
      const templateName = this.getTemplateName(type);
      const templatePath = path.join(this.templatesPath, `${templateName}.html`);

      // Leer template HTML
      const htmlTemplate = await fs.readFile(templatePath, 'utf-8');
      const template = Handlebars.compile(htmlTemplate);
      const htmlContent = template(variables);

      // Generar versión de texto plano (simplificada)
      const textContent = this.htmlToText(htmlContent);

      return { htmlContent, textContent };
    } catch (error) {
      this.logger.error('Error generating email content:', error);

      // Fallback a contenido básico
      return {
        htmlContent: this.getFallbackHtml(type, variables),
        textContent: this.getFallbackText(type, variables)
      };
    }
  }

  private getTemplateName(type: EmailType): string {
    const templateMap: Record<EmailType, string> = {
      [EmailType.WELCOME]: 'welcome',
      [EmailType.PASSWORD_RESET]: 'password-reset',
      [EmailType.EMAIL_VERIFICATION]: 'email-verification',
      [EmailType.PRICE_ALERT]: 'price-alert',
      [EmailType.NEW_OFFER]: 'new-offer',
      [EmailType.REVIEW_REMINDER]: 'review-reminder',
      [EmailType.PROVIDER_APPROVAL]: 'provider-approval',
      [EmailType.PROVIDER_REJECTION]: 'provider-rejection',
      [EmailType.WEEKLY_DIGEST]: 'weekly-digest',
      [EmailType.CUSTOM]: 'custom'
    };

    return templateMap[type] || 'custom';
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private getFallbackHtml(type: EmailType, variables: Record<string, any>): string {
    return `
      <html>
        <body>
          <h1>Alto Carwash</h1>
          <p>Hola ${variables.userName || 'Usuario'},</p>
          <p>Este es un email de ${type}.</p>
          <p>Gracias por usar Alto Carwash.</p>
        </body>
      </html>
    `;
  }

  private getFallbackText(type: EmailType, variables: Record<string, any>): string {
    return `
      Alto Carwash
      
      Hola ${variables.userName || 'Usuario'},
      
      Este es un email de ${type}.
      
      Gracias por usar Alto Carwash.
    `;
  }
}
