# Script PowerShell para verificar secretos antes de commit

Write-Host "🔍 Verificando que no hay secretos en el commit..." -ForegroundColor Cyan

# Obtener archivos staged
$stagedFiles = git diff --cached --name-only

# Verificar archivos .env
$envFiles = $stagedFiles | Where-Object { 
    $_ -match '\.env$' -or ($_ -match '\.env\.' -and $_ -notmatch '\.env\.example$')
}

if ($envFiles) {
    Write-Host "❌ ERROR: Intentando versionar archivos .env" -ForegroundColor Red
    Write-Host ""
    Write-Host "Los siguientes archivos no deben ser versionados:" -ForegroundColor Yellow
    $envFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "Para resolver:" -ForegroundColor White
    Write-Host "  git reset HEAD <archivo>"
    Write-Host "  Asegúrate de que .gitignore incluya estos archivos"
    exit 1
}

# Patrones de secretos comunes
$patterns = @(
    'password\s*=\s*[''"][^''"]+[''"]',
    'secret\s*=\s*[''"][^''"]+[''"]',
    'api[_-]?key\s*=\s*[''"][^''"]+[''"]',
    'token\s*=\s*[''"][^''"]+[''"]',
    'private[_-]?key\s*=\s*[''"][^''"]+[''"]',
    'BEGIN PRIVATE KEY',
    'BEGIN RSA PRIVATE KEY'
)

# Obtener diff de archivos staged
$diff = git diff --cached -U0

# Buscar patrones
$found = $false
foreach ($pattern in $patterns) {
    if ($diff -match $pattern) {
        if (-not $found) {
            Write-Host "⚠️  ADVERTENCIA: Posibles secretos detectados" -ForegroundColor Yellow
            Write-Host ""
            $found = $true
        }
        Write-Host "  Patrón encontrado: $pattern" -ForegroundColor Yellow
    }
}

if ($found) {
    Write-Host ""
    Write-Host "Revisa los cambios staged y asegúrate de no versionar credenciales" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para continuar de todos modos, usa: git commit --no-verify" -ForegroundColor White
    exit 1
}

Write-Host "✅ Verificación de secretos completada - No se encontraron problemas" -ForegroundColor Green
exit 0
