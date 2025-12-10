# 🔐 Configuración SSL/HTTPS con Let's Encrypt

Esta guía te ayudará a configurar certificados SSL gratuitos para tu aplicación usando Let's Encrypt y Nginx.

## 📋 Prerrequisitos

1. Tener un dominio apuntando a tu VPS (ejemplo: altocarwash.com)
2. Tener la aplicación corriendo en la VPS
3. Puertos 80 y 443 abiertos en el firewall

---

## 🚀 OPCIÓN 1: Con Nginx Reverse Proxy (RECOMENDADO)

### Paso 1: Instalar Nginx y Certbot

```bash
# Conectarse a la VPS
ssh root@104.250.132.28

# Instalar Nginx
apt update
apt install nginx -y

# Instalar Certbot
apt install certbot python3-certbot-nginx -y
```

### Paso 2: Configurar Nginx

```bash
# Crear archivo de configuración
nano /etc/nginx/sites-available/altocarwash
```

Agregar:

```nginx
# Frontend
server {
    listen 80;
    server_name altocarwash.com www.altocarwash.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 80;
    server_name api.altocarwash.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Habilitar el sitio
ln -s /etc/nginx/sites-available/altocarwash /etc/nginx/sites-enabled/

# Eliminar sitio por defecto
rm /etc/nginx/sites-enabled/default

# Verificar configuración
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

### Paso 3: Obtener Certificado SSL

```bash
# Obtener certificado para ambos dominios
certbot --nginx -d altocarwash.com -d www.altocarwash.com -d api.altocarwash.com

# Seguir las instrucciones interactivas
# - Ingresar email
# - Aceptar términos
# - Elegir si compartir email (opcional)
# - Elegir opción 2 para redirigir automáticamente HTTP a HTTPS
```

### Paso 4: Configuración automática de renovación

```bash
# Verificar renovación automática
certbot renew --dry-run

# Si funciona, la renovación se hará automáticamente cada 90 días
```

---

## 🚀 OPCIÓN 2: Con Docker Compose y Traefik

### docker-compose.prod-ssl.yml

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=tu-email@ejemplo.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "traefik-letsencrypt:/letsencrypt"
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: alto-carwash-backend
    restart: unless-stopped
    env_file:
      - ./backend/.env.production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.altocarwash.com`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
      - "traefik.http.services.backend.loadbalancer.server.port=4000"
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: alto-carwash-frontend
    restart: unless-stopped
    env_file:
      - ./frontend/.env.production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`altocarwash.com`) || Host(`www.altocarwash.com`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.frontend.loadbalancer.server.port=3000"
    networks:
      - app-network

volumes:
  traefik-letsencrypt:

networks:
  app-network:
    name: alto-carwash-network
    driver: bridge
```

---

## 🔧 Actualizar Variables de Entorno

### backend/.env.production

```bash
# Cambiar URLs a HTTPS
APP_URL="https://api.altocarwash.com"
FRONTEND_URL="https://altocarwash.com"
CORS_ORIGINS="https://altocarwash.com,https://www.altocarwash.com"
```

### frontend/.env.production

```bash
# Cambiar URLs a HTTPS
NEXT_PUBLIC_API_URL=https://api.altocarwash.com
NEXT_PUBLIC_API_BASE=https://api.altocarwash.com/api
```

---

## 📝 Configurar DNS

En tu proveedor de dominio (ej: GoDaddy, Namecheap), agrega estos registros:

```
Tipo    Nombre    Valor               TTL
A       @         104.250.132.28      3600
A       www       104.250.132.28      3600
A       api       104.250.132.28      3600
```

---

## ✅ Verificar Instalación

```bash
# Verificar certificados
certbot certificates

# Verificar que el sitio carga con HTTPS
curl -I https://altocarwash.com
curl -I https://api.altocarwash.com

# Ver logs de Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔄 Renovación Manual (si es necesario)

```bash
# Renovar certificados
certbot renew

# Reiniciar Nginx
systemctl restart nginx
```

---

## 🆘 Solución de Problemas

### El certificado no se genera

```bash
# Verificar que el dominio apunta a la IP correcta
nslookup altocarwash.com

# Verificar que los puertos están abiertos
ufw status
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Ver logs de certbot
journalctl -u certbot
```

### Error "Connection refused"

```bash
# Verificar que Nginx está corriendo
systemctl status nginx

# Reiniciar Nginx
systemctl restart nginx

# Ver logs
tail -f /var/log/nginx/error.log
```

---

## 📊 Calificación SSL

Una vez configurado, puedes verificar tu calificación SSL en:
- https://www.ssllabs.com/ssltest/

---

## 🔒 Mejoras de Seguridad Adicionales

```nginx
# Agregar al archivo de configuración de Nginx
# /etc/nginx/sites-available/altocarwash

server {
    # ... configuración existente ...

    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Límites de rate limiting
    limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;
    limit_req zone=one burst=20 nodelay;
}
```

```bash
# Aplicar cambios
nginx -t
systemctl reload nginx
```

---

## 📞 Recursos Adicionales

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Documentation](https://certbot.eff.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [SSL Labs Testing Tool](https://www.ssllabs.com/ssltest/)
