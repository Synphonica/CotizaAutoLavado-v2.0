# 📋 Guía Rápida - Configuración de Variables de Entorno

## 📁 Archivos Únicos de Configuración

Ahora el proyecto tiene **SOLO 2 archivos** `.env` (uno por carpeta):

```
alto-carwash-mejorado/
├── frontend/
│   └── .env.local          ← SOLO ESTE (frontend)
└── backend/
    └── .env                ← SOLO ESTE (backend)
```

✅ **Eliminados:** `.env`, `.env.development` duplicados que causaban confusión

---

## 🎯 Frontend: `.env.local`

**Ubicación:** `frontend/.env.local`

### Variables OBLIGATORIAS para empezar:

```env
# Clerk Authentication (OBLIGATORIO)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_TU_CLAVE_AQUI
CLERK_SECRET_KEY=sk_test_TU_SECRET_KEY_AQUI

# Backend API (OBLIGATORIO)
NEXT_PUBLIC_API_BASE=http://localhost:4000/api
```

### Variables OPCIONALES:

```env
# Google Maps (opcional, pero recomendado)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

# Sentry error tracking (opcional)
NEXT_PUBLIC_SENTRY_DSN=https://...
```

---

## 🎯 Backend: `.env`

**Ubicación:** `backend/.env`

### Variables OBLIGATORIAS para empezar:

```env
# Database (OBLIGATORIO - ya está configurado)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Clerk Authentication (OBLIGATORIO - mismas claves que frontend)
CLERK_PUBLISHABLE_KEY="pk_test_TU_CLAVE_AQUI"
CLERK_SECRET_KEY="sk_test_TU_SECRET_KEY_AQUI"
```

### Variables OPCIONALES:

```env
# Google Maps (opcional)
GOOGLE_MAPS_API_KEY="AIza..."

# OpenAI (opcional)
OPENAI_API_KEY="sk-..."

# Sentry (opcional)
SENTRY_DSN=https://...
```

---

## 🔑 Cómo Obtener las Claves de Clerk

### 1. Ve a Clerk Dashboard
https://dashboard.clerk.com

### 2. Selecciona tu Proyecto
O crea uno nuevo si no tienes

### 3. Ve a "API Keys"
En el menú lateral: **Configure → API Keys**

### 4. Copia las Claves
- **Publishable Key:** Empieza con `pk_test_...` (para desarrollo)
- **Secret Key:** Haz clic en "Reveal" y copia (empieza con `sk_test_...`)

### 5. Pega en AMBOS Archivos
- Frontend: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY`
- Backend: `CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY`

⚠️ **IMPORTANTE:** Las claves deben ser **EXACTAMENTE las mismas** en frontend y backend.

---

## ✅ Verificación Rápida

### ¿Están las claves correctas?

Las claves de Clerk son **LARGAS** (~100 caracteres):

```
✅ CORRECTO:
pk_test_d2VsY29tZWQtdGhydXNoLTAuY2xlcmsuYWNjb3VudHMuZGV2JA
(sigue más caracteres...)

❌ INCORRECTO:
pk_test_abc123
(demasiado corta)
```

### ¿Cómo verificar?

```bash
# Ejecuta este comando desde la raíz del proyecto
node verify-clerk.js
```

Esto te mostrará si:
- ✅ Las claves coinciden entre frontend y backend
- ✅ Las claves están completas
- ⚠️ Hay algún problema

---

## 🚀 Iniciar el Proyecto

### 1. Verifica que tengas las claves
```bash
# Verifica que existan los archivos
ls frontend/.env.local
ls backend/.env
```

### 2. Inicia el backend
```bash
cd backend
npm run start:dev
```

Deberías ver:
```
✅ Backend corriendo en http://localhost:4000
📚 Swagger docs: http://localhost:4000/api/docs
```

### 3. Inicia el frontend (en otra terminal)
```bash
cd frontend
npm run dev
```

Deberías ver:
```
✅ Frontend corriendo en http://localhost:3000
```

### 4. Abre el navegador
http://localhost:3000

---

## 🐛 Solución de Problemas

### Error: "Infinite redirect loop"

**Causa:** Las claves de Clerk no coinciden o están incompletas

**Solución:**
1. Ve a Clerk Dashboard
2. Copia las claves **completas**
3. Pégalas **SIN comillas** en ambos archivos
4. Reinicia frontend y backend
5. Limpia cookies del navegador (F12 → Application → Cookies → Clear)

### Error: "Cannot find module"

**Causa:** Falta instalar dependencias

**Solución:**
```bash
cd backend && npm install
cd frontend && npm install
```

### Error: "Database connection failed"

**Causa:** DATABASE_URL incorrecto

**Solución:**
- Verifica que `backend/.env` tenga la DATABASE_URL correcta de Supabase
- Ya está configurada, no deberías tener este error

---

## 📝 Resumen

### ✅ Lo que DEBES tener:

1. **Frontend:** Solo `.env.local` con claves de Clerk
2. **Backend:** Solo `.env` con las mismas claves de Clerk
3. Las claves deben ser **completas** y **sin comillas**

### ❌ Lo que NO debes hacer:

1. ~~Crear múltiples archivos `.env`~~
2. ~~Usar comillas en las claves~~
3. ~~Usar claves diferentes en frontend y backend~~
4. ~~Mezclar claves de development y production~~

---

## 🆘 ¿Necesitas Ayuda?

Si sigues teniendo problemas:

1. Ejecuta `node verify-clerk.js` para diagnóstico
2. Verifica en Clerk Dashboard que las claves sean correctas
3. Limpia cookies del navegador
4. Reinicia ambos servidores

---

**Fecha:** Noviembre 1, 2025  
**Última actualización:** Consolidación de archivos .env
