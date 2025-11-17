import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User data extracted from Clerk JWT token
 */
export interface CurrentUserData {
  clerkId: string;
  email: string;
  name?: string;
  avatar?: string;
  emailVerified?: boolean;
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