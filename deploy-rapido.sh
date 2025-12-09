#!/bin/bash
# Script rápido de despliegue - Copiar y pegar en la VPS

echo "🚀 Iniciando despliegue..."

# Ir al directorio del proyecto
cd ~/CotizaAutoLavado-v2.0

# Actualizar código
echo "📥 Actualizando código..."
git pull origin main

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores antiguos..."
docker-compose down 2>/dev/null || true

# Copiar variables de entorno
echo "⚙️ Configurando variables de entorno..."
cp backend/.env.production backend/.env
cp frontend/.env.production frontend/.env.local

# Copiar docker-compose si existe en docs
if [ -f "docs/docker-compose.prod.yml" ]; then
    cp docs/docker-compose.prod.yml docker-compose.yml
fi

# Construir y ejecutar
echo "🐳 Construyendo contenedores..."
docker-compose up -d --build

# Esperar un poco
sleep 10

# Mostrar estado
echo ""
echo "✅ Despliegue completado!"
echo ""
echo "📊 Estado de los contenedores:"
docker-compose ps
echo ""
echo "🌐 URLs:"
echo "  Frontend: http://104.250.132.28"
echo "  Backend:  http://104.250.132.28:4000"
echo "  API Docs: http://104.250.132.28:4000/api"
echo ""
echo "📝 Ver logs: docker-compose logs -f"
