# 🚀 Guía de Inicio Rápido - Alto Carwash

Esta guía te ayudará a tener el proyecto corriendo en **menos de 10 minutos**.

---

## ⚡ Opción 1: Docker (Más Rápido - Recomendado)

### 1. Prerrequisitos
- Docker Desktop instalado
- Git

### 2. Clonar y Configurar

```bash
# Clonar repositorio
git clone https://github.com/tuusuario/alto-carwash.git
cd alto-carwash

# Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 3. Editar Variables de Entorno Mínimas

**backend/.env:**
```bash
# Usar DB de Docker (ya configurada)
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/altocarwash?schema=public"
DIRECT_URL="postgresql://postgres:postgres@postgres:5432/altocarwash?schema=public"

# JWT Secret (generar uno nuevo en producción)
JWT_SECRET="dev-secret-key-change-in-production-minimum-32-chars"

# Clerk (obtener gratis en clerk.com)
CLERK_SECRET_KEY="sk_test_..." # Reemplazar
CLERK_PUBLISHABLE_KEY="pk_test_..." # Reemplazar

# Google Maps (obtener gratis en console.cloud.google.com)
GOOGLE_MAPS_API_KEY="AIza..." # Reemplazar

# Resto opcional para desarrollo
CORS_ORIGIN="http://localhost:3001"
NODE_ENV="development"
```

**frontend/.env.local:**
```bash
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..." # Mismo que arriba
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..." # Mismo que arriba
```

### 4. Levantar Servicios

```bash
# Desarrollo (con hot-reload)
docker-compose -f docker-compose.dev.yml up -d

# Ver logs en tiempo real
docker-compose logs -f
```

### 5. Acceder a la Aplicación

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **API Docs:** http://localhost:3000/api
- **Adminer (DB Manager):** http://localhost:8080
  - Sistema: PostgreSQL
  - Servidor: postgres
  - Usuario: postgres
  - Contraseña: postgres
  - Base de datos: altocarwash

### 6. Poblar Base de Datos (Opcional)

```bash
# Ejecutar seed con datos de prueba
docker-compose exec backend npx prisma db seed
```

---

## 🛠️ Opción 2: Instalación Local

### 1. Prerrequisitos
- Node.js 20.x o superior
- PostgreSQL 15 instalado y corriendo
- Git
- npm o yarn

### 2. Configurar PostgreSQL

```bash
# Crear base de datos
psql -U postgres
CREATE DATABASE altocarwash;
\q
```

### 3. Backend

```bash
# Clonar repositorio
git clone https://github.com/tuusuario/alto-carwash.git
cd alto-carwash/backend

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tu configuración local
# DATABASE_URL="postgresql://postgres:password@localhost:5432/altocarwash?schema=public"
nano .env

# Instalar dependencias
npm install

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Poblar con datos de prueba
npx prisma db seed

# Iniciar servidor de desarrollo
npm run start:dev
```

**Backend corriendo en:** http://localhost:3000

### 4. Frontend (en otra terminal)

```bash
cd ../frontend

# Copiar variables de entorno
cp .env.example .env.local

# Editar .env.local
nano .env.local

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

**Frontend corriendo en:** http://localhost:3000 (o 3001 si 3000 está ocupado)

---

## 🔑 Obtener API Keys Gratuitas

### Clerk (Autenticación)

1. Ir a https://clerk.com/
2. Crear cuenta gratis
3. Crear nueva aplicación
4. Copiar:
   - `CLERK_SECRET_KEY` (sk_test_...)
   - `CLERK_PUBLISHABLE_KEY` (pk_test_...)

### Google Maps API

1. Ir a https://console.cloud.google.com/
2. Crear nuevo proyecto
3. Habilitar APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Crear credencial (API Key)
5. Copiar `GOOGLE_MAPS_API_KEY`

### OpenAI (Opcional - Para IA)

1. Ir a https://platform.openai.com/
2. Crear cuenta
3. Agregar créditos ($5 mínimo)
4. Crear API key
5. Copiar `OPENAI_API_KEY`

### Supabase (Opcional - Para storage)

1. Ir a https://supabase.com/
2. Crear proyecto gratis
3. Ir a Settings → API
4. Copiar:
   - `SUPABASE_URL`
   - `SUPABASE_KEY` (anon/public key)

### Resend (Opcional - Para emails)

1. Ir a https://resend.com/
2. Crear cuenta gratis (3000 emails/mes)
3. Crear API key
4. Copiar `RESEND_API_KEY`

---

## ✅ Verificar Instalación

### Backend Health Check

```bash
curl http://localhost:3000/health

# Respuesta esperada:
# {"status":"ok","database":"connected","uptime":123.456}
```

### Frontend Health Check

```bash
curl http://localhost:3001/api/health

# Respuesta esperada:
# {"status":"healthy","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Base de Datos

```bash
# Abrir Prisma Studio
cd backend
npx prisma studio

# Abre en http://localhost:5555
# Deberías ver las tablas: User, Provider, Service, Booking, etc.
```

---

## 🧪 Ejecutar Tests (Opcional)

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

---

## 📦 Comandos Útiles

### Docker

```bash
# Ver servicios corriendo
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Reiniciar un servicio
docker-compose restart backend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: borra la DB)
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache
```

### Prisma

```bash
cd backend

# Ver datos en UI
npx prisma studio

# Resetear DB (CUIDADO: borra todos los datos)
npx prisma migrate reset

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Formatear schema
npx prisma format
```

### Git

```bash
# Instalar hooks (después de clonar)
cd backend && npm run prepare
cd ../frontend && npm run prepare

# Saltear hooks (no recomendado)
git commit --no-verify -m "mensaje"
```

---

## 🐛 Problemas Comunes

### Error: "Cannot connect to database"

**Solución (Docker):**
```bash
# Verificar que postgres esté corriendo
docker-compose ps

# Reiniciar postgres
docker-compose restart postgres

# Ver logs
docker-compose logs postgres
```

**Solución (Local):**
```bash
# Verificar PostgreSQL corriendo
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Verificar conexión
psql -U postgres -d altocarwash -c "SELECT 1;"
```

### Error: "Port 3000 already in use"

**Solución:**
```bash
# Encontrar proceso usando puerto
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Matar proceso
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# O cambiar puerto en .env
PORT=3001
```

### Error: "Prisma Client not generated"

**Solución:**
```bash
cd backend
npx prisma generate
npm run build
```

### Error: "Module not found"

**Solución:**
```bash
# Borrar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Frontend no se conecta al Backend

**Verificar:**
1. Backend corriendo en puerto correcto (3000)
2. `NEXT_PUBLIC_API_URL` en frontend/.env.local es correcto
3. CORS habilitado en backend (ya configurado)

---

## 📚 Próximos Pasos

1. **Explorar la aplicación:**
   - Crear cuenta de usuario
   - Buscar carwash en mapa
   - Comparar servicios
   - Hacer una reserva de prueba

2. **Revisar código:**
   - Backend: `backend/src/`
   - Frontend: `frontend/src/app/` (rutas)
   - Componentes: `frontend/src/components/`

3. **Leer documentación:**
   - [README.md](./PROYECTO_README.md) - Overview completo
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía de despliegue
   - [docs/historias_de_usuario.md](./docs/historias_de_usuario.md) - Casos de uso

4. **Desarrollo:**
   - Crear una nueva feature
   - Escribir tests
   - Hacer commit (hooks automáticos de lint/format)
   - Abrir PR (CI/CD automático)

---

## 🆘 Ayuda Adicional

- **Documentación completa:** [PROYECTO_README.md](./PROYECTO_README.md)
- **Issues:** https://github.com/tuusuario/alto-carwash/issues
- **Discord:** [Unirse al servidor](#)
- **Email:** dev@altocarwash.cl

---

**¡Feliz codificación! 🚀**
