import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { ClerkController } from './controllers/clerk.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ClerkStrategy } from './strategies/clerk.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, ClerkController],
  providers: [
    AuthService,
    JwtStrategy,
    ClerkStrategy,
    JwtAuthGuard,
    ClerkAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtAuthGuard, ClerkAuthGuard, RolesGuard],
})
export class AuthModule {}