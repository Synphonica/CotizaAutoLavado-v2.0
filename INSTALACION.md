# 🔧 Guía de Instalación Post-Clone

Esta guía te ayudará a configurar completamente el proyecto Alto Carwash después de clonarlo.

---

## 📋 Checklist de Instalación

### 1. ✅ Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend (en otra terminal)
cd frontend
npm install
```

### 2. ✅ Configurar Husky (Pre-commit Hooks)

**Backend:**
```bash
cd backend
npm install husky lint-staged --save-dev
npx husky init

# Verificar que .husky/pre-commit existe
cat .husky/pre-commit
```

**Frontend:**
```bash
cd frontend
npm install husky lint-staged --save-dev
npx husky init

# Verificar que .husky/pre-commit exists
cat .husky/pre-commit
```

**⚠️ IMPORTANTE:** Los archivos `.husky/pre-commit` ya están creados en el repositorio con el contenido correcto. Solo necesitas ejecutar `npx husky init` para habilitar los hooks.

### 3. ✅ Configurar Variables de Entorno

**Backend (.env):**
```bash
cd backend
cp .env.example .env

# Editar con tus credenciales
nano .env  # o code .env
```

**Variables mínimas requeridas:**
```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="tu-secret-minimo-32-caracteres"
CLERK_SECRET_KEY="sk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."
GOOGLE_MAPS_API_KEY="AIza..."
```

**Frontend (.env.local):**
```bash
cd frontend
cp .env.example .env.local

# Editar con tus credenciales
nano .env.local  # o code .env.local
```

**Variables mínimas requeridas:**
```bash
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..."
```

### 4. ✅ Configurar Base de Datos

**Opción A: Con Docker (Recomendado)**
```bash
# Levantar PostgreSQL
docker-compose -f docker-compose.dev.yml up -d postgres

# Esperar a que esté listo
docker-compose logs -f postgres

# Cuando veas "database system is ready to accept connections"
# presiona Ctrl+C
```

**Opción B: PostgreSQL Local**
```bash
# Crear base de datos
psql -U postgres
CREATE DATABASE altocarwash;
\q
```

### 5. ✅ Ejecutar Migraciones

```bash
cd backend

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Poblar con datos de prueba
npx prisma db seed
```

### 6. ✅ Verificar Instalación

**Backend:**
```bash
cd backend

# Tests
npm test

# Lint
npm run lint

# Format check
npm run format

# Iniciar servidor
npm run start:dev
```

**Frontend:**
```bash
cd frontend

# Tests
npm test

# Lint
npm run lint

# Iniciar servidor
npm run dev
```

### 7. ✅ Verificar Husky Hooks

```bash
# Hacer un commit de prueba (sin -m para abrir editor)
git add .
git commit

# Deberías ver:
# - ✓ Preparing lint-staged...
# - ✓ Running tasks for staged files...
# - ✓ Applying modifications from tasks...
# - ✓ Running check-secrets script...
```

**Si los hooks NO se ejecutan:**
```bash
# Backend
cd backend
rm -rf .husky
npx husky init
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npm run check-secrets
EOF
chmod +x .husky/pre-commit

# Frontend (similar)
cd frontend
rm -rf .husky
npx husky init
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npm run check-secrets
EOF
chmod +x .husky/pre-commit
```

---

## 🐳 Instalación con Docker (Alternativa Rápida)

### Opción Completa

```bash
# 1. Variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Editar archivos .env con tus credenciales

# 2. Levantar todo
docker-compose -f docker-compose.dev.yml up -d

# 3. Ver logs
docker-compose logs -f

# 4. Ejecutar migraciones (primera vez)
docker-compose exec backend npx prisma migrate dev

# 5. (Opcional) Seed
docker-compose exec backend npx prisma db seed
```

**Servicios disponibles:**
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- PostgreSQL: localhost:5432
- Adminer: http://localhost:8080

---

## 🔑 Obtener API Keys

### Clerk (Autenticación) - GRATIS

1. Ir a https://clerk.com/
2. Sign up gratis
3. Dashboard → Create Application
4. Copiar:
   - `CLERK_SECRET_KEY` (Backend)
   - `CLERK_PUBLISHABLE_KEY` (Backend y Frontend)

### Google Maps API - GRATIS

1. Ir a https://console.cloud.google.com/
2. Create New Project
3. APIs & Services → Enable APIs
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Credentials → Create Credentials → API Key
5. Copiar `GOOGLE_MAPS_API_KEY`

### OpenAI (Opcional - IA) - $5 mínimo

1. Ir a https://platform.openai.com/
2. Sign up
3. Billing → Add payment method ($5 mínimo)
4. API Keys → Create new secret key
5. Copiar `OPENAI_API_KEY`

### Supabase (Opcional - Storage) - GRATIS

1. Ir a https://supabase.com/
2. New project (gratis)
3. Settings → API
4. Copiar:
   - `SUPABASE_URL`
   - `SUPABASE_KEY` (anon/public)
5. Storage → Create bucket: `altocarwash-uploads`

### Resend (Opcional - Email) - GRATIS

1. Ir a https://resend.com/
2. Sign up (3000 emails/mes gratis)
3. API Keys → Create API Key
4. Copiar `RESEND_API_KEY`

---

## 🧪 Verificar Todo Funciona

### 1. Health Checks

```bash
# Backend
curl http://localhost:3000/health
# Esperado: {"status":"ok","database":"connected"}

# Frontend
curl http://localhost:3001/api/health
# Esperado: {"status":"healthy"}
```

### 2. Tests

```bash
# Backend - Debería pasar ~50+ tests
cd backend
npm test

# Frontend - Debería pasar ~30+ tests
cd frontend
npm test
```

### 3. Prisma Studio

```bash
cd backend
npx prisma studio

# Abre http://localhost:5555
# Verifica que veas las tablas
```

### 4. Husky Hooks

```bash
# Crear archivo de prueba
echo "console.log('test')" > test.ts

# Agregar y commitear
git add test.ts
git commit -m "test: verify husky hooks"

# Deberías ver:
# ✓ Preparing lint-staged...
# ✓ Running tasks for staged files...
# ✓ Applying modifications from tasks...
# ✓ check-secrets passed

# Limpiar
git reset HEAD~1
rm test.ts
```

---

## 🚨 Problemas Comunes

### Error: "Husky hooks not running"

**Causa:** Git hooks no instalados correctamente

**Solución:**
```bash
cd backend  # o frontend
rm -rf .git/hooks
rm -rf .husky
npm run prepare
```

### Error: "Cannot find module 'husky'"

**Causa:** Husky no instalado

**Solución:**
```bash
npm install husky lint-staged --save-dev
npx husky init
```

### Error: ".husky/pre-commit: Permission denied"

**Causa:** Archivo sin permisos de ejecución

**Solución:**
```bash
chmod +x .husky/pre-commit
```

### Error: "check-secrets script not found"

**Causa:** Script no en package.json

**Solución:**
```bash
# Ya debería estar en package.json
# Verificar con:
npm run check-secrets

# Si no existe, agregar a package.json:
"scripts": {
  "check-secrets": "bash ./scripts/check-secrets.sh || powershell -ExecutionPolicy Bypass -File ./scripts/check-secrets.ps1"
}
```

### Error: "lint-staged not found"

**Causa:** lint-staged no instalado

**Solución:**
```bash
npm install lint-staged --save-dev
```

---

## ✅ Checklist Final

Antes de empezar a desarrollar, verifica:

- [ ] Dependencias instaladas (`npm install` en backend y frontend)
- [ ] Husky configurado y hooks funcionando
- [ ] Variables de entorno configuradas (.env y .env.local)
- [ ] Base de datos creada y migraciones ejecutadas
- [ ] Prisma client generado
- [ ] Tests pasando (backend y frontend)
- [ ] Servidores iniciando correctamente
- [ ] Health checks respondiendo
- [ ] Pre-commit hooks ejecutándose

**Si todos los checks están ✅, estás listo para desarrollar!**

---

## 📚 Próximos Pasos

1. **Leer documentación:**
   - [PROYECTO_README.md](./PROYECTO_README.md) - Overview
   - [QUICK_START.md](./QUICK_START.md) - Guía rápida
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy

2. **Explorar código:**
   - Backend: `backend/src/`
   - Frontend: `frontend/src/app/`

3. **Ejecutar en local:**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run start:dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

4. **Abrir en navegador:**
   - http://localhost:3000 (Frontend)
   - http://localhost:3000/api (Backend API docs)

---

## 🆘 Ayuda Adicional

- **Issues:** https://github.com/tuusuario/alto-carwash/issues
- **Docs:** Ver carpeta `/docs`
- **Email:** dev@altocarwash.cl

---

**¡Bienvenido al proyecto Alto Carwash! 🚗💧**
