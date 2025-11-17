#!/bin/bash

# Script para verificar que no hay secretos o archivos .env en el commit
# Este script debe ejecutarse como pre-commit hook

echo "🔍 Verificando que no hay secretos en el commit..."

# Verificar si hay archivos .env staged
if git diff --cached --name-only | grep -E "\.env$|\.env\..*$" | grep -v "\.env\.example$"; then
    echo "❌ ERROR: Intentando versionar archivos .env"
    echo ""
    echo "Los siguientes archivos no deben ser versionados:"
    git diff --cached --name-only | grep -E "\.env$|\.env\..*$" | grep -v "\.env\.example$"
    echo ""
    echo "Para resolver:"
    echo "  git reset HEAD <archivo>"
    echo "  Asegúrate de que .gitignore incluya estos archivos"
    exit 1
fi

# Buscar patrones comunes de secretos en los archivos staged
PATTERNS=(
    "password\s*=\s*['\"][^'\"]+['\"]"
    "secret\s*=\s*['\"][^'\"]+['\"]"
    "api[_-]?key\s*=\s*['\"][^'\"]+['\"]"
    "token\s*=\s*['\"][^'\"]+['\"]"
    "private[_-]?key\s*=\s*['\"][^'\"]+['\"]"
    "BEGIN PRIVATE KEY"
    "BEGIN RSA PRIVATE KEY"
)

for pattern in "${PATTERNS[@]}"; do
    if git diff --cached -U0 | grep -iE "$pattern" > /dev/null; then
        echo "⚠️  ADVERTENCIA: Posible secreto detectado con patrón: $pattern"
        echo ""
        echo "Revisa los cambios staged y asegúrate de no versionar credenciales"
        echo ""
        echo "Para continuar de todos modos, usa: git commit --no-verify"
        exit 1
    fi
done

echo "✅ Verificación de secretos completada - No se encontraron problemas"
exit 0
