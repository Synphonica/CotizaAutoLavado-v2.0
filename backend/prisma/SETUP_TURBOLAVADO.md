# 🏪 Configurar Proveedor: Turbolavado R y N

Este script configura un proveedor de ejemplo con todos los servicios necesarios para empezar a recibir reservas y notificaciones.

## 📋 ¿Qué hace este script?

1. **Crea un usuario** con rol de PROVIDER
2. **Crea el perfil del proveedor** con toda la información de negocio
3. **Crea 5 servicios** diferentes con precios y duración
4. **Activa las notificaciones** para que el proveedor reciba alertas de reservas

## 🚀 Cómo ejecutar

### En tu máquina local:

```bash
cd backend
npx tsx prisma/seed-turbolavado.ts
```

### En el VPS:

```bash
# 1. Conectarse al VPS
ssh root@104.250.132.28

# 2. Ir al directorio del proyecto
cd /root/proyecto-titulo/alto-carwash-mejorado

# 3. Actualizar código
git pull origin main

# 4. Ejecutar dentro del contenedor del backend
docker exec -it alto-carwash-backend sh

# 5. Ejecutar el script
npx tsx prisma/seed-turbolavado.ts

# 6. Salir del contenedor
exit
```

## 📊 Datos creados

### Usuario
- **Email**: turbolavado@ryn.cl
- **Nombre**: Turbolavado R y N
- **Rol**: PROVIDER
- **Teléfono**: +56912345678

### Proveedor
- **Nombre de Negocio**: Turbolavado R y N
- **Tipo**: Autolavado Profesional
- **Ubicación**: Santiago Centro, Región Metropolitana
- **Estado**: ACTIVE (listo para recibir reservas)
- **Horario**:
  - Lunes a Jueves: 09:00 - 19:00
  - Viernes: 09:00 - 20:00
  - Sábado: 09:00 - 18:00
  - Domingo: 10:00 - 16:00
- **Rating**: 4.5 ⭐
- **Acepta Reservas**: Sí ✅

### Servicios Creados

1. **Lavado Exterior Completo**
   - Precio: $8.000
   - Duración: 30 minutos
   - Tipo: BASIC_WASH

2. **Lavado Interior**
   - Precio: $12.000
   - Duración: 45 minutos
   - Tipo: INTERIOR_CLEAN

3. **Lavado Completo (Exterior + Interior)**
   - Precio: $18.000
   - Duración: 60 minutos
   - Tipo: PREMIUM_WASH

4. **Lavado de Motor**
   - Precio: $10.000
   - Duración: 30 minutos
   - Tipo: ENGINE_CLEAN

5. **Pulido y Encerado**
   - Precio: $25.000
   - Duración: 90 minutos
   - Tipo: WAXING

## ✅ Verificar que funciona

### 1. Verificar en la base de datos

```bash
docker exec -it alto-carwash-backend sh
npx prisma studio
```

Busca:
- En **users**: turbolavado@ryn.cl
- En **providers**: Turbolavado R y N
- En **services**: 5 servicios activos

### 2. Probar desde el frontend

1. Abre http://104.250.132.28
2. Busca "Turbolavado R y N"
3. Deberías ver el proveedor con sus 5 servicios
4. Intenta hacer una reserva
5. El proveedor debería recibir una notificación

### 3. Verificar notificaciones

```bash
# Ver notificaciones del proveedor
docker exec -it alto-carwash-backend sh

# Abrir Prisma Studio
npx prisma studio

# En la tabla "notifications" filtrar por:
# recipientType = PROVIDER
# Deberías ver las notificaciones de reservas
```

## 🔧 Personalizar el proveedor

Si quieres cambiar algún dato, edita el archivo `prisma/seed-turbolavado.ts`:

```typescript
const provider = await prisma.provider.upsert({
  // ... configuración actual ...
  create: {
    businessName: 'TU NOMBRE AQUÍ',  // Cambiar nombre
    phone: '+56XXXXXXXXX',            // Cambiar teléfono
    email: 'tuemail@ejemplo.cl',     // Cambiar email
    address: 'Tu dirección',          // Cambiar dirección
    // ... etc
  }
});
```

Luego ejecuta de nuevo:
```bash
npx tsx prisma/seed-turbolavado.ts
```

## 🎯 Panel de Proveedor

Para acceder al panel del proveedor:

1. Ve a http://104.250.132.28
2. Inicia sesión con: **turbolavado@ryn.cl**
3. Deberías ver el dashboard de proveedor con:
   - ✅ Reservas pendientes
   - ✅ Notificaciones
   - ✅ Lista de servicios
   - ✅ Estadísticas

## 🔔 Configuración de Notificaciones

El proveedor recibirá notificaciones cuando:

- ✅ Un usuario hace una reserva
- ✅ Un usuario cancela una reserva
- ✅ Un usuario deja una reseña
- ✅ Se vence una reserva

Tipos de notificaciones:
- 📧 **Email**: turbolavado@ryn.cl
- 🔔 **In-app**: En el dashboard
- 📱 **Push** (si está configurado)

## 📝 Notas

- El script es **idempotente**: puedes ejecutarlo múltiples veces sin crear duplicados
- Si el usuario ya existe, solo actualiza el proveedor
- Si los servicios ya existen, solo actualiza precios y descripción
- El proveedor queda **ACTIVO** inmediatamente (no necesita aprobación de admin)

## 🆘 Solución de Problemas

### Error: "Email already exists"
El usuario ya existe. El script debería actualizarlo automáticamente. Si no, verifica la base de datos.

### Error: "Cannot connect to database"
Verifica que el backend esté corriendo y que DATABASE_URL esté configurado correctamente.

### El proveedor no aparece en búsquedas
Verifica que:
- `status` sea `ACTIVE`
- `acceptsBookings` sea `true`
- Los servicios tengan `isAvailable` en `true`

### No recibe notificaciones
Verifica que:
- El usuario tenga `role` = `PROVIDER`
- El proveedor tenga `userId` conectado
- Las preferencias de notificación estén habilitadas

## 🚀 Próximos Pasos

Después de configurar el proveedor:

1. **Configura el logo/imagen**: Sube imágenes del negocio
2. **Ajusta horarios**: Modifica horarios según necesidad
3. **Agrega más servicios**: Crea servicios personalizados
4. **Configura promociones**: Agrega descuentos y ofertas
5. **Prueba reservas**: Haz reservas de prueba para verificar notificaciones

---

**¿Preguntas?** Revisa la documentación del proyecto o abre un issue en GitHub.
