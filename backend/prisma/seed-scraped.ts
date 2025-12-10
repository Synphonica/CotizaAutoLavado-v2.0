import { PrismaClient } from '@prisma/client';
import { seedPart1 } from './seed-part-01';
import { seedPart2 } from './seed-part-02';
import { seedPart3 } from './seed-part-03';
import { seedPart4 } from './seed-part-04';
import { seedPart5 } from './seed-part-05';
import { seedPart6 } from './seed-part-06';
import { seedPart7 } from './seed-part-07';
import { seedPart8 } from './seed-part-08';
import { seedPart9 } from './seed-part-09';
import { seedPart10 } from './seed-part-10';
import { seedPart11 } from './seed-part-11';
import { seedPart12 } from './seed-part-12';
import { seedPart13 } from './seed-part-13';
import { seedPart14 } from './seed-part-14';
import { seedPart15 } from './seed-part-15';
import { seedPart16 } from './seed-part-16';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando importación de datos scrapeados...');
  console.log('📊 Total de lotes: 16');
  console.log('');
  
  const startTime = Date.now();
  let totalProviders = 0;
  let totalServices = 0;
  let totalErrors = 0;

  const result1 = await seedPart1();
  totalProviders += result1.providersCreated;
  totalServices += result1.servicesCreated;
  totalErrors += result1.errors;
  
  const result2 = await seedPart2();
  totalProviders += result2.providersCreated;
  totalServices += result2.servicesCreated;
  totalErrors += result2.errors;
  
  const result3 = await seedPart3();
  totalProviders += result3.providersCreated;
  totalServices += result3.servicesCreated;
  totalErrors += result3.errors;
  
  const result4 = await seedPart4();
  totalProviders += result4.providersCreated;
  totalServices += result4.servicesCreated;
  totalErrors += result4.errors;
  
  const result5 = await seedPart5();
  totalProviders += result5.providersCreated;
  totalServices += result5.servicesCreated;
  totalErrors += result5.errors;
  
  const result6 = await seedPart6();
  totalProviders += result6.providersCreated;
  totalServices += result6.servicesCreated;
  totalErrors += result6.errors;
  
  const result7 = await seedPart7();
  totalProviders += result7.providersCreated;
  totalServices += result7.servicesCreated;
  totalErrors += result7.errors;
  
  const result8 = await seedPart8();
  totalProviders += result8.providersCreated;
  totalServices += result8.servicesCreated;
  totalErrors += result8.errors;
  
  const result9 = await seedPart9();
  totalProviders += result9.providersCreated;
  totalServices += result9.servicesCreated;
  totalErrors += result9.errors;
  
  const result10 = await seedPart10();
  totalProviders += result10.providersCreated;
  totalServices += result10.servicesCreated;
  totalErrors += result10.errors;
  
  const result11 = await seedPart11();
  totalProviders += result11.providersCreated;
  totalServices += result11.servicesCreated;
  totalErrors += result11.errors;
  
  const result12 = await seedPart12();
  totalProviders += result12.providersCreated;
  totalServices += result12.servicesCreated;
  totalErrors += result12.errors;
  
  const result13 = await seedPart13();
  totalProviders += result13.providersCreated;
  totalServices += result13.servicesCreated;
  totalErrors += result13.errors;
  
  const result14 = await seedPart14();
  totalProviders += result14.providersCreated;
  totalServices += result14.servicesCreated;
  totalErrors += result14.errors;
  
  const result15 = await seedPart15();
  totalProviders += result15.providersCreated;
  totalServices += result15.servicesCreated;
  totalErrors += result15.errors;
  
  const result16 = await seedPart16();
  totalProviders += result16.providersCreated;
  totalServices += result16.servicesCreated;
  totalErrors += result16.errors;
  
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  
  console.log('');
  console.log('✅ Importación completada!');
  console.log(`📊 Proveedores creados: ${totalProviders}`);
  console.log(`📦 Servicios creados: ${totalServices}`);
  console.log(`❌ Errores: ${totalErrors}`);
  console.log(`⏱️  Tiempo: ${elapsed}s`);
  console.log('');
  
  const dbProviders = await prisma.provider.count();
  const dbServices = await prisma.service.count();
  console.log(`📈 Total en BD: ${dbProviders} proveedores, ${dbServices} servicios`);
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
