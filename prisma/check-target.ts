import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkKagoshima() {
  const m = await prisma.regionMarker.findFirst({
    where: { name: { contains: 'Kagoshima' } }
  });
  console.log("Kagoshima in DB:", m);
}

checkKagoshima().catch(console.error).finally(() => prisma.$disconnect());
