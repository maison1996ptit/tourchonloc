import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function dumpData() {
  console.log("--- DATABASE IMAGE URL DUMP ---");
  const markers = await prisma.regionMarker.findMany({
    take: 10,
    select: { name: true, imageUrl: true }
  });

  markers.forEach(m => {
    console.log(`- ${m.name}: ${m.imageUrl}`);
  });
  console.log("-------------------------------");
}

dumpData().catch(console.error).finally(() => prisma.$disconnect());
