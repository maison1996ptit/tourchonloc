import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.menuItem.updateMany({
    where: { url: '/cam-nang' },
    data: { label: 'Cẩm Nang' }
  });
  console.log('Successfully updated menu label in DB');
}
main().catch(console.error).finally(() => prisma.$disconnect());