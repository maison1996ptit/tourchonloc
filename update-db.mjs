import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Đang kết nối database...');
  try {
    const updated = await prisma.siteSettings.upsert({
      where: { id: 'main_settings' },
      update: {
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
      },
      create: {
        id: 'main_settings',
        websiteName: 'Tour Chọn Lọc',
        seoDefaultTitle: 'Tour Chọn Lọc - Luôn mang lại giá trị cốt lõi',
        seoDefaultDescription: 'Khám phá những trải nghiệm du lịch đẳng cấp và chân thực cùng đội ngũ chuyên gia của chúng tôi.',
        tagline: 'Khám phá thế giới theo cách của bạn',
        heroHeadline: 'Experience Authentic Travel Like Never Before',
        heroSubtitle: 'Tailor-made journeys for the discerning traveler.',
        heroImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=2070',
        heroCTA: { text: 'Plan Your Trip', link: '/customize-trip' },
        footerDescription: 'Chúng tôi chuyên cung cấp các trải nghiệm du lịch độc đáo và đẳng cấp.',
        contactInfo: {
          phone: ['+84 372 521 237'],
          email: ['fit.saletourchonloc@gmail.com'],
          officeAddresses: ['535/25 Pham Van Dong Street, Binh Loi Trung Ward, Ho Chi Minh City, Vietnam']
        },
        socialLinks: {
          zalo: 'https://zalo.me/84372521237'
        },
        affiliateGear: []
      }
    });
    console.log('✅ THÀNH CÔNG! Đã lưu cấu hình mới vào database:');
    console.log(`- Tên web: ${updated.websiteName}`);
    console.log(`- Email: ${updated.contactInfo?.email?.[0]}`);
  } catch (error) {
    console.error('❌ LỖI:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();