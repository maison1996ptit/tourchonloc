import { PrismaClient } from '@prisma/client';
import { mockBlogs } from '../src/data/blogs';
import { mockTours } from '../src/data/tours';
import { mockSiteSettings } from '../src/data/siteSettings';
import { mockThemeSettings } from '../src/data/theme';
import { mockUsers } from '../src/data/users';
import { mockTestimonials } from '../src/data/testimonials';
import { mockMenus } from '../src/data/menus';
import { mockGuideMaps } from '../src/data/guideMaps';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('--- MASTER DATA RESTORATION ---');

  // 1. Site Settings
  console.log('Restoring Site Settings...');
  await prisma.siteSettings.upsert({
    where: { id: 'main_settings' },
    update: {
      ...mockSiteSettings,
      heroCTA: mockSiteSettings.heroCTA as any,
      contactInfo: mockSiteSettings.contactInfo as any,
      socialLinks: mockSiteSettings.socialLinks as any,
      affiliateGear: mockSiteSettings.affiliateGear as any,
    },
    create: {
      id: 'main_settings',
      ...mockSiteSettings,
      heroCTA: mockSiteSettings.heroCTA as any,
      contactInfo: mockSiteSettings.contactInfo as any,
      socialLinks: mockSiteSettings.socialLinks as any,
      affiliateGear: mockSiteSettings.affiliateGear as any,
    },
  });

  // 2. Theme Settings
  console.log('Restoring Theme Settings...');
  await prisma.themeSettings.upsert({
    where: { id: 'main_theme' },
    update: {
      activePreset: mockThemeSettings.activePreset,
      useSeasonalTheme: mockThemeSettings.useSeasonalTheme,
      customConfig: mockThemeSettings.customConfig as any,
    },
    create: {
      id: 'main_theme',
      activePreset: mockThemeSettings.activePreset,
      useSeasonalTheme: mockThemeSettings.useSeasonalTheme,
      customConfig: mockThemeSettings.customConfig as any,
    },
  });

  // 3. Users
  console.log('Restoring Users...');
  await prisma.user.deleteMany({});
  for (const user of mockUsers) {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password ? hashPassword(user.password) : hashPassword('default123'),
        role: user.role,
        isActive: user.isActive,
      },
    });
  }

  // 4. Tours
  console.log('Restoring Tours...');
  await prisma.tour.deleteMany({});
  // Use data from seed_real_data if available or fallback to mockTours
  const realTours = [
    {
      title: "Đài Loan: Đài Bắc - Đài Trung - Cao Hùng (5N4Đ)",
      slug: "tour-dai-loan-5n4d",
      shortDescription: "Khám phá hòn đảo ngọc Đài Loan với hành trình xuyên suốt từ Bắc đến Nam. Chiêm ngưỡng tháp Taipei 101 kiêu hãnh, thả đèn trời cầu an tại phố cổ Thập Phần và đắm mình trong vẻ đẹp thơ mộng của hồ Nhật Nguyệt.",
      overview: "Đài Loan mang trong mình một sức hút kỳ lạ, là sự kết hợp giữa nét hiện đại sầm uất của Taipei 101 và vẻ trầm mặc, hoài cổ của những ngôi làng ven biển. Hành trình này sẽ đưa bạn đi qua những địa danh biểu tượng nhất.",
      destination: "Đài Loan",
      region: "Đông Á",
      durationDays: 5,
      durationNights: 4,
      priceFrom: 12990000,
      featuredImage: "https://images.unsplash.com/photo-1583116631143-0370428d0976?auto=format&fit=crop&w=1200",
      images: [
        "https://images.unsplash.com/photo-1583116631143-0370428d0976?auto=format&fit=crop&w=1200", 
        "https://images.unsplash.com/photo-1552250575-e508473b090f?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1571474004516-f3319080dbfa?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1590059346853-eb89d8161f3f?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1502484437255-75e1f0e20ec4?auto=format&fit=crop&w=800"
      ],
      isFeatured: true,
      status: "Published",
      category: "Đông Á",
      itinerary: [
        { day: 1, title: "TP.HCM - Đài Bắc", activities: ["Khởi hành đến sân bay Đào Viên", "Tham quan tháp Taipei 101", "Dạo chợ đêm Tây Môn Đinh"] },
        { day: 2, title: "Đài Bắc - Đài Trung", activities: ["Tham quan phố cổ Thập Phần", "Công viên địa chất Dã Liễu", "Di chuyển đến Đài Trung"] },
        { day: 3, title: "Đài Trung - Cao Hùng", activities: ["Du thuyền hồ Nhật Nguyệt", "Ghé thăm Văn Võ Miếu", "Di chuyển đến Cao Hùng"] },
        { day: 4, title: "Cao Hùng - Đài Bắc", activities: ["Phật Quang Sơn Tự", "Đầm Liên Trì", "Trở về Đài Bắc"] },
        { day: 5, title: "Đài Bắc - TP.HCM", activities: ["Mua sắm tại trung tâm miễn thuế", "Khởi hành về Việt Nam"] }
      ],
      included: ["Vé máy bay khứ hồi", "Khách sạn 4 sao", "Các bữa ăn theo chương trình", "Bảo hiểm du lịch", "Visa"],
      excluded: ["Tiền tip cho HDV và tài xế", "Chi phí cá nhân"],
      departureDates: ["07/05/2026", "21/05/2026", "28/05/2026", "04/06/2026", "11/06/2026", "18/06/2026"],
      highlights: ["Tháp Taipei 101", "Phố cổ Thập Phần", "Hồ Nhật Nguyệt"],
      seoTitle: "Tour du lịch Đài Loan 5 ngày 4 đêm giá tốt nhất",
      seoDescription: "Tham gia tour Đài Loan khám phá Đài Bắc, Đài Trung, Cao Hùng với lịch trình hấp dẫn, khách sạn cao cấp."
    },
    {
      title: "Nhật Bản: Cung Đường Vàng Osaka - Kyoto - Tokyo (5N5Đ)",
      slug: "tour-nhat-ban-cung-duong-vang",
      shortDescription: "Hành trình di sản đi qua những thành phố biểu tượng nhất của xứ sở hoa anh đào. Trải nghiệm tàu Shinkansen hiện đại, chiêm ngưỡng núi Phú Sĩ hùng vĩ.",
      overview: "Hành trình đi qua những thành phố biểu tượng nhất của xứ sở hoa anh đào. Trải nghiệm tàu Shinkansen hiện đại, chiêm ngưỡng núi Phú Sĩ hùng vĩ và lạc bước trong những ngôi chùa cổ kính tại Kyoto.",
      destination: "Nhật Bản",
      region: "Đông Á",
      durationDays: 5,
      durationNights: 5,
      priceFrom: 28900000,
      featuredImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200",
      images: [
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200", 
        "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1490806678282-284e4470179e?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800"
      ],
      isFeatured: true,
      status: "Published",
      category: "Đông Á",
      itinerary: [
        { day: 1, title: "TP.HCM - Osaka", activities: ["Khởi hành bay đêm đến Osaka"] },
        { day: 2, title: "Osaka - Kyoto", activities: ["Lâu đài Osaka", "Chùa Thanh Thủy (Kiyomizu-dera)", "Di chuyển bằng Shinkansen"] },
        { day: 3, title: "Kyoto - Núi Phú Sĩ", activities: ["Đền Fushimi Inari", "Tham quan khu vực núi Phú Sĩ", "Trải nghiệm tắm Onsen"] },
        { day: 4, title: "Núi Phú Sĩ - Tokyo", activities: ["Làng cổ Oshino Hakkai", "Mua sắm tại Ginza", "Di chuyển về Tokyo"] },
        { day: 5, title: "Tokyo - TP.HCM", activities: ["Chùa Asakusa Kannon", "Tháp Tokyo Skytree", "Bay về Việt Nam"] }
      ],
      included: ["Vé máy bay khứ hồi", "Khách sạn 4-5 sao", "Trải nghiệm Onsen và Shinkansen", "Visa Nhật Bản"],
      excluded: ["Tiền tip", "Chi phí mua sắm"],
      departureDates: ["14/05/2026", "21/05/2026", "28/05/2026", "03/06/2026", "04/06/2026", "10/06/2026"],
      highlights: ["Núi Phú Sĩ", "Chùa Thanh Thủy", "Tàu Shinkansen"],
      seoTitle: "Tour Nhật Bản Cung Đường Vàng 5 ngày 5 đêm",
      seoDescription: "Khám phá Nhật Bản với tour cung đường vàng Osaka - Kyoto - Tokyo. Đặt ngay để nhận ưu đãi."
    }
  ];

  for (const t of realTours) {
    await prisma.tour.create({
      data: {
        ...t,
        itinerary: t.itinerary as any,
        priceByGroupSize: {},
      }
    });
  }

  // 5. Blogs
  console.log('Restoring Blogs...');
  await prisma.blog.deleteMany({});
  const improvedBlogs = [
    {
      title: "Nhật Bản - Hành Trình Chạm Đến Linh Hồn Của Xứ Sở Phù Tang",
      slug: "nhat-ban-hanh-trinh-linh-hon",
      content: "Nội dung cẩm nang Nhật Bản chi tiết...",
      excerpt: "Lạc bước giữa cố đô Kyoto cổ kính hay đắm chìm trong nhịp sống hiện đại của Tokyo.",
      author: "Nhà Lữ Hành Tâm Huyết",
      categoryId: "cam-nang",
      category: "Cẩm nang du lịch",
      thumbnail: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800",
      status: "Published",
      tags: ["Nhật Bản", "Kinh nghiệm", "Văn hóa"],
      seoTitle: "Cẩm nang du lịch Nhật Bản từ góc nhìn nhà lữ hành",
      seoDescription: "Khám phá Nhật Bản trọn vẹn với những địa điểm độc bản."
    },
    {
      title: "Việt Nam - Vẻ Đẹp Bất Tận Từ Bắc Chí Nam",
      slug: "viet-nam-ve-dep-bat-tan",
      content: "Nội dung cẩm nang Việt Nam chi tiết...",
      excerpt: "Khám phá dải đất hình chữ S với những kỳ quan thiên nhiên thế giới và nền văn hóa đậm đà bản sắc.",
      author: "Tour Chọn Lọc",
      categoryId: "cam-nang",
      category: "Cẩm nang du lịch",
      thumbnail: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800",
      status: "Published",
      tags: ["Việt Nam", "Cẩm nang", "Di sản"],
      seoTitle: "Cẩm nang du lịch Việt Nam toàn tập",
      seoDescription: "Khám phá vẻ đẹp bất tận của Việt Nam qua lăng kính du lịch."
    }
  ];

  for (const b of improvedBlogs) {
    await prisma.blog.create({
      data: {
        ...b,
        publishedDate: new Date(),
      }
    });
  }

  // 6. Testimonials
  console.log('Restoring Testimonials...');
  await prisma.testimonial.deleteMany({});
  for (const t of mockTestimonials) {
    await prisma.testimonial.create({
      data: {
        customerName: t.customerName,
        country: t.country,
        avatar: t.avatar,
        flagCode: t.flagCode,
        rating: t.rating,
        content: t.content,
        language: t.language,
        status: t.status,
      }
    });
  }

  // 7. Menus
  console.log('Restoring Menus...');
  await prisma.menuItem.deleteMany({});
  const headerMenu = [
    { label: 'Trang chủ', url: '/', order: 1 },
    { label: 'Tour du lịch', url: '/tours', order: 2 },
    { label: 'Dịch vụ Visa', url: '/visa', order: 3 },
    { label: 'Cẩm Nang', url: '/cam-nang', order: 4 },
    { label: 'Về chúng tôi', url: '/about', order: 5 }
  ];
  for (const item of headerMenu) {
    await prisma.menuItem.create({
      data: { label: item.label, url: item.url, order: item.order, type: 'Header', isActive: true }
    });
  }
  for (const item of mockMenus.footer) {
    await prisma.menuItem.create({
      data: { label: item.label, url: item.url, order: item.order, type: 'Footer', isActive: item.isActive }
    });
  }

  // 8. Country Guides
  console.log('Restoring Country Guides & 80 Markers...');
  for (const guide of mockGuideMaps) {
    const country = await prisma.countryGuide.upsert({
      where: { countrySlug: guide.countrySlug },
      update: {
        centerLat: guide.center[0],
        centerLng: guide.center[1],
        zoom: guide.zoom,
        maxBounds: guide.maxBounds as any,
        introduction: guide.introduction,
        cultureInfo: guide.cultureInfo,
        flag: guide.flag,
        mascot: guide.mascot,
      },
      create: {
        id: guide.id,
        countryName: guide.countryName,
        countrySlug: guide.countrySlug,
        centerLat: guide.center[0],
        centerLng: guide.center[1],
        zoom: guide.zoom,
        maxBounds: guide.maxBounds as any,
        introduction: guide.introduction,
        cultureInfo: guide.cultureInfo,
        flag: guide.flag,
        mascot: guide.mascot,
      },
    });

    await prisma.regionMarker.deleteMany({ where: { countryGuideId: country.id } });
    await prisma.regionMarker.createMany({
      data: guide.markers.map(m => ({
        id: m.id,
        name: m.name,
        lat: m.lat,
        lng: m.lng,
        markerType: m.markerType || 'Spot',
        contentSlug: m.contentSlug,
        shortDescription: m.shortDescription,
        imageUrl: m.imageUrl,
        priority: m.priority || 1,
        countryGuideId: country.id
      }))
    });
  }

  // 9. Visa Services
  console.log('Restoring Visa Services...');
  const visaData = [
    { country: 'Canada', price: 7000000 },
    { country: 'Mỹ', price: 7200000 },
    { country: 'Úc', price: 6800000 },
    { country: 'New Zealand', price: 10000000 },
    { country: 'Visa Schengen', price: 7000000 },
    { country: 'Anh Quốc', price: 11000000 },
    { country: 'Hàn Quốc 5 năm', price: 6000000 },
    { country: 'Hàn Quốc 3 tháng', price: 3000000 },
    { country: 'Nhật Bản', price: 3600000 },
    { country: 'Trung Quốc', price: 4000000 },
    { country: 'Đài Loan', price: 3500000 },
    { country: 'Hong Kong', price: 3500000 }
  ];

  for (const item of visaData) {
    await prisma.visaService.upsert({
      where: { country: item.country },
      update: { price: item.price },
      create: { country: item.country, price: item.price }
    });
  }

  console.log('--- ALL DATA RESTORED SUCCESSFULLY ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
