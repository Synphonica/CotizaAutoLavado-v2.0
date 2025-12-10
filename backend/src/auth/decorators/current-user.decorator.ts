import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User data extracted from Clerk JWT token and enriched with database info
 */
export interface CurrentUserData {
  id: string; // Database user ID
  clerkId: string;
  email: string;
  name?: string;
  avatar?: string;
  emailVerified?: boolean;
  role?: any; // UserRole from Prisma
}

/**
 * Decorator to get current authenticated user from request
 * 
 * @example
 * ```typescript
 * @Get('profile')
 * @UseGuards(ClerkAuthGuard)
 * getProfile(@CurrentUser() user: CurrentUserData) {
 *   return { userId: user.clerkId, email: user.email };
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);