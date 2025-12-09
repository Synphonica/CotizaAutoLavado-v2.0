# ��� Guía de Despliegue - CotizaAutoLavado

## ��� Requisitos Previos

- VPS con Linux (Ubuntu 20.04+ recomendado)
- 4GB RAM mínimo
- Docker y Docker Compose instalados
- Dominio configurado (opcional pero recomendado)

## ��� Archivos de Docker

### Ubicación de Archivos Creados:

```
/
├── .gitignore                     # Raíz del proyecto
├── .env.example                   # Raíz del proyecto (copiar a .env)
├── docker-compose.yml             # Raíz del proyecto
├── backend/
│   ├── Dockerfile.prod           # Dockerfile de producción para backend
│   └── .dockerignore             # Ya existía
└── frontend/
    ├── Dockerfile.prod           # Dockerfile de producción para frontend
    └── .dockerignore             # Ya existía
```

## ��� Instalación en VPS

### 1. Instalar Docker (si no está instalado)

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Clonar el Repositorio

```bash
cd /opt
sudo git clone https://github.com/TU_USUARIO/CotizaAutoLavado.git
cd CotizaAutoLavado
```

### 3. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus valores reales
nano .env
```

**Importante:** Configura las siguientes variables:
- `POSTGRES_PASSWORD`: Contraseña segura para PostgreSQL
- `JWT_SECRET`: Secreto para tokens JWT
- `CLERK_SECRET_KEY`: Tu clave secreta de Clerk
- `NEXT_PUBLIC_API_URL`: URL pública de tu backend (ej: https://api.tudominio.com)

### 4. Construir y Levantar los Contenedores

```bash
# Construir las imágenes
docker compose build

# Levantar los servicios
docker compose up -d

# Ver logs
docker compose logs -f
```

### 5. Verificar que Todo Funciona

```bash
# Ver estado de contenedores
docker compose ps

# Verificar logs individuales
docker compose logs backend
docker compose logs frontend
docker compose logs postgres

# Verificar salud
curl http://localhost:4000/health
curl http://localhost:3000
```

## ��� Comandos Útiles

### Gestión de Contenedores

```bash
# Detener todos los servicios
docker compose down

# Detener y eliminar volúmenes (¡CUIDADO! Elimina la base de datos)
docker compose down -v

# Reiniciar un servicio específico
docker compose restart backend

# Ver logs en tiempo real
docker compose logs -f backend

# Ejecutar comandos dentro de un contenedor
docker compose exec backend sh
docker compose exec postgres psql -U postgres -d cotiza_autolavado
```

### Actualizaciones

```bash
# Obtener últimos cambios
git pull origin main

# Reconstruir y reiniciar
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Backup de Base de Datos

```bash
# Crear backup
docker compose exec postgres pg_dump -U postgres cotiza_autolavado > backup_$(date +%Y%m%d).sql

# Restaurar backup
cat backup_20231208.sql | docker compose exec -T postgres psql -U postgres cotiza_autolavado
```

## ��� Configuración con Nginx (Recomendado)

Si quieres usar un dominio y HTTPS, instala Nginx como reverse proxy:

```nginx
# /etc/nginx/sites-available/cotiza-autolavado
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Luego instala Certbot para SSL:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tudominio.com
```

## ��� Monitoreo de Recursos

```bash
# Ver uso de recursos por contenedor
docker stats

# Ver logs del sistema
journalctl -u docker -f
```

## ���️ Seguridad

1. **Firewall**: Configura UFW para permitir solo los puertos necesarios
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. **Contraseñas**: Usa contraseñas fuertes y únicas
3. **Updates**: Mantén Docker y el sistema actualizado
4. **Backups**: Programa backups automáticos de la base de datos

## ❗ Troubleshooting

### Error: Cannot connect to database
```bash
# Verificar que postgres esté corriendo
docker compose ps postgres
docker compose logs postgres

# Verificar variables de entorno
docker compose exec backend env | grep DATABASE
```

### Error: Frontend no se conecta al backend
- Verifica que `NEXT_PUBLIC_API_URL` esté configurado correctamente
- Para producción, debe ser la URL pública, no `localhost`

### Error: Out of memory
- Ajusta los límites de memoria en `docker-compose.yml`
- Considera aumentar el swap del VPS

## ��� Soporte

Para más ayuda, revisa:
- Logs: `docker compose logs -f`
- Estado: `docker compose ps`
- Recursos: `docker stats`
