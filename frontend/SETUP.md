# 🚀 Configuración Rápida - Alto Carwash Frontend

Esta guía te ayudará a configurar el frontend de Alto Carwash en **menos de 5 minutos**.

---

## ⚡ Configuración Express

### 📋 **Paso 1: Clonar e instalar**
```bash
git clone <url-del-repositorio>
cd alto-carwash/frontend
npm install
```

### 🔑 **Paso 2: Variables de entorno**
```bash
# Copiar plantilla
cp .env.development .env.local

# Editar archivo .env.local con tus credenciales:
nano .env.local  # o tu editor favorito
```

### 🗝️ **Paso 3: Configurar APIs (IMPORTANTE)**

#### **Google Maps API Key**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita estas APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Crea una API Key
5. Agrega la key en `.env.local`:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="tu_api_key_aqui"
```

#### **Clerk Authentication**
1. Ve a [Clerk Dashboard](https://dashboard.clerk.com/)
2. Crea una nueva aplicación
3. Copia las keys en `.env.local`:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

### 🚀 **Paso 4: Iniciar**
```bash
npm run dev
```

**¡Listo!** Abre http://localhost:3000 🎉

---

## 🔧 Configuración Detallada

### 📝 **Variables de Entorno Requeridas**

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."  # ✅ Requerido
CLERK_SECRET_KEY="sk_test_..."                   # ✅ Requerido  
NEXT_PUBLIC_API_BASE="http://localhost:4000/api" # ✅ Requerido
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..."        # ⚠️ Opcional pero recomendado
```

### ⚙️ **Variables Opcionales**

```bash
# Desarrollo
NODE_ENV="development"
NEXT_PUBLIC_DEBUG_MODE="true"

# Analytics (si los usas)
NEXT_PUBLIC_ANALYTICS_ID=""
NEXT_PUBLIC_GTM_ID=""
```

---

## 🗺️ Configuración de Google Maps

### 📍 **APIs Necesarias**
- **Maps JavaScript API**: Para mostrar mapas
- **Places API**: Para autocompletado de direcciones
- **Geocoding API**: Para convertir direcciones a coordenadas

### 🔐 **Restricciones Recomendadas**
1. **Referrers HTTP**: 
   - `localhost:3000/*`
   - `tu-dominio.com/*`
2. **APIs restringidas**: Solo las que necesitas

### 💰 **Costos**
- Google Maps ofrece $200 USD/mes gratis
- Para desarrollo local es más que suficiente

---

## 🔐 Configuración de Clerk

### 🎭 **Configuración Básica**
1. **Crear aplicación** en Clerk Dashboard
2. **Configurar métodos de login**:
   - Email/Password ✅
   - Google OAuth ✅ (recomendado)
   - GitHub OAuth ✅ (opcional)
3. **Dominios autorizados**:
   - `localhost:3000` (desarrollo)
   - Tu dominio de producción

### 🔗 **Webhooks (opcional)**
Si quieres sincronizar usuarios con tu backend:
```bash
# Endpoint del webhook
http://localhost:4000/api/auth/clerk/webhook
```

---

## 🚨 Troubleshooting

### ❌ **Error: Cannot connect to API**
```bash
# Verificar que el backend esté corriendo
curl http://localhost:4000/api/health

# Si el backend usa un puerto diferente, actualizar:
NEXT_PUBLIC_API_BASE="http://localhost:PUERTO/api"
```

### ❌ **Error: Google Maps not loading**
```bash
# Verificar API Key
echo $NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Verificar que las APIs estén habilitadas en Google Cloud Console
# Verificar restricciones de dominio
```

### ❌ **Error: Clerk authentication failed**
```bash
# Verificar keys
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
echo $CLERK_SECRET_KEY

# Verificar que localhost:3000 esté en dominios autorizados
```

### ❌ **Error: Build failed**
```bash
# Limpiar caché
rm -rf .next node_modules
npm install

# Verificar sintaxis
npm run lint
```

---

## 📦 Dependencias Principales

```json
{
  "next": "15.x",           // Framework principal
  "react": "19.x",          // UI Library  
  "@clerk/nextjs": "^6.x",  // Autenticación
  "tailwindcss": "^3.x",    // CSS Framework
  "framer-motion": "^11.x", // Animaciones
  "lucide-react": "^0.x"    // Iconos
}
```

---

## 🎯 Próximos Pasos

1. **✅ Configurar variables de entorno**
2. **✅ Iniciar servidor de desarrollo**
3. **📱 Probar funcionalidades básicas**
4. **🗺️ Verificar que los mapas funcionen**
5. **🔐 Probar autenticación**
6. **🔗 Conectar con backend**

---

## 📞 Ayuda

¿Problemas? **¡No te preocupes!**

1. **Revisar logs**: `npm run dev` muestra errores detallados
2. **Consultar README**: Documentación completa disponible
3. **Contactar equipo**: Canal de desarrollo en Slack/Discord

---

**¡Feliz desarrollo!** 🚀💻