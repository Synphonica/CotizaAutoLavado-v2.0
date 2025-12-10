# 🚀 Guía Rápida de Deploy - Alto Carwash

## 📋 Pre-requisitos

- ✅ Docker y Docker Compose instalados en el servidor
- ✅ Git instalado
- ✅ Acceso SSH al servidor
- ✅ Credenciales de Clerk configuradas

## 🎯 Deploy en 3 Pasos

### 1️⃣ Clonar/Actualizar el Repositorio

```bash
# Si es la primera vez
cd ~
git clone https://github.com/Synphonica/CotizaAutoLavado-v2.0.git proyecto-titulo/alto-carwash-mejorado

# Si ya existe
cd ~/proyecto-titulo/alto-carwash-mejorado
git pull origin main
```

### 2️⃣ Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.production.example .env.production

# Editar con tus credenciales reales
nano .env.production
```

**Variables que DEBES configurar:**

```bash
# Clerk (obligatorio para autenticación)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_tu_clave_aqui
CLERK_SECRET_KEY=sk_test_tu_clave_secreta_aqui

# API (reemplaza con tu IP/dominio)
NEXT_PUBLIC_API_URL=http://TU_IP:4000
NEXT_PUBLIC_API_BASE=http://TU_IP:4000/api

# Google Maps (obligatorio para mapas)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_key_aqui

# Database
DATABASE_URL=postgresql://usuario:password@db:5432/nombre_db
```

### 3️⃣ Ejecutar Deploy

#### Opción A: Script Automático (Recomendado) ⭐

```bash
cd docs
chmod +x deploy.sh
./deploy.sh
```

El script te guiará paso a paso y verificará que todo esté correcto.

#### Opción B: Manual

```bash
cd docs

# Copiar .env
cp ../.env.production ../.env

# Exportar variables
export $(cat ../.env | xargs)

# Build
docker-compose --env-file ../.env -f docker-compose.prod.yml build --no-cache

# Levantar servicios
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Verificar el Deploy

```bash
# Ver estado de contenedores
docker-compose -f docker-compose.prod.yml ps

# Ver logs del frontend
docker logs alto-carwash-frontend --tail 50 -f

# Ver logs del backend
docker logs alto-carwash-backend --tail 50 -f

# Probar endpoints
curl http://localhost
curl http://localhost:4000/api/health
```

## 🌐 Acceder a la Aplicación

Una vez levantados los servicios:

- **Frontend**: http://TU_IP_O_DOMINIO
- **Backend API**: http://TU_IP_O_DOMINIO:4000
- **Health Check**: http://TU_IP_O_DOMINIO:4000/api/health

## 🔄 Actualizar la Aplicación

Cuando hagas cambios en el código:

```bash
cd ~/proyecto-titulo/alto-carwash-mejorado

# 1. Traer cambios
git pull origin main

# 2. Rebuild (solo el servicio que cambiaste)
cd docs
docker-compose -f docker-compose.prod.yml build --no-cache frontend  # o backend

# 3. Reiniciar
docker-compose -f docker-compose.prod.yml up -d frontend  # o backend
```

## 🛑 Detener los Servicios

```bash
cd ~/proyecto-titulo/alto-carwash-mejorado/docs

# Detener todos
docker-compose -f docker-compose.prod.yml down

# Detener y eliminar volúmenes (⚠️ CUIDADO: elimina datos)
docker-compose -f docker-compose.prod.yml down -v
```

## 🐛 Troubleshooting

### ❌ Error: "variable is not set"

```bash
# Verifica que .env existe
ls -la ../.env.production

# Exporta las variables
export $(cat ../.env.production | xargs)

# Intenta de nuevo el build
docker-compose --env-file ../.env.production -f docker-compose.prod.yml build
```

### ❌ Error: "useUser can only be used within ClerkProvider"

Este error indica que las variables de Clerk no están disponibles durante el build.

```bash
# 1. Verifica que las variables están en .env.production
cat ../.env.production | grep CLERK

# 2. Exporta las variables antes del build
export $(cat ../.env.production | xargs)
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  # debe mostrar tu key

# 3. Build con --env-file
docker-compose --env-file ../.env.production -f docker-compose.prod.yml build --no-cache frontend
```

### ❌ Contenedor se reinicia continuamente

```bash
# Ver logs detallados
docker logs alto-carwash-frontend --tail 100

# Ver todos los errores
docker-compose -f docker-compose.prod.yml logs | grep -i error
```

### ❌ No puedo acceder a la aplicación

1. Verifica que los contenedores estén corriendo:
   ```bash
   docker ps
   ```

2. Verifica que los puertos estén abiertos en el firewall:
   ```bash
   sudo ufw status
   sudo ufw allow 80
   sudo ufw allow 4000
   ```

3. Verifica la IP del servidor:
   ```bash
   curl ifconfig.me
   ```

## 📚 Documentación Adicional

- [ENV_SETUP.md](./ENV_SETUP.md) - Guía detallada de variables de entorno
- [COMANDOS_VPS.md](./COMANDOS_VPS.md) - Comandos útiles para el VPS
- [SSL_SETUP.md](./SSL_SETUP.md) - Configurar SSL/HTTPS

## 🆘 Comandos Útiles

```bash
# Ver todos los contenedores
docker ps -a

# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Reiniciar un servicio
docker-compose -f docker-compose.prod.yml restart frontend

# Entrar a un contenedor
docker exec -it alto-carwash-frontend sh

# Limpiar todo Docker (⚠️ CUIDADO)
docker system prune -a --volumes

# Ver uso de recursos
docker stats
```

## 🎉 ¡Listo!

Tu aplicación Alto Carwash ahora está corriendo en producción con:
- ✅ Autenticación con Clerk
- ✅ Backend API
- ✅ Frontend optimizado
- ✅ Base de datos PostgreSQL
- ✅ Redis para caché
- ✅ Health checks automáticos

---

**¿Problemas?** Revisa los logs o consulta [ENV_SETUP.md](./ENV_SETUP.md) para más detalles.
