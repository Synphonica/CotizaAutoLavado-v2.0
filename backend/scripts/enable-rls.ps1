# ====================================
# Script para habilitar RLS en Supabase (PowerShell)
# ====================================

Write-Host "🔒 Habilitando Row Level Security (RLS) en Supabase..." -ForegroundColor Cyan
Write-Host ""

# Verificar que existe el archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: No se encontró el archivo .env" -ForegroundColor Red
    Write-Host "Por favor, crea un archivo .env con tu DATABASE_URL"
    exit 1
}

# Cargar variables de entorno
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1]
        $value = $matches[2]
        Set-Item -Path "env:$name" -Value $value
    }
}

# Verificar que existe DATABASE_URL
if (-not $env:DATABASE_URL) {
    Write-Host "❌ Error: DATABASE_URL no está definida en .env" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Conectando a Supabase..." -ForegroundColor Yellow
Write-Host ""

# Mensaje de instrucciones para aplicar manualmente
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   INSTRUCCIONES PARA HABILITAR RLS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para habilitar RLS en tus tablas de Supabase:" -ForegroundColor White
Write-Host ""
Write-Host "1. Ve a https://supabase.com y abre tu proyecto" -ForegroundColor Green
Write-Host "2. Haz clic en 'SQL Editor' en el menú lateral" -ForegroundColor Green
Write-Host "3. Crea un 'New query'" -ForegroundColor Green
Write-Host "4. Copia el contenido del archivo:" -ForegroundColor Green
Write-Host "   prisma/migrations/enable_rls.sql" -ForegroundColor Yellow
Write-Host "5. Pégalo en el editor y ejecuta con 'Run'" -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Abrir el archivo SQL para facilitar la copia
$sqlPath = "prisma\migrations\enable_rls.sql"
if (Test-Path $sqlPath) {
    Write-Host "📄 Abriendo archivo SQL..." -ForegroundColor Yellow
    notepad $sqlPath
    Write-Host ""
    Write-Host "✅ Archivo abierto en Notepad" -ForegroundColor Green
    Write-Host "Copia el contenido y pégalo en Supabase SQL Editor" -ForegroundColor Yellow
} else {
    Write-Host "❌ No se encontró el archivo: $sqlPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Después de ejecutar el script en Supabase:" -ForegroundColor Cyan
Write-Host "- Los warnings de RLS desaparecerán ✅" -ForegroundColor Green
Write-Host "- Las tablas estarán protegidas 🔒" -ForegroundColor Green
Write-Host "- Reinicia el backend: npm run start:dev" -ForegroundColor Yellow
Write-Host ""
