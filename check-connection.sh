#!/bin/bash

echo "🔍 Verificando Conexión Clerk + Base de Datos"
echo "=============================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar variable de entorno
check_env_var() {
    local var_name=$1
    local var_value="${!var_name}"
    
    if [ -n "$var_value" ]; then
        echo -e "${GREEN}✓${NC} $var_name está configurado"
        return 0
    else
        echo -e "${RED}✗${NC} $var_name NO está configurado"
        return 1
    fi
}

# Verificar directorio backend
if [ ! -d "backend" ]; then
    echo -e "${RED}✗${NC} No se encuentra la carpeta backend/"
    exit 1
fi

cd backend

# Cargar variables de entorno si existe .env
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Archivo .env encontrado"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠${NC} Archivo .env no encontrado"
    echo "  Crea un archivo .env en la carpeta backend/"
fi

echo ""
echo "📋 Verificando Variables de Entorno:"
echo "------------------------------------"

# Variables de Base de Datos
check_env_var "DATABASE_URL"
check_env_var "DIRECT_URL"

echo ""
echo "🔐 Verificando Variables de Clerk:"
echo "-----------------------------------"

# Variables de Clerk
check_env_var "CLERK_SECRET_KEY"

echo ""
echo "🌐 Verificando Variables del Frontend:"
echo "---------------------------------------"

cd ../frontend

if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} Archivo .env.local encontrado"
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠${NC} Archivo .env.local no encontrado"
fi

check_env_var "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
check_env_var "NEXT_PUBLIC_API_URL"

echo ""
echo "🧪 Pruebas de Conexión:"
echo "-----------------------"

# Volver a backend
cd ../backend

# Test 1: Conexión a Base de Datos
echo -n "Probando conexión a PostgreSQL... "
if command -v node &> /dev/null; then
    node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.\$connect()
        .then(() => {
            console.log('✓ CONECTADO');
            process.exit(0);
        })
        .catch((err) => {
            console.log('✗ ERROR:', err.message);
            process.exit(1);
        });
    " 2>&1 | head -n 1
else
    echo -e "${YELLOW}⚠${NC} Node.js no disponible para probar"
fi

# Test 2: Endpoint del Backend
echo -n "Probando endpoint del backend... "
if command -v curl &> /dev/null; then
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health 2>/dev/null)
    if [ "$response" == "200" ]; then
        echo -e "${GREEN}✓${NC} Backend respondiendo (HTTP $response)"
    else
        echo -e "${RED}✗${NC} Backend no responde o apagado (HTTP $response)"
    fi
else
    echo -e "${YELLOW}⚠${NC} curl no disponible"
fi

echo ""
echo "📊 Resumen:"
echo "-----------"

# Determinar tipo de base de datos
if [[ "$DATABASE_URL" == *"supabase"* ]]; then
    echo -e "${GREEN}✓${NC} Usando Supabase como proveedor PostgreSQL"
elif [[ "$DATABASE_URL" == *"localhost"* ]] || [[ "$DATABASE_URL" == *"127.0.0.1"* ]]; then
    echo -e "${GREEN}✓${NC} Usando PostgreSQL local"
elif [[ "$DATABASE_URL" == *"postgres"* ]]; then
    echo -e "${GREEN}✓${NC} Usando PostgreSQL remoto"
else
    echo -e "${YELLOW}⚠${NC} No se detectó configuración de base de datos"
fi

echo ""
echo "🔗 Para verificar Clerk manualmente:"
echo "------------------------------------"
echo "1. Ve a: https://dashboard.clerk.com"
echo "2. Selecciona tu aplicación"
echo "3. Ve a 'Configure' → 'Webhooks'"
echo "4. Verifica que tengas un webhook configurado:"
echo "   URL: http://tu-backend.com/auth/clerk/webhook"
echo "   Events: user.created, user.updated, user.deleted"
echo ""
echo "🔗 Para verificar Supabase manualmente:"
echo "----------------------------------------"
echo "1. Ve a: https://supabase.com/dashboard"
echo "2. Selecciona tu proyecto"
echo "3. Ve a 'Settings' → 'Database'"
echo "4. Copia la 'Connection string' y compárala con tu DATABASE_URL"
echo ""
