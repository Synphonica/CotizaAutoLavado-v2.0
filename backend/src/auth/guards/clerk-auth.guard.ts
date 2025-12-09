import { Injectable, ExecutionContext, UnauthorizedException, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { verifyToken } from '@clerk/backend';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface ClerkUser {
    clerkId: string;
    email: string;
    name?: string;
    avatar?: string;
    emailVerified?: boolean;
    role?: UserRole;
}

/**
 * Guard to verify Clerk JWT tokens with Supabase template
 */
@Injectable()
export class ClerkAuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Check if route is public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('No se proporcionó token de autenticación');
        }

        try {
            // Verify Clerk token with required issuer
            const payload = await verifyToken(token, {
                secretKey: process.env.CLERK_SECRET_KEY,
                issuer: (iss) => iss.startsWith('https://') && iss.includes('clerk'),
            }) as any;

            // Extract user data from token claims
            const user: ClerkUser = {
                clerkId: (payload.user_metadata?.clerk_id || payload.sub) as string,
                email: payload.email as string,
                name: payload.user_metadata?.name as string | undefined,
                avatar: payload.user_metadata?.avatar as string | undefined,
                emailVerified: payload.email_verified as boolean | undefined,
                // Extract role from Clerk's publicMetadata
                role: (payload.public_metadata?.role || payload.publicMetadata?.role) as UserRole | undefined,
            };

            // Si no hay rol en el token, buscarlo en la base de datos
            if (!user.role && user.clerkId) {
                const dbUser = await this.prisma.user.findUnique({
                    where: { clerkId: user.clerkId },
                    select: { role: true },
                });

                if (dbUser) {
                    user.role = dbUser.role;
                }
            }

            // Attach user to request
            request.user = user;

            return true;
        } catch (error) {
            console.error('[ClerkAuthGuard] Token verification failed:', error);
            throw new UnauthorizedException('Token de Clerk inválido o expirado');
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
