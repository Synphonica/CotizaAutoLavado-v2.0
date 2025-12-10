# 🚀 DESPLIEGUE DEL FRONTEND EN VPS

## 📋 Pasos para Desplegar el Frontend

### 1. Subir los cambios del frontend a GitHub (desde tu máquina local)
```bash
cd c:\Users\benja\Downloads\proyecto-titulo\alto-carwash-mejorado

# Agregar los cambios
git add .

# Hacer commit
git commit -m "feat: Configurar frontend para producción"

# Subir a GitHub
git push origin main
```

### 2. Conectarse a la VPS
```bash
ssh root@104.250.132.28
```

### 3. Clonar el repositorio en la VPS (PRIMERA VEZ)
```bash
# Crear directorio para el proyecto
mkdir -p /root/proyecto-titulo
cd /root/proyecto-titulo

# Clonar el repositorio desde GitHub
git clone https://github.com/Synphonica/CotizaAutoLavado-v2.0.git alto-carwash-mejorado

# Entrar al directorio
cd alto-carwash-mejorado
```

**NOTA:** Si ya clonaste el repositorio antes, solo haz:
```bash
cd /root/proyecto-titulo/alto-carwash-mejorado
git pull origin main
```

### 4. Configurar variables de entorno en la VPS
```bash
# En la VPS
cd /root/proyecto-titulo/alto-carwash-mejorado

# Verificar que el archivo .env.production existe
ls -la frontend/.env.production

# Si NO existe, créalo (aunque debería estar en el repositorio)
# nano frontend/.env.production
# (copiar el contenido del archivo .env.production local)
```

### 5. Construir y levantar el frontend con Docker
```bash
# Detener los contenedores actuales si existen
docker-compose -f docker-compose.prod.yml down

# Construir la imagen del frontend (forzar rebuild)
docker-compose -f docker-compose.prod.yml build --no-cache frontend

# Levantar todos los servicios
docker-compose -f docker-compose.prod.yml up -d

# O solo el frontend si el backend ya está corriendo
docker-compose -f docker-compose.prod.yml up -d frontend
```

### 6. Verificar que el frontend está corriendo
```bash
# Ver los logs del frontend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Ver el estado de los contenedores
docker-compose -f docker-compose.prod.yml ps

# Verificar la salud del contenedor
docker inspect alto-carwash-frontend | grep -A 5 Health
```

### 7. Probar el acceso
```bash
# Desde la VPS
curl http://localhost:3000

# Desde tu navegador
http://104.250.132.28
```

## 🔧 Comandos Útiles

### Ver logs en tiempo real
```bash
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Reiniciar solo el frontend
```bash
docker-compose -f docker-compose.prod.yml restart frontend
```

### Reconstruir desde cero
```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache frontend
docker-compose -f docker-compose.prod.yml up -d
```

### Ver recursos del contenedor
```bash
docker stats alto-carwash-frontend
```

### Acceder al contenedor
```bash
docker exec -it alto-carwash-frontend sh
```

## 🐛 Troubleshooting

### El frontend no inicia
```bash
# Ver logs detallados
docker-compose -f docker-compose.prod.yml logs frontend

# Verificar variables de entorno
docker exec alto-carwash-frontend env | grep NEXT_PUBLIC
```

### Error de conexión con el backend
```bash
# Verificar que el backend está corriendo
docker-compose -f docker-compose.prod.yml ps backend

# Verificar la red
docker network inspect alto-carwash-mejorado_app-network

# Probar conexión desde el frontend al backend
docker exec alto-carwash-frontend wget -O- http://backend:4000/api/health
```

### Limpiar y empezar de nuevo
```bash
# Detener y eliminar todo
docker-compose -f docker-compose.prod.yml down -v

# Limpiar imágenes antiguas
docker image prune -a

# Reconstruir
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🔒 Configuración de Firewall (si es necesario)
```bash
# Permitir tráfico en el puerto 80
ufw allow 80/tcp

# Verificar reglas
ufw status
```

## 📝 Notas Importantes

1. **Variables de Entorno**: El archivo `.env.production` ya está configurado con la IP de la VPS (104.250.132.28)

2. **DOCKER_BUILD**: La variable `DOCKER_BUILD=true` está configurada para habilitar el modo `standalone` de Next.js

3. **Imágenes Remotas**: Se agregó la configuración para que Next.js pueda cargar imágenes desde tu VPS

4. **Puerto**: El frontend se ejecuta en el puerto 80, así que puedes acceder directamente sin especificar puerto

5. **Dependencia del Backend**: El frontend esperará a que el backend esté saludable antes de iniciar

## ✅ Checklist de Despliegue

- [ ] Backend está corriendo y saludable
- [ ] Código actualizado en GitHub
- [ ] Código actualizado en VPS (git pull)
- [ ] Variables de entorno configuradas (.env.production)
- [ ] Docker Compose ejecutado
- [ ] Contenedor del frontend corriendo
- [ ] Frontend accesible desde http://104.250.132.28
- [ ] Conexión con backend funcionando
- [ ] Autenticación con Clerk funcionando
- [ ] Google Maps funcionando
