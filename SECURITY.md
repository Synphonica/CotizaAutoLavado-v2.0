# 🔒 Guía de Seguridad - Alto Carwash

## ⚠️ ACCIÓN INMEDIATA REQUERIDA

Si acabas de detectar que archivos `.env` fueron versionados en Git, sigue estos pasos **INMEDIATAMENTE**:

### 1. Rotar Todas las Credenciales Expuestas

#### Base de Datos (Supabase/PostgreSQL)
```bash
# 1. Cambiar password de PostgreSQL
# 2. Actualizar DATABASE_URL en variables de entorno
# 3. Reiniciar aplicación
```

#### JWT Secret
```bash
# Generar nuevo secret
openssl rand -base64 32

# Actualizar en .env (NUNCA versionarlo)
JWT_SECRET="nuevo-secret-generado"
```

#### API Keys Externas
- **Google Maps**: Ir a [Google Cloud Console](https://console.cloud.google.com/) → Credentials → Regenerar API Key
- **Supabase**: Ir a Settings → API → Regenerar Service Role Key
- **OpenAI**: Ir a [Platform OpenAI](https://platform.openai.com/api-keys) → Revocar y crear nueva key
- **Clerk**: Ir a Dashboard → Regenerar Secret Key
- **Resend**: Ir a Settings → API Keys → Regenerar

#### Stripe/Transbank (Pagos)
- Revocar keys comprometidas inmediatamente desde el dashboard
- Generar nuevas keys de producción
- Verificar transacciones recientes por actividad sospechosa

### 2. Eliminar Archivos .env del Historial de Git

```bash
# ADVERTENCIA: Esto reescribirá el historial de Git
# Asegúrate de que todos los colaboradores estén informados

# Navegar a la raíz del proyecto
cd c:\Users\benja\Downloads\proyecto-titulo\alto-carwash-mejorado

# Eliminar .env de backend
cd backend
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env .env.development .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Eliminar .env de frontend
cd ../frontend
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env .env.development .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Forzar push (CUIDADO: destructivo)
cd ..
git push origin --force --all
git push origin --force --tags

# Limpiar reflog local
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### 3. Verificar que .gitignore está Correctamente Configurado

Asegúrate de que estos archivos/patterns están en `.gitignore`:

```gitignore
# Variables de entorno
.env
.env.*
!.env.example
.env.local
.env.development
.env.development.local
.env.test
.env.test.local
.env.production
.env.production.local

# Archivos de configuración sensibles
config/secrets.json
config/database.json

# Uploads de usuarios (pueden contener datos sensibles)
uploads/
```

### 4. Notificar al Equipo

- Informar a todos los colaboradores sobre la exposición
- Solicitar que eliminen sus copias locales del historial antiguo
- Compartir las nuevas credenciales de forma segura (1Password, Bitwarden, etc.)

---

## 🛡️ Mejores Prácticas de Seguridad

### Gestión de Secretos

#### ✅ CORRECTO
```bash
# Usar variables de entorno
export JWT_SECRET="valor-desde-servicio-seguro"

# Usar gestores de secretos en producción
# - AWS Secrets Manager
# - Azure Key Vault
# - HashiCorp Vault
# - Google Secret Manager
```

#### ❌ INCORRECTO
```typescript
// NUNCA hardcodear credenciales
const apiKey = "sk-1234567890abcdef"; // ❌ MAL
const dbPassword = "mypassword123";    // ❌ MAL
```

### Validación de Entrada

#### ✅ CORRECTO
```typescript
import { IsString, IsEmail, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  firstName: string;
}
```

#### ❌ INCORRECTO
```typescript
// Sin validación
async createUser(data: any) {
  return this.prisma.user.create({ data }); // ❌ Peligroso
}
```

### CORS y Autenticación

#### ✅ CORRECTO
```typescript
// Whitelist específica de dominios
app.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
});
```

#### ❌ INCORRECTO
```typescript
// Permite CUALQUIER origen
app.register(cors, {
  origin: true, // ❌ Inseguro
});
```

### Rate Limiting

```typescript
// Configuración recomendada
app.register(rateLimit, {
  max: 100,              // 100 requests
  timeWindow: 15 * 60 * 1000, // por 15 minutos
  cache: 10000,          // Caché de IPs
});

// Rate limiting estricto para endpoints sensibles
@UseGuards(StrictRateLimitGuard) // 5 requests/min
@Post('auth/login')
async login() {}
```

### SQL Injection (Prisma ORM)

#### ✅ CORRECTO
```typescript
// Usar el cliente tipado de Prisma
const user = await prisma.user.findUnique({
  where: { email: userInput } // ✅ Seguro
});

// Si necesitas raw queries, usa parámetros
const results = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userEmail}
`; // ✅ Parámetros escapados
```

#### ❌ INCORRECTO
```typescript
// Concatenación de strings (vulnerable)
const results = await prisma.$queryRawUnsafe(
  `SELECT * FROM users WHERE email = '${userEmail}'`
); // ❌ VULNERABLE a SQL Injection
```

### XSS (Cross-Site Scripting)

#### Frontend - React/Next.js
```tsx
// React escapa automáticamente
<div>{userInput}</div> // ✅ Seguro

// Usar DOMPurify para HTML rich
import DOMPurify from 'isomorphic-dompurify';
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(htmlContent) 
}} />
```

### Autenticación y Autorización

```typescript
// Usar guards para proteger endpoints
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'provider')
@Delete('services/:id')
async deleteService(@Param('id') id: string) {
  // Solo admins y providers pueden acceder
}

// Verificar ownership de recursos
async updateService(userId: string, serviceId: string) {
  const service = await this.prisma.service.findUnique({
    where: { id: serviceId }
  });
  
  if (service.providerId !== userId) {
    throw new ForbiddenException('No tienes permisos para editar este servicio');
  }
  
  // Continuar con la actualización
}
```

### Headers de Seguridad (Helmet)

```typescript
// Ya configurado en main.ts
await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [`'self'`],
      styleSrc: [`'self'`, `'unsafe-inline'`],
      imgSrc: [`'self'`, 'data:', 'https:'],
      scriptSrc: [`'self'`],
    },
  },
});
```

---

## 🔍 Auditoría de Seguridad

### Escaneo de Dependencias

```bash
# Backend
cd backend
npm audit
npm audit fix

# Escaneo profundo con Snyk
npx snyk test
npx snyk monitor

# Frontend
cd frontend
npm audit
npm audit fix
```

### Escaneo de Secretos en Código

```bash
# Instalar gitleaks
# Windows: winget install gitleaks
# macOS: brew install gitleaks

# Escanear repositorio
gitleaks detect --source . --verbose

# Escanear antes de commit (pre-commit hook)
gitleaks protect --staged
```

### Checklist de Seguridad

- [ ] ✅ Archivos `.env` en `.gitignore`
- [ ] ✅ No hay secretos en el código fuente
- [ ] ✅ CORS configurado con whitelist
- [ ] ✅ Rate limiting activo
- [ ] ✅ Validación de entrada en todos los DTOs
- [ ] ✅ Helmet configurado (headers de seguridad)
- [ ] ✅ JWT con expiración configurada
- [ ] ✅ HTTPS en producción
- [ ] ✅ Dependencias actualizadas (sin vulnerabilidades)
- [ ] ✅ Logs sin información sensible
- [ ] ✅ Backups de base de datos encriptados
- [ ] ✅ 2FA habilitado para cuentas admin

---

## 📞 Reporte de Vulnerabilidades

Si descubres una vulnerabilidad de seguridad, por favor **NO la publiques públicamente**. En su lugar:

1. Envía un email a: security@altocarwash.cl
2. Incluye:
   - Descripción detallada de la vulnerabilidad
   - Pasos para reproducirla
   - Impacto potencial
   - Sugerencias de mitigación (si las tienes)

Responderemos en un plazo máximo de 48 horas.

---

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/helmet)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/security)
- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)

---

**Última actualización**: 2025-10-31
