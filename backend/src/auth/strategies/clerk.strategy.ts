import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as CustomStrategy } from 'passport-custom';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ClerkStrategy extends PassportStrategy(CustomStrategy, 'clerk') {
    constructor(private readonly authService: AuthService) {
        super();
    }

    async validate(req: any): Promise<any> {
        try {
            // Extraer token de Clerk del header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new UnauthorizedException('Token de Clerk no proporcionado');
            }

            const token = authHeader.substring(7);

            // Verificar token con Clerk
            const clerkUser = await this.authService.verifyClerkToken(token);
            if (!clerkUser) {
                throw new UnauthorizedException('Token de Clerk inválido');
            }

            // Sincronizar o crear usuario en nuestra base de datos
            const user = await this.authService.syncWithClerk(clerkUser.id, clerkUser);

            return user;
        } catch (error) {
            throw new UnauthorizedException('Autenticación con Clerk fallida');
        }
    }
}