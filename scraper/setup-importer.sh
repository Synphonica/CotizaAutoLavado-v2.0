#!/bin/bash

# 🚀 Script de Configuración Rápida del Importador
# Este script configura automáticamente el importador de datos

echo "🚀 ============================================="
echo "📦 CONFIGURADOR DEL IMPORTADOR DE DATOS"
echo "=============================================="
echo ""

# Verificar que estamos en la carpeta correcta
if [ ! -f "package.json" ]; then
    echo "❌ Error: Este script debe ejecutarse desde la carpeta 'scraper'"
    exit 1
fi

echo "📋 Paso 1: Verificando instalación de dependencias..."
if [ ! -d "node_modules" ]; then
    echo "   Instalando dependencias..."
    npm install
else
    echo "   ✅ Dependencias ya instaladas"
fi

echo ""
echo "📋 Paso 2: Copiando schema de Prisma..."
if [ -f "../backend/prisma/schema.prisma" ]; then
    mkdir -p prisma
    cp ../backend/prisma/schema.prisma ./prisma/schema.prisma
    echo "   ✅ Schema copiado exitosamente"
else
    echo "   ⚠️  No se encontró schema.prisma en el backend"
fi

echo ""
echo "📋 Paso 3: Configurando variables de entorno..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "   ✅ Archivo .env creado desde .env.example"
        echo ""
        echo "   ⚠️  IMPORTANTE: Debes editar .env y agregar:"
        echo "      - DATABASE_URL (copia desde backend/.env)"
        echo "      - DIRECT_URL (copia desde backend/.env)"
        echo ""
    else
        echo "   ❌ No se encontró .env.example"
    fi
else
    echo "   ✅ Archivo .env ya existe"
fi

echo "📋 Paso 4: Generando Prisma Client..."
npm run prisma:generate
echo ""

echo "✅ ============================================="
echo "🎉 CONFIGURACIÓN COMPLETADA"
echo "=============================================="
echo ""
echo "📚 Próximos pasos:"
echo ""
echo "1. Edita el archivo .env y configura DATABASE_URL y DIRECT_URL"
echo "   (Cópialos desde backend/.env)"
echo ""
echo "2. Ejecuta el scraper para obtener datos:"
echo "   npm start"
echo ""
echo "3. Importa datos de muestra (primeros 5):"
echo "   npm run import:sample"
echo ""
echo "4. Importa todos los datos:"
echo "   npm run import"
echo ""
echo "5. Ver estadísticas de la base de datos:"
echo "   npm run import -- --stats"
echo ""
echo "📖 Lee IMPORT_GUIDE.md para más información"
echo ""
