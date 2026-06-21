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
      title: "Nhật Bản Tháng 10 Có Gì Đẹp? Cẩm Nang Mùa Lá Đỏ Cho Gia Đình",
      slug: "nhat-ban-thang-10-co-gi-dep",
      isMemo: true,
      coverImage: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200",
      memoContent: {
        hook: "Có những chuyến đi mà nhiều năm sau nhìn lại, điều còn đọng lại không phải là đã check-in bao nhiêu điểm đến, mà là những khoảnh khắc được cùng gia đình trải qua một khoảng thời gian thật trọn vẹn. Với Nhật Bản, tháng 10 chính là một trong những thời điểm tuyệt vời nhất như vậy. Đây là lúc mùa thu bắt đầu hiện rõ trên khắp đất nước với tiết trời mát mẻ, bầu trời trong xanh và những sắc vàng, đỏ đầu tiên xuất hiện.",
        problem: "Nhiều du khách thường nghĩ rằng toàn bộ nước Nhật sẽ đỏ rực vào tháng 10. Nhưng thực tế, mùa lá phong bắt đầu từ vùng lạnh phía Bắc (Hokkaido) trước rồi mới lan dần xuống phía Nam. Đi Tokyo hay Kyoto vào tháng 10, bạn sẽ hụt hẫng vì lá vẫn còn xanh. Ngoài ra, việc di chuyển bằng tàu điện ngầm công cộng phức tạp khi đi cùng người lớn tuổi và trẻ nhỏ rất mệt mỏi, kết hợp với thời tiết tối sớm ở Hokkaido (16h30 đã nhá nhem) khiến bạn dễ bị bể lịch trình.",
        solution: "Đội ngũ Tour Chọn Lọc đã thiết kế lịch trình chuyên biệt cho mùa lá đỏ tháng 10. Chúng tôi đưa bạn đến đúng nơi lá chuyển màu rực rỡ nhất (Hokkaido, Jozankei, đèo phong Nikko, Kawaguchi ngắm Phú Sĩ). Đặc biệt, chuyến đi sử dụng xe du lịch riêng đưa đón tận nơi, sắp xếp thời gian Onsen thư giãn ấm áp ngay khi trời vừa sập tối, giúp cả gia đình thong thả tận hưởng chuyến đi.",
        experience: "Nên chuẩn bị trang phục theo kiểu 'củ hành' – nhiều lớp áo mỏng để dễ dàng điều chỉnh khi nhiệt độ thay đổi từ 10°C (ban đêm) đến 24°C (ban ngày). Tránh di chuyển đèo Irohazaka (Nikko) vào ngày cuối tuần vì cực kỳ tắc đường, hãy đi ngày thường hoặc xuất phát thật sớm. Ở Kawaguchi, các điểm ngắm Phú Sĩ khá xa nhau, thuê xe riêng sẽ tối ưu hơn xe bus công cộng rất nhiều.",
        benefits: "Đặt tour tại Tour Chọn Lọc, bạn được hỗ trợ thủ tục Visa trọn gói với tỷ lệ đậu 100%. Lịch trình được may đo phù hợp cho gia đình nhiều thế hệ, dịch vụ 4-5 sao chất lượng cao, hướng dẫn viên bản địa am hiểu văn hóa đồng hành suốt chặng, cam kết giá cả minh bạch không phát sinh chi phí ẩn.",
        cta: { text: "Nhận Tư Vấn Thiết Kế Lịch Trình Miễn Phí", link: "/customize-trip" },
        faq: [
          { q: "Làm sao để tắm Onsen đúng cách cho trẻ nhỏ?", a: "Các khu tắm Onsen có quy định nhiệt độ riêng. Chuyên viên của Tour Chọn Lọc sẽ tư vấn các bể tắm Onsen gia đình riêng tư (Kashikiri) có nhiệt độ nước vừa phải, an toàn cho bé." },
          { q: "Thời gian làm Visa Nhật Bản mất bao lâu?", a: "Thông thường làm Visa Nhật Bản mất từ 8-10 ngày làm việc. Bạn nên nộp hồ sơ trước ngày khởi hành dự kiến ít nhất 30 ngày để đảm bảo lịch trình." }
        ],
        tableOfContents: ["Hiểu lầm về mùa lá đỏ Nhật Bản", "Hành trình ngắm lá đỏ lý tưởng tháng 10", "Kinh nghiệm thực tế khi đi cùng gia đình", "Lợi ích khi đặt tour trọn gói tại Tour Chọn Lọc"]
      },
      content: "",
      excerpt: "Lá đỏ tháng 10 ngắm ở đâu đẹp nhất? Hướng dẫn đầy đủ và kinh nghiệm du lịch Nhật Bản mùa thu cho gia đình có trẻ nhỏ và người cao tuổi.",
      author: "Chuyên gia Tour Chọn Lọc",
      categoryId: "cam-nang",
      category: "Cẩm nang du lịch",
      thumbnail: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800",
      status: "Published",
      tags: ["Nhật Bản", "Mùa lá đỏ", "Hokkaido", "Gia đình"],
      seoTitle: "Cẩm Nang Du Lịch Nhật Bản Mùa Thu Lá Đỏ",
      seoDescription: "Khám phá kinh nghiệm ngắm lá đỏ Nhật Bản tháng 10 tại Hokkaido, Nikko, Phú Sĩ cùng lịch trình tối ưu cho gia đình có người cao tuổi."
    },
    {
      title: "Chi Phí Đi Nhật Bản Tháng 10 Hết Bao Nhiêu? Phân Tích Chi Phí Thực Tế Cho Gia Đình",
      slug: "chi-phi-di-nhat-ban-thang-10",
      isMemo: true,
      coverImage: "https://images.unsplash.com/photo-1502484437255-75e1f0e20ec4?auto=format&fit=crop&w=1200",
      memoContent: {
        hook: "Khi bắt đầu lên kế hoạch du lịch Nhật Bản mùa thu, câu hỏi lớn nhất của các gia đình là: 'Đi Nhật Bản tháng 10 hết khoảng bao nhiêu tiền?'. Các quảng cáo tour thường báo giá 25-35 triệu, nhưng tổng chi phí thực tế cho gia đình 4 người (gồm 2 người lớn, 1 trẻ em, 1 người lớn tuổi) đi tự túc mùa cao điểm thường cao hơn rất nhiều do các chi phí phát sinh ẩn.",
        problem: "Chi phí thực tế tự túc bao gồm: Vé máy bay khứ hồi chất lượng cao (12-16 triệu/người), khách sạn trung tâm cho gia đình mùa cao điểm (3-4 triệu/đêm), ăn uống thoải mái cho mọi thế hệ (1.2 triệu/người/ngày), và chi phí di chuyển liên tỉnh đắt đỏ ở Nhật Bản (tàu nhanh Shinkansen, bus, xe riêng ngắm cảnh từ 4-5 triệu/người). Tổng cộng ngân sách tự túc vọt lên khoảng 128 triệu đồng cho gia đình 4 người, chưa kể việc tự chuẩn bị hồ sơ visa phức tạp và căng thẳng.",
        solution: "Tour Chọn Lọc mang đến giải pháp tour trọn gói gia đình cao cấp với chi phí trọn gói chỉ khoảng 32 triệu đồng/người. Mức giá này đã bao gồm toàn bộ vé máy bay thẳng, khách sạn 4 sao gần ga trung tâm, các bữa ăn tiêu chuẩn cao và dịch vụ làm visa trọn gói, giúp bạn tiết kiệm 30% ngân sách và loại bỏ hoàn toàn mệt mỏi.",
        experience: "Hãy ưu tiên các chuyến bay thẳng của Vietnam Airlines hoặc ANA để đảm bảo sức khỏe cho ông bà và trẻ nhỏ, tránh bay transit giá rẻ gây mệt mỏi. Nên đặt tour trước tối thiểu 60 ngày để hưởng chính sách ưu đãi nhóm đặc biệt từ Tour Chọn Lọc.",
        benefits: "Đặt tour sớm giúp gia đình an tâm 100% đậu Visa. Bạn sẽ có xe du lịch đưa đón suốt tuyến không lo đi bộ mang vác hành lý nặng tại các ga tàu điện ngầm. Đặc biệt: Đăng ký nhóm gia đình từ 4 người trở lên được Giảm ngay 1.000.000đ/khách.",
        cta: { text: "Nhận Báo Giá Tour Trọn Gói Ưu Đãi", link: "/contact" },
        faq: [
          { q: "Chi phí tour đã bao gồm phí làm Visa chưa?", a: "Có, giá tour trọn gói của Tour Chọn Lọc đã bao gồm toàn bộ lệ phí Đại sứ quán và phí chuẩn bị hồ sơ dịch thuật công chứng visa." },
          { q: "Chính sách giảm giá nhóm 4 người áp dụng như thế nào?", a: "Khi đăng ký nhóm gia đình từ 4 người trước ngày khởi hành 60 ngày, bạn sẽ được trừ trực tiếp 1.000.000đ/khách vào tổng giá trị hợp đồng." }
        ],
        tableOfContents: ["Chi tiết các hạng mục chi phí đi Nhật", "Những chi phí ẩn gia đình thường bỏ qua", "So sánh kinh tế giữa đi tự túc và đi tour", "Ưu đãi đặc biệt khi đặt tour sớm"]
      },
      content: "",
      excerpt: "Phân tích chi tiết chi phí vé máy bay, khách sạn, ăn uống và di chuyển mùa thu Nhật Bản. So sánh thực tế chi phí đi tự túc và đi tour trọn gói cho gia đình.",
      author: "Chuyên gia Tài chính Du Lịch",
      categoryId: "cam-nang",
      category: "Cẩm nang du lịch",
      thumbnail: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=800",
      status: "Published",
      tags: ["Chi phí du lịch", "Kinh nghiệm du lịch", "Gia đình", "Nhật Bản"],
      seoTitle: "Chi Phí Du Lịch Nhật Bản Tháng 10 Thực Tế Cho Gia Đình",
      seoDescription: "Tính toán chi tiết ngân sách đi Nhật Bản tháng 10 cho gia đình 4 người. So sánh chi phí đi tự túc và đi tour trọn gói cùng ưu đãi nhóm."
    },
    {
      title: "Bí Quyết Săn Sale Du Lịch: Đừng Để Giá Cả Cản Trở Chuyến Đi!",
      slug: "bi-quyet-san-sale-du-lich",
      isMemo: true,
      coverImage: "/images/about-bg.jpg",
      memoContent: {
        hook: "Bạn có biết? Hàng ngàn chuyến du lịch trong mơ đang có giá tốt hơn bạn nghĩ. Vấn đề chỉ là bạn chưa biết cách 'săn' chúng một cách khoa học.",
        problem: "Bạn thường xuyên bỏ lỡ các đợt khuyến mãi? Bạn thấy một tour 'giảm giá' nhưng lại sợ 'của rẻ là của ôi', không biết chất lượng có đảm bảo? Bạn tốn hàng giờ để so sánh giá nhưng vẫn không chắc mình đã có lựa chọn tốt nhất?",
        solution: "Tại Tour Chọn Lọc, chúng tôi đã 'lập trình' một hệ thống săn sale thông minh. Tương tự như một 'Product Schema' trong kỹ thuật, mỗi tour đều có các trường giá đặc biệt (`salePrice`, `saleStartDate`, `saleEndDate`). Hệ thống sẽ tự động áp dụng mức giá tốt nhất khi một đợt khuyến mãi được kích hoạt, đảm bảo bạn không bao giờ bỏ lỡ cơ hội.",
        experience: "Kinh nghiệm của chúng tôi cho thấy, các đợt sale tốt nhất thường không kéo dài. Giống như một 'Cron Job' chạy hàng ngày để cập nhật trạng thái `isActive`, các ưu đãi của chúng tôi được cập nhật liên tục. Hãy đăng ký nhận tin từ Tour Chọn Lọc, hệ thống sẽ tự động thông báo cho bạn ngay khi có đợt sale phù hợp với sở thích của bạn.",
        benefits: "Đặt tour qua Tour Chọn Lọc, bạn không chỉ nhận được giá tốt. Bạn nhận được sự AN TÂM. Mọi tính toán giá (`Price Calculation Logic`) đều được thực hiện và xác thực ở phía máy chủ, loại bỏ mọi sai sót. Chúng tôi cam kết mức giá bạn thấy là mức giá cuối cùng, minh bạch và không có chi phí ẩn.",
        cta: { text: "Xem Ngay Các Tour Đang Giảm Giá!", link: "/tours?filter=on-sale" },
        faq: [ { q: "Làm sao để biết một tour đang giảm giá?", a: "Các tour giảm giá sẽ có nhãn 'Ưu đãi' nổi bật. Ngoài ra, bạn có thể lọc các tour đang giảm giá trên trang danh sách tour của chúng tôi." }, { q: "Chất lượng tour giảm giá có đảm bảo không?", a: "Tuyệt đối! Mọi tour du lịch, dù có giảm giá hay không, đều tuân thủ tiêu chuẩn chất lượng vàng của Tour Chọn Lọc." } ],
        tableOfContents: ["Vấn đề thường gặp khi săn sale", "Giải pháp công nghệ từ Tour Chọn Lọc", "Kinh nghiệm đặt tour giá tốt", "Lợi ích khi đặt qua chúng tôi"]
      },
      content: "", // Keep original content field empty for memos
      excerpt: "Làm thế nào để vi vu thế giới mà không 'đau ví'? Khám phá các bí quyết săn sale du lịch một cách khoa học và an toàn.",
      author: "Chuyên gia Săn Deal",
      categoryId: "cam-nang",
      category: "Cẩm nang du lịch",
      thumbnail: "https://images.unsplash.com/photo-1570125909248-b39b5b18f8a8?auto=format&fit=crop&w=800",
      status: "Published",
      tags: ["Sale", "Khuyến mãi", "Mẹo du lịch"],
      seoTitle: "Bí Quyết Săn Sale Du Lịch Thông Minh",
      seoDescription: "Hướng dẫn cách tìm kiếm, đánh giá và đặt các tour du lịch giảm giá một cách an toàn, hiệu quả và khoa học."
    },
    {
      title: "Lập Trình Chuyến Đi Hoàn Hảo: Biến Ước Mơ Thành Kế Hoạch",
      slug: "lap-trinh-chuyen-di-hoan-hao",
      isMemo: true,
      coverImage: "/images/about-bg.jpg",
      memoContent: {
        hook: "Một chuyến đi hoàn hảo không tự nhiên mà có. Nó được 'kiến trúc' và 'lập trình' một cách khoa học, tỉ mỉ đến từng chi tiết.",
        problem: "Bạn cảm thấy choáng ngợp trước hàng tá việc cần chuẩn bị: đặt vé, chọn khách sạn, lên lịch trình, dự trù kinh phí? Bạn sợ bỏ sót những điểm đến thú vị hoặc gặp phải những vấnnom không lường trước?",
        solution: "Hãy xem việc lập kế hoạch chuyến đi như xây dựng một phần mềm. Tại Tour Chọn Lọc, chúng tôi có những 'Kiến trúc sư giải pháp' cho hành trình của bạn. Chúng tôi xác định 'Key Components' (Điểm đến, Trải nghiệm, Chỗ ở, Di chuyển), sau đó thiết kế một 'logic' kết nối chúng một cách hoàn hảo, tối ưu về thời gian và chi phí.",
        experience: "Với kinh nghiệm tổ chức hàng ngàn tour, chúng tôi có những 'Scheduled Tasks' (Công việc định kỳ) để kiểm tra mọi thứ trước khi bạn lên đường: xác nhận lại vé, kiểm tra tình hình thời tiết, gửi cho bạn những gợi ý về trang phục... Mọi rủi ro tiềm ẩn đều được quản lý.",
        benefits: "Khi bạn chọn Tour Chọn Lọc, bạn không cần phải lo về 'Admin Interface' (giao diện quản trị phức tạp) của chuyến đi. Chúng tôi lo tất cả. Bạn chỉ cần tận hưởng. Dịch vụ của chúng tôi đảm bảo an toàn ('Security Considerations') và tích hợp liền mạch với mọi nhu cầu của bạn.",
        cta: { text: "Nhận Tư Vấn 1-1 Miễn Phí Từ Chuyên Gia", link: "/customize-trip" },
        faq: [ { q: "Tôi có thể yêu cầu thay đổi lịch trình không?", a: "Chắc chắn rồi. Dịch vụ của chúng tôi cho phép tùy biến linh hoạt để phù hợp nhất với mong muốn của bạn." }, { q: "Chi phí cho việc tư vấn và lập kế hoạch là bao nhiêu?", a: "Chúng tôi cung cấp phiên tư vấn và lên kế hoạch sơ bộ hoàn toàn miễn phí. Bạn chỉ thanh toán khi quyết định đặt tour." } ],
        tableOfContents: ["Nỗi sợ khi tự lập kế hoạch", "Giải pháp từ các 'Kiến trúc sư' du lịch", "Quy trình làm việc khoa học", "Tại sao nên chọn chúng tôi?"]
      },
      content: "",
      excerpt: "Biến chuyến đi mơ ước của bạn thành một kế hoạch chi tiết, khả thi và không còn căng thẳng với phương pháp làm việc khoa học của chúng tôi.",
      author: "Kiến Trúc Sư Hành Trình",
      categoryId: "cam-nang",
      category: "Cẩm nang du lịch",
      thumbnail: "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&w=800",
      status: "Published",
      tags: ["Lập kế hoạch", "Tư vấn", "Mẹo du lịch"],
      seoTitle: "Phương Pháp Lập Kế Hoạch Chuyến Đi Hoàn Hảo",
      seoDescription: "Học cách biến một chuyến đi phức tạp thành một kế hoạch đơn giản, dễ thực hiện và đảm bảo mọi thứ hoàn hảo như một phần mềm được lập trình tốt."
    },
    {
      title: "Hàn Quốc - Bản Tình Ca Ngọt Ngào Giữa Lòng Á Đông",
      slug: "han-quoc-ban-tinh-ca",
      isMemo: false,
      content: `
![Gyeongbokgung Palace](https://images.unsplash.com/photo-1540959733332-e9ab65cca611?auto=format&fit=crop&w=1200)

Hàn Quốc không chỉ có trên phim ảnh. Khi trực tiếp đặt chân đến đây, bạn mới thấy vùng đất này tràn đầy năng lượng nhưng cũng không kém phần lãng mạn.

### Hành Trình Qua Những Thước Phim
- **Đảo Nami:** Bất kể bạn đến vào mùa thu lá vàng hay mùa đông tuyết trắng, Nami luôn mang một vẻ đẹp buồn man mác nhưng vô cùng quyến rũ. Đi dạo dưới hàng cây ngân hạnh thẳng tắp, bạn sẽ ngỡ như mình là nhân vật chính trong một bản tình ca.
- **Cung điện Gyeongbokgung:** Trải nghiệm mặc bộ Hanbok truyền thống và dạo bước trong cung điện nguy nga là điều bắt buộc. Cảm giác như được xuyên không trở về thời kỳ Joseon huy hoàng.
- **Tháp Namsan (N Seoul Tower):** Nơi lưu giữ hàng ngàn ổ khóa tình yêu. Hãy lên đây vào buổi tối để ngắm nhìn Seoul hoa lệ rực rỡ ánh đèn.

![Nami Island](https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1200)
      `,
      excerpt: "Từ đảo Nami lãng mạn đến cung điện Gyeongbokgung nguy nga, Hàn Quốc là điểm đến mơ ước của mọi trái tim yêu cái đẹp.",
      author: "Nhà Lữ Hành Tâm Huyết",
      categoryId: "cam-nang",
      category: "Cẩm nang du lịch",
      thumbnail: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800",
      status: "Published",
      tags: ["Hàn Quốc", "Nami", "Seoul"],
      seoTitle: "Hàn Quốc: Cẩm nang du lịch trọn gói từ A-Z",
      seoDescription: "Khám phá vẻ đẹp lãng mạn của Hàn Quốc: Đảo Nami, Seoul sôi động và văn hóa ẩm thực độc đáo."
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
        historyInfo: guide.historyInfo,
        geographyInfo: guide.geographyInfo,
        populationInfo: guide.populationInfo,
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
        historyInfo: guide.historyInfo,
        geographyInfo: guide.geographyInfo,
        populationInfo: guide.populationInfo,
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

  // 10. Visa Stats
  console.log('Restoring Visa Stats...');
  await prisma.visaStats.upsert({
    where: { id: 'singleton' },
    update: {
      passRate: 98.6,
      successfulClients: 10000,
      experienceYears: 10
    },
    create: {
      id: 'singleton',
      passRate: 98.6,
      successfulClients: 10000,
      experienceYears: 10
    }
  });

  // 11. Guide Categories & Tags
  console.log('Restoring Guide Categories & Tags...');
  const guideCategories = [
    { name: 'Cẩm nang du lịch', slug: 'cam-nang-du-lich', description: 'Kinh nghiệm du lịch trọn gói cao cấp.' },
    { name: 'Cẩm nang tự túc', slug: 'cam-nang-tu-tuc', description: 'Bí quyết khám phá tự do.' },
    { name: 'Kinh nghiệm ăn uống', slug: 'kinh-nghiem-an-uong', description: 'Khám phá văn hóa ẩm thực địa phương.' }
  ];

  for (const cat of guideCategories) {
    await prisma.guideCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: { name: cat.name, slug: cat.slug, description: cat.description }
    });
  }

  const guideTags = [
    { name: 'Nhật Bản', slug: 'nhat-ban' },
    { name: 'Hàn Quốc', slug: 'han-quoc' },
    { name: 'Mùa thu', slug: 'mua-thu' },
    { name: 'Tiết kiệm', slug: 'tiet-kiem' },
    { name: 'Gia đình', slug: 'gia-dinh' }
  ];

  for (const tag of guideTags) {
    await prisma.guideTag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: { name: tag.name, slug: tag.slug }
    });
  }

  console.log('--- ALL DATA RESTORED SUCCESSFULLY ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
