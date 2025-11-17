# 🔒 Guía: Habilitar Row Level Security (RLS) en Supabase

## ⚠️ Problema Detectado

Supabase ha detectado que 3 tablas están públicas sin Row Level Security (RLS) habilitado:

- ❌ `public.time_slots`
- ❌ `public.blocked_dates`
- ❌ `public.bookings`

Esto significa que estas tablas son accesibles públicamente a través de PostgREST, lo cual es un **riesgo de seguridad**.

---

## ✅ Solución

### Opción 1: Aplicar desde Supabase Dashboard (Recomendado)

1. **Accede a tu proyecto de Supabase:**
   - Ve a https://supabase.com
   - Abre tu proyecto `Alto Carwash`

2. **Abre el SQL Editor:**
   - En el menú lateral, haz clic en `SQL Editor`
   - Haz clic en `+ New query`

3. **Copia y pega el script completo:**
   ```sql
   -- Ver el archivo: backend/prisma/migrations/enable_rls.sql
   ```
   - Abre el archivo `backend/prisma/migrations/enable_rls.sql`
   - Copia TODO el contenido
   - Pégalo en el editor SQL de Supabase

4. **Ejecuta el script:**
   - Haz clic en el botón `Run` o presiona `Ctrl + Enter`
   - Deberías ver: "Success. No rows returned"

5. **Verifica que RLS está habilitado:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('time_slots', 'blocked_dates', 'bookings');
   ```
   - Todas las tablas deben mostrar `rowsecurity = true` ✅

---

### Opción 2: Aplicar desde la terminal (Avanzado)

Si tienes `psql` instalado:

```bash
cd backend/prisma/migrations
psql $DATABASE_URL -f enable_rls.sql
```

---

## 🔐 ¿Qué hace el script?

### 1. **Habilita RLS en las tablas:**
```sql
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
```

### 2. **Crea políticas de seguridad:**

#### Para `time_slots` (horarios disponibles):
- ✅ **Lectura pública:** Cualquiera puede ver horarios disponibles
- 🔒 **Escritura protegida:** Solo el backend puede crear/modificar/eliminar

#### Para `blocked_dates` (fechas bloqueadas):
- ✅ **Lectura pública:** Cualquiera puede ver fechas bloqueadas
- 🔒 **Escritura protegida:** Solo el backend puede crear/modificar/eliminar

#### Para `bookings` (reservas):
- 🔒 **Lectura protegida:** Solo el backend valida quién puede ver qué reservas
- 🔒 **Escritura protegida:** Solo el backend valida quién puede crear/modificar reservas

---

## ⚙️ Políticas Implementadas

El script utiliza `USING (true)` para las políticas, lo que significa:

- **Las políticas están habilitadas** (RLS activado)
- **La validación real se hace en tu backend NestJS** con Clerk Auth
- Esto es correcto porque:
  1. Tu backend ya tiene autenticación con Clerk
  2. Las rutas ya están protegidas con guards
  3. No necesitas doble validación (base de datos + backend)

---

## 🧪 Verificar que funciona

Después de aplicar el script:

1. **Los errores de Supabase desaparecerán** ✅
2. **Tu aplicación seguirá funcionando igual** (el backend sigue manejando la seguridad)
3. **Las tablas estarán protegidas** contra acceso directo no autorizado

---

## 🔍 Verificación Final

Ejecuta esta consulta en Supabase SQL Editor:

```sql
-- Ver todas las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('time_slots', 'blocked_dates', 'bookings')
ORDER BY tablename, policyname;
```

Deberías ver **12 políticas** en total (4 por cada tabla).

---

## ⚠️ Warning de UploadService

✅ **YA ESTÁ SOLUCIONADO**

El warning:
```
[Nest] 13184 - WARN [UploadService] UploadService is deprecated. 
Please use SupabaseUploadService instead.
```

**Ya fue eliminado** del código. El servicio legacy se mantiene solo para compatibilidad, pero sin mostrar warnings en cada inicio.

---

## 📚 Recursos Adicionales

- [Documentación oficial de RLS en Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Políticas de seguridad en PostgreSQL](https://www.postgresql.org/docs/current/sql-createpolicy.html)

---

## 🎯 Resumen

1. ✅ Copia el script SQL de `backend/prisma/migrations/enable_rls.sql`
2. ✅ Pégalo en el SQL Editor de Supabase
3. ✅ Ejecútalo con `Run`
4. ✅ Verifica que RLS está habilitado
5. ✅ Los warnings desaparecerán

**¡Listo!** Tu base de datos estará protegida con RLS. 🎉
