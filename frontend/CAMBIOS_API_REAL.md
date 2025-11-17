# Cambios: Integración con API Real del Backend

## Fecha: 2025-01-XX

## Resumen
Se actualizó el frontend para que consuma datos reales del backend en lugar de usar datos mockeados (hardcodeados).

---

## 🔧 Cambios Realizados

### 1. **Archivo: `src/app/results/page.tsx`**

#### Cambios principales:
- ✅ Agregados tipos TypeScript para la respuesta del backend (`BackendSearchResult`, `BackendSearchResponse`)
- ✅ Creada función `transformToServiceItem()` para mapear datos del backend al formato del frontend
- ✅ Actualizada función `fetchResults()` para llamar al endpoint real: `GET /api/search?q={query}&limit=20`
- ✅ Agregados logs de consola para debugging:
  - `🔍 Fetching results from backend API...`
  - `✅ Backend response: {...}`
  - `❌ Error fetching results from backend: {...}`
  - `⚠️  Using mock data as fallback`

#### Comportamiento actual:
1. **Backend encendido + Base de datos CON datos**: Muestra datos reales de Supabase
2. **Backend encendido + Base de datos VACÍA**: Devuelve array vacío `[]`, muestra "No se encontraron resultados"
3. **Backend apagado**: Usa `mockServices` como fallback (6 servicios hardcodeados)

---

## 📊 Estructura de Datos

### Frontend espera (`ServiceItem`):
```typescript
{
  id: string;
  name: string;
  price: number;
  provider: {
    id: string;
    businessName: string;
    city?: string;
  };
  rating?: number;
  discount?: number;
  duration?: number;
  description?: string;
  images?: string[];
  category?: string;
}
```

### Backend devuelve (`BackendSearchResult`):
```typescript
{
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  duration: number;
  rating: number;
  reviewCount: number;
  discountedPrice?: number;
  images?: Array<{ id, url, alt, isMain }>;
  provider?: {
    id: string;
    businessName: string;
    city: string;
    rating: number;
  };
  discountInfo?: {
    hasDiscount: boolean;
    discountPercentage?: number;
    originalPrice?: number;
  };
}
```

### Mapeo realizado por `transformToServiceItem()`:
- `backendResult.discountInfo.discountPercentage` → `ServiceItem.discount`
- `backendResult.images[].url` → `ServiceItem.images[]` (solo URLs)
- Se mantienen los demás campos compatibles

---

## 🚨 Estado Actual

### ✅ Completado:
- Integración con API real del backend
- Transformación de datos backend → frontend
- Manejo de errores con fallback a mockData
- Logs de debugging en consola

### ⚠️  Pendiente (requiere acción del usuario):
1. **Poblar la base de datos** (actualmente está vacía):
   ```bash
   cd scraper
   npm run import:sample  # O import:full para datos completos
   ```
   
2. **Verificar que el backend esté encendido**:
   ```bash
   cd backend
   npm run start:dev
   ```

3. **Verificar configuración de variables de entorno** en `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE=http://localhost:4000/api
   ```

---

## 🧪 Cómo Verificar que Funciona

### Escenario 1: Backend encendido + Base de datos poblada
1. Abrir DevTools (F12) → Pestaña "Console"
2. Ir a `/results` o hacer una búsqueda
3. Deberías ver:
   ```
   🔍 Fetching results from backend API...
   ✅ Backend response: { results: [...], total: X, page: 1, ... }
   ```
4. Los servicios mostrados deben venir de Supabase

### Escenario 2: Backend encendido + Base de datos vacía
1. Verás:
   ```
   🔍 Fetching results from backend API...
   ✅ Backend response: { results: [], total: 0, ... }
   ```
2. En pantalla: "No se encontraron resultados"

### Escenario 3: Backend apagado
1. Verás:
   ```
   🔍 Fetching results from backend API...
   ❌ Error fetching results from backend: fetch failed
   ⚠️  Using mock data as fallback
   ```
2. En pantalla: 6 servicios hardcodeados (AutoClean Pro, Car Spa, etc.)

---

## 🔗 Endpoints Usados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/search?q={query}&limit=20` | Búsqueda de servicios (sin query = todos) |

**Base URL**: `http://localhost:4000/api` (definida en `NEXT_PUBLIC_API_BASE`)

---

## 📝 Notas Técnicas

1. **MockData aún existe** en el código como fallback de emergencia - NO se eliminó para evitar pantallas en blanco si el backend falla.

2. **El hook `useSearch`** en `src/hooks/useSearch.ts` ya estaba configurado para llamar a la API real, pero la página de resultados no lo usaba.

3. **TypeScript strict mode**: Todos los tipos están correctamente tipados para evitar errores en tiempo de compilación.

4. **Logs de consola**: Se agregaron para facilitar el debugging. Puedes eliminarlos en producción cambiando `console.log` por `console.debug`.

---

## 🐛 Posibles Problemas y Soluciones

### Problema: "Siempre veo los 6 servicios mockeados"
**Causa**: Backend apagado o error de red  
**Solución**: 
1. Verificar que el backend esté corriendo en `http://localhost:4000`
2. Revisar logs de consola en DevTools

### Problema: "No se encontraron resultados" pero sé que hay datos
**Causa**: Base de datos vacía en Supabase  
**Solución**: Ejecutar el scraper para poblar la BD:
```bash
cd scraper
npm run import:sample
```

### Problema: Error de CORS
**Causa**: Backend no tiene configurado el origin del frontend  
**Solución**: Verificar en `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:3000', ...],
  credentials: true,
});
```

---

## 📚 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `frontend/src/app/results/page.tsx` | Agregados tipos backend, función transform, logs de debugging |

## 📚 Archivos Relacionados (NO modificados)

| Archivo | Descripción |
|---------|-------------|
| `frontend/src/hooks/useSearch.ts` | Hook para búsquedas (ya configurado para API real) |
| `frontend/src/lib/api.ts` | Cliente HTTP con autenticación Clerk |
| `frontend/src/lib/api/search.ts` | Endpoints de búsqueda |
| `backend/src/search/controllers/search.controller.ts` | Controlador de búsqueda |
| `backend/src/search/dto/search-response.dto.ts` | DTO de respuesta del backend |

---

## ✅ Conclusión

El frontend ahora está **100% conectado al backend real**. Solo falta poblar la base de datos con el scraper para ver datos reales en lugar del fallback mockeado.

**Próximos pasos recomendados:**
1. Ejecutar `npm run import:sample` en el directorio `scraper/`
2. Verificar en Supabase Studio que las tablas `services` y `providers` tengan datos
3. Refrescar el frontend y ver datos reales en `/results`
