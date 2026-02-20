import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seeds...');

  const sources = [
    { name: 'BCV', isActive: true },
    { name: 'BINANCE', isActive: true },
  ];

  for (const source of sources) {
    await prisma.sources.upsert({
      where: { name: source.name },
      update: { isActive: source.isActive },
      create: source,
    });
    console.log(`✅ Fuente configurada: ${source.name}`);
  }

  console.log('🚀 Seeds completados');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
