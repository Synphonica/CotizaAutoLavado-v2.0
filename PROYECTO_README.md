# 🚗 Alto Carwash - Plataforma de Servicios de Lavado de Autos

<div align="center">

![CI Backend](https://github.com/tuusuario/alto-carwash/workflows/Backend%20CI/badge.svg)
![CI Frontend](https://github.com/tuusuario/alto-carwash/workflows/Frontend%20CI/badge.svg)
[![codecov](https://codecov.io/gh/tuusuario/alto-carwash/branch/main/graph/badge.svg)](https://codecov.io/gh/tuusuario/alto-carwash)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Plataforma completa para búsqueda, comparación y reserva de servicios de lavado de autos en Chile**

[Demo en Vivo](#) | [Documentación](#documentación) | [Reportar Bug](https://github.com/tuusuario/alto-carwash/issues)

</div>

---

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#sobre-el-proyecto)
- [Características Principales](#características-principales)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Inicio Rápido](#inicio-rápido)
- [Desarrollo](#desarrollo)
- [Testing](#testing)
- [Despliegue](#despliegue)
- [Documentación](#documentación)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## 🎯 Sobre el Proyecto

Alto Carwash es una plataforma moderna que conecta usuarios con proveedores de servicios de lavado de autos. Permite:

- 🔍 **Búsqueda avanzada** de carwash por ubicación, servicios y precio
- 📊 **Comparación inteligente** de hasta 3 proveedores lado a lado
- ⭐ **Sistema de reviews** y calificaciones verificadas
- 📅 **Reservas en tiempo real** con confirmación instantánea
- 🤖 **Recomendaciones IA** personalizadas basadas en preferencias
- 📱 **Responsive design** optimizado para móvil, tablet y desktop

---

## ✨ Características Principales

### Para Usuarios

- **Búsqueda Inteligente**
  - Filtros por ubicación (mapa interactivo)
  - Rango de precios personalizable
  - Tipos de servicio (lavado básico, premium, detailing)
  - Disponibilidad en tiempo real

- **Comparación de Servicios**
  - Comparar hasta 3 proveedores simultáneamente
  - Matriz de características y precios
  - Puntuación agregada de reviews
  - Distancia desde ubicación actual

- **Sistema de Reservas**
  - Calendario interactivo con slots disponibles
  - Confirmación instantánea
  - Notificaciones por email
  - Historial de reservas

- **IA Personalizada**
  - Recomendaciones basadas en historial
  - Chat asistente para consultas
  - Análisis de preferencias

### Para Proveedores

- **Dashboard Completo**
  - Gestión de servicios y precios
  - Calendario de disponibilidad
  - Gestión de reservas
  - Analytics y reportes

- **Perfil Optimizado**
  - Galería de fotos
  - Descripción detallada
  - Horarios de atención
  - Ubicación en mapa

- **Comunicación**
  - Notificaciones de nuevas reservas
  - Sistema de reviews y respuestas
  - Estadísticas de visitas

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js 15)                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │   Pages    │  │ Components │  │   State Management     │ │
│  │  Routing   │  │   (UI)     │  │  (React Query/Zustand) │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API + WebSockets
┌───────────────────────────┴─────────────────────────────────┐
│                     BACKEND (NestJS 11)                      │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────────┐ │
│  │  Auth   │ │ Bookings │ │ Search  │ │  AI Assistant    │ │
│  │ (Clerk) │ │  Module  │ │ Module  │ │    (OpenAI)      │ │
│  └─────────┘ └──────────┘ └─────────┘ └──────────────────┘ │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────────┐ │
│  │ Reviews │ │ Providers│ │  Maps   │ │   Notifications  │ │
│  │ Module  │ │  Module  │ │(Google) │ │    (Resend)      │ │
│  └─────────┘ └──────────┘ └─────────┘ └──────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ Prisma ORM
┌───────────────────────────┴─────────────────────────────────┐
│                   DATABASE (PostgreSQL 15)                   │
│                    + RLS (Row Level Security)                │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                      EXTERNAL SERVICES                       │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────────┐  │
│  │ Google Maps  │ │   OpenAI     │ │  Supabase Storage  │  │
│  │     API      │ │   GPT-4o     │ │   (Imágenes)       │  │
│  └──────────────┘ └──────────────┘ └────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tecnologías

### Frontend

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **UI:** [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **Animaciones:** [Framer Motion](https://www.framer.com/motion/) + [GSAP](https://greensock.com/gsap/)
- **State:** [TanStack Query v5](https://tanstack.com/query/latest) (React Query)
- **Forms:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Maps:** [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- **Auth:** [Clerk](https://clerk.com/)

### Backend

- **Framework:** [NestJS 11](https://nestjs.com/) + [Fastify](https://www.fastify.io/)
- **ORM:** [Prisma 6](https://www.prisma.io/)
- **Database:** [PostgreSQL 15](https://www.postgresql.org/)
- **Cache:** [Redis](https://redis.io/) (para rate limiting)
- **Auth:** [Clerk](https://clerk.com/) + JWT
- **Storage:** [Supabase Storage](https://supabase.com/docs/guides/storage)
- **Email:** [Resend](https://resend.com/)
- **AI:** [OpenAI GPT-4o](https://platform.openai.com/)

### DevOps & Testing

- **Testing:** [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/)
- **E2E:** Jest E2E (backend)
- **CI/CD:** [GitHub Actions](https://github.com/features/actions)
- **Containerization:** [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/)
- **Code Quality:** [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)
- **Git Hooks:** [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged)
- **Security:** Trivy (container scanning) + npm audit

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20.x o superior
- PostgreSQL 15 (o usar Docker)
- npm o yarn
- Git

### Opción 1: Con Docker (Recomendado)

```bash
# Clonar repositorio
git clone https://github.com/tuusuario/alto-carwash.git
cd alto-carwash

# Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Editar archivos .env con tus credenciales
# nano backend/.env
# nano frontend/.env.local

# Levantar servicios (PostgreSQL, Backend, Frontend)
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose logs -f

# Acceder a:
# - Frontend: http://localhost:3001
# - Backend: http://localhost:3000
# - Adminer (DB): http://localhost:8080
```

### Opción 2: Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/tuusuario/alto-carwash.git
cd alto-carwash

# Backend
cd backend
cp .env.example .env
# Editar .env con tus credenciales
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed  # (Opcional) Datos de prueba
npm run start:dev

# Frontend (en otra terminal)
cd ../frontend
cp .env.example .env.local
# Editar .env.local con tus credenciales
npm install
npm run dev
```

**Acceder a:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3000/api (si usaste puerto diferente)

---

## 💻 Desarrollo

### Estructura del Proyecto

```
alto-carwash/
├── backend/                 # Backend NestJS
│   ├── prisma/             # Esquema DB y migraciones
│   ├── src/                # Código fuente
│   │   ├── auth/           # Autenticación (Clerk + JWT)
│   │   ├── bookings/       # Gestión de reservas
│   │   ├── providers/      # Gestión de proveedores
│   │   ├── search/         # Búsqueda y filtros
│   │   ├── comparison/     # Comparación de servicios
│   │   ├── reviews/        # Sistema de reviews
│   │   ├── ia/             # Integración OpenAI
│   │   ├── maps/           # Google Maps API
│   │   └── ...
│   └── test/               # Tests E2E
│
├── frontend/               # Frontend Next.js
│   ├── src/
│   │   ├── app/            # Rutas (App Router)
│   │   ├── components/     # Componentes React
│   │   ├── lib/            # Utilidades y API client
│   │   ├── hooks/          # Custom hooks
│   │   └── contexts/       # React contexts
│   └── public/             # Assets estáticos
│
├── scraper/                # Web scraper (datos iniciales)
│   ├── src/
│   │   ├── scrapers/       # Scrapers (Google Maps, Yapo)
│   │   └── importers/      # Importadores a DB
│   └── output/             # CSV/JSON generados
│
├── docs/                   # Documentación
│   ├── plantuml/           # Diagramas UML
│   ├── historias_de_usuario.md
│   └── requerimientos.txt
│
├── .github/
│   └── workflows/          # CI/CD pipelines
│
├── docker-compose.yml      # Producción
├── docker-compose.dev.yml  # Desarrollo
├── DEPLOYMENT.md           # Guía de despliegue
└── README.md               # Este archivo
```

### Scripts Disponibles

#### Backend

```bash
# Desarrollo
npm run start:dev          # Servidor con hot-reload
npm run build              # Build de producción
npm run start:prod         # Servidor producción

# Testing
npm test                   # Tests unitarios
npm run test:watch         # Tests en modo watch
npm run test:cov           # Coverage report
npm run test:e2e           # Tests E2E

# Base de datos
npx prisma studio          # UI para ver DB
npx prisma migrate dev     # Crear migración
npx prisma db seed         # Poblar DB con datos

# Calidad de código
npm run lint               # ESLint
npm run format             # Prettier
npm run check-secrets      # Detectar secrets
```

#### Frontend

```bash
# Desarrollo
npm run dev                # Dev server (Turbopack)
npm run build              # Build producción
npm start                  # Servidor producción

# Testing
npm test                   # Tests unitarios
npm run test:watch         # Tests en modo watch
npm run test:coverage      # Coverage report

# Calidad de código
npm run lint               # ESLint
```

### Variables de Entorno

Ver archivos `.env.example` en cada carpeta para todas las variables necesarias.

**Mínimo requerido:**

**Backend:**
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret para JWT (mínimo 32 caracteres)
- `CLERK_SECRET_KEY`: API key de Clerk
- `GOOGLE_MAPS_API_KEY`: API key de Google Maps

**Frontend:**
- `NEXT_PUBLIC_API_URL`: URL del backend
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Public key de Clerk
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: API key de Google Maps

---

## 🧪 Testing

### Cobertura Actual

- **Backend:** ~92% (líneas, funciones, branches)
- **Frontend:** ~85% (componentes críticos)

### Ejecutar Tests

```bash
# Backend - Todos los tests
cd backend
npm test

# Frontend - Todos los tests
cd frontend
npm test

# Coverage completo
npm run test:cov

# Modo watch (desarrollo)
npm run test:watch

# E2E (solo backend)
cd backend
npm run test:e2e
```

### Escribir Tests

**Backend (Jest):**
```typescript
// src/bookings/__tests__/bookings.service.spec.ts
describe('BookingsService', () => {
  it('should create a booking', async () => {
    const result = await service.create(createBookingDto);
    expect(result).toHaveProperty('id');
  });
});
```

**Frontend (React Testing Library):**
```typescript
// src/components/__tests__/SearchBar.test.tsx
describe('SearchBar', () => {
  it('should render search input', () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
  });
});
```

---

## 🚢 Despliegue

### Producción Recomendada

- **Frontend:** [Vercel](https://vercel.com) (deploy automático desde GitHub)
- **Backend:** [Railway](https://railway.app) o [Render](https://render.com)
- **Database:** [Supabase](https://supabase.com) (PostgreSQL + Storage)

### Guía Completa

Ver **[DEPLOYMENT.md](./DEPLOYMENT.md)** para instrucciones detalladas de:

- ✅ Configuración de variables de entorno
- ✅ Deploy con Docker
- ✅ Deploy en Vercel (frontend)
- ✅ Deploy en Railway/Render (backend)
- ✅ Configuración de PostgreSQL
- ✅ Post-deployment checks
- ✅ Troubleshooting

### Deploy Rápido

```bash
# Frontend en Vercel
cd frontend
npx vercel --prod

# Backend en Railway
railway login
railway init
railway up
```

---

## 📚 Documentación

### Documentos Principales

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía completa de despliegue
- **[SECURITY.md](./backend/SECURITY.md)** - Políticas de seguridad
- **[DIA_1_SEGURIDAD_RESUMEN.md](./DIA_1_SEGURIDAD_RESUMEN.md)** - Implementación seguridad
- **[DIA_2_TESTING_RESUMEN.md](./DIA_2_TESTING_RESUMEN.md)** - Infraestructura de testing
- **[DIA_3_CI_CD_RESUMEN.md](./DIA_3_CI_CD_RESUMEN.md)** - CI/CD y Docker

### Historias de Usuario

Ver `docs/historias_de_usuario.md` para casos de uso completos.

### Diagramas

PlantUML diagrams en `docs/plantuml/`:
- Arquitectura del sistema
- Modelo de datos
- Flujos BPMN
- Diagramas de secuencia

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Guías

- Seguir [Conventional Commits](https://www.conventionalcommits.org/)
- Escribir tests para nuevas features
- Actualizar documentación cuando sea necesario
- Pasar todos los checks de CI/CD

### Code Review

Todos los PRs requieren:
- ✅ Tests pasando (backend y frontend)
- ✅ Coverage >= 50%
- ✅ Lint sin errores
- ✅ Build exitoso
- ✅ Review aprobado por mantenedor

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Equipo

- **Desarrollo:** [Tu Nombre](https://github.com/tuusuario)
- **Diseño:** [Nombre Diseñador]
- **Product Owner:** [Nombre PO]

---

## 🙏 Agradecimientos

- [NestJS](https://nestjs.com/) por el excelente framework backend
- [Next.js](https://nextjs.org/) por el mejor framework React
- [Clerk](https://clerk.com/) por autenticación simple y segura
- [Prisma](https://www.prisma.io/) por el mejor ORM de TypeScript
- [Vercel](https://vercel.com/) por hosting gratuito
- [GitHub](https://github.com/) por CI/CD gratis

---

## 📞 Contacto

- **Email:** contacto@altocarwash.cl
- **Website:** https://altocarwash.cl
- **Twitter:** [@altocarwash](https://twitter.com/altocarwash)
- **GitHub Issues:** [Reportar bug](https://github.com/tuusuario/alto-carwash/issues)

---

<div align="center">

**Hecho con ❤️ en Chile 🇨🇱**

[⬆ Volver arriba](#-alto-carwash---plataforma-de-servicios-de-lavado-de-autos)

</div>
