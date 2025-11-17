# 🧪 Mejoras de Testing Aplicadas - Día 2

## Resumen de Cambios

Se ha implementado una **infraestructura de testing completa** para frontend y backend, con tests unitarios, cobertura de código y configuración CI/CD ready.

---

## ✅ Cambios Implementados

### 1. Configuración Jest para Frontend

#### Archivos creados:
- ✅ `frontend/jest.config.js` - Configuración completa de Jest con Next.js
- ✅ `frontend/jest.setup.js` - Setup global de tests
- ✅ `frontend/__mocks__/styleMock.js` - Mock de CSS
- ✅ `frontend/__mocks__/fileMock.js` - Mock de archivos estáticos

#### Frontend: `package.json`
- ✅ Scripts de testing agregados:
  - `npm test` - Ejecutar tests
  - `npm run test:watch` - Modo watch
  - `npm run test:coverage` - Generar reporte de cobertura
  - `npm run test:ci` - Tests para CI/CD

#### Dependencias agregadas:
```json
"@testing-library/jest-dom": "^6.6.3",
"@testing-library/react": "^16.1.0",
"@testing-library/user-event": "^14.5.2",
"@types/jest": "^29.5.14",
"jest": "^29.7.0",
"jest-environment-jsdom": "^29.7.0"
```

#### Características:
- ✅ Integración con Next.js 14/15
- ✅ Soporte para React 19
- ✅ Path aliases (`@/`) configurados
- ✅ Mocks automáticos de CSS e imágenes
- ✅ Umbrales de cobertura: 50% global
- ✅ IntersectionObserver y ResizeObserver mockeados

---

### 2. Tests para Cliente API (Frontend)

#### Archivo: `frontend/src/lib/__tests__/api-client.test.ts`

**Cobertura de tests:**
- ✅ `apiGet()` - Requests GET exitosos y con errores
- ✅ `apiPost()` - Requests POST con datos
- ✅ `apiPut()` - Requests PUT
- ✅ `apiPatch()` - Requests PATCH
- ✅ `apiDelete()` - Requests DELETE
- ✅ Manejo de errores HTTP (400, 401, 403, 404, 429, 500)
- ✅ Retry logic para errores 5xx
- ✅ Retry logic para errores de red
- ✅ Headers de autorización con tokens
- ✅ Helper `handleApiError()` para mensajes user-friendly
- ✅ Clase `ApiError` personalizada

**Total: 25+ casos de prueba**

**Ejemplo de test:**
```typescript
it('should retry on 5xx errors', async () => {
  (global.fetch as jest.Mock)
    .mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' }),
    })
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

  const result = await apiGet('/services', { retry: 1 });

  expect(global.fetch).toHaveBeenCalledTimes(2);
  expect(result).toEqual({ success: true });
});
```

---

### 3. Tests para Componentes (Frontend)

#### Archivo: `frontend/src/components/__tests__/SearchBar.test.tsx`

**Cobertura de tests:**
- ✅ Renderizado de input y botón
- ✅ Atributo action por defecto y personalizado
- ✅ Actualización del input al escribir
- ✅ Query inicial (prop initialQuery)
- ✅ Iconos de búsqueda
- ✅ Submit del formulario
- ✅ Atributo name del input

**Total: 8 casos de prueba**

**Ejemplo de test:**
```typescript
it('should update input value when typing', async () => {
  const user = userEvent.setup();
  render(<SearchBar />);

  const input = screen.getByPlaceholderText(/Ej: Lavado premium/i);

  await user.type(input, 'lavado de auto');

  expect(input.value).toBe('lavado de auto');
});
```

---

### 4. Tests para Filtro de Excepciones (Backend)

#### Archivo: `backend/src/common/filters/__tests__/http-exception.filter.spec.ts`

**Cobertura de tests:**
- ✅ Manejo de HttpException (string y object response)
- ✅ Diferentes códigos HTTP (400, 401, 403, 404, 500)
- ✅ Errores de Prisma:
  - P2002 (Unique constraint) → 409 Conflict
  - P2025 (Record not found) → 404 Not Found
  - P2003 (Foreign key constraint) → 400 Bad Request
  - P2001 (Record does not exist) → 404 Not Found
  - Códigos desconocidos
- ✅ Errores genéricos (Error, unknown)
- ✅ Estructura de respuesta (timestamp, path, statusCode)
- ✅ Stack trace solo en desarrollo (no en producción)

**Total: 15+ casos de prueba**

**Ejemplo de test:**
```typescript
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
```

---

### 5. Tests para Guards (Backend)

#### Archivo: `backend/src/auth/guards/__tests__/user-rate-limit.guard.spec.ts`

**Cobertura de tests:**
- ✅ Permitir acceso sin configuración de rate limit
- ✅ Permitir primera request dentro del límite
- ✅ Permitir múltiples requests dentro del límite
- ✅ Bloquear requests que excedan el límite
- ✅ Usar IP cuando usuario no autenticado
- ✅ Usar user ID cuando autenticado
- ✅ Reset del contador después de TTL
- ✅ Tracking separado por usuario
- ✅ Tracking separado por endpoint
- ✅ Mensaje de error con tiempo de reintento
- ✅ Cleanup de entradas expiradas
- ✅ Tests del decorador `@UserRateLimit()`

**Total: 16+ casos de prueba**

**Ejemplo de test:**
```typescript
it('should reset counter after TTL expires', async () => {
  jest.spyOn(reflector, 'get').mockReturnValue({ limit: 2, ttl: 1 });

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
```

---

### 6. Tests para DTOs (Backend)

#### Archivo: `backend/src/search/dto/__tests__/search-query.dto.spec.ts`

**Cobertura de tests:**
- ✅ Validación de campo `query` (required, maxLength, trim)
- ✅ Validación de latitud y longitud (rangos válidos)
- ✅ Conversión de strings a números
- ✅ Validación de radius (min 1, max 100, default 10)
- ✅ Validación de city y region (maxLength, trim)
- ✅ Validación de ServiceType enum
- ✅ Validación de arrays de ServiceTypes
- ✅ Validación de precios (minPrice, maxPrice, no negativos)
- ✅ Validación de rating (min 1, max 5)
- ✅ Validación de paginación (page >= 1, limit <= 100)
- ✅ Valores por defecto (page=1, limit=20, sortBy='relevance')
- ✅ Flags booleanos (availableOnly, verifiedOnly, hasDiscounts)
- ✅ Campos de sorting (sortBy, sortOrder)

**Total: 35+ casos de prueba**

**Ejemplo de test:**
```typescript
it('should trim whitespace from query', () => {
  const dto = plainToInstance(SearchQueryDto, {
    query: '  lavado premium  ',
  });

  expect(dto.query).toBe('lavado premium');
});

it('should reject query exceeding max length', async () => {
  const dto = plainToInstance(SearchQueryDto, {
    query: 'a'.repeat(201),
  });

  const errors = await validate(dto);
  const queryErrors = errors.find(e => e.property === 'query');
  expect(queryErrors).toBeDefined();
  expect(queryErrors?.constraints).toHaveProperty('maxLength');
});
```

---

### 7. Configuración de Cobertura

#### Backend: `package.json`
```json
"coverageThreshold": {
  "global": {
    "branches": 50,
    "functions": 50,
    "lines": 50,
    "statements": 50
  }
}
```

#### Frontend: `jest.config.js`
```javascript
coverageThreshold: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  },
}
```

#### Exclusiones de cobertura:
**Backend:**
- `*.module.ts`
- `*.interface.ts`
- `main.ts`
- Carpetas de tests

**Frontend:**
- `*.d.ts`
- `*.stories.tsx`
- `layout.tsx`
- `__tests__/**`

---

## 📋 Próximos Pasos

### Instalación de Dependencias

```bash
# Frontend
cd frontend
npm install

# Backend (ya tiene todo)
cd ../backend
# No requiere instalación adicional
```

### Ejecutar Tests

```bash
# Frontend
cd frontend
npm test                    # Ejecutar todos los tests
npm run test:watch          # Modo watch
npm run test:coverage       # Con cobertura

# Backend
cd backend
npm test                    # Ejecutar todos los tests
npm run test:watch          # Modo watch
npm run test:cov            # Con cobertura
npm run test:e2e            # Tests E2E
```

### Verificar Cobertura

```bash
# Frontend
cd frontend
npm run test:coverage
# Ver reporte en: coverage/lcov-report/index.html

# Backend
cd backend
npm run test:cov
# Ver reporte en: coverage/lcov-report/index.html
```

---

## 📊 Métricas de Cobertura Esperadas

| Componente | Tests Creados | Cobertura Objetivo |
|------------|---------------|-------------------|
| **Frontend - API Client** | 25+ tests | 90%+ |
| **Frontend - SearchBar** | 8 tests | 85%+ |
| **Backend - Exception Filter** | 15+ tests | 90%+ |
| **Backend - Rate Limit Guard** | 16+ tests | 95%+ |
| **Backend - Search DTO** | 35+ tests | 100% |

---

## 🎯 Tests Adicionales Sugeridos

### Frontend (Alta prioridad)
- [ ] Tests para `ServiceCard.tsx`
- [ ] Tests para `ErrorBoundary.tsx`
- [ ] Tests para hooks (`useAuth`, `useServices`, `useFavorites`)
- [ ] Tests de integración para flujo de búsqueda

### Backend (Alta prioridad)
- [ ] Tests para `AuthService` (login, register, validateUser)
- [ ] Tests para `SearchService` (search logic, filtering)
- [ ] Tests para `BookingsService` (create, update, cancel)
- [ ] Tests para otros guards (`JwtAuthGuard`, `RolesGuard`)

### E2E (Media prioridad)
- [ ] Flujo completo de autenticación
- [ ] Flujo de búsqueda y resultados
- [ ] Flujo de reserva de servicio
- [ ] Flujo de gestión de favoritos

---

## 🚀 Integración CI/CD

Los tests están listos para integrarse en pipelines de CI/CD. Los scripts `test:ci` ejecutan tests con:
- Modo CI (sin watch)
- Reporte de cobertura
- Paralelización limitada (maxWorkers=2)

**Ejemplo para GitHub Actions:**
```yaml
- name: Run tests
  run: npm run test:ci
  
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

---

## 💡 Mejores Prácticas Aplicadas

### Tests Unitarios
- ✅ Nombres descriptivos (patrón "should...")
- ✅ Arrange-Act-Assert
- ✅ Un concepto por test
- ✅ Mocks aislados (beforeEach cleanup)
- ✅ Tests independientes entre sí

### Cobertura
- ✅ Umbrales configurados (50% global)
- ✅ Exclusión de archivos irrelevantes
- ✅ Reportes HTML generados automáticamente

### Organización
- ✅ Tests junto al código (`__tests__/`)
- ✅ Nomenclatura consistente (`.spec.ts` backend, `.test.tsx` frontend)
- ✅ Describe blocks para agrupación lógica

---

## 📞 Troubleshooting

### Error: "Cannot find module '@testing-library/react'"
```bash
cd frontend
npm install
```

### Error: "ReferenceError: Request is not defined" (Frontend)
Asegúrate de que `jest.setup.js` esté configurado correctamente.

### Tests lentos en modo watch
Usa `--maxWorkers=2` o `--runInBand` para tests que requieren recursos.

### Cobertura no alcanza umbrales
Temporal: Puedes reducir umbrales en `jest.config` mientras agregas más tests.

---

**Última actualización**: 2025-10-31

**Siguiente paso**: Día 3 - CI/CD y Deployment 🚀
