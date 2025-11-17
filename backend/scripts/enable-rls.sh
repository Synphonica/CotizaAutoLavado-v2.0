#!/bin/bash

# ====================================
# Script para habilitar RLS en Supabase
# ====================================

echo "🔒 Habilitando Row Level Security (RLS) en Supabase..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: No se encontró el archivo .env${NC}"
    echo "Por favor, crea un archivo .env con tu DATABASE_URL"
    exit 1
fi

# Cargar variables de entorno
source .env

# Verificar que existe DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL no está definida en .env${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Verificando estado actual de RLS...${NC}"
echo ""

# Verificar estado actual
psql "$DATABASE_URL" -c "
SELECT 
    tablename, 
    CASE WHEN rowsecurity THEN '✅ Habilitado' ELSE '❌ Deshabilitado' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('time_slots', 'blocked_dates', 'bookings')
ORDER BY tablename;
" 2>/dev/null

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: No se pudo conectar a la base de datos${NC}"
    echo "Verifica que DATABASE_URL sea correcta"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔧 Aplicando políticas de RLS...${NC}"
echo ""

# Aplicar el script de RLS
psql "$DATABASE_URL" -f "prisma/migrations/enable_rls.sql"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ RLS habilitado exitosamente${NC}"
    echo ""
    echo -e "${YELLOW}📊 Verificando resultado final...${NC}"
    echo ""
    
    # Verificar resultado
    psql "$DATABASE_URL" -c "
    SELECT 
        tablename, 
        CASE WHEN rowsecurity THEN '✅ Habilitado' ELSE '❌ Deshabilitado' END as rls_status,
        (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as politicas
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('time_slots', 'blocked_dates', 'bookings')
    ORDER BY tablename;
    "
    
    echo ""
    echo -e "${GREEN}🎉 ¡Proceso completado!${NC}"
    echo ""
    echo "Los warnings de Supabase deberían desaparecer."
    echo "Reinicia tu backend con: npm run start:dev"
else
    echo ""
    echo -e "${RED}❌ Error al aplicar RLS${NC}"
    echo "Revisa el archivo: prisma/migrations/enable_rls.sql"
    exit 1
fi
