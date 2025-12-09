# Cotiza Auto Lavado - Mobile App

Aplicación móvil React Native con Expo para buscar, comparar y reservar servicios de autolavado.

## 🚀 Características

- 📱 **Multiplataforma**: iOS, Android y Web
- 🔍 **Búsqueda inteligente** de autolavados
- 🗺️ **Mapa interactivo** con ubicación de proveedores
- ⭐ **Sistema de reseñas** y calificaciones
- 📅 **Reservas en línea** de servicios
- 💳 **Comparación de precios** y servicios
- 🔔 **Notificaciones** en tiempo real

## 📋 Requisitos Previos

- Node.js (v20.19.x o superior)
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app en tu dispositivo móvil (iOS/Android)

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start

# Iniciar en Android
npm run android

# Iniciar en iOS (solo en macOS)
npm run ios

# Iniciar en Web
npm run web
```

## 📱 Ejecutar en Dispositivo Físico

1. Instala **Expo Go** desde App Store (iOS) o Google Play (Android)
2. Ejecuta `npm start`
3. Escanea el código QR con:
   - **iOS**: Cámara del iPhone
   - **Android**: App Expo Go

## 🏗️ Estructura del Proyecto

```
mobile/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── ProviderCard.tsx
│   │   └── ServiceCard.tsx
│   ├── screens/          # Pantallas de la app
│   │   ├── HomeScreen.tsx
│   │   ├── ProviderDetailScreen.tsx
│   │   └── ...
│   ├── navigation/       # Configuración de navegación
│   │   └── index.tsx
│   ├── config/           # Configuraciones
│   │   └── api.ts
│   ├── constants/        # Constantes y temas
│   │   └── theme.ts
│   └── types/            # Tipos TypeScript
│       └── index.ts
├── assets/               # Imágenes y recursos
├── App.tsx              # Punto de entrada
└── app.json             # Configuración de Expo
```

## 🔧 Configuración de la API

La aplicación se conecta al backend en:

- **Desarrollo**: `http://localhost:4000/api` (Web) o `http://10.0.2.2:4000/api` (Android Emulator)
- **Producción**: Configura la URL en `src/config/api.ts`

Para Android Emulator, el backend debe estar corriendo en tu máquina local.

## 🎨 Diseño

La app utiliza un sistema de diseño consistente:

- **Colores primarios**:
  - Verde: `#0F9D58`
  - Azul: `#2B8EAD`
  - Amarillo: `#FFD166`
  - Oscuro: `#073642`

- **Componentes**:
  - Cards con sombras suaves
  - Botones redondeados
  - Navegación por tabs
  - Iconos de Ionicons

## 📚 Tecnologías Utilizadas

- **React Native**: Framework móvil
- **Expo**: Plataforma de desarrollo
- **TypeScript**: Tipado estático
- **React Navigation**: Navegación
- **Axios**: Cliente HTTP
- **React Native Maps**: Mapas
- **Expo Location**: Geolocalización
- **AsyncStorage**: Almacenamiento local

## 🔐 Autenticación

La app utiliza tokens JWT almacenados en AsyncStorage:

```typescript
// Guardar token
await AsyncStorage.setItem('authToken', token);

// Recuperar token
const token = await AsyncStorage.getItem('authToken');
```

## 🗺️ Integración con Backend

### Endpoints principales:

```typescript
// Proveedores
GET /providers
GET /providers/:id

// Servicios
GET /services
GET /services/:id

// Reservas
GET /bookings
POST /bookings

// Reseñas
GET /reviews
POST /reviews
```

## 🐛 Debugging

```bash
# Ver logs en consola
npx expo start --dev-client

# Limpiar caché
npx expo start -c

# Verificar errores TypeScript
npx tsc --noEmit
```

## 📦 Build para Producción

### Android APK:
```bash
eas build --platform android --profile preview
```

### iOS (requiere cuenta Apple Developer):
```bash
eas build --platform ios --profile preview
```

## 🚀 Próximas Características

- [ ] Autenticación con biométricos
- [ ] Notificaciones push
- [ ] Chat en tiempo real
- [ ] Modo offline
- [ ] Filtros avanzados
- [ ] Historial de reservas
- [ ] Favoritos sincronizados
- [ ] Compartir proveedores
- [ ] Modo oscuro

## 📄 Licencia

Este proyecto es parte del sistema Cotiza Auto Lavado.

## 👥 Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.
