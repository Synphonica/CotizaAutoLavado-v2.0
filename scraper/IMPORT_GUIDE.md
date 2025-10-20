# 📥 Guía de Importación de Datos

Esta guía te ayudará a importar los datos scrapeados directamente a tu base de datos PostgreSQL usando Prisma.

## 🎯 Requisitos Previos

1. ✅ Tener el backend configurado y funcionando
2. ✅ Base de datos PostgreSQL activa
3. ✅ Haber ejecutado el scraper y generado archivos en `/output`

## ⚙️ Configuración Inicial

### 1. Instalar Dependencias

```bash
cd scraper
npm install
```

### 2. Configurar Variables de Entorno

Copia las URLs de conexión de tu base de datos desde `backend/.env`:

```bash
# Copia .env.example a .env
cp .env.example .env
```

Edita `.env` y agrega tus URLs de base de datos:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/altocarwash
DIRECT_URL=postgresql://user:password@localhost:5432/altocarwash
```

### 3. Generar Prisma Client

```bash
npm run prisma:generate
```

## 🚀 Uso del Importador

### Opción 1: Importar Datos de Muestra (Recomendado para pruebas)

Importa solo los primeros 5 registros:

```bash
npm run import:sample
```

### Opción 2: Importar Todos los Datos

Importa todos los datos desde `output/carwashes.json`:

```bash
npm run import
```

### Opción 3: Ver Estadísticas de la Base de Datos

```bash
npm run import -- --stats
```

### Opción 4: Limpiar Datos Scrapeados

Elimina todos los datos que fueron importados por el scraper:

```bash
npm run import -- --clean
```

## 📊 Datos que se Importan

Para cada autolavado el importador crea:

### 1. **Usuario** (`users` table)
- Email único generado automáticamente
- Nombre y apellido extraídos del nombre del negocio
- Rol: `PROVIDER`
- Estado: `ACTIVE`

### 2. **Provider** (`providers` table)
- Nombre del negocio
- Dirección y ubicación (latitud/longitud)
- Teléfono y contacto
- Rating y número de reseñas
- Horarios de atención
- Estado: `APPROVED` (auto-aprobado)

### 3. **Servicios** (`services` table)
- Servicios extraídos del scraping
- Si no hay servicios, crea servicios por defecto:
  - Lavado Básico: $5.000 (30 min)
  - Lavado Premium: $10.000 (60 min)
  - Encerado: $8.000 (45 min)

### 4. **Imágenes** (`provider_images` table)
- Hasta 5 imágenes del negocio
- Primera imagen marcada como principal

## 🔍 Ejemplo de Salida

```
🚀 =============================================
📦 IMPORTADOR DE DATOS A BASE DE DATOS
===============================================

📂 Leyendo archivo: carwashes.json

📊 Total de registros a importar: 25

⏳ Iniciando importación...

[1/25] Procesando: Lavado de autos a domicilio en maipu
   ✅ Importado exitosamente

[2/25] Procesando: AUTO LAVADO SJ
   ✅ Importado exitosamente

[3/25] Procesando: Lavado de autos a domicilio en maipu
   ⚠️  Ya existe en la base de datos (omitido)

...

📊 ============ RESUMEN DE IMPORTACIÓN ============
✅ Exitosos: 22
⚠️  Omitidos (duplicados): 3
❌ Fallidos: 0
===================================================

📊 =============================================
📈 ESTADÍSTICAS DE LA BASE DE DATOS
===============================================

👥 Total Usuarios: 25
🏪 Total Providers: 25
🔧 Total Servicios: 75
🤖 Providers Scrapeados: 22

✅ Importación completada!
```

## 🛡️ Manejo de Duplicados

El importador detecta automáticamente duplicados basándose en:
- Email único del usuario
- Si ya existe un provider con ese email, se omite

Los registros duplicados se muestran como "⚠️ Omitidos" en el resumen.

## 🧹 Limpieza de Datos

Para eliminar TODOS los datos importados por el scraper:

```bash
npm run import -- --clean
```

⚠️ **ADVERTENCIA**: Esto eliminará:
- Todos los usuarios con email `@scraped.altocarwash.cl`
- Sus providers asociados
- Sus servicios
- Sus imágenes

## 📋 Validaciones

El importador valida:

✅ Nombre del negocio no vacío  
✅ Dirección válida  
✅ Coordenadas GPS válidas (-90 a 90 lat, -180 a 180 long)  
✅ Email único  

## 🔧 Troubleshooting

### Error: "Cannot find module '@prisma/client'"

```bash
npm run prisma:generate
```

### Error: "Database connection failed"

Verifica que:
1. PostgreSQL esté corriendo
2. Las URLs en `.env` sean correctas
3. El usuario tenga permisos en la base de datos

### Error: "Archivo no encontrado: carwashes.json"

Primero ejecuta el scraper:

```bash
npm start
```

Esto generará los archivos en `/output`.

## 🔄 Flujo de Trabajo Completo

```bash
# 1. Ejecutar el scraper
npm start

# 2. Revisar datos generados
cat output/carwashes.json

# 3. Probar con datos de muestra
npm run import:sample

# 4. Verificar en la base de datos
npm run import -- --stats

# 5. Si todo está bien, importar todo
npm run import

# 6. Si necesitas rehacer, limpiar primero
npm run import -- --clean
```

## 💡 Tips

- **Siempre prueba con `--sample` primero** antes de importar todos los datos
- **Revisa las estadísticas** con `--stats` para ver el estado actual
- **Usa `--clean`** si necesitas volver a importar desde cero
- Los datos se marcan como `@scraped.altocarwash.cl` para fácil identificación

## 📚 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run import` | Importa todos los datos |
| `npm run import:sample` | Importa solo 5 registros de muestra |
| `npm run import -- --stats` | Muestra estadísticas de la BD |
| `npm run import -- --clean` | Elimina datos scrapeados |
| `npm run prisma:generate` | Regenera Prisma Client |

## 🎓 Siguiente Paso

Después de importar los datos, puedes:

1. Verificar en tu frontend que aparecen los providers
2. Probar la búsqueda y filtrado
3. Ajustar manualmente datos si es necesario
4. Configurar imágenes adicionales
5. Activar/desactivar providers según calidad de datos
