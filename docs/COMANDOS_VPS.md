# 🚀 Guía Rápida de Comandos VPS

## 📌 COMANDOS BÁSICOS SSH

### Conectarse a la VPS
```bash
ssh root@104.250.132.28
```

### Salir de la VPS
```bash
exit
```

---

## 🧹 LIMPIEZA DEL SERVIDOR

### Ejecutar script de limpieza automática
```bash
cd /root/alto-carwash/scripts
chmod +x clean-vps.sh
./clean-vps.sh
```

### Limpieza manual rápida
```bash
# Detener todos los contenedores
docker stop $(docker ps -aq)

# Eliminar todos los contenedores
docker rm $(docker ps -aq)

# Eliminar todas las imágenes
docker rmi $(docker images -q)

# Limpieza profunda (cuidado: elimina volúmenes)
docker system prune -a --volumes -f

# Eliminar proyecto
rm -rf /root/alto-carwash
```

---

## 🚀 DESPLIEGUE

### Despliegue automático
```bash
cd /root
wget https://raw.githubusercontent.com/Synphonica/CotizaAutoLavado-v2.0/main/scripts/deploy-vps.sh
chmod +x deploy-vps.sh
./deploy-vps.sh
```

### Despliegue manual paso a paso
```bash
# 1. Clonar repositorio
cd /root
git clone https://github.com/Synphonica/CotizaAutoLavado-v2.0.git alto-carwash
cd alto-carwash

# 2. Copiar variables de entorno
cp backend/.env.production backend/.env
cp frontend/.env.production frontend/.env.local

# 3. Copiar docker-compose
cp docs/docker-compose.prod.yml .

# 4. Construir y ejecutar
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🐳 DOCKER COMPOSE

### Iniciar servicios
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Detener servicios
```bash
docker-compose -f docker-compose.prod.yml down
```

### Ver logs en tiempo real
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Ver logs de un servicio específico
```bash
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Reiniciar servicios
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Reconstruir y reiniciar
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### Ver estado de los servicios
```bash
docker-compose -f docker-compose.prod.yml ps
```

---

## 🐳 DOCKER (Comandos directos)

### Ver contenedores en ejecución
```bash
docker ps
```

### Ver todos los contenedores (incluyendo detenidos)
```bash
docker ps -a
```

### Ver logs de un contenedor
```bash
docker logs <container_id_or_name>
docker logs -f <container_id_or_name>  # En tiempo real
docker logs --tail 100 <container_id_or_name>  # Últimas 100 líneas
```

### Entrar a un contenedor
```bash
docker exec -it <container_name> sh
docker exec -it alto-carwash-backend sh
docker exec -it alto-carwash-frontend sh
```

### Reiniciar un contenedor
```bash
docker restart <container_name>
```

### Detener un contenedor
```bash
docker stop <container_name>
```

### Eliminar un contenedor
```bash
docker rm <container_name>
docker rm -f <container_name>  # Forzar
```

### Ver imágenes
```bash
docker images
```

### Eliminar una imagen
```bash
docker rmi <image_id>
```

### Ver uso de recursos
```bash
docker stats
```

---

## 💾 BASE DE DATOS (Prisma)

### Ejecutar migraciones dentro del contenedor
```bash
docker exec -it alto-carwash-backend sh
npx prisma migrate deploy
exit
```

### Ver estado de la base de datos
```bash
docker exec -it alto-carwash-backend sh
npx prisma db pull
exit
```

### Ejecutar seed
```bash
docker exec -it alto-carwash-backend sh
npx prisma db seed
exit
```

---

## 📊 MONITOREO

### Ver uso de CPU, RAM y disco
```bash
htop
```

### Ver espacio en disco
```bash
df -h
```

### Ver uso de memoria
```bash
free -h
```

### Ver procesos
```bash
top
```

### Ver logs del sistema
```bash
journalctl -xe
journalctl -u docker -f  # Logs de Docker
```

---

## 🔥 FIREWALL (UFW)

### Ver reglas del firewall
```bash
ufw status
```

### Permitir un puerto
```bash
ufw allow 4000/tcp
```

### Denegar un puerto
```bash
ufw deny 4000/tcp
```

### Eliminar una regla
```bash
ufw delete allow 4000/tcp
```

### Habilitar firewall
```bash
ufw enable
```

### Deshabilitar firewall
```bash
ufw disable
```

---

## 🔄 ACTUALIZACIÓN DEL PROYECTO

### Actualizar código y reconstruir
```bash
cd /root/alto-carwash
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔍 TROUBLESHOOTING

### Ver por qué falló un contenedor
```bash
docker logs <container_name>
docker inspect <container_name>
```

### Verificar si un puerto está en uso
```bash
netstat -tulpn | grep :4000
lsof -i :4000
```

### Verificar conectividad
```bash
curl http://localhost:4000/api/health
curl http://localhost:3000
```

### Limpiar espacio en disco
```bash
docker system df  # Ver uso
docker system prune -a  # Limpiar
apt autoremove -y
apt clean
```

### Reiniciar Docker
```bash
systemctl restart docker
```

---

## 📦 RESPALDOS

### Respaldar volúmenes de Docker
```bash
docker run --rm \
  --volumes-from alto-carwash-backend \
  -v $(pwd):/backup \
  alpine tar czf /backup/uploads-backup.tar.gz /app/uploads
```

### Restaurar volúmenes
```bash
docker run --rm \
  --volumes-from alto-carwash-backend \
  -v $(pwd):/backup \
  alpine sh -c "cd /app && tar xzf /backup/uploads-backup.tar.gz"
```

---

## 🌐 URLs DE ACCESO

- **Frontend**: http://104.250.132.28
- **Backend**: http://104.250.132.28:4000
- **API Swagger**: http://104.250.132.28:4000/api
- **Health Check**: http://104.250.132.28:4000/api/health

---

## 📞 AYUDA RÁPIDA

Si algo no funciona:

1. **Ver logs**:
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

2. **Reiniciar todo**:
   ```bash
   docker-compose -f docker-compose.prod.yml restart
   ```

3. **Reconstruir desde cero**:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml build --no-cache
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Verificar estado**:
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   docker ps
   ```
