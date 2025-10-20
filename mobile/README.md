# Alto Carwash - Aplicación Móvil

Aplicación móvil nativa desarrollada con React Native y Expo para la plataforma de comparación de precios de servicios automotrices Alto Carwash.

## 🚀 Tecnologías Utilizadas

- **React Native** con TypeScript
- **Expo SDK 54**
- **React Navigation** para navegación
- **React Query** para manejo de estado y cache
- **Expo Maps & Location** para geolocalización y mapas
- **Axios** para comunicación con API

## 📱 Características

### Funcionalidades Principales
- **Búsqueda de Servicios**: Encuentra servicios automotrices por categoría o texto libre
- **Geolocalización**: Detecta automáticamente tu ubicación para mostrar proveedores cercanos
- **Vista de Mapa**: Visualiza proveedores en un mapa interactivo con marcadores
- **Comparación de Precios**: Compara precios y servicios de diferentes proveedores
- **Navegación Intuitiva**: Navegación por pestañas con acceso rápido a funciones principales

### Pantallas Implementadas
- **Inicio**: Búsqueda principal, categorías populares y accesos rápidos
- **Resultados**: Lista de proveedores filtrados por búsqueda y ubicación
- **Mapa**: Vista interactiva con ubicación del usuario y proveedores cercanos
- **Perfil**: Información del usuario, configuraciones y estadísticas

## 🛠️ Instalación y Desarrollo

### Prerrequisitos
- Node.js (versión 20.19.4 o superior)
- npm o yarn
- Expo CLI
- Backend de Alto Carwash ejecutándose en `localhost:4000`

### Instalación
```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

### Comandos Disponibles
```bash
# Desarrollo
npm start          # Iniciar Expo Dev Server
npm run android    # Ejecutar en Android
npm run ios        # Ejecutar en iOS (requiere macOS)
npm run web        # Ejecutar en navegador web

# Compilación
npm run build      # Crear build de producción
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── constants/          # Constantes (colores, API endpoints)
├── hooks/              # Custom hooks (useLocation, etc.)
├── navigation/         # Configuración de navegación
├── screens/            # Pantallas de la aplicación
├── services/           # Servicios API y comunicación con backend
├── types/              # Definiciones de TypeScript
└── utils/              # Utilidades y helpers
```

## 🎨 Paleta de Colores

La aplicación utiliza la paleta de colores oficial de Alto Carwash:

- **Primario**: `#2563EB` (Azul principal)
- **Secundario**: `#F59E0B` (Naranja)
- **Éxito**: `#10B981` (Verde)
- **Fondo**: `#FFFFFF` (Blanco)
- **Superficie**: `#F8FAFC` (Gris claro)

## 🔗 Integración con Backend

La aplicación se conecta al backend de Alto Carwash a través de:
- **Base URL**: `http://localhost:4000`
- **Endpoints principales**:
  - `/services/search` - Búsqueda de servicios
  - `/providers/nearby` - Proveedores cercanos
  - `/providers/{id}` - Detalles de proveedor

## 📋 Funcionalidades Pendientes

### Fase 1 - Básico ✅
- [x] Configuración inicial del proyecto
- [x] Estructura de carpetas y navegación
- [x] Pantallas principales (Inicio, Resultados, Mapa, Perfil)
- [x] Integración con API del backend
- [x] Geolocalización básica

### Fase 2 - Intermedio 🚧
- [ ] Pantalla de detalles de proveedor
- [ ] Sistema de favoritos
- [ ] Historial de búsquedas
- [ ] Filtros avanzados de búsqueda
- [ ] Notificaciones push

### Fase 3 - Avanzado 📅
- [ ] Autenticación de usuarios
- [ ] Sistema de reseñas y calificaciones
- [ ] Chat o comunicación con proveedores
- [ ] Compartir servicios en redes sociales
- [ ] Modo oscuro

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test
```

## 🚀 Deployment

### Desarrollo
La aplicación puede ejecutarse en:
- **Expo Go** (desarrollo rápido)
- **Emulador Android/iOS**
- **Dispositivo físico** via Expo Dev Client

### Producción
Para compilar la aplicación para las tiendas:
```bash
# Build para Android (APK/AAB)
eas build --platform android

# Build para iOS (IPA)
eas build --platform ios
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## 📄 Licencia

Este proyecto es parte del sistema Alto Carwash y está sujeto a los términos de uso correspondientes.

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---

**Alto Carwash Mobile App** - Encuentra y compara los mejores servicios para tu vehículo 🚗✨