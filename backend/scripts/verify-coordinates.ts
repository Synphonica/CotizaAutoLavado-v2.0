/**
 * Script para verificar que todos los proveedores tienen coordenadas y direcciones válidas
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando coordenadas y direcciones de proveedores...\n');

  // Obtener todos los proveedores
  const providers = await prisma.provider.findMany({
    select: {
      id: true,
      businessName: true,
      address: true,
      city: true,
      latitude: true,
      longitude: true,
      status: true,
    }
  });

  console.log(`📊 Total de proveedores: ${providers.length}\n`);

  // Categorizar proveedores
  const withCoordinates = providers.filter(p => p.latitude && p.longitude);
  const withoutCoordinates = providers.filter(p => !p.latitude || !p.longitude);
  const withValidCoordinates = withCoordinates.filter(p => 
    p.latitude !== 0 && p.longitude !== 0 &&
    p.latitude >= -90 && p.latitude <= 90 &&
    p.longitude >= -180 && p.longitude <= 180
  );
  const withDefaultCoordinates = withCoordinates.filter(p => 
    (p.latitude === -33.4489 && p.longitude === -70.6693) // Coordenadas de Santiago centro
  );
  const withAddress = providers.filter(p => p.address && p.address.length > 10);
  const withCity = providers.filter(p => p.city);

  // Reporte
  console.log('✅ PROVEEDORES CON COORDENADAS:');
  console.log(`   Total: ${withCoordinates.length} (${Math.round(withCoordinates.length / providers.length * 100)}%)`);
  console.log(`   Válidas: ${withValidCoordinates.length}`);
  console.log(`   Con coordenadas por defecto (Santiago): ${withDefaultCoordinates.length}\n`);

  console.log('❌ PROVEEDORES SIN COORDENADAS:');
  console.log(`   Total: ${withoutCoordinates.length} (${Math.round(withoutCoordinates.length / providers.length * 100)}%)\n`);

  console.log('📍 DIRECCIONES:');
  console.log(`   Con dirección válida: ${withAddress.length} (${Math.round(withAddress.length / providers.length * 100)}%)`);
  console.log(`   Con ciudad: ${withCity.length} (${Math.round(withCity.length / providers.length * 100)}%)\n`);

  // Mostrar algunos ejemplos sin coordenadas
  if (withoutCoordinates.length > 0) {
    console.log('⚠️  Ejemplos de proveedores sin coordenadas:');
    withoutCoordinates.slice(0, 5).forEach(p => {
      console.log(`   - ${p.businessName} (${p.city || 'Sin ciudad'})`);
      console.log(`     Dirección: ${p.address || 'Sin dirección'}`);
    });
    console.log();
  }

  // Mostrar algunos ejemplos con coordenadas por defecto
  if (withDefaultCoordinates.length > 0) {
    console.log('⚠️  Ejemplos de proveedores con coordenadas por defecto (Santiago centro):');
    withDefaultCoordinates.slice(0, 5).forEach(p => {
      console.log(`   - ${p.businessName} (${p.city || 'Sin ciudad'})`);
      console.log(`     Dirección: ${p.address || 'Sin dirección'}`);
    });
    console.log();
  }

  // Estadísticas por ciudad
  const citiesWithCounts = providers.reduce((acc, p) => {
    const city = p.city || 'Sin ciudad';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📊 Distribución por ciudad:');
  Object.entries(citiesWithCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([city, count]) => {
      const withCoords = providers.filter(p => 
        (p.city === city || (!p.city && city === 'Sin ciudad')) && 
        p.latitude && p.longitude && 
        !(p.latitude === -33.4489 && p.longitude === -70.6693)
      ).length;
      console.log(`   ${city}: ${count} (${withCoords} con coordenadas reales)`);
    });

  console.log('\n✅ Verificación completada');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
