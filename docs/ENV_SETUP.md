# Configuración de Variables de Entorno para Producción

## ✅ Credenciales Ya Configuradas

Las credenciales de Clerk y otros servicios ya están configuradas en:
- `frontend/.env.production` - Variables del frontend
- `.env.production` - Variables para docker-compose (raíz del proyecto)

## Variables Configuradas:

### Clerk Authentication
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Configurada
- ✅ `CLERK_SECRET_KEY` - Configurada

### Backend API
- ✅ `NEXT_PUBLIC_API_URL` - http://104.250.132.28:4000
- ✅ `NEXT_PUBLIC_API_BASE` - http://104.250.132.28:4000/api

### Google Maps
- ✅ `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Configurada

### Supabase
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Configurada
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Configurada

### Sentry
- ✅ `NEXT_PUBLIC_SENTRY_DSN` - Configurada

## Pasos para Deploy en el Servidor

### 1. Clonar/Actualizar el repositorio en el servidor

```bash
cd ~/proyecto-titulo/alto-carwash-mejorado
git pull origin main
```

### 2. Copiar el archivo de variables de entorno

```bash
# Copiar .env.production a .env para que docker-compose lo use
cp .env.production .env
```

### 2. Copiar el archivo de variables de entorno

```bash
# Copiar .env.production a .env para que docker-compose lo use
cp .env.production .env
```

### 3. Verificar que las variables estén disponibles

```bash
# Ver el contenido del archivo
cat .env

# Exportar variables para la sesión actual (docker-compose las leerá automáticamente)
export $(cat .env | xargs)

# Verificar que estén disponibles
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```

### 4. Hacer build del frontend con las variables

```bash
# Build con cache limpio
docker-compose -f docker-compose.prod.yml build --no-cache frontend

# O si prefieres pasar las variables explícitamente:
docker-compose --env-file .env -f docker-compose.prod.yml build --no-cache frontend
```

### 5. Levantar todos los servicios

```bash
# Iniciar todos los contenedores
docker-compose -f docker-compose.prod.yml up -d

# Ver logs para verificar
docker-compose -f docker-compose.prod.yml logs -f
```

### 6. Verificar que todo esté funcionando

```bash
# Ver estado de los contenedores
docker-compose -f docker-compose.prod.yml ps

# Verificar logs del frontend
docker logs alto-carwash-frontend

# Verificar logs del backend
docker logs alto-carwash-backend

# Probar la aplicación
curl http://localhost
curl http://localhost:4000/api/health
```

## Verificación de Clerk

Una vez que la aplicación esté corriendo, verifica que Clerk esté funcionando:

1. Abre el navegador: `http://104.250.132.28`
2. Haz clic en "Iniciar Sesión" o "Registrarse"
3. Deberías ver el formulario de Clerk
4. Si ves errores, revisa los logs: `docker logs alto-carwash-frontend`

## Actualizar Variables en el Futuro

Si necesitas cambiar alguna variable:

```bash
# 1. Editar el archivo
nano .env

# 2. Recargar las variables
export $(cat .env | xargs)

# 3. Rebuild del servicio afectado
docker-compose -f docker-compose.prod.yml build --no-cache frontend

# 4. Reiniciar el servicio
docker-compose -f docker-compose.prod.yml up -d frontend
```

## Troubleshooting

### ❌ Warning: "variable is not set"

Si ves estos warnings durante el build:
```
WARNING: The CLERK_SECRET_KEY variable is not set. Defaulting to a blank string.
```

**Solución:**
```bash
# 1. Verifica que el archivo .env existe
ls -la .env

# 2. Exporta las variables
export $(cat .env | xargs)

# 3. Verifica que se exportaron
env | grep CLERK

# 4. Intenta el build de nuevo
docker-compose --env-file .env -f docker-compose.prod.yml build --no-cache frontend
```

### ❌ Error: useUser can only be used within ClerkProvider

Este error ya está corregido en el código. Si lo sigues viendo:

1. Asegúrate de que las variables de Clerk están en `.env`
2. Exporta las variables antes del build: `export $(cat .env | xargs)`
3. Usa `--env-file`: `docker-compose --env-file .env -f docker-compose.prod.yml build`

### ❌ Error: Cannot connect to Clerk

Si la aplicación carga pero Clerk no funciona:

1. Verifica que las keys sean correctas en `.env`
2. Verifica que las keys sean de **producción** (no test) si estás en producción
3. Verifica en el dashboard de Clerk que el dominio esté permitido
4. Revisa los logs: `docker logs alto-carwash-frontend`

### ❌ Contenedor se reinicia continuamente

```bash
# Ver logs detallados
docker logs alto-carwash-frontend --tail 100

# Ver todos los logs
docker-compose -f docker-compose.prod.yml logs

# Verificar el estado
docker-compose -f docker-compose.prod.yml ps
```

### 🔍 Debug Mode

Para ver más información durante el build:

```bash
# Build con output detallado
docker-compose -f docker-compose.prod.yml build --no-cache --progress=plain frontend

# Ver todas las variables durante el build
docker-compose -f docker-compose.prod.yml config
```

## Seguridad

⚠️ **IMPORTANTE**: 
- El archivo `.env` contiene credenciales sensibles
- Está en `.gitignore` y no se subirá a GitHub
- En el servidor, asegúrate de que tenga permisos adecuados:

```bash
chmod 600 .env
```

## Resumen de Comandos Rápidos

```bash
# Setup inicial en el servidor
cd ~/proyecto-titulo/alto-carwash-mejorado
git pull origin main
cp .env.production .env
export $(cat .env | xargs)

# Build y deploy
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Verificar
docker-compose -f docker-compose.prod.yml ps
docker logs alto-carwash-frontend --tail 50
curl http://localhost
```
