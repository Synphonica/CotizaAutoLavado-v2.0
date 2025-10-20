# 🚗 Alto Carwash - Web Scraper

Herramienta automatizada para recopilar información de autolavados en Chile, específicamente en la Región Metropolitana, comuna de Maipú.

## 🎯 Objetivo

Este scraper recopila datos de autolavados desde múltiples fuentes:
- ✅ **Yapo.cl** - Clasificados chilenos
- ✅ **Google Maps** - Con API key (recomendado)
- ✅ **Google Maps** - Con Puppeteer (sin API key)
- 🔄 **Extensible** - Fácil agregar nuevas fuentes

## 📋 Datos Recopilados

Para cada autolavado se obtiene:
- Nombre del negocio
- Dirección completa
- Comuna y región
- Teléfono de contacto
- Email (si está disponible)
- Sitio web
- Descripción
- Servicios ofrecidos
- Precios (cuando están disponibles)
- Rating/calificación
- Cantidad de reseñas
- Coordenadas (latitud/longitud)
- Horarios de atención
- Imágenes
- Fuente de los datos

## 🚀 Instalación

```bash
# 1. Navegar a la carpeta del scraper
cd scraper

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus configuraciones
```

## ⚙️ Configuración

Edita el archivo `.env`:

```env
# Opcional: Google Maps API Key para mejores resultados
GOOGLE_MAPS_API_KEY=tu_api_key_aqui

# Configuración de búsqueda
REGION=Región Metropolitana
COMUNA=Maipú
SEARCH_QUERY=autolavado

# Opciones
MAX_RESULTS=50
DELAY_BETWEEN_REQUESTS=2000
```

### 🗝️ Obtener Google Maps API Key (Opcional pero Recomendado)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita **Places API**
4. Crea credenciales → API Key
5. Copia la key al archivo `.env`

**Nota**: Google ofrece $200 USD de crédito mensual gratuito.

## 💻 Uso

### Opción 1: Scraping Básico (Yapo.cl)
```bash
npm start
```

### Opción 2: Con Google Maps API
```bash
# Configura GOOGLE_MAPS_API_KEY en .env
npm start
```

### Opción 3: Con Puppeteer (más datos, más lento)
```bash
npm start -- --puppeteer
```

### Opción 4: Scraping Específico
```bash
# Solo Yapo
npm run scrape:yapo

# Solo Google Maps
npm run scrape:google

# Todo junto
npm run scrape:all
```

## 📤 Formatos de Exportación

Los datos se exportan automáticamente en 4 formatos:

### 1. **JSON** (`carwashes.json`)
```json
[
  {
    "name": "AutoLavado Express",
    "address": "Av. Pajaritos 1234, Maipú",
    "phone": "+56912345678",
    "services": ["Lavado exterior", "Encerado"],
    "rating": 4.5
  }
]
```

### 2. **Excel** (`carwashes.xlsx`)
- Ideal para análisis en Excel
- Una fila por autolavado
- Todas las columnas organizadas

### 3. **CSV** (`carwashes.csv`)
- Compatible con cualquier software
- Importable a Google Sheets

### 4. **SQL** (`insert_carwashes.sql`)
- Scripts SQL básicos (deprecado)
- ⚠️ **Recomendado**: Usar el importador de Prisma en su lugar

## 📥 **NUEVO: Importación Directa a Base de Datos**

### Usar Prisma Importer (Recomendado)

```bash
# 1. Configurar conexión a la base de datos
# Copia DATABASE_URL y DIRECT_URL de backend/.env a scraper/.env

# 2. Generar Prisma Client
npm run prisma:generate

# 3. Importar datos de muestra (primeros 5)
npm run import:sample

# 4. Importar todos los datos
npm run import

# 5. Ver estadísticas
npm run import -- --stats

# 6. Limpiar datos scrapeados
npm run import -- --clean
```

📚 **Guía completa**: Lee [IMPORT_GUIDE.md](./IMPORT_GUIDE.md) para más detalles

### Ventajas del Importador Prisma

✅ **Seguro**: Usa Prisma Client, no SQL raw  
✅ **Completo**: Crea Users, Providers y Services automáticamente  
✅ **Inteligente**: Detecta y omite duplicados  
✅ **Validación**: Valida datos antes de insertar  
✅ **Transaccional**: Rollback automático en caso de errores  

## 📁 Estructura de Salida

```
output/
├── carwashes.json          # Datos en JSON
├── carwashes.xlsx          # Hoja de Excel
├── carwashes.csv           # Archivo CSV
├── insert_carwashes.sql    # Scripts SQL (deprecado)
└── sample_carwashes.json   # Datos de muestra (primeros 5)
```

## 🛠️ Desarrollo

### Agregar Nueva Fuente

1. Crea un nuevo archivo en `src/scrapers/`:

```typescript
// src/scrapers/mercadolibre.ts
export class MercadoLibreScraper {
  async scrape(): Promise<CarWashData[]> {
    // Tu lógica aquí
  }
}
```

2. Impórtalo en `src/index.ts`:

```typescript
import { MercadoLibreScraper } from './scrapers/mercadolibre';
```

3. Agrégalo al flujo principal.

### Modificar Búsqueda

Edita `src/config.ts` para cambiar:
- Comuna objetivo
- Cantidad de resultados
- Delay entre requests

## 🔍 Fuentes de Datos

### 1. Yapo.cl
- ✅ No requiere API key
- ✅ Fácil de scrapear
- ⚠️ Datos limitados
- ⚠️ Principalmente servicios independientes

### 2. Google Maps (API)
- ✅ Datos muy completos
- ✅ Ratings y reseñas
- ✅ Coordenadas precisas
- ⚠️ Requiere API key
- ⚠️ Límite de requests

### 3. Google Maps (Puppeteer)
- ✅ No requiere API key
- ✅ Datos completos
- ⚠️ Más lento
- ⚠️ Consume más recursos

## 📊 Ejemplo de Salida

```
🚀 =============================================
🚗 ALTO CARWASH - SCRAPER DE AUTOLAVADOS
📍 Región: Metropolitana - Comuna: Maipú
===============================================

📌 1. Scraping Yapo.cl...
✅ Yapo: 12 autolavados encontrados

📌 2. Scraping Google Places API...
✅ Google: 28 autolavados encontrados

📊 ============ RESUMEN ============
Total scrapeado: 40
Total único: 35
Duplicados removidos: 5
=====================================

💾 Exportando datos...

✅ Datos exportados a: output/carwashes.json
📊 Total de registros: 35
✅ Datos exportados a: output/carwashes.xlsx
📊 Total de registros: 35
✅ Datos exportados a: output/carwashes.csv
📊 Total de registros: 35
✅ SQL exportado a: output/insert_carwashes.sql
📊 Total de registros: 35

✅ ¡Scraping completado exitosamente!
📁 Revisa la carpeta "output" para los archivos generados.
```

## 🔄 Actualización de Datos

Para mantener los datos actualizados:

```bash
# Ejecutar semanalmente
npm start

# O configurar cron job
0 0 * * 0 cd /path/to/scraper && npm start
```

## ⚠️ Consideraciones Legales

- **Respeta los Terms of Service** de cada sitio
- **No sobrecargues los servidores** (usa delays apropiados)
- **Datos públicos solamente**
- **Uso educacional/comercial permitido**

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Google API quota exceeded"
- Espera 24 horas
- O usa `--puppeteer` en su lugar

### Error: "No data found"
- Verifica tu conexión a internet
- Revisa que las URLs estén activas
- Chequea los selectores CSS (pueden cambiar)

## 📝 TODO

- [ ] Agregar scraper de Facebook Marketplace
- [ ] Implementar scraper de Instagram
- [ ] Agregar detección automática de precios
- [ ] Implementar sistema de actualización incremental
- [ ] Agregar validación de datos con IA

## 🤝 Contribuir

¿Encontraste un bug o quieres agregar una feature?
1. Fork el proyecto
2. Crea tu branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios
4. Push y crea un Pull Request

## 📄 Licencia

MIT License - Uso libre para proyectos personales y comerciales.

---

**Desarrollado para Alto Carwash** 🚗✨