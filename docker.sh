#!/bin/bash

# ============================================
# AltoCarWash Docker Helper Script
# ============================================

set -e

show_help() {
    echo "🚀 AltoCarWash Docker Helper"
    echo ""
    echo "Usage: ./docker.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev          - Start development environment"
    echo "  prod         - Start production environment"
    echo "  stop         - Stop all containers"
    echo "  restart      - Restart all containers"
    echo "  logs         - Show logs (ctrl+c to exit)"
    echo "  build        - Rebuild all containers"
    echo "  clean        - Remove all containers and volumes"
    echo "  migrate      - Run database migrations"
    echo "  seed         - Seed database with initial data"
    echo "  status       - Show status of containers"
    echo ""
}

case "$1" in
    dev)
        echo "🚀 Starting development environment..."
        docker-compose up -d
        echo "✅ Services started!"
        echo "📱 Frontend: http://localhost:3000"
        echo "🔧 Backend: http://localhost:4000"
        echo "📚 API Docs: http://localhost:4000/api"
        ;;
    prod)
        echo "🚀 Starting production environment..."
        docker-compose -f docker-compose.prod.yml up -d --build
        echo "✅ Production services started!"
        ;;
    stop)
        echo "🛑 Stopping services..."
        docker-compose down
        docker-compose -f docker-compose.prod.yml down
        echo "✅ Services stopped"
        ;;
    restart)
        echo "🔄 Restarting services..."
        docker-compose restart
        echo "✅ Services restarted"
        ;;
    logs)
        echo "📋 Showing logs (Ctrl+C to exit)..."
        docker-compose logs -f
        ;;
    build)
        echo "🔨 Rebuilding containers..."
        docker-compose build --no-cache
        echo "✅ Containers rebuilt"
        ;;
    clean)
        echo "🧹 Cleaning up..."
        docker-compose down -v
        docker-compose -f docker-compose.prod.yml down -v
        echo "✅ Cleanup complete"
        ;;
    migrate)
        echo "🔄 Running database migrations..."
        docker-compose exec backend npx prisma migrate deploy
        echo "✅ Migrations complete"
        ;;
    seed)
        echo "🌱 Seeding database..."
        docker-compose exec backend npm run seed:josscar
        echo "✅ Database seeded"
        ;;
    status)
        echo "📊 Container status:"
        docker-compose ps
        ;;
    *)
        show_help
        ;;
esac
