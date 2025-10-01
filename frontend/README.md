# 🚗 Alto Carwash Frontend

**Aplicación web moderna** construida con Next.js 15 para la plataforma de comparación de autolavados más innovadora de Chile.

> **¡Bienvenido al equipo!** Este README te ayudará a configurar y entender toda la interfaz de usuario de Alto Carwash.

---

## 📋 Tabla de Contenidos

- [🎯 ¿Qué es Alto Carwash Frontend?](#-qué-es-alto-carwash-frontend)
- [🚀 Stack Tecnológico](#-stack-tecnológico)
- [📦 Instalación y Configuración](#-instalación-y-configuración)
- [🏗️ Arquitectura del Frontend](#️-arquitectura-del-frontend)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🎨 Componentes Principales](#-componentes-principales)
- [🗺️ Rutas y Navegación](#️-rutas-y-navegación)
- [🔐 Autenticación](#-autenticación)
- [🧪 Testing](#-testing)
- [🚀 Despliegue](#-despliegue)
- [🔧 Comandos Útiles](#-comandos-útiles)
- [❓ Troubleshooting](#-troubleshooting)

---

## 🎯 ¿Qué es Alto Carwash Frontend?

El frontend de Alto Carwash es una **Progressive Web App (PWA)** que ofrece:

- **🔍 Búsqueda inteligente** de servicios de autolavado
- **🗺️ Mapas interactivos** con geolocalización
- **💰 Comparación de precios** en tiempo real
- **⭐ Sistema de reseñas** y calificaciones
- **❤️ Lista de favoritos** personalizada
- **🔔 Notificaciones** push en tiempo real
- **📱 Diseño responsivo** para móviles y desktop
- **⚡ Rendimiento optimizado** con Next.js 15

---

## 🚀 Stack Tecnológico

| Categoría | Tecnología | Propósito |
|-----------|------------|-----------|
| **Framework** | ![Next.js](https://img.shields.io/badge/-Next.js%2015-000000?logo=next.js&logoColor=white) | Framework React con SSR/SSG |
| **React** | ![React](https://img.shields.io/badge/-React%2019-61DAFB?logo=react&logoColor=black) | Librería de UI |
| **Styling** | ![Tailwind](https://img.shields.io/badge/-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white) | Framework de CSS utilitario |
| **UI Components** | ![Shadcn](https://img.shields.io/badge/-shadcn/ui-000000?logo=shadcnui&logoColor=white) | Componentes reutilizables |
| **Animaciones** | ![Framer](https://img.shields.io/badge/-Framer%20Motion-0055FF?logo=framer&logoColor=white) | Animaciones fluidas |
| **Autenticación** | ![Clerk](https://img.shields.io/badge/-Clerk-6C47FF?logo=clerk&logoColor=white) | Gestión de usuarios |
| **Mapas** | ![Google Maps](https://img.shields.io/badge/-Google%20Maps-4285F4?logo=google-maps&logoColor=white) | Mapas y geolocalización |
| **Icons** | ![Lucide](https://img.shields.io/badge/-Lucide%20Icons-000000?logo=lucide&logoColor=white) | Iconografía moderna |
| **TypeScript** | ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) | Tipado estático |

---

## 📦 Instalación y Configuración

### 📋 Prerrequisitos

- **Node.js 18+** ([Descargar](https://nodejs.org/))
- **npm** o **yarn**
- **Backend corriendo** en `http://localhost:4000`

### 🔧 Configuración Inicial

#### 1. **Clonar e instalar dependencias**
```bash
# Si no lo has clonado ya
git clone <url-del-repositorio>
cd alto-carwash/frontend

# Instalar dependencias
npm install
```

#### 2. **Configurar variables de entorno**
```bash
# Copiar el archivo de desarrollo
cp .env.development .env.local

# Editar con tus credenciales
# Especialmente Google Maps API Key
```

#### 3. **Configurar Google Maps (IMPORTANTE)**
```bash
# En .env.local, agregar tu API Key:
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="tu_api_key_aqui"
```

> **📝 Nota:** Sin Google Maps API Key, los mapas no funcionarán. Ver [MAPS_SETUP.md](MAPS_SETUP.md) para instrucciones detalladas.

#### 4. **Iniciar el servidor**
```bash
npm run dev
```

¡La aplicación estará corriendo en `http://localhost:3000`! 🎉

---

## 🏗️ Arquitectura del Frontend

```
┌─────────────────────────────────────────────────────────────┐
│                    Alto Carwash Frontend                     │
├─────────────────────┬───────────────────┬───────────────────┤
│    Presentation     │     Business      │      Data         │
│       Layer         │      Logic        │      Layer        │
├─────────────────────┼───────────────────┼───────────────────┤
│                     │                   │                   │
│  🎨 Components      │  🔄 Contexts      │  📡 API Calls     │
│  • SearchBar        │  • Auth Context   │  • lib/api.ts     │
│  • ServiceCard      │  • Map Context    │  • fetch calls    │
│  • MapView          │  • Theme Context  │                   │
│  • Navbar           │                   │                   │
│                     │  🪝 Hooks         │  🗄️ State Mgmt   │
│  📱 Pages           │  • useAuth        │  • React State    │
│  • Home (/)         │  • useSearch      │  • Local Storage  │
│  • Search Results  │  • useMap         │  • Session Mgmt   │
│  • Service Detail  │  • useGeoloc      │                   │
│  • Dashboard        │                   │                   │
│                     │  🛡️ Middleware    │  🔔 Real-time     │
│  🎭 Layouts         │  • Auth Guard     │  • WebSockets     │
│  • RootLayout       │  • Route Guard    │  • Notifications  │
│  • DashboardLayout  │                   │                   │
│                     │                   │                   │
└─────────────────────┴───────────────────┴───────────────────┘
```

---

## 📁 Estructura del Proyecto

```
src/
├── 📄 middleware.ts              # Middleware de autenticación
│
├── 📂 app/                       # App Router (Next.js 15)
│   ├── 📄 layout.tsx            # Layout principal
│   ├── 📄 page.tsx              # Página de inicio
│   ├── 📄 globals.css           # Estilos globales
│   │
│   ├── 📂 (auth)/               # Rutas de autenticación
│   │   ├── 📂 sign-in/
│   │   └── 📂 sign-up/
│   │
│   ├── 📂 dashboard/            # Dashboard del usuario
│   │   └── 📄 page.tsx
│   │
│   ├── 📂 map/                  # Vista de mapa
│   │   └── 📄 page.tsx
│   │
│   ├── 📂 results/              # Resultados de búsqueda
│   │   └── 📄 page.tsx
│   │
│   ├── 📂 services/             # Detalles de servicios
│   │   └── 📂 [id]/
│   │       └── 📄 page.tsx
│   │
│   ├── 📂 compare/              # Comparación de servicios
│   │   └── 📄 page.tsx
│   │
│   ├── 📂 provider/             # Dashboard de proveedores
│   │   └── 📄 page.tsx
│   │
│   └── 📂 user/                 # Perfil de usuario
│       └── 📄 page.tsx
│
├── 📂 components/               # Componentes reutilizables
│   ├── 📄 Navbar.tsx           # Navegación principal
│   ├── 📄 SearchBar.tsx        # Barra de búsqueda
│   ├── 📄 ServiceCard.tsx      # Tarjeta de servicio
│   ├── 📄 MapView.tsx          # Componente de mapa
│   ├── 📄 FilterPill.tsx       # Filtros de búsqueda
│   ├── 📄 Footer.tsx           # Pie de página
│   │
│   └── 📂 ui/                  # Componentes base (shadcn/ui)
│       ├── 📄 button.tsx
│       ├── 📄 card.tsx
│       ├── 📄 input.tsx
│       ├── 📄 avatar.tsx
│       └── 📄 tabs.tsx
│
├── 📂 contexts/                # Contextos de React
│   └── 📄 MapProviderContext.tsx
│
├── 📂 hooks/                   # Custom hooks
│   └── 📄 useAuth.ts
│
└── 📂 lib/                     # Utilidades y configuración
    ├── 📄 api.ts               # Cliente de API
    └── 📄 utils.ts             # Funciones utilitarias
```

---

## 🎨 Componentes Principales

### 🔍 **SearchBar**
```typescript
// Búsqueda inteligente con autocompletado
<SearchBar 
  onSearch={handleSearch}
  placeholder="Buscar autolavados cerca..."
  showFilters={true}
/>
```

### 🗺️ **MapView**
```typescript
// Mapa interactivo con marcadores
<MapView 
  services={services}
  center={userLocation}
  onServiceClick={handleServiceClick}
/>
```

### 🚗 **ServiceCard**
```typescript
// Tarjeta de servicio con información clave
<ServiceCard 
  service={service}
  showDistance={true}
  onFavorite={toggleFavorite}
/>
```

### 🧭 **Navbar**
```typescript
// Navegación principal con autenticación
<Navbar 
  user={user}
  onSignOut={handleSignOut}
  notifications={notifications}
/>
```

---

## 🗺️ Rutas y Navegación

| Ruta | Descripción | Protegida |
|------|-------------|-----------|
| `/` | Página de inicio con búsqueda | ❌ |
| `/sign-in` | Iniciar sesión | ❌ |
| `/sign-up` | Registrarse | ❌ |
| `/results` | Resultados de búsqueda | ❌ |
| `/services/[id]` | Detalle de servicio | ❌ |
| `/map` | Vista de mapa | ❌ |
| `/compare` | Comparar servicios | ❌ |
| `/dashboard` | Dashboard usuario | ✅ |
| `/user` | Perfil de usuario | ✅ |
| `/provider` | Dashboard proveedor | ✅ |

### 🛡️ **Rutas Protegidas**
```typescript
// middleware.ts - Protege rutas automáticamente
export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up", "/results", "/services/:id", "/map", "/compare"],
  ignoredRoutes: ["/api/webhook"]
});
```

---

## 🔐 Autenticación

### 🎭 **Clerk Integration**

```typescript
// Componente protegido
import { useUser } from "@clerk/nextjs";

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  
  if (!isLoaded || !isSignedIn) {
    return <div>Cargando...</div>;
  }
  
  return <DashboardContent user={user} />;
}
```

### 🔑 **Roles del Sistema**
- **USER**: Usuario final (busca servicios)
- **PROVIDER**: Proveedor de servicios
- **ADMIN**: Administrador de la plataforma

---

## 🧪 Testing

### 📋 Comandos de Testing
```bash
# Tests unitarios
npm run test

# Tests con watch mode
npm run test:watch

# Tests end-to-end (si están configurados)
npm run test:e2e

# Cobertura de código
npm run test:coverage
```

### 🎯 **Estrategia de Testing**
- **Unit Tests**: Componentes individuales
- **Integration Tests**: Flujos de usuario
- **E2E Tests**: Funcionalidades críticas
- **Visual Regression**: Cambios en UI

---

## 🚀 Despliegue

### ☁️ **Vercel (Recomendado)**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 🐳 **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 📋 **Variables de Entorno en Producción**
Asegúrate de configurar en tu plataforma de deploy:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_API_BASE`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

---

## 🔧 Comandos Útiles

### 🏃 **Desarrollo**
```bash
# Servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar servidor de producción
npm start

# Verificar build
npm run lint
```

### 🎨 **UI y Styling**
```bash
# Agregar nuevo componente shadcn/ui
npx shadcn-ui@latest add button

# Verificar Tailwind
npx tailwindcss -i ./src/app/globals.css -o ./dist/output.css --watch
```

---

## ❓ Troubleshooting

### 🚨 **Problemas Comunes**

#### **Error: Google Maps no carga**
```bash
# Verificar API Key en .env.local
echo $NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Verificar que la API Key tenga permisos para:
# - Maps JavaScript API
# - Places API
# - Geocoding API
```

#### **Error: Cannot connect to backend**
```bash
# Verificar que el backend esté corriendo
curl http://localhost:4000/api/health

# Verificar variable NEXT_PUBLIC_API_BASE
echo $NEXT_PUBLIC_API_BASE
```

#### **Error: Clerk authentication failed**
```bash
# Verificar claves en .env.local
# Verificar que las claves coincidan con el dashboard de Clerk
# Verificar dominios autorizados en Clerk
```

#### **Error: Build failed**
```bash
# Limpiar caché de Next.js
rm -rf .next

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Verificar tipos de TypeScript
npm run type-check
```

### 📞 **Obtener Ayuda**

1. **Revisar logs**: `npm run dev` (modo verbose)
2. **Consultar documentación**: Next.js, Clerk, Tailwind
3. **Issues del proyecto**: En GitHub
4. **Contactar al equipo**: Canal de desarrollo

---

## 🤝 Contribuciones

### 📝 **Flujo de Desarrollo**

1. **Crear rama feature**
```bash
git checkout -b feature/nueva-funcionalidad-ui
```

2. **Desarrollo con hot-reload**
```bash
npm run dev
```

3. **Verificar antes del commit**
```bash
npm run lint
npm run build
npm run test
```

4. **Commit con mensaje descriptivo**
```bash
git commit -m "feat(ui): agregar componente de comparación de servicios"
```

### 🎯 **Estándares de Código**
- **React 19**: Hooks y componentes funcionales
- **TypeScript**: Strict mode
- **Tailwind CSS**: Utility-first
- **ESLint + Prettier**: Formateo automático
- **Responsive Design**: Mobile-first

---

## 🏆 **Créditos del Equipo**

Desarrollado con ❤️ por el equipo de Alto Carwash:

- **Frontend Lead**: [Tu Nombre]
- **UI/UX Designer**: [Nombre del Designer]
- **Backend Integration**: [Nombre del Backend Dev]

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver [LICENSE](../LICENSE) para más detalles.

---

**¿Listo para comenzar?** 🚀

```bash
npm run dev
```

¡Abre http://localhost:3000 y empieza a construir el futuro de los autolavados! 💪
