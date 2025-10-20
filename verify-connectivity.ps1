# Script de verificación de conectividad Backend-Frontend
# Alto Carwash - Sistema de Reservas
# PowerShell version for Windows

Write-Host "🔍 Verificando conectividad Backend-Frontend..." -ForegroundColor Cyan
Write-Host ""

# Función para verificar endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Name
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $Name" -ForegroundColor Green -NoNewline
            Write-Host " - $Url"
            return $true
        }
    }
    catch {
        Write-Host "❌ $Name" -ForegroundColor Red -NoNewline
        Write-Host " - $Url"
        return $false
    }
}

# Verificar que Backend esté corriendo
Write-Host "📡 Verificando Backend (puerto 4000)..." -ForegroundColor Yellow
$backendOk = Test-Endpoint -Url "http://localhost:4000/api/health" -Name "Health Check"
if (-not $backendOk) {
    Write-Host "⚠️  Backend no está corriendo. Ejecuta: cd backend && npm run start:dev" -ForegroundColor Red
}
Write-Host ""

# Verificar que Frontend esté corriendo
Write-Host "🌐 Verificando Frontend (puerto 3000)..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 5 -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend - http://localhost:3000" -ForegroundColor Green
        $frontendOk = $true
    }
}
catch {
    Write-Host "❌ Frontend - http://localhost:3000" -ForegroundColor Red
    Write-Host "⚠️  Frontend no está corriendo. Ejecuta: cd frontend && npm run dev" -ForegroundColor Red
    $frontendOk = $false
}
Write-Host ""

# Si backend está corriendo, verificar endpoints
if ($backendOk) {
    Write-Host "🔗 Verificando endpoints críticos del Backend..." -ForegroundColor Yellow
    Test-Endpoint -Url "http://localhost:4000/api/bookings" -Name "GET /api/bookings" | Out-Null
    Test-Endpoint -Url "http://localhost:4000/api/providers" -Name "GET /api/providers" | Out-Null
    Test-Endpoint -Url "http://localhost:4000/api/services" -Name "GET /api/services" | Out-Null
    Write-Host ""
    
    Write-Host "🧪 Probando endpoint de disponibilidad (nuevo)..." -ForegroundColor Yellow
    $tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
    
    Write-Host "ℹ️  Nota: Este test puede fallar si no hay providers en la BD" -ForegroundColor DarkYellow
    try {
        Invoke-WebRequest -Uri "http://localhost:4000/api/bookings/availability/test-provider-id?date=$tomorrow" -Method Get -TimeoutSec 5 -UseBasicParsing | Out-Null
        Write-Host "✅ GET /api/bookings/availability/:providerId" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  GET /api/bookings/availability/:providerId (puede fallar sin datos)" -ForegroundColor DarkYellow
    }
    Write-Host ""
}

# Verificar CORS
Write-Host "🔐 Verificando configuración de CORS..." -ForegroundColor Yellow
if ($backendOk) {
    try {
        $headers = @{
            "Origin"                        = "http://localhost:3000"
            "Access-Control-Request-Method" = "GET"
        }
        $corsResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -Method Options -Headers $headers -TimeoutSec 5 -UseBasicParsing
        
        $allowOrigin = $corsResponse.Headers["Access-Control-Allow-Origin"]
        if ($allowOrigin -like "*localhost:3000*" -or $allowOrigin -eq "*") {
            Write-Host "✅ CORS permite localhost:3000" -ForegroundColor Green
        }
        else {
            Write-Host "❌ CORS NO permite localhost:3000" -ForegroundColor Red
            Write-Host "   Verifica CORS_ORIGINS en backend/.env" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "⚠️  No se pudo verificar CORS" -ForegroundColor DarkYellow
    }
}
else {
    Write-Host "⚠️  No se puede verificar CORS (backend no está corriendo)" -ForegroundColor DarkYellow
}
Write-Host ""

# Verificar archivos .env
Write-Host "📁 Verificando archivos de configuración..." -ForegroundColor Yellow

if (Test-Path "backend\.env") {
    Write-Host "✅ backend\.env existe" -ForegroundColor Green
    
    $backendEnv = Get-Content "backend\.env" -Raw
    if ($backendEnv -match "CLERK_PUBLISHABLE_KEY" -and $backendEnv -match "DATABASE_URL") {
        Write-Host "   ✓ Variables críticas presentes" -ForegroundColor Green
    }
    else {
        Write-Host "   ⚠️  Faltan variables críticas (CLERK_PUBLISHABLE_KEY, DATABASE_URL)" -ForegroundColor DarkYellow
    }
}
else {
    Write-Host "❌ backend\.env NO existe" -ForegroundColor Red
    Write-Host "   Ejecuta: cd backend && cp env.example .env" -ForegroundColor Yellow
}

if (Test-Path "frontend\.env.local") {
    Write-Host "✅ frontend\.env.local existe" -ForegroundColor Green
    
    $frontendEnv = Get-Content "frontend\.env.local" -Raw
    if ($frontendEnv -match "NEXT_PUBLIC_API_BASE.*localhost:4000") {
        Write-Host "   ✓ NEXT_PUBLIC_API_BASE apunta a localhost:4000" -ForegroundColor Green
    }
    else {
        Write-Host "   ⚠️  Verifica NEXT_PUBLIC_API_BASE en .env.local" -ForegroundColor DarkYellow
    }
}
else {
    Write-Host "❌ frontend\.env.local NO existe" -ForegroundColor Red
    Write-Host "   Ejecuta: cd frontend && cp env.example .env.local" -ForegroundColor Yellow
}
Write-Host ""

# Resumen final
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 RESUMEN" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$totalChecks = 2
$passedChecks = 0

if ($backendOk) { $passedChecks++ }
if ($frontendOk) { $passedChecks++ }

Write-Host "Checks pasados: $passedChecks/$totalChecks"
Write-Host ""

if ($backendOk -and $frontendOk) {
    Write-Host "✅ Sistema listo para usar" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 URLs:"
    Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   Backend:  http://localhost:4000" -ForegroundColor Cyan
    Write-Host "   Swagger:  http://localhost:4000/api/docs" -ForegroundColor Cyan
}
else {
    Write-Host "⚠️  Sistema NO está completamente listo" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Pasos para iniciar:"
    if (-not $backendOk) {
        Write-Host "   1. cd backend && npm run start:dev" -ForegroundColor Yellow
    }
    if (-not $frontendOk) {
        Write-Host "   2. cd frontend && npm run dev" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📚 Documentación: BACKEND_FRONTEND_CONNECTIVITY.md" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
