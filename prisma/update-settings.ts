import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const currentSettings = await prisma.siteSettings.findUnique({
    where: { id: 'main_settings' }
  });

  if (currentSettings) {
    await prisma.siteSettings.update({
      where: { id: 'main_settings' },
      data: {
        websiteName: 'Tour Chọn Lọc',
        seoDefaultTitle: 'Tour Chọn Lọc - Luôn mang lại giá trị cốt lõi',
        contactInfo: {
          phone: ['+84 372 521 237'],
          email: ['fit.saletourchonloc@gmail.com'],
          officeAddresses: ['535/25 Pham Van Dong Street, Binh Loi Trung Ward, Ho Chi Minh City, Vietnam']
        },
        socialLinks: {
          zalo: 'https://zalo.me/84372521237'
        }
      }
    });
    console.log('Successfully updated existing SiteSettings in the database.');
  } else {
    console.log('No existing SiteSettings found in the database. Please update via the Admin panel.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });