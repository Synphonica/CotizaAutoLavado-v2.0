#!/bin/bash

# Script de diagnóstico para la app móvil de Alto Carwash
# Uso: bash mobile-diagnostics.sh

echo "🔍 Diagnóstico de App Móvil - Alto Carwash"
echo "=========================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1"
        return 1
    fi
}

# Verificar directorio
if [ ! -d "mobile" ]; then
    echo -e "${RED}Error: No estás en el directorio correcto${NC}"
    echo "Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

cd mobile

echo "📦 Verificando Node y NPM..."
node --version > /dev/null 2>&1
check "Node.js instalado"

npm --version > /dev/null 2>&1
check "NPM instalado"

echo ""
echo "📱 Verificando Expo..."
npx expo --version > /dev/null 2>&1
check "Expo CLI disponible"

echo ""
echo "📂 Verificando archivos..."
[ -f "package.json" ] && check "package.json existe" || echo -e "${RED}✗${NC} package.json NO existe"
[ -f "App.tsx" ] && check "App.tsx existe" || echo -e "${RED}✗${NC} App.tsx NO existe"
[ -f "index.ts" ] && check "index.ts existe" || echo -e "${RED}✗${NC} index.ts NO existe"
[ -f "app.json" ] && check "app.json existe" || echo -e "${RED}✗${NC} app.json NO existe"

echo ""
echo "📁 Verificando dependencias..."
[ -d "node_modules" ] && check "node_modules instalado" || echo -e "${RED}✗${NC} node_modules NO existe - ejecuta: npm install"

echo ""
echo "🔧 Verificando configuración de API..."
if [ -f "src/constants/API.ts" ]; then
    IP=$(grep "DEFAULT_API_BASE_URL" src/constants/API.ts | head -1)
    echo -e "${GREEN}✓${NC} API.ts existe"
    echo "  Configuración: $IP"
else
    echo -e "${RED}✗${NC} API.ts NO existe"
fi

echo ""
echo "🌐 Verificando Backend..."
echo "  Probando conexión a http://localhost:4000/api/health..."

if command -v curl &> /dev/null; then
    if curl -s --max-time 3 http://localhost:4000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend respondiendo en localhost:4000"
        BACKEND_STATUS=$(curl -s http://localhost:4000/api/health)
        echo "  Status: $BACKEND_STATUS"
    else
        echo -e "${RED}✗${NC} Backend NO responde"
        echo -e "${YELLOW}  Asegúrate de iniciar el backend: cd backend && npm run start:dev${NC}"
    fi
else
    echo -e "${YELLOW}⚠${NC}  curl no disponible, no se puede probar backend"
fi

echo ""
echo "📊 Información de package.json..."
if [ -f "package.json" ]; then
    REACT_VERSION=$(grep '"react"' package.json | head -1 | sed 's/.*: *"\(.*\)".*/\1/')
    EXPO_VERSION=$(grep '"expo"' package.json | head -1 | sed 's/.*: *"\(.*\)".*/\1/')
    echo "  React: $REACT_VERSION"
    echo "  Expo: $EXPO_VERSION"
    
    if [[ $REACT_VERSION == "19."* ]]; then
        echo -e "${YELLOW}  ⚠ Advertencia: React 19 puede causar problemas${NC}"
        echo -e "${YELLOW}    Considera downgrade a React 18.2.0${NC}"
    fi
fi

echo ""
echo "🧹 Sugerencias de Limpieza..."
echo "  Si tienes problemas, prueba:"
echo "  1. Limpiar cache: npx expo start -c"
echo "  2. Reinstalar: rm -rf node_modules && npm install"
echo "  3. Verificar IP en API.ts"

echo ""
echo "=========================================="
echo "Diagnóstico completado"
echo ""
echo "Para iniciar la app:"
echo "  npx expo start -c"
echo ""
