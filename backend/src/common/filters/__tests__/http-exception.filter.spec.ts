import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { AllExceptionsFilter } from '../http-exception.filter';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('AllExceptionsFilter', () => {
    let filter: AllExceptionsFilter;
    let mockResponse: any;
    let mockRequest: any;
    let mockHost: ArgumentsHost;

    beforeEach(() => {
        filter = new AllExceptionsFilter();

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        mockRequest = {
            url: '/api/test',
            method: 'GET',
        };

        mockHost = {
            switchToHttp: jest.fn().mockReturnValue({
                getResponse: () => mockResponse,
                getRequest: () => mockRequest,
            }),
        } as any;
    });

    describe('HTTP Exceptions', () => {
        it('should handle HttpException with string response', () => {
            const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

            filter.catch(exception, mockHost);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 400,
                    message: 'Test error',
                    path: '/api/test',
                }),
            );
        });

        it('should handle HttpException with object response', () => {
            const exception = new HttpException(
                {
                    message: 'Validation failed',
                    error: 'Bad Request',
                },
                HttpStatus.BAD_REQUEST,
            );

            filter.catch(exception, mockHost);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 400,
                    message: 'Validation failed',
                    error: 'Bad Request',
                }),
            );
        });

        it('should handle NOT_FOUND exception', () => {
            const exception = new HttpException('Resource not found', HttpStatus.NOT_FOUND);

            filter.catch(exception, mockHost);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 404,
                    message: 'Resource not found',
                }),
            );
        });

        it('should handle UNAUTHORIZED exception', () => {
            const exception = new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

            filter.catch(exception, mockHost);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
        });

        it('should handle FORBIDDEN exception', () => {
            const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

            filter.catch(exception, mockHost);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
        });
    });

    describe('Prisma Exceptions', () => {
        it('should handle P2002 (Unique constraint violation)', () => {
            const exception = new PrismaClientKnownRequestError('Unique constraint failed', {
                code: 'P2002',
                clientVersion: '5.0.0',
                meta: { target: ['email'] },
            });

            filter.catch(exception, mockHost);

            expect(mockResponse.status).toHaveBeenCalledWith(409);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 409,
                    message: expect.stringContaining('Duplicate value'),
                }),
            );
        });

        it('should handle P2025 (Record not found)', () => {
            const exception = new PrismaClientKnownRequestError('Record not found', {
                code: 'P2025',
                clientVersion: '5.0.0',
            });

            filter.catch(exception, mockHost);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 404,
                    message: 'Record not found',
                }),
            );
        });

        it('should handle P2003 (Foreign key constraint)', () => {
            const exception = new PrismaClientKnownRequestError('Foreign key constraint failed', {
                code: 'P2003',
                clientVersion: '5.0.0',
            });

            filter.catch(exception, mockHost);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Foreign key constraint failed',
                }),
            );
        });

        it('should handle P2001 (Record does not exist)', () => {
            const exception = new PrismaClientKnownRequestError('Record does not exist', {
                code: 'P2001',
                clientVersion: '5.0.0',
            });

            filter.catch(exception, mockHost);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 404,
                    message: 'Record does not exist',
                }),
            );
        });

        it('should handle unknown Prisma errors', () => {
            const exception = new PrismaClientKnownRequestError('Unknown error', {
                code: 'P9999',
                clientVersion: '5.0.0',
            });

            filter.catch(exception, mockHost);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Database operation failed',
                }),
            );
        });
    });

    describe('Generic Errors', () => {
        it('should handle generic Error', () => {
            const exception = new Error('Something went wrong');

            filter.catch(exception, mockHost);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 500,
                    message: 'Something went wrong',
                }),
            );
        });

        it('should handle unknown exceptions', () => {
            const exception = 'string error';

            filter.catch(exception, mockHost);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 500,
                    message: 'Internal server error',
                }),
            );
        });
    });

    describe('Response structure', () => {
        it('should include timestamp', () => {
            const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

            filter.catch(exception, mockHost);

            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    timestamp: expect.any(String),
                }),
            );
        });

        it('should include request path', () => {
            const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

            filter.catch(exception, mockHost);

            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    path: '/api/test',
                }),
            );
        });

        it('should include statusCode', () => {
            const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

            filter.catch(exception, mockHost);

            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 400,
                }),
            );
        });
    });

    describe('Environment-specific behavior', () => {
        const originalEnv = process.env.NODE_ENV;

        afterEach(() => {
            process.env.NODE_ENV = originalEnv;
        });

        it('should include stack trace in development', () => {
            process.env.NODE_ENV = 'development';
            const exception = new Error('Test error');

            filter.catch(exception, mockHost);

            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    details: expect.any(String),
                }),
            );
        });

        it('should not include stack trace in production', () => {
            process.env.NODE_ENV = 'production';
            const exception = new Error('Test error');

            filter.catch(exception, mockHost);

            const sendCall = mockResponse.send.mock.calls[0][0];
            expect(sendCall).not.toHaveProperty('details');
        });
    });
});
