import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- EMERGENCY DATA WIPE: CLEARING IMAGE URLS ---');
  await prisma.regionMarker.updateMany({
    data: { imageUrl: null }
  });
  console.log('--- ALL IMAGE URLS CLEARED FROM DATABASE ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
