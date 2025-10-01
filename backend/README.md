# 🚗 Alto Carwash Backend

**API REST completa** construida con NestJS para la plataforma de comparación de autolavados más avanzada de Chile.

> **¡Bienvenido al equipo!** Este README te guiará paso a paso para entender y configurar todo el backend de Alto Carwash.

---

## 📋 Tabla de Contenidos

- [🎯 ¿Qué es Alto Carwash?](#-qué-es-alto-carwash)
- [🏗️ Arquitectura del Sistema](#️-arquitectura-del-sistema)
- [🚀 Stack Tecnológico](#-stack-tecnológico)
- [📦 Instalación y Configuración](#-instalación-y-configuración)
- [🗃️ Base de Datos](#️-base-de-datos)
- [🔐 Sistema de Autenticación](#-sistema-de-autenticación)
- [📡 API Endpoints](#-api-endpoints)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🧪 Testing](#-testing)
- [🚀 Despliegue](#-despliegue)
- [🔧 Comandos Útiles](#-comandos-útiles)
- [❓ Troubleshooting](#-troubleshooting)

---

## 🎯 ¿Qué es Alto Carwash?

Alto Carwash es una **plataforma digital** que conecta a propietarios de vehículos con servicios de autolavado, permitiendo:

- **Comparar precios** en tiempo real
- **Buscar por ubicación** con geolocalización
- **Leer reseñas reales** de otros usuarios
- **Reservar servicios** fácilmente
- **Gestionar favoritos** y historial
- **Análisis inteligente** con IA

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ External APIs   │
                    │ • Google Maps   │
                    │ • OpenAI        │
                    │ • Clerk Auth    │
                    └─────────────────┘
```

---

## 🚀 Stack Tecnológico

| Categoría | Tecnología | Propósito |
|-----------|------------|-----------|
| **Framework** | ![NestJS](https://img.shields.io/badge/-NestJS-E0234E?logo=nestjs&logoColor=white) | Framework principal del backend |
| **Base de Datos** | ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?logo=postgresql&logoColor=white) | Base de datos principal |
| **ORM** | ![Prisma](https://img.shields.io/badge/-Prisma-2D3748?logo=prisma&logoColor=white) | Mapeo objeto-relacional |
| **Autenticación** | ![Clerk](https://img.shields.io/badge/-Clerk-6C47FF?logo=clerk&logoColor=white) | Gestión de usuarios |
| **Documentación** | ![Swagger](https://img.shields.io/badge/-Swagger-85EA2D?logo=swagger&logoColor=black) | API Documentation |
| **Validación** | class-validator | Validación de datos |
| **Testing** | ![Jest](https://img.shields.io/badge/-Jest-C21325?logo=jest&logoColor=white) | Framework de testing |
| **AI** | ![OpenAI](https://img.shields.io/badge/-OpenAI-412991?logo=openai&logoColor=white) | Funciones de inteligencia artificial |

---

## 📦 Instalación y Configuración

### 📋 Prerrequisitos

Antes de empezar, asegúrate de tener instalado:

- **Node.js 18+** ([Descargar](https://nodejs.org/))
- **PostgreSQL 14+** ([Descargar](https://www.postgresql.org/download/))
- **npm** o **yarn**
- **Git** ([Descargar](https://git-scm.com/))

### 🔧 Configuración Inicial

#### 1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd alto-carwash/backend
```

#### 2. **Instalar dependencias**
```bash
npm install
# o con yarn
yarn install
```

#### 3. **Configurar variables de entorno**
```bash
# Copiar el archivo de ejemplo
cp .env.development .env

# Editar con tus credenciales
nano .env  # o con tu editor favorito
```

#### 4. **Configurar base de datos**
```bash
# Ejecutar migraciones
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# (Opcional) Poblar con datos de prueba
npx prisma db seed
```

#### 5. **Iniciar el servidor**
```bash
npm run start:dev
```

¡Tu servidor estará corriendo en `http://localhost:4000`! 🎉

---

## 🗃️ Base de Datos

### 🎨 Esquema Principal

Nuestro esquema de base de datos incluye:

```sql
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │   Service   │    │   Review    │
│━━━━━━━━━━━━━│    │━━━━━━━━━━━━━│    │━━━━━━━━━━━━━│
│ id          │    │ id          │    │ id          │
│ email       │◄──►│ name        │◄──►│ rating      │
│ name        │    │ price       │    │ comment     │
│ avatar      │    │ location    │    │ userId      │
│ createdAt   │    │ providerId  │    │ serviceId   │
└─────────────┘    │ category    │    └─────────────┘
                   │ features    │
                   └─────────────┘
```

### 📊 Modelos Principales

- **User**: Usuarios de la plataforma
- **Provider**: Proveedores de servicios
- **Service**: Servicios de autolavado
- **Review**: Reseñas y calificaciones
- **Favorite**: Lista de favoritos del usuario
- **Notification**: Sistema de notificaciones
- **SearchHistory**: Historial de búsquedas

### 🔄 Migraciones

```bash
# Crear una nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Resetear la base de datos (¡Cuidado!)
npx prisma migrate reset
```

---

## 🔐 Sistema de Autenticación

### 🎭 Métodos de Autenticación

1. **Clerk Authentication** (Principal)
   - OAuth con Google, GitHub, etc.
   - Gestión completa de usuarios
   - Webhooks automáticos

2. **JWT Tokens** (Interno)
   - Para comunicación entre servicios
   - Tokens de sesión personalizados

### 🛡️ Middleware de Seguridad

```typescript
// Guards implementados:
@UseGuards(AuthGuard)          // Autenticación requerida
@UseGuards(RolesGuard)         // Control de roles
@UseGuards(ThrottlerGuard)     // Rate limiting
```

### 🔑 Roles del Sistema

- **USER**: Usuario final (busca servicios)
- **PROVIDER**: Proveedor de servicios
- **ADMIN**: Administrador de la plataforma

---

## 📡 API Endpoints

### 🔍 Documentación Interactiva

La documentación completa está disponible en: **`http://localhost:4000/api/docs`**

### 📋 Endpoints Principales

#### 🔐 **Autenticación**
```http
POST   /auth/login              # Iniciar sesión
POST   /auth/register           # Registrarse
POST   /auth/refresh            # Refrescar token
DELETE /auth/logout             # Cerrar sesión
```

#### 👤 **Usuarios**
```http
GET    /users/profile           # Obtener perfil
PUT    /users/profile           # Actualizar perfil
GET    /users/favorites         # Lista de favoritos
POST   /users/favorites/:id     # Agregar favorito
DELETE /users/favorites/:id     # Eliminar favorito
```

#### 🚗 **Servicios**
```http
GET    /services                # Listar servicios (con filtros)
GET    /services/:id            # Obtener servicio específico
POST   /services/search         # Búsqueda avanzada
GET    /services/compare        # Comparar múltiples servicios
POST   /services                # Crear servicio (PROVIDER)
PUT    /services/:id            # Actualizar servicio (PROVIDER)
```

#### 🔍 **Búsqueda**
```http
POST   /search/services         # Búsqueda con filtros
GET    /search/suggestions      # Sugerencias de búsqueda
GET    /search/trending         # Búsquedas populares
POST   /search/nearby           # Servicios cercanos
```

#### ⭐ **Reseñas**
```http
GET    /reviews/service/:id     # Reseñas de un servicio
POST   /reviews                 # Crear reseña
PUT    /reviews/:id             # Actualizar reseña
DELETE /reviews/:id             # Eliminar reseña
```

#### 📊 **Análisis**
```http
GET    /analytics/stats         # Estadísticas generales
GET    /analytics/trending      # Servicios trending
POST   /analytics/ai-insights   # Insights con IA
```

---

## 📁 Estructura del Proyecto

```
src/
├── 📄 app.module.ts            # Módulo principal de la aplicación
├── 📄 main.ts                  # Punto de entrada del servidor
│
├── 📂 aggregator/              # 🔄 Agregación de datos externos
│   ├── controllers/
│   ├── services/
│   └── dto/
│
├── 📂 analytics/               # 📊 Análisis y estadísticas
│   ├── controllers/
│   ├── services/
│   └── entities/
│
├── 📂 auth/                    # 🔐 Sistema de autenticación
│   ├── controllers/            # - auth.controller.ts
│   ├── services/               # - auth.service.ts
│   ├── guards/                 # - jwt.guard.ts, roles.guard.ts
│   ├── strategies/             # - jwt.strategy.ts
│   └── dto/                    # - login.dto.ts, register.dto.ts
│
├── 📂 comparison/              # ⚖️ Comparación de servicios
│   ├── controllers/
│   ├── services/
│   └── dto/
│
├── 📂 email/                   # 📧 Gestión de emails
│   ├── services/
│   └── templates/
│
├── 📂 favorites/               # ❤️ Sistema de favoritos
│   ├── controllers/
│   ├── services/
│   └── entities/
│
├── 📂 health/                  # 🏥 Health checks
│   └── health.controller.ts
│
├── 📂 ia/                      # 🤖 Funciones de IA
│   ├── services/
│   └── dto/
│
├── 📂 maps/                    # 🗺️ Geolocalización
│   ├── services/
│   └── dto/
│
├── 📂 notifications/           # 🔔 Sistema de notificaciones
│   ├── controllers/
│   ├── services/
│   └── entities/
│
├── 📂 prisma/                  # 🗄️ Configuración de Prisma
│   ├── prisma.service.ts
│   └── prisma.module.ts
│
├── 📂 providers/               # 🏢 Gestión de proveedores
│   ├── controllers/
│   ├── services/
│   └── entities/
│
├── 📂 reviews/                 # ⭐ Sistema de reseñas
│   ├── controllers/
│   ├── services/
│   └── entities/
│
├── 📂 search/                  # 🔍 Motor de búsqueda
│   ├── controllers/
│   ├── services/
│   └── dto/
│
├── 📂 services/                # 🚗 Gestión de servicios
│   ├── controllers/            # - services.controller.ts
│   ├── services/               # - services.service.ts
│   ├── entities/               # - service.entity.ts
│   └── dto/                    # - create-service.dto.ts
│
├── 📂 upload/                  # 📎 Upload de archivos
│   ├── controllers/
│   ├── services/
│   └── interceptors/
│
└── 📂 users/                   # 👥 Gestión de usuarios
    ├── controllers/            # - users.controller.ts
    ├── services/               # - users.service.ts
    ├── entities/               # - user.entity.ts
    └── dto/                    # - user-response.dto.ts
```

### 🎯 Patrones de Arquitectura

- **Módulos**: Cada funcionalidad está en su propio módulo
- **Controllers**: Manejan las requests HTTP
- **Services**: Contienen la lógica de negocio
- **DTOs**: Data Transfer Objects para validación
- **Entities**: Representan las tablas de la base de datos
- **Guards**: Middleware para autenticación y autorización

---

## 🧪 Testing

### 📋 Tipos de Tests

```bash
# Tests unitarios (servicios individuales)
npm run test

# Tests con watch mode (desarrollo)
npm run test:watch

# Tests end-to-end (flujos completos)
npm run test:e2e

# Cobertura de código
npm run test:cov
```

### 🎯 Cobertura Objetivo

- **Servicios**: >90%
- **Controllers**: >80%
- **E2E**: Flujos principales cubiertos

### 🧪 Estructura de Tests

```
test/
├── unit/                       # Tests unitarios
│   ├── auth.service.spec.ts
│   ├── users.service.spec.ts
│   └── services.service.spec.ts
│
├── e2e/                        # Tests end-to-end
│   ├── auth.e2e-spec.ts
│   ├── services.e2e-spec.ts
│   └── app.e2e-spec.ts
│
└── fixtures/                   # Datos de prueba
    ├── users.fixture.ts
    └── services.fixture.ts
```

---

## 🚀 Despliegue

### 🐳 Docker (Recomendado)

```dockerfile
# Dockerfile incluido en el proyecto
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 4000
CMD ["npm", "run", "start:prod"]
```

```bash
# Construir imagen
docker build -t alto-carwash-backend .

# Ejecutar contenedor
docker run -p 4000:4000 --env-file .env alto-carwash-backend
```

### ☁️ Plataformas de Deploy

- **Railway**: Deploy automático desde Git
- **Render**: Free tier disponible
- **DigitalOcean**: App Platform
- **AWS**: ECS o Elastic Beanstalk
- **Vercel**: Función serverless

---

## 🔧 Comandos Útiles

### 🗄️ **Base de Datos**
```bash
# Abrir interfaz visual
npx prisma studio

# Ver estado de migraciones
npx prisma migrate status

# Resetear base de datos completa
npx prisma migrate reset

# Generar cliente después de cambios
npx prisma generate
```

### 🔍 **Desarrollo**
```bash
# Servidor con hot-reload
npm run start:dev

# Servidor con debug
npm run start:debug

# Construir para producción
npm run build

# Ejecutar en modo producción
npm run start:prod
```

### 🧹 **Code Quality**
```bash
# Verificar código
npm run lint

# Corregir problemas automáticamente
npm run lint:fix

# Formatear código
npm run format
```

---

## ❓ Troubleshooting

### 🚨 Problemas Comunes

#### **Error: Cannot connect to database**
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar DATABASE_URL en .env
echo $DATABASE_URL

# Probar conexión
npx prisma db push
```

#### **Error: Module not found**
```bash
# Limpiar e instalar dependencias
rm -rf node_modules package-lock.json
npm install

# Regenerar cliente Prisma
npx prisma generate
```

#### **Error: Port 4000 already in use**
```bash
# Encontrar proceso usando el puerto
lsof -i :4000

# Matar proceso específico
kill -9 <PID>

# O cambiar puerto en .env
PORT=4001
```

#### **Error: Unauthorized - Invalid token**
```bash
# Verificar JWT_SECRET en .env
# Verificar que el token no haya expirado
# Regenerar token si es necesario
```

### 📞 **Obtener Ayuda**

1. **Consultar la documentación**: `http://localhost:4000/api/docs`
2. **Revisar logs**: `npm run start:dev` (modo verbose)
3. **Consultar Issues**: En el repositorio de GitHub
4. **Preguntar al equipo**: En el canal de Slack/Discord

---

## 🤝 Contribuciones

### 📝 **Flujo de Desarrollo**

1. **Crear rama feature**
```bash
git checkout -b feature/nueva-funcionalidad
```

2. **Hacer commits descriptivos**
```bash
git commit -m "feat: agregar endpoint de comparación de servicios"
```

3. **Ejecutar tests antes del push**
```bash
npm run test
npm run test:e2e
```

4. **Crear Pull Request** con descripción detallada

### 🎯 **Estándares de Código**

- **TypeScript**: Strict mode habilitado
- **ESLint**: Configuración de NestJS
- **Prettier**: Formateo automático
- **Conventional Commits**: Para mensajes de commit
- **Tests**: Requeridos para nuevas funcionalidades

---

## 🏆 **Créditos del Equipo**

Desarrollado con ❤️ por el equipo de Alto Carwash:

- **Backend Lead**: [Tu Nombre]
- **DevOps**: [Nombre del DevOps]
- **QA**: [Nombre del QA]

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver [LICENSE](LICENSE) para más detalles.

---

¿Tienes preguntas? ¡No dudes en preguntar al equipo! 🚀
