/**
 * Tests para el cliente API mejorado
 */

import {
    apiGet,
    apiPost,
    apiPut,
    apiPatch,
    apiDelete,
    ApiError,
    isApiError,
    handleApiError,
} from '../api-client'

// Mock de fetch global
global.fetch = jest.fn()

describe('API Client', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (global.fetch as jest.Mock).mockClear()
    })

    describe('apiGet', () => {
        it('should make a successful GET request', async () => {
            const mockData = { id: 1, name: 'Test Service' }
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockData,
                })

            const result = await apiGet('/services/1')

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/services/1'),
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                })
            )
            expect(result).toEqual(mockData)
        })

        it('should handle 404 errors', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => ({ message: 'Not found' }),
            })

            await expect(apiGet('/services/999')).rejects.toThrow(ApiError)

            try {
                await apiGet('/services/999')
            } catch (error) {
                expect(isApiError(error)).toBe(true)
                if (isApiError(error)) {
                    expect(error.statusCode).toBe(404)
                    expect(error.message).toBe('Not found')
                }
            }
        })

        it('should retry on 5xx errors', async () => {
            ; (global.fetch as jest.Mock)
                .mockResolvedValueOnce({
                    ok: false,
                    status: 500,
                    json: async () => ({ message: 'Server error' }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ success: true }),
                })

            const result = await apiGet('/services', { retry: 1 })

            expect(global.fetch).toHaveBeenCalledTimes(2)
            expect(result).toEqual({ success: true })
        })

        it('should handle network errors with retry', async () => {
            ; (global.fetch as jest.Mock)
                .mockRejectedValueOnce(new TypeError('Failed to fetch'))
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ success: true }),
                })

            const result = await apiGet('/services', { retry: 1 })

            expect(global.fetch).toHaveBeenCalledTimes(2)
            expect(result).toEqual({ success: true })
        })

        it('should include authorization header when token provided', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({}),
            })

            await apiGet('/protected', { token: 'test-token' })

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-token',
                    }),
                })
            )
        })
    })

    describe('apiPost', () => {
        it('should make a successful POST request with data', async () => {
            const postData = { name: 'New Service', price: 10000 }
            const mockResponse = { id: 1, ...postData }

                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    status: 201,
                    json: async () => mockResponse,
                })

            const result = await apiPost('/services', postData)

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(postData),
                })
            )
            expect(result).toEqual(mockResponse)
        })

        it('should handle validation errors (422)', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 422,
                json: async () => ({
                    message: 'Validation failed',
                    details: { name: 'Name is required' },
                }),
            })

            await expect(apiPost('/services', {})).rejects.toThrow(ApiError)

            try {
                await apiPost('/services', {})
            } catch (error) {
                if (isApiError(error)) {
                    expect(error.statusCode).toBe(422)
                    expect(error.details).toBeDefined()
                }
            }
        })
    })

    describe('apiPut', () => {
        it('should make a successful PUT request', async () => {
            const updateData = { name: 'Updated Service' }
            const mockResponse = { id: 1, ...updateData }

                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockResponse,
                })

            const result = await apiPut('/services/1', updateData)

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(updateData),
                })
            )
            expect(result).toEqual(mockResponse)
        })
    })

    describe('apiPatch', () => {
        it('should make a successful PATCH request', async () => {
            const patchData = { price: 15000 }
            const mockResponse = { id: 1, ...patchData }

                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockResponse,
                })

            const result = await apiPatch('/services/1', patchData)

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method: 'PATCH',
                })
            )
            expect(result).toEqual(mockResponse)
        })
    })

    describe('apiDelete', () => {
        it('should make a successful DELETE request', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 204,
            })

            const result = await apiDelete('/services/1')

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method: 'DELETE',
                })
            )
            expect(result).toBeNull()
        })

        it('should handle 403 forbidden errors', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 403,
                json: async () => ({ message: 'Forbidden' }),
            })

            await expect(apiDelete('/services/1')).rejects.toThrow(ApiError)
        })
    })

    describe('handleApiError', () => {
        it('should return appropriate message for 400 error', () => {
            const error = new ApiError(400, 'Bad request')
            expect(handleApiError(error)).toBe('Bad request')
        })

        it('should return appropriate message for 401 error', () => {
            const error = new ApiError(401, 'Unauthorized')
            expect(handleApiError(error)).toBe('No autorizado. Por favor, inicia sesión')
        })

        it('should return appropriate message for 403 error', () => {
            const error = new ApiError(403, 'Forbidden')
            expect(handleApiError(error)).toBe('No tienes permisos para realizar esta acción')
        })

        it('should return appropriate message for 404 error', () => {
            const error = new ApiError(404, 'Not found')
            expect(handleApiError(error)).toBe('Recurso no encontrado')
        })

        it('should return appropriate message for 429 error', () => {
            const error = new ApiError(429, 'Too many requests')
            expect(handleApiError(error)).toBe('Demasiadas solicitudes. Por favor, espera un momento')
        })

        it('should return appropriate message for 500 error', () => {
            const error = new ApiError(500, 'Server error')
            expect(handleApiError(error)).toBe('Error del servidor. Por favor, intenta más tarde')
        })

        it('should handle generic Error', () => {
            const error = new Error('Something went wrong')
            expect(handleApiError(error)).toBe('Something went wrong')
        })

        it('should handle unknown errors', () => {
            const error = 'string error'
            expect(handleApiError(error)).toBe('Ha ocurrido un error inesperado')
        })
    })

    describe('Rate limiting handling', () => {
        it('should handle 429 rate limit errors correctly', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 429,
                json: async () => ({
                    message: 'Rate limit exceeded. Try again in 30 seconds',
                }),
            })

            try {
                await apiGet('/services')
            } catch (error) {
                if (isApiError(error)) {
                    expect(error.statusCode).toBe(429)
                    const message = handleApiError(error)
                    expect(message).toBe('Demasiadas solicitudes. Por favor, espera un momento')
                }
            }
        })
    })
})
