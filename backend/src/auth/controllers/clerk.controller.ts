import {
    Controller,
    Post,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
  } from '@nestjs/swagger';
  import { AuthService } from '../services/auth.service';
  import { Public } from '../decorators/public.decorator';
  
  @ApiTags('auth')
  @Controller('auth/clerk')
  export class ClerkController {
    constructor(private readonly authService: AuthService) {}
  
  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook de Clerk para sincronización de usuarios' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook procesado exitosamente',
  })
  async handleWebhook(@Body() payload: any) {
    try {
      const { type, data } = payload;

      switch (type) {
        case 'user.created':
          await this.authService.handleUserCreated(data);
          break;
        case 'user.updated':
          await this.authService.handleUserUpdated(data);
          break;
        case 'user.deleted':
          await this.authService.handleUserDeleted(data);
          break;
        default:
          console.log(`Evento de Clerk no manejado: ${type}`);
      }

      return {
        message: 'Webhook de Clerk procesado exitosamente',
        type,
        processed: true,
      };
    } catch (error) {
      console.error('Error procesando webhook de Clerk:', error);
      return {
        message: 'Error procesando webhook',
        type: payload.type,
        processed: false,
        error: error.message,
      };
    }
  }
  
    @Post('sync-user')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Sincronizar usuario con Clerk' })
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          clerkId: { type: 'string' },
          userData: { type: 'object' },
        },
      },
    })
    @ApiResponse({
      status: 200,
      description: 'Usuario sincronizado exitosamente',
    })
    async syncUser(
      @Body('clerkId') clerkId: string,
      @Body('userData') userData: any,
    ) {
      const user = await this.authService.syncWithClerk(clerkId, userData);
      return {
        message: 'Usuario sincronizado exitosamente',
        user,
      };
    }
  }