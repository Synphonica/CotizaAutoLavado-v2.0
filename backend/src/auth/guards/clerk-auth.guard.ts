import { Injectable, ExecutionContext, UnauthorizedException, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { verifyToken } from '@clerk/backend';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface ClerkUser {
    id: string; // Database user ID
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
            const clerkId = (payload.user_metadata?.clerk_id || payload.sub) as string;
            const email = payload.email as string;

            // Look up user in database to get database ID
            const dbUser = await this.prisma.user.findUnique({
                where: { clerkId },
                select: { id: true, role: true },
            });

            // If user doesn't exist in database yet, we still allow the request
            // but services that need database user will handle creation
            const user: ClerkUser = {
                id: dbUser?.id || '', // Database ID (empty if not found)
                clerkId: clerkId,
                email: email,
                name: payload.user_metadata?.name as string | undefined,
                avatar: payload.user_metadata?.avatar as string | undefined,
                emailVerified: payload.email_verified as boolean | undefined,
                // Use role from database if available, otherwise from token
                role: dbUser?.role || (payload.public_metadata?.role || payload.publicMetadata?.role) as UserRole | undefined,
            };

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
