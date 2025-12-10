#!/bin/bash

# ============================================
# Script de Deploy - Alto Carwash
# ============================================

set -e  # Exit on error

echo "🚀 Iniciando proceso de deploy..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}❌ Error: No se encuentra docker-compose.prod.yml${NC}"
    echo "Asegúrate de estar en el directorio 'docs'"
    exit 1
fi

# Verificar que existe el archivo .env
if [ ! -f "../.env.production" ]; then
    echo -e "${RED}❌ Error: No se encuentra .env.production en la raíz del proyecto${NC}"
    echo ""
    echo "Crea el archivo .env.production usando .env.production.example como plantilla:"
    echo "cp ../.env.production.example ../.env.production"
    echo "nano ../.env.production"
    exit 1
fi

# Copiar .env.production a .env
echo -e "${YELLOW}📋 Copiando variables de entorno...${NC}"
cp ../.env.production ../.env

# Cargar variables de entorno
echo -e "${YELLOW}🔐 Cargando variables de entorno...${NC}"
export $(cat ../.env | xargs)

# Verificar variables críticas
echo -e "${YELLOW}✓ Verificando variables críticas...${NC}"
if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
    echo -e "${RED}❌ Error: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY no está configurada${NC}"
    exit 1
fi

if [ -z "$CLERK_SECRET_KEY" ]; then
    echo -e "${RED}❌ Error: CLERK_SECRET_KEY no está configurada${NC}"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    echo -e "${RED}❌ Error: NEXT_PUBLIC_API_URL no está configurada${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Todas las variables críticas están configuradas${NC}"
echo ""

# Preguntar qué servicios construir
echo -e "${YELLOW}¿Qué servicios deseas construir?${NC}"
echo "1) Todos (backend + frontend)"
echo "2) Solo backend"
echo "3) Solo frontend"
read -p "Selecciona una opción [1-3]: " BUILD_OPTION

case $BUILD_OPTION in
    1)
        SERVICES=""
        echo -e "${GREEN}✓ Construyendo todos los servicios${NC}"
        ;;
    2)
        SERVICES="backend"
        echo -e "${GREEN}✓ Construyendo solo backend${NC}"
        ;;
    3)
        SERVICES="frontend"
        echo -e "${GREEN}✓ Construyendo solo frontend${NC}"
        ;;
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac

# Preguntar si limpiar caché
read -p "¿Construir sin caché? (recomendado para producción) [Y/n]: " NO_CACHE
NO_CACHE=${NO_CACHE:-Y}

if [[ $NO_CACHE =~ ^[Yy]$ ]]; then
    CACHE_FLAG="--no-cache"
    echo -e "${GREEN}✓ Construyendo sin caché${NC}"
else
    CACHE_FLAG=""
    echo -e "${GREEN}✓ Construyendo con caché${NC}"
fi

echo ""
echo -e "${YELLOW}🔨 Construyendo servicios...${NC}"
echo ""

# Construir servicios
docker-compose --env-file ../.env -f docker-compose.prod.yml build $CACHE_FLAG $SERVICES

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error durante la construcción${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Construcción exitosa${NC}"
echo ""

# Preguntar si levantar los servicios
read -p "¿Deseas levantar los servicios ahora? [Y/n]: " START_SERVICES
START_SERVICES=${START_SERVICES:-Y}

if [[ $START_SERVICES =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}🚀 Levantando servicios...${NC}"
    docker-compose -f docker-compose.prod.yml up -d $SERVICES
    
    echo ""
    echo -e "${GREEN}✓ Servicios levantados${NC}"
    echo ""
    echo -e "${YELLOW}📊 Estado de los contenedores:${NC}"
    docker-compose -f docker-compose.prod.yml ps
    
    echo ""
    echo -e "${GREEN}✨ ¡Deploy completado exitosamente!${NC}"
    echo ""
    echo "Para ver los logs:"
    echo "  docker-compose -f docker-compose.prod.yml logs -f $SERVICES"
    echo ""
    echo "Para verificar el estado:"
    echo "  docker-compose -f docker-compose.prod.yml ps"
    echo ""
    echo "Para acceder a la aplicación:"
    echo "  http://localhost (frontend)"
    echo "  http://localhost:4000 (backend)"
else
    echo ""
    echo -e "${GREEN}✓ Build completado. Los servicios no se levantaron.${NC}"
    echo ""
    echo "Para levantar los servicios manualmente:"
    echo "  docker-compose -f docker-compose.prod.yml up -d $SERVICES"
fi

echo ""
