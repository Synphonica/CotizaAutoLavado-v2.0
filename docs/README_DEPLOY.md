# 📚 Índice de Documentación de Despliegue

Documentación completa para desplegar Alto Carwash en VPS de Holy.gg.

---

## 🎯 Documentos Principales

### 1. [DEPLOY_VPS.md](../DEPLOY_VPS.md)
**Guía principal de despliegue**
- Información de la VPS
- Conexión SSH
- Instalación de dependencias
- Configuración paso a paso
- Troubleshooting

### 2. [COMANDOS_VPS.md](COMANDOS_VPS.md)
**Referencia rápida de comandos**
- Comandos Docker
- Comandos Docker Compose
- Gestión de contenedores
- Monitoreo y logs
- Troubleshooting común

### 3. [SSL_SETUP.md](SSL_SETUP.md)
**Configuración de HTTPS (Opcional)**
- Instalación de certificados SSL
- Configuración de Nginx
- Let's Encrypt
- Renovación automática

---

## 🚀 Inicio Rápido

### Opción 1: Despliegue Automático (Recomendado)

```bash
# 1. Conectarse a la VPS
ssh root@104.250.132.28

# 2. Descargar y ejecutar script de despliegue
curl -o deploy.sh https://raw.githubusercontent.com/Synphonica/CotizaAutoLavado-v2.0/main/scripts/deploy-vps.sh
chmod +x deploy.sh
./deploy.sh
```

### Opción 2: Despliegue Manual

Ver [DEPLOY_VPS.md](../DEPLOY_VPS.md) - Sección "Despliegue Manual"

---

## 📦 Archivos de Configuración

### Variables de Entorno

- `backend/.env.production` - Configuración del backend para producción
- `frontend/.env.production` - Configuración del frontend para producción

### Docker

- `docker-compose.prod.yml` - Configuración de Docker Compose para producción
- `backend/Dockerfile.prod` - Dockerfile del backend
- `frontend/Dockerfile.prod` - Dockerfile del frontend

### Scripts

- `scripts/deploy-vps.sh` - Script de despliegue automático
- `scripts/clean-vps.sh` - Script de limpieza del servidor

---

## 🔧 Configuración de la VPS

### Información del Servidor
- **IP**: 104.250.132.28
- **OS**: Ubuntu 24.04
- **RAM**: 4 GB
- **vCPUs**: 2
- **Storage**: 50 GB

### Puertos Utilizados
- **80**: Frontend (HTTP)
- **443**: Frontend (HTTPS) - opcional
- **4000**: Backend API
- **22**: SSH

### URLs de Acceso
- **Frontend**: http://104.250.132.28
- **Backend**: http://104.250.132.28:4000
- **API Docs**: http://104.250.132.28:4000/api

---

## 📋 Lista de Verificación Pre-Despliegue

- [ ] VPS activa y accesible vía SSH
- [ ] Variables de entorno configuradas
- [ ] Puertos abiertos en firewall (80, 443, 4000, 22)
- [ ] Docker y Docker Compose instalados
- [ ] Repositorio actualizado

---

## 📋 Lista de Verificación Post-Despliegue

- [ ] Contenedores corriendo: `docker ps`
- [ ] Frontend accesible en http://104.250.132.28
- [ ] Backend accesible en http://104.250.132.28:4000
- [ ] API Docs accesible en http://104.250.132.28:4000/api
- [ ] Logs sin errores: `docker-compose logs -f`
- [ ] Base de datos conectada
- [ ] Migraciones ejecutadas

---

## 🆘 Soporte y Troubleshooting

### Problemas Comunes

1. **Contenedores no inician**
   - Ver logs: `docker-compose logs -f`
   - Verificar variables de entorno
   - Verificar permisos de archivos

2. **Error de conexión a la base de datos**
   - Verificar DATABASE_URL en `.env`
   - Verificar conectividad con Supabase
   - Ejecutar migraciones: `npx prisma migrate deploy`

3. **Frontend no se conecta al Backend**
   - Verificar NEXT_PUBLIC_API_URL en frontend/.env.production
   - Verificar CORS_ORIGINS en backend/.env.production
   - Verificar que backend esté corriendo: `curl http://localhost:4000/api/health`

4. **Puerto ya en uso**
   - Verificar qué usa el puerto: `lsof -i :4000`
   - Detener proceso: `kill -9 <PID>`
   - O cambiar puerto en configuración

---

## 🔄 Actualizaciones

### Para actualizar la aplicación:

```bash
cd /root/alto-carwash
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📊 Monitoreo

### Logs en tiempo real
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Estado de los servicios
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Uso de recursos
```bash
htop
docker stats
```

---

## 🔐 Seguridad

### Recomendaciones básicas:
1. Cambiar puerto SSH por defecto
2. Configurar fail2ban
3. Usar certificados SSL (ver SSL_SETUP.md)
4. Mantener sistema actualizado
5. Backups regulares
6. Monitoreo de logs

---

## 📞 Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)

---

## 📝 Notas

- Las credenciales sensibles están en los archivos `.env` y **NO** deben subirse a Git
- Los archivos `.env.production` son plantillas - actualizar con tus valores reales
- Hacer backups regulares de volúmenes de Docker (especialmente uploads)
- Monitorear uso de disco regularmente
- Renovar certificados SSL cada 90 días (automático con certbot)

---

## ✅ Checklist de Mejoras Futuras

- [ ] Configurar dominio personalizado
- [ ] Instalar certificado SSL
- [ ] Implementar CI/CD con GitHub Actions
- [ ] Configurar backups automáticos
- [ ] Implementar monitoring (Grafana + Prometheus)
- [ ] Configurar alertas de sistema
- [ ] Implementar CDN para assets estáticos
- [ ] Configurar auto-scaling
