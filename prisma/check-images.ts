import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkImages() {
  console.log("--- IMAGE URL DIAGNOSTIC ---");
  const markers = await prisma.regionMarker.findMany({
    where: { name: { contains: 'Phú Sĩ' } },
    select: { name: true, imageUrl: true }
  });

  markers.forEach(m => {
    console.log(`Marker: ${m.name}`);
    console.log(`URL in DB: ${m.imageUrl}`);
    if (m.imageUrl && !m.imageUrl.includes('?')) {
      console.error("CRITICAL ERROR: URL is missing the '?' separator!");
    }
  });
  console.log("----------------------------");
}

checkImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
