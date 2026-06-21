import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.tour.count({
    where: { status: 'Published' }
  });
  console.log("Count of Published Tours:", count);

  const samples = await prisma.tour.findMany({
    where: { status: 'Published' },
    select: { title: true, destination: true },
    take: 5
  });
  console.log("Sample Tours:", samples);
}

main().catch(console.error).finally(() => prisma.$disconnect());
