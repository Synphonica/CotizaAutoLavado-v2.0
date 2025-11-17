import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRateLimitGuard, UserRateLimit } from '../user-rate-limit.guard';

describe('UserRateLimitGuard', () => {
    let guard: UserRateLimitGuard;
    let reflector: Reflector;
    let mockContext: ExecutionContext;
    let mockRequest: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserRateLimitGuard,
                {
                    provide: Reflector,
                    useValue: {
                        get: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<UserRateLimitGuard>(UserRateLimitGuard);
        reflector = module.get<Reflector>(Reflector);

        mockRequest = {
            user: { id: 'user-123' },
            ip: '192.168.1.1',
        };

        mockContext = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: () => mockRequest,
            }),
            getHandler: jest.fn().mockReturnValue({ name: 'testHandler' }),
        } as any;
    });

    afterEach(() => {
        // Limpiar el Map interno del guard
        (guard as any).requests.clear();
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        it('should allow access when no rate limit config', () => {
            jest.spyOn(reflector, 'get').mockReturnValue(undefined);

            const result = guard.canActivate(mockContext);

            expect(result).toBe(true);
        });

        it('should allow first request within limit', () => {
            jest.spyOn(reflector, 'get').mockReturnValue({ limit: 10, ttl: 60 });

            const result = guard.canActivate(mockContext);

            expect(result).toBe(true);
        });

        it('should allow multiple requests within limit', () => {
            jest.spyOn(reflector, 'get').mockReturnValue({ limit: 5, ttl: 60 });

            // Hacer 5 requests (debería permitir todos)
            for (let i = 0; i < 5; i++) {
                const result = guard.canActivate(mockContext);
                expect(result).toBe(true);
            }
        });

        it('should block requests exceeding limit', () => {
            jest.spyOn(reflector, 'get').mockReturnValue({ limit: 3, ttl: 60 });

            // Primeros 3 requests deberían pasar
            for (let i = 0; i < 3; i++) {
                guard.canActivate(mockContext);
            }

            // El 4to debería lanzar excepción
            expect(() => guard.canActivate(mockContext)).toThrow(HttpException);
        });

        it('should use IP when user not authenticated', () => {
            jest.spyOn(reflector, 'get').mockReturnValue({ limit: 5, ttl: 60 });
            mockRequest.user = undefined;

            const result = guard.canActivate(mockContext);

            expect(result).toBe(true);
            // Verificar que usa IP como identifier
            const key = `${mockRequest.ip}:testHandler`;
            expect((guard as any).requests.has(key)).toBe(true);
        });

        it('should use user ID when authenticated', () => {
            jest.spyOn(reflector, 'get').mockReturnValue({ limit: 5, ttl: 60 });

            const result = guard.canActivate(mockContext);

            expect(result).toBe(true);
            // Verificar que usa user ID como identifier
            const key = `${mockRequest.user.id}:testHandler`;
            expect((guard as any).requests.has(key)).toBe(true);
        });

        it('should reset counter after TTL expires', async () => {
            jest.spyOn(reflector, 'get').mockReturnValue({ limit: 2, ttl: 1 }); // 1 segundo

            // Hacer 2 requests
            guard.canActivate(mockContext);
            guard.canActivate(mockContext);

            // El 3ro debería fallar
            expect(() => guard.canActivate(mockContext)).toThrow(HttpException);

            // Esperar que expire el TTL
            await new Promise(resolve => setTimeout(resolve, 1100));

            // Ahora debería permitir nuevamente
            const result = guard.canActivate(mockContext);
            expect(result).toBe(true);
        });

        it('should track different users separately', () => {
            jest.spyOn(reflector, 'get').mockReturnValue({ limit: 2, ttl: 60 });

            // User 1 hace 2 requests
            mockRequest.user = { id: 'user-1' };
            guard.canActivate(mockContext);
            guard.canActivate(mockContext);

            // User 2 debería poder hacer requests
            mockRequest.user = { id: 'user-2' };
            const result = guard.canActivate(mockContext);
            expect(result).toBe(true);
        });

        it('should track different endpoints separately', () => {
            jest.spyOn(reflector, 'get').mockReturnValue({ limit: 2, ttl: 60 });

            // Endpoint 1 - 2 requests
            (mockContext.getHandler as jest.Mock).mockReturnValue({ name: 'endpoint1' });
            guard.canActivate(mockContext);
            guard.canActivate(mockContext);

            // Endpoint 2 debería permitir requests
            (mockContext.getHandler as jest.Mock).mockReturnValue({ name: 'endpoint2' });
            const result = guard.canActivate(mockContext);
            expect(result).toBe(true);
        });

        it('should return error message with retry time', () => {
            jest.spyOn(reflector, 'get').mockReturnValue({ limit: 1, ttl: 60 });

            guard.canActivate(mockContext);

            try {
                guard.canActivate(mockContext);
            } catch (error: any) {
                expect(error.message).toContain('Rate limit exceeded');
                expect(error.message).toMatch(/Try again in \d+ seconds/);
                expect(error.getStatus()).toBe(429);
            }
        });

        it('should allow access when no identifier available', () => {
            jest.spyOn(reflector, 'get').mockReturnValue({ limit: 5, ttl: 60 });
            mockRequest.user = undefined;
            mockRequest.ip = undefined;

            const result = guard.canActivate(mockContext);

            expect(result).toBe(true);
        });
    });

    describe('cleanup', () => {
        it('should remove expired entries', async () => {
            jest.spyOn(reflector, 'get').mockReturnValue({ limit: 5, ttl: 1 }); // 1 segundo

            // Crear entrada
            guard.canActivate(mockContext);
            expect((guard as any).requests.size).toBe(1);

            // Esperar a que expire
            await new Promise(resolve => setTimeout(resolve, 1100));

            // Forzar cleanup
            (guard as any).cleanup();

            // Debería haberse eliminado
            expect((guard as any).requests.size).toBe(0);
        });

        it('should keep valid entries during cleanup', async () => {
            jest.spyOn(reflector, 'get').mockReturnValue({ limit: 5, ttl: 60 });

            // Crear entrada que no expira pronto
            guard.canActivate(mockContext);
            expect((guard as any).requests.size).toBe(1);

            // Ejecutar cleanup
            (guard as any).cleanup();

            // No debería eliminarse
            expect((guard as any).requests.size).toBe(1);
        });
    });
});

describe('UserRateLimit Decorator', () => {
    it('should set metadata on method', () => {
        class TestController {
            @UserRateLimit(10, 60)
            testMethod() {
                return 'test';
            }
        }

        const metadata = Reflect.getMetadata('user-rate-limit', TestController.prototype.testMethod);
        expect(metadata).toEqual({ limit: 10, ttl: 60 });
    });

    it('should allow different configurations per method', () => {
        class TestController {
            @UserRateLimit(5, 30)
            method1() {
                return 'method1';
            }

            @UserRateLimit(10, 60)
            method2() {
                return 'method2';
            }
        }

        const metadata1 = Reflect.getMetadata('user-rate-limit', TestController.prototype.method1);
        const metadata2 = Reflect.getMetadata('user-rate-limit', TestController.prototype.method2);

        expect(metadata1).toEqual({ limit: 5, ttl: 30 });
        expect(metadata2).toEqual({ limit: 10, ttl: 60 });
    });
});
