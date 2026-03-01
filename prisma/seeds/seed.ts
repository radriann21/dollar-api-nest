import { PrismaClient, Sources, Trend } from '@prisma/client';
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
    { name: 'BCV', isActive: true, weight: 0.6 },
    { name: 'BINANCE', isActive: true, weight: 0.4 },
  ];

  const createdSources: Sources[] = [];
  for (const source of sources) {
    const createdSource = await prisma.sources.upsert({
      where: { name: source.name },
      update: { isActive: source.isActive, weight: source.weight },
      create: source,
    });
    createdSources.push(createdSource);
    console.log(`✅ Fuente configurada: ${source.name}`);
  }

  console.log('📊 Creando datos históricos de tasas de cambio...');

  const bcvSource = createdSources.find((s) => s.name === 'BCV');
  const binanceSource = createdSources.find((s) => s.name === 'BINANCE');

  if (!bcvSource || !binanceSource) {
    throw new Error('No se encontraron las fuentes BCV o BINANCE');
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let bcvPrice = 36.5;
  let binancePrice = 42.0;

  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);

    const bcvVariation = (Math.random() - 0.5) * 2;
    const binanceVariation = (Math.random() - 0.5) * 3;

    bcvPrice += bcvVariation;
    binancePrice += binanceVariation;

    bcvPrice = Math.max(35, Math.min(45, bcvPrice));
    binancePrice = Math.max(40, Math.min(50, binancePrice));

    const bcvTrend: Trend =
      bcvVariation > 0.5 ? 'UP' : bcvVariation < -0.5 ? 'DOWN' : 'STABLE';
    const binanceTrend: Trend =
      binanceVariation > 0.5
        ? 'UP'
        : binanceVariation < -0.5
          ? 'DOWN'
          : 'STABLE';

    await prisma.exchangeRate.create({
      data: {
        price: bcvPrice,
        sourceId: bcvSource.id,
        trend: bcvTrend,
        variation: bcvVariation,
        createdAt: date,
        updatedAt: date,
      },
    });

    await prisma.exchangeRate.create({
      data: {
        price: binancePrice,
        sourceId: binanceSource.id,
        trend: binanceTrend,
        variation: binanceVariation,
        createdAt: date,
        updatedAt: date,
      },
    });

    if ((i + 1) % 10 === 0) {
      console.log(`  ✓ Creados ${i + 1} días de datos...`);
    }
  }

  await prisma.sources.update({
    where: { id: bcvSource.id },
    data: { lastPrice: bcvPrice },
  });

  await prisma.sources.update({
    where: { id: binanceSource.id },
    data: { lastPrice: binancePrice },
  });

  console.log(`✅ Creados 30 días de datos históricos (60 registros)`);
  console.log(`  📈 BCV último precio: ${bcvPrice.toFixed(4)}`);
  console.log(`  📈 BINANCE último precio: ${binancePrice.toFixed(4)}`);
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
