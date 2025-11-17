import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EmailService } from '../services/email.service';
import {
  SendEmailDto,
  SendBulkEmailDto,
  EmailResponseDto,
  EmailStatsDto,
  EmailQueryDto,
  EmailListResponseDto,
  TestEmailDto
} from '../dto/email.dto';

@ApiTags('email')
@ApiBearerAuth()
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) { }

  @Post('send')
  @ApiOperation({ summary: 'Enviar un email individual' })
  @ApiOkResponse({ description: 'Email enviado exitosamente', type: EmailResponseDto as any })
  async sendEmail(@Body() sendEmailDto: SendEmailDto): Promise<EmailResponseDto> {
    return this.emailService.sendEmail(sendEmailDto);
  }

  @Post('send-bulk')
  @ApiOperation({ summary: 'Enviar emails masivos' })
  @ApiOkResponse({ description: 'Emails procesados', type: [EmailResponseDto] as any })
  async sendBulkEmail(@Body() sendBulkEmailDto: SendBulkEmailDto): Promise<EmailResponseDto[]> {
    return this.emailService.sendBulkEmail(sendBulkEmailDto);
  }

  @Post('welcome')
  @ApiOperation({ summary: 'Enviar email de bienvenida' })
  @ApiOkResponse({ description: 'Email de bienvenida enviado', type: EmailResponseDto as any })
  async sendWelcomeEmail(
    @Body() body: { userEmail: string; userName: string; userId?: string }
  ): Promise<EmailResponseDto> {
    return this.emailService.sendWelcomeEmail(body.userEmail, body.userName, body.userId);
  }

  @Post('password-reset')
  @ApiOperation({ summary: 'Enviar email de restablecimiento de contraseña' })
  @ApiOkResponse({ description: 'Email de restablecimiento enviado', type: EmailResponseDto as any })
  async sendPasswordResetEmail(
    @Body() body: { userEmail: string; userName: string; resetToken: string; userId?: string }
  ): Promise<EmailResponseDto> {
    return this.emailService.sendPasswordResetEmail(
      body.userEmail,
      body.userName,
      body.resetToken,
      body.userId
    );
  }

  @Post('price-alert')
  @ApiOperation({ summary: 'Enviar alerta de precio' })
  @ApiOkResponse({ description: 'Alerta de precio enviada', type: EmailResponseDto as any })
  async sendPriceAlertEmail(
    @Body() body: {
      to: string;
      userName: string;
      serviceName: string;
      providerName: string;
      currentPrice: number;
      oldPrice: number;
      discountPercent: number;
      serviceUrl: string;
    }
  ): Promise<EmailResponseDto> {
    return this.emailService.sendPriceAlertEmail(body);
  }

  @Post('weekly-digest')
  @ApiOperation({ summary: 'Enviar resumen semanal' })
  @ApiOkResponse({ description: 'Resumen semanal enviado', type: EmailResponseDto as any })
  async sendWeeklyDigest(
    @Body() body: {
      userEmail: string;
      userName: string;
      digestData: any;
      userId?: string;
    }
  ): Promise<EmailResponseDto> {
    return this.emailService.sendWeeklyDigest(
      body.userEmail,
      body.userName,
      body.digestData,
      body.userId
    );
  }

  @Post('test')
  @ApiOperation({ summary: 'Enviar email de prueba' })
  @ApiOkResponse({ description: 'Email de prueba enviado', type: EmailResponseDto as any })
  async testEmail(@Body() testEmailDto: TestEmailDto): Promise<EmailResponseDto> {
    return this.emailService.testEmail(testEmailDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de emails' })
  @ApiOkResponse({ description: 'Estadísticas de emails', type: EmailStatsDto as any })
  @ApiQuery({ name: 'type', required: false, description: 'Tipo de email' })
  @ApiQuery({ name: 'status', required: false, description: 'Estado del email' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID del usuario' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Fecha de inicio' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Fecha de fin' })
  async getEmailStats(@Query() query: EmailQueryDto): Promise<EmailStatsDto> {
    return this.emailService.getEmailStats(query);
  }

  @Get()
  @ApiOperation({ summary: 'Listar emails enviados' })
  @ApiOkResponse({ description: 'Lista de emails', type: EmailListResponseDto as any })
  @ApiQuery({ name: 'type', required: false, description: 'Tipo de email' })
  @ApiQuery({ name: 'status', required: false, description: 'Estado del email' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID del usuario' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Fecha de inicio' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Fecha de fin' })
  @ApiQuery({ name: 'page', required: false, description: 'Página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite por página' })
  async listEmails(@Query() query: EmailQueryDto): Promise<EmailListResponseDto> {
    return this.emailService.listEmails(query);
  }
}
