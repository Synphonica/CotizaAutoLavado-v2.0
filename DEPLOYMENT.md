# 🚀 Guía de Despliegue - Alto Carwash

Esta guía describe cómo desplegar la aplicación Alto Carwash en diferentes entornos.

## 📋 Tabla de Contenidos

- [Prerrequisitos](#prerrequisitos)
- [Variables de Entorno](#variables-de-entorno)
- [Despliegue con Docker](#despliegue-con-docker)
- [Despliegue en Vercel (Frontend)](#despliegue-en-vercel-frontend)
- [Despliegue en Railway/Render (Backend)](#despliegue-en-railwayrender-backend)
- [Base de Datos PostgreSQL](#base-de-datos-postgresql)
- [Configuración Post-Despliegue](#configuración-post-despliegue)

## 🔧 Prerrequisitos

- Node.js 20.x o superior
- PostgreSQL 15 o superior
- Cuenta en Vercel (frontend)
- Cuenta en Railway/Render (backend)
- Cuenta en Supabase (storage y base de datos opcional)
- API Keys de servicios externos:
  - Google Maps API
  - OpenAI API
  - Clerk (autenticación)
  - Resend (email)

## 🔐 Variables de Entorno

### Backend (.env)

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/altocarwash?schema=public"
DIRECT_URL="postgresql://user:password@host:5432/altocarwash?schema=public"

# JWT
JWT_SECRET="tu-secret-key-super-seguro-y-largo-minimo-32-caracteres"

# Clerk Authentication
CLERK_SECRET_KEY="sk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."

# Google Maps
GOOGLE_MAPS_API_KEY="AIza..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Supabase Storage
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_KEY="eyJ..."
SUPABASE_BUCKET_NAME="altocarwash-uploads"

# Resend Email
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@tudominio.com"

# Redis (Opcional - Para rate limiting en producción)
REDIS_URL="redis://localhost:6379"

# CORS
CORS_ORIGIN="https://tu-frontend.vercel.app"

# Environment
NODE_ENV="production"
PORT=3000
```

### Frontend (.env.local)

```bash
# Backend API
NEXT_PUBLIC_API_URL="https://tu-backend.railway.app"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..."

# Environment
NEXT_PUBLIC_ENV="production"
```

## 🐳 Despliegue con Docker

### Producción

1. **Construir y ejecutar con Docker Compose:**

```bash
# Copiar archivo de variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Editar variables de entorno con valores de producción
nano backend/.env
nano frontend/.env.local

# Construir y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

2. **Acceder a los servicios:**
   - Frontend: http://localhost:3001
   - Backend: http://localhost:3000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

### Desarrollo

```bash
# Usar configuración de desarrollo
docker-compose -f docker-compose.dev.yml up -d

# Acceder a servicios adicionales
# Adminer (DB Manager): http://localhost:8080
```

### Comandos útiles

```bash
# Reconstruir servicios
docker-compose build --no-cache

# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy

# Ver logs de un servicio específico
docker-compose logs -f backend

# Ejecutar shell en contenedor
docker-compose exec backend sh
```

## ☁️ Despliegue en Vercel (Frontend)

### 1. Preparación

1. **Fork o push del repositorio a GitHub**
2. **Conectar Vercel a tu repositorio**

### 2. Configuración en Vercel

**Build Settings:**
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Root Directory: `frontend`

**Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
NEXT_PUBLIC_ENV=production
```

### 3. Deploy

```bash
# Desde terminal local (opcional)
cd frontend
npx vercel --prod
```

O usar el dashboard de Vercel para deploys automáticos desde Git.

### 4. Configuración de Dominio

1. Ir a Settings → Domains
2. Agregar tu dominio personalizado
3. Configurar DNS según instrucciones de Vercel

## 🚂 Despliegue en Railway/Render (Backend)

### Opción A: Railway

1. **Crear nuevo proyecto en Railway**

2. **Agregar PostgreSQL:**
   - Click en "New" → "Database" → "Add PostgreSQL"
   - Copiar `DATABASE_URL` generada

3. **Agregar servicio Backend:**
   - Click en "New" → "GitHub Repo"
   - Seleccionar repositorio
   - Root Directory: `backend`

4. **Variables de Entorno:**
   ```bash
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   DIRECT_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=<generar-secret-seguro>
   CLERK_SECRET_KEY=sk_live_...
   CLERK_PUBLISHABLE_KEY=pk_live_...
   GOOGLE_MAPS_API_KEY=AIza...
   OPENAI_API_KEY=sk-...
   SUPABASE_URL=https://...
   SUPABASE_KEY=eyJ...
   SUPABASE_BUCKET_NAME=altocarwash-uploads
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=noreply@tudominio.com
   CORS_ORIGIN=https://tu-frontend.vercel.app
   NODE_ENV=production
   PORT=3000
   ```

5. **Configurar Build:**
   - Build Command: `npm run build`
   - Start Command: `npm run start:migrate:prod`

6. **Agregar Redis (Opcional):**
   - Click en "New" → "Database" → "Add Redis"
   - Agregar variable: `REDIS_URL=${{Redis.REDIS_URL}}`

### Opción B: Render

1. **Crear Web Service:**
   - New → Web Service
   - Connect repository
   - Root Directory: `backend`

2. **Configuración:**
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:migrate:prod`

3. **Agregar PostgreSQL:**
   - New → PostgreSQL
   - Copiar Internal Database URL

4. **Variables de Entorno:**
   - Igual que Railway (ver arriba)

## 🗄️ Base de Datos PostgreSQL

### Opción A: Supabase (Recomendado)

1. **Crear proyecto en Supabase**
2. **Obtener credenciales:**
   - Settings → Database → Connection String
   - Usar modo "Session" para `DATABASE_URL`
   - Usar modo "Transaction" para `DIRECT_URL`

3. **Habilitar RLS (Row Level Security):**
   ```bash
   # Desde tu máquina local
   cd backend
   ./scripts/enable-rls.sh
   ```

### Opción B: Railway/Render PostgreSQL

1. **Railway:** Incluido en el plan (500MB gratis)
2. **Render:** PostgreSQL disponible (plan gratuito: 90 días, luego $7/mes)

### Migraciones

```bash
# Ejecutar migraciones en producción
npx prisma migrate deploy

# Ver estado de migraciones
npx prisma migrate status

# Generar cliente Prisma
npx prisma generate
```

## ✅ Configuración Post-Despliegue

### 1. Verificar Health Checks

```bash
# Backend health
curl https://tu-backend.railway.app/health

# Frontend health
curl https://tu-frontend.vercel.app/api/health
```

### 2. Ejecutar Seed (Primera vez)

```bash
# Conectarse al contenedor/servicio backend
npx prisma db seed
```

### 3. Configurar CORS

Asegurar que `CORS_ORIGIN` en backend incluya el dominio del frontend:

```typescript
// backend/src/main.ts ya configurado
app.enableCors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
});
```

### 4. Configurar Webhooks de Clerk

En Clerk Dashboard:
1. Configure → Webhooks
2. Agregar endpoint: `https://tu-backend.railway.app/webhooks/clerk`
3. Seleccionar eventos: `user.created`, `user.updated`, `user.deleted`

### 5. Monitoreo

**Logs:**
```bash
# Railway
railway logs

# Render
Ver en dashboard → Logs

# Docker
docker-compose logs -f
```

**Métricas:**
- Railway: Dashboard → Metrics
- Render: Dashboard → Metrics
- Vercel: Analytics automático

## 🔒 Seguridad

### Checklist de Seguridad

- [ ] Variables de entorno configuradas correctamente
- [ ] JWT_SECRET fuerte (mínimo 32 caracteres)
- [ ] CORS configurado solo para dominios permitidos
- [ ] HTTPS habilitado (automático en Vercel/Railway/Render)
- [ ] RLS habilitado en Supabase
- [ ] Rate limiting configurado (UserRateLimitGuard)
- [ ] Secrets no versionados (verificar con `npm run check-secrets`)
- [ ] Dependencias actualizadas (`npm audit`)

### Generar JWT Secret Seguro

```bash
# Opción 1: OpenSSL
openssl rand -base64 32

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 📊 CI/CD

Los workflows de GitHub Actions se ejecutan automáticamente:

- **Backend CI:** Tests, lint, build, security scan
- **Frontend CI:** Tests, lint, build, Lighthouse audit
- **PR Checks:** Coverage reports, cambios de versión

Ver `.github/workflows/` para más detalles.

## 🆘 Troubleshooting

### Error: Cannot connect to database

**Solución:**
1. Verificar `DATABASE_URL` correcta
2. Verificar whitelist de IPs (Railway/Supabase)
3. Verificar estado de servicio PostgreSQL

### Error: CORS blocked

**Solución:**
1. Verificar `CORS_ORIGIN` en backend
2. Verificar `NEXT_PUBLIC_API_URL` en frontend
3. Verificar HTTPS en ambos servicios

### Error: Prisma Client not generated

**Solución:**
```bash
npx prisma generate
npm run build
```

### Build fails en Vercel/Railway

**Solución:**
1. Verificar Node.js version (20.x)
2. Limpiar caché y rebuild
3. Verificar todas las variables de entorno

## 📚 Recursos Adicionales

- [Documentación Vercel](https://vercel.com/docs)
- [Documentación Railway](https://docs.railway.app)
- [Documentación Render](https://render.com/docs)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

**¿Necesitas ayuda?** Revisa los logs, GitHub Issues, o contacta al equipo de desarrollo.
