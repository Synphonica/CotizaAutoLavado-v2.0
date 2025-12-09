# ============================================
# AltoCarWash - Guía de Docker
# ============================================

## 📋 Prerequisitos

Antes de usar Docker, asegúrate de tener configurados:

### Backend (.env)
```bash
# Supabase PostgreSQL
DATABASE_URL="postgresql://user:password@host.supabase.co:5432/postgres"

# Clerk Authentication
CLERK_SECRET_KEY="sk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."

# Otras variables...
```

### Frontend (.env.local)
```bash
# Backend API
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Otras variables...
```

## 🚀 Inicio Rápido

### Desarrollo (con hot-reload)
```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down
```

### Producción
```bash
# Build y levantar servicios de producción
docker-compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Parar servicios
docker-compose -f docker-compose.prod.yml down
```

## 📋 Comandos Útiles

### Backend
```bash
# Ejecutar migraciones de Prisma (hacia Supabase)
docker-compose exec backend npx prisma migrate deploy

# Generar Prisma Client
docker-compose exec backend npx prisma generate

# Ver logs del backend
docker-compose logs -f backend

# Acceder al contenedor
docker-compose exec backend sh

# Seed de base de datos (en Supabase)
docker-compose exec backend npm run seed:josscar
```

### Frontend
```bash
# Ver logs del frontend
docker-compose logs -f frontend

# Acceder al contenedor
docker-compose exec frontend sh

# Rebuild del frontend
docker-compose up -d --build frontend
```

### Base de Datos (si usas PostgreSQL local)
```bash
# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres -d altocarwash

# Backup de base de datos
docker-compose exec postgres pg_dump -U postgres altocarwash > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres altocarwash < backup.sql
```

**Nota**: Si usas Supabase, estas operaciones se hacen desde el dashboard de Supabase.

## 🔧 Troubleshooting

### Rebuild completo (limpia cache)
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Ver estado de contenedores
```bash
docker-compose ps
```

### Limpiar volúmenes
```bash
docker-compose down -v
```

### Ver uso de recursos
```bash
docker stats
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Swagger Docs**: http://localhost:4000/api
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Clerk Dashboard**: https://dashboard.clerk.com

## 📝 Notas Importantes

1. **Variables de Entorno Requeridas**:
   - `backend/.env` → DATABASE_URL, CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY
   - `frontend/.env.local` → NEXT_PUBLIC_API_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY

2. **Supabase**: 
   - La base de datos está en Supabase (PostgreSQL externo)
   - No se incluye PostgreSQL local en Docker
   - Las migraciones se ejecutan contra Supabase

3. **Clerk**:
   - Autenticación manejada por Clerk (externo)
   - Ambos frontend y backend necesitan las keys de Clerk

4. **Volúmenes**: 
   - Los uploads se persisten en `./backend/uploads`
   - Hot-reload funciona con volúmenes montados en desarrollo

5. **Networking**:
   - Backend y Frontend se comunican a través de `altocarwash-network`
   - Frontend accede al backend via `http://localhost:4000` (desde el navegador)

## 🔐 Producción

Para producción, usa `docker-compose.prod.yml`:
- Imágenes optimizadas multi-stage
- Sin hot-reload
- Healthchecks habilitados
- Reinicio automático
