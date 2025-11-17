/**
 * Script para verificar la calidad de los datos de servicios
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando calidad de datos de servicios...\n');

  // Obtener todos los servicios con sus proveedores
  const services = await prisma.service.findMany({
    include: {
      provider: {
        select: {
          id: true,
          businessName: true,
          address: true,
          city: true,
          latitude: true,
          longitude: true,
          rating: true,
          reviewCount: true,
        }
      }
    }
  });

  console.log(`📊 Total de servicios: ${services.length}\n`);

  // Estadísticas
  const stats = {
    withProvider: services.filter(s => s.provider).length,
    withPrice: services.filter(s => s.price && Number(s.price) > 0).length,
    withDuration: services.filter(s => s.duration && s.duration > 0).length,
    withDescription: services.filter(s => s.description && s.description.length > 10).length,
    withCategory: services.filter(s => s.category).length,
    active: services.filter(s => s.status === 'ACTIVE').length,
    available: services.filter(s => s.isAvailable).length,
    withProviderCoordinates: services.filter(s => 
      s.provider && s.provider.latitude && s.provider.longitude
    ).length,
  };

  console.log('✅ ESTADÍSTICAS DE SERVICIOS:');
  console.log(`   Con proveedor: ${stats.withProvider} (${Math.round(stats.withProvider / services.length * 100)}%)`);
  console.log(`   Con precio válido: ${stats.withPrice} (${Math.round(stats.withPrice / services.length * 100)}%)`);
  console.log(`   Con duración: ${stats.withDuration} (${Math.round(stats.withDuration / services.length * 100)}%)`);
  console.log(`   Con descripción: ${stats.withDescription} (${Math.round(stats.withDescription / services.length * 100)}%)`);
  console.log(`   Con categoría: ${stats.withCategory} (${Math.round(stats.withCategory / services.length * 100)}%)`);
  console.log(`   Activos: ${stats.active} (${Math.round(stats.active / services.length * 100)}%)`);
  console.log(`   Disponibles: ${stats.available} (${Math.round(stats.available / services.length * 100)}%)`);
  console.log(`   Con coordenadas del proveedor: ${stats.withProviderCoordinates} (${Math.round(stats.withProviderCoordinates / services.length * 100)}%)\n`);

  // Análisis de precios
  const prices = services
    .filter(s => s.price && Number(s.price) > 0)
    .map(s => Number(s.price));
  
  if (prices.length > 0) {
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    console.log('💰 ANÁLISIS DE PRECIOS:');
    console.log(`   Precio promedio: $${Math.round(avgPrice).toLocaleString()}`);
    console.log(`   Precio mínimo: $${minPrice.toLocaleString()}`);
    console.log(`   Precio máximo: $${maxPrice.toLocaleString()}\n`);
  }

  // Análisis de duraciones
  const durations = services
    .filter(s => s.duration && s.duration > 0)
    .map(s => s.duration);
  
  if (durations.length > 0) {
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    console.log('⏱️  ANÁLISIS DE DURACIONES:');
    console.log(`   Duración promedio: ${Math.round(avgDuration)} min`);
    console.log(`   Duración mínima: ${minDuration} min`);
    console.log(`   Duración máxima: ${maxDuration} min\n`);
  }

  // Tipos de servicio
  const serviceTypes = services.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('🔧 DISTRIBUCIÓN POR TIPO DE SERVICIO:');
  Object.entries(serviceTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`   ${type}: ${count} (${Math.round(count / services.length * 100)}%)`);
    });

  // Categorías
  const categories = services
    .filter(s => s.category)
    .reduce((acc, s) => {
      acc[s.category!] = (acc[s.category!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  if (Object.keys(categories).length > 0) {
    console.log('\n📂 DISTRIBUCIÓN POR CATEGORÍA:');
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} (${Math.round(count / services.length * 100)}%)`);
      });
  }

  // Servicios con problemas
  const problematicServices = services.filter(s => 
    !s.price || Number(s.price) <= 0 ||
    !s.duration || s.duration <= 0 ||
    !s.description ||
    !s.provider ||
    !s.provider.latitude ||
    !s.provider.longitude
  );

  if (problematicServices.length > 0) {
    console.log(`\n⚠️  SERVICIOS CON DATOS INCOMPLETOS: ${problematicServices.length}`);
    console.log('   Ejemplos:');
    problematicServices.slice(0, 5).forEach(s => {
      const issues: string[] = [];
      if (!s.price || Number(s.price) <= 0) issues.push('sin precio');
      if (!s.duration || s.duration <= 0) issues.push('sin duración');
      if (!s.description) issues.push('sin descripción');
      if (!s.provider) issues.push('sin proveedor');
      else if (!s.provider.latitude || !s.provider.longitude) issues.push('sin coordenadas');
      
      console.log(`   - ${s.name} (${issues.join(', ')})`);
      if (s.provider) {
        console.log(`     Provider: ${s.provider.businessName}`);
      }
    });
  }

  console.log('\n✅ Verificación de servicios completada');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
