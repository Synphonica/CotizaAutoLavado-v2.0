# 🗺️ Configuración de Mapas - Alto Carwash

## Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env.local`:

```env
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=tu_mapbox_access_token
```

## 🔧 Configuración de APIs

### Google Maps API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita la API de Maps JavaScript
4. Crea credenciales (API Key)
5. Configura restricciones de dominio

### Mapbox API

1. Ve a [Mapbox](https://www.mapbox.com/)
2. Crea una cuenta gratuita
3. Ve a tu dashboard y copia tu Access Token
4. El token público es suficiente para el frontend

## 🎯 Características Implementadas

- **Toggle de Mapas**: Los usuarios pueden cambiar entre Google Maps y Mapbox
- **Preferencias Persistentes**: La selección se guarda en localStorage
- **Fallback Automático**: Si un servicio falla, se usa el otro
- **Diseño Unificado**: Ambos mapas tienen la misma interfaz
- **Performance Optimizada**: Carga solo el mapa seleccionado

## 🚀 Uso

Los usuarios pueden:

1. Hacer clic en el toggle para cambiar entre mapas
2. Su preferencia se guarda automáticamente
3. Disfrutar de la mejor experiencia según su preferencia
