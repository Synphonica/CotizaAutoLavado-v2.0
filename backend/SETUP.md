# Configuración del Proyecto Backend

## 📋 Setup para Nuevos Desarrolladores

### 1. Variables de Entorno
```bash
# Copia el archivo de ejemplo
cp .env.development .env

# Edita las variables necesarias:
nano .env
```

### 2. Base de Datos
```bash
# Instalar PostgreSQL localmente O usar Supabase

# Configurar DATABASE_URL en .env
DATABASE_URL="postgresql://usuario:password@localhost:5432/alto_carwash"

# Ejecutar migraciones
npx prisma migrate dev

# Opcional: Poblar con datos de prueba
npx prisma db seed
```

### 3. Instalación y Ejecución
```bash
npm install
npm run start:dev
```

## 🔑 Variables Requeridas vs Opcionales

### ✅ REQUERIDAS (mínimo para desarrollo)
- `DATABASE_URL` - Conexión a PostgreSQL
- `JWT_SECRET` - Para autenticación interna
- `PORT` - Puerto del servidor (default: 4000)

### 🔧 OPCIONALES (para funciones específicas)
- `CLERK_SECRET_KEY` - Solo si usas autenticación Clerk
- `GOOGLE_MAPS_API_KEY` - Solo para funciones de mapas
- `OPENAI_API_KEY` - Solo para funciones de IA

## 🚀 Comandos Útiles

```bash
# Base de datos
npx prisma studio          # Interfaz visual de DB
npx prisma migrate reset    # Resetear DB (¡cuidado!)
npx prisma generate         # Regenerar cliente

# Desarrollo
npm run start:dev           # Servidor con hot-reload
npm run start:debug         # Con debug habilitado

# Testing
npm run test               # Tests unitarios
npm run test:e2e          # Tests end-to-end
```

## 🐛 Troubleshooting

### Error de conexión a DB
1. Verifica que PostgreSQL esté corriendo
2. Verifica la DATABASE_URL en .env
3. Ejecuta: `npx prisma migrate deploy`

### Error "Module not found"
1. Ejecuta: `npm install`
2. Si persiste: `rm -rf node_modules && npm install`

### Error de Prisma
1. Ejecuta: `npx prisma generate`
2. Si persiste: `npx prisma migrate reset`