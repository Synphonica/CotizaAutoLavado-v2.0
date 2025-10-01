# 🚗 Alto Carwash

**Plataforma completa de comparación y reserva de servicios de autolavado en Chile**

Este es un monorepo que contiene tanto el **backend** (NestJS) como el **frontend** (Next.js 15) de Alto Carwash.

---

## 📁 Estructura del Proyecto

```
alto-carwash/
├── 📂 backend/              # API REST con NestJS
│   ├── 🗄️ Base de datos    # PostgreSQL + Prisma
│   ├── 🔐 Autenticación    # Clerk + JWT
│   ├── 🤖 IA Integration   # OpenAI para recomendaciones
│   └── 🗺️ Geolocalización  # Google Maps API
│
├── 📂 frontend/             # Aplicación web con Next.js 15
│   ├── ⚛️ React 19         # Framework de UI
│   ├── 🎨 Tailwind CSS     # Styling moderno
│   ├── 🔐 Clerk Auth       # Sistema de usuarios
│   └── 📱 PWA Ready        # Progressive Web App
│
└── 📄 README.md            # Documentación principal
```

---

## 🚀 Inicio Rápido

### 📋 **Prerrequisitos**
- Node.js 18+
- PostgreSQL 14+
- Git

### ⚡ **Configuración Express (5 minutos)**

#### 1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd alto-carwash
```

#### 2. **Backend**
```bash
cd backend
npm install
cp .env.development .env
# Configurar variables de entorno en .env
npm run start:dev
```

#### 3. **Frontend**
```bash
cd ../frontend
npm install
cp .env.development .env.local
# Configurar Google Maps API key
npm run dev
```

#### 4. **¡Listo!**
- **Backend**: http://localhost:4000
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:4000/api/docs

---

## 🛠️ Stack Tecnológico

### **Backend**
| Tecnología | Propósito |
|------------|-----------|
| ![NestJS](https://img.shields.io/badge/-NestJS-E0234E?logo=nestjs&logoColor=white) | Framework principal |
| ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?logo=postgresql&logoColor=white) | Base de datos |
| ![Prisma](https://img.shields.io/badge/-Prisma-2D3748?logo=prisma&logoColor=white) | ORM |
| ![Clerk](https://img.shields.io/badge/-Clerk-6C47FF?logo=clerk&logoColor=white) | Autenticación |
| ![OpenAI](https://img.shields.io/badge/-OpenAI-412991?logo=openai&logoColor=white) | IA y recomendaciones |

### **Frontend**
| Tecnología | Propósito |
|------------|-----------|
| ![Next.js](https://img.shields.io/badge/-Next.js%2015-000000?logo=next.js&logoColor=white) | Framework React |
| ![React](https://img.shields.io/badge/-React%2019-61DAFB?logo=react&logoColor=black) | UI Library |
| ![Tailwind](https://img.shields.io/badge/-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white) | CSS Framework |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) | Tipado estático |
| ![Framer Motion](https://img.shields.io/badge/-Framer%20Motion-0055FF?logo=framer&logoColor=white) | Animaciones |

---

## 📖 Documentación

### 📚 **Guías Detalladas**
- **[Backend README](backend/README.md)** - Documentación completa del API
- **[Frontend README](frontend/README.md)** - Guía del desarrollo frontend
- **[Backend SETUP](backend/SETUP.md)** - Configuración rápida del backend
- **[Frontend SETUP](frontend/SETUP.md)** - Configuración rápida del frontend

### 🔗 **Enlaces Importantes**
- **[API Documentation](http://localhost:4000/api/docs)** - Swagger/OpenAPI
- **[Maps Setup Guide](frontend/MAPS_SETUP.md)** - Configuración de Google Maps

---

## 🌟 Características Principales

### 🔍 **Para Usuarios**
- ✅ Búsqueda inteligente de autolavados
- ✅ Comparación de precios en tiempo real
- ✅ Mapas interactivos con geolocalización
- ✅ Sistema de reseñas y calificaciones
- ✅ Lista de favoritos personalizada
- ✅ Notificaciones de ofertas especiales

### 🏢 **Para Proveedores**
- ✅ Dashboard completo de gestión
- ✅ Análisis de rendimiento
- ✅ Gestión de servicios y precios
- ✅ Comunicación con clientes
- ✅ Reportes detallados

### 🤖 **Tecnología Avanzada**
- ✅ Recomendaciones con IA
- ✅ Análisis predictivo de demanda
- ✅ Optimización de rutas
- ✅ Alertas de precios inteligentes

---

## 🧪 Testing & Calidad

```bash
# Backend
cd backend
npm run test          # Tests unitarios
npm run test:e2e      # Tests end-to-end
npm run lint          # Verificar código

# Frontend  
cd frontend
npm run test          # Tests de componentes
npm run lint          # Verificar código
npm run build         # Verificar build
```

---

## 🚀 Despliegue

### ☁️ **Producción**

#### **Backend**
- **Railway** / **Render** / **DigitalOcean**
- Variables de entorno configuradas
- PostgreSQL en la nube
- CI/CD con GitHub Actions

#### **Frontend**
- **Vercel** (recomendado)
- **Netlify** / **Railway**
- Variables de entorno configuradas
- Deploy automático desde Git

### 🐳 **Docker**
```bash
# Backend
cd backend
docker build -t alto-carwash-backend .
docker run -p 4000:4000 alto-carwash-backend

# Frontend
cd frontend
docker build -t alto-carwash-frontend .
docker run -p 3000:3000 alto-carwash-frontend
```

---

## 🤝 Contribuir al Proyecto

### 🔄 **Flujo de Desarrollo**

1. **Fork** el repositorio
2. **Crear rama** feature: `git checkout -b feature/nueva-funcionalidad`
3. **Hacer commits** descriptivos: `git commit -m "feat: agregar búsqueda por categorías"`
4. **Push** a la rama: `git push origin feature/nueva-funcionalidad`
5. **Crear Pull Request**

### 📋 **Estándares**
- **Conventional Commits** para mensajes
- **TypeScript** con strict mode
- **ESLint + Prettier** para formateo
- **Tests** requeridos para nuevas features
- **Documentación** actualizada

---

## 👥 Equipo de Desarrollo

| Rol | Responsabilidades |
|-----|------------------|
| **Full-Stack Lead** | Arquitectura general y coordinación |
| **Backend Developer** | API, base de datos y lógica de negocio |
| **Frontend Developer** | UI/UX y experiencia del usuario |
| **DevOps Engineer** | Infraestructura y despliegue |
| **QA Engineer** | Testing y aseguramiento de calidad |

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver [LICENSE](LICENSE) para más detalles.

---

## 🆘 Soporte

¿Tienes preguntas o problemas?

- 📖 **Documentación**: Revisa los README específicos
- 🐛 **Issues**: Crea un issue en GitHub
- 💬 **Discusiones**: Usa GitHub Discussions
- 📧 **Contacto**: equipo@altocarwash.cl

---

## 🗺️ Roadmap

### 🎯 **Versión Actual (v1.0)**
- ✅ Búsqueda básica y comparación
- ✅ Autenticación de usuarios
- ✅ Mapas y geolocalización
- ✅ Sistema de reseñas

### 🚀 **Próximas Versiones**
- 🔄 **v1.1**: Reservas online
- 🔄 **v1.2**: Pagos integrados
- 🔄 **v1.3**: App móvil nativa
- 🔄 **v2.0**: IA avanzada y analytics

---

**¡Construyamos juntos el futuro de los autolavados en Chile!** 🚗✨

```bash
# ¡Empezar es fácil!
git clone <url-del-repositorio>
cd alto-carwash
# Seguir las guías de setup en backend/ y frontend/
```