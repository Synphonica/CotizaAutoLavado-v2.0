import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { ClerkController } from './controllers/clerk.controller';
import { AuthService } from './services/auth.service';
import { ClerkStrategy } from './strategies/clerk.strategy';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [],
  controllers: [AuthController, ClerkController],
  providers: [
    AuthService,
    ClerkStrategy,
    ClerkAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, ClerkAuthGuard, RolesGuard],
})
export class AuthModule { }