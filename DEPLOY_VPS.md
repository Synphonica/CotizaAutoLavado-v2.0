# 🚀 Guía de Despliegue en VPS Holy.gg

## 📋 Información de tu VPS
- **IP**: 104.250.132.28
- **OS**: Ubuntu 24.04
- **RAM**: 4 GB
- **vCPUs**: 2
- **Storage**: 50 GB

---

## 1️⃣ CONECTARSE A LA VPS

### Desde Windows (PowerShell o CMD):
```bash
ssh root@104.250.132.28
```

### Desde WSL/Git Bash:
```bash
ssh root@104.250.132.28
```

> **Nota**: Si no tienes la contraseña, ve al panel de Holy.gg → "Manage" → "Reset Password"

---

## 2️⃣ LIMPIAR ARCHIVOS EXISTENTES (Si ya subiste algo)

Una vez conectado a la VPS, ejecuta:

```bash
# Ver qué hay en el servidor
ls -la

# Opción 1: Limpiar todo en el directorio actual
rm -rf *

# Opción 2: Limpiar un directorio específico
rm -rf /ruta/a/tu/proyecto

# Opción 3: Eliminar contenedores Docker existentes
docker ps -a  # Ver todos los contenedores
docker stop $(docker ps -aq)  # Detener todos
docker rm $(docker ps -aq)  # Eliminar todos
docker system prune -a --volumes -f  # Limpieza completa
```

---

## 3️⃣ INSTALAR DEPENDENCIAS EN LA VPS

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose -y

# Verificar instalación
docker --version
docker-compose --version

# Instalar Git (para clonar el repositorio)
sudo apt install git -y

# Instalar utilidades adicionales
sudo apt install nano curl wget htop -y
```

---

## 4️⃣ SUBIR TU PROYECTO A LA VPS

### Opción A: Usando Git (RECOMENDADO)

```bash
# En la VPS
cd ~
git clone https://github.com/Synphonica/CotizaAutoLavado-v2.0.git
cd CotizaAutoLavado-v2.0
```

### Opción B: Usando SCP desde tu PC

```bash
# Desde tu PC (Windows PowerShell)
cd C:\Users\benja\Downloads\proyecto-titulo\alto-carwash-mejorado
scp -r . root@104.250.132.28:/root/alto-carwash
```

### Opción C: Usando WinSCP o FileZilla
1. Descarga WinSCP: https://winscp.net
2. Conecta con:
   - Host: 104.250.132.28
   - Usuario: root
   - Puerto: 22
3. Arrastra y suelta los archivos

---

## 5️⃣ CONFIGURAR VARIABLES DE ENTORNO

Una vez en la VPS, crea los archivos `.env`:

```bash
cd /root/alto-carwash

# Crear .env del backend (usa nano o vi)
nano backend/.env.production
```

Copia el contenido del archivo `.env.production` (que crearemos después) y guarda con `Ctrl+O`, `Enter`, `Ctrl+X`.

```bash
# Crear .env del frontend
nano frontend/.env.production
```

---

## 6️⃣ CONSTRUIR Y EJECUTAR CON DOCKER COMPOSE

```bash
# En el directorio raíz del proyecto
cd /root/alto-carwash

# Construir las imágenes
docker-compose -f docker-compose.prod.yml build

# Iniciar los contenedores
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Ver estado
docker-compose -f docker-compose.prod.yml ps
```

---

## 7️⃣ CONFIGURAR FIREWALL (IMPORTANTE)

Desde el panel de Holy.gg:
1. Ve a "Networking" → "Firewall"
2. Asegúrate de tener estas reglas:
   - **Puerto 80**: HTTP (para el frontend)
   - **Puerto 443**: HTTPS (si usas SSL)
   - **Puerto 4000**: API Backend
   - **Puerto 22**: SSH (para conectarte)

---

## 8️⃣ ACCEDER A TU APLICACIÓN

- **Frontend**: http://104.250.132.28
- **Backend**: http://104.250.132.28:4000
- **API Docs**: http://104.250.132.28:4000/api

---

## 🔧 COMANDOS ÚTILES

### Gestión de contenedores:
```bash
# Ver contenedores corriendo
docker ps

# Ver logs de un contenedor específico
docker logs -f <container_name>

# Reiniciar un contenedor
docker restart <container_name>

# Detener todos los contenedores
docker-compose down

# Reconstruir y reiniciar
docker-compose up -d --build
```

### Migraciones de base de datos:
```bash
# Entrar al contenedor del backend
docker exec -it <backend_container_name> sh

# Ejecutar migraciones
npx prisma migrate deploy

# Seed de datos (opcional)
npx prisma db seed
```

### Monitoreo:
```bash
# Ver uso de recursos
htop

# Ver uso de disco
df -h

# Ver logs del sistema
journalctl -xe
```

---

## 🔒 SEGURIDAD (RECOMENDACIONES)

1. **Cambiar puerto SSH** (opcional pero recomendado):
```bash
sudo nano /etc/ssh/sshd_config
# Cambiar Port 22 a Port 2222
sudo systemctl restart sshd
```

2. **Configurar fail2ban**:
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

3. **Crear usuario no-root**:
```bash
adduser tuusuario
usermod -aG sudo tuusuario
```

---

## 📊 MONITOREO Y MANTENIMIENTO

### Configurar logs rotación:
```bash
# Limitar tamaño de logs de Docker
sudo nano /etc/docker/daemon.json
```

Agregar:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
sudo systemctl restart docker
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Los contenedores no inician:
```bash
docker-compose logs
```

### Puerto ya en uso:
```bash
sudo lsof -i :4000  # Ver qué usa el puerto
sudo kill -9 <PID>  # Matar el proceso
```

### Sin espacio en disco:
```bash
docker system prune -a --volumes  # Liberar espacio
```

### Problemas de permisos:
```bash
sudo chown -R $USER:$USER /root/alto-carwash
```

---

## 📞 CONTACTO Y SOPORTE

Si tienes problemas:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica el firewall en el panel de Holy.gg
3. Asegúrate de que las variables de entorno estén correctas

---

## 🎯 PRÓXIMOS PASOS

- [ ] Configurar dominio personalizado (altocarwash.com)
- [ ] Instalar certificado SSL (Let's Encrypt)
- [ ] Configurar backups automáticos
- [ ] Implementar monitoring (Grafana + Prometheus)
- [ ] Configurar CI/CD con GitHub Actions
