import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const tours = [
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
    images: ["https://images.unsplash.com/photo-1583116631143-0370428d0976?auto=format&fit=crop&w=1200", "https://images.unsplash.com/photo-1552250575-e508473b090f?auto=format&fit=crop&w=800"],
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
    images: ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200", "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=800"],
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
  },
  {
    title: "Hàn Quốc: Seoul - Nami - Everland (4N4Đ)",
    slug: "tour-han-quoc-seoul-nami",
    shortDescription: "Đắm chìm trong không gian lãng mạn của đảo Nami và sự sôi động của thủ đô Seoul.",
    overview: "Nếu có một đất nước biết cách làm say lòng người bằng những khung cảnh lãng mạn, đó chắc chắn phải là Hàn Quốc. Một hành trình cân bằng hoàn hảo giữa thiên nhiên và văn hóa.",
    destination: "Hàn Quốc",
    region: "Đông Á",
    durationDays: 4,
    durationNights: 4,
    priceFrom: 15900000,
    featuredImage: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1200",
    images: ["https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1200", "https://images.unsplash.com/photo-1538669715515-5c3758c07ba9?auto=format&fit=crop&w=800"],
    isFeatured: true,
    status: "Published",
    category: "Đông Á",
    itinerary: [
      { day: 1, title: "TP.HCM - Seoul", activities: ["Bay đêm đến sân bay Incheon"] },
      { day: 2, title: "Seoul - Đảo Nami", activities: ["Tham quan đảo Nami", "Tháp Namsan", "Thưởng thức ẩm thực địa phương"] },
      { day: 3, title: "Seoul - Everland", activities: ["Công viên giải trí Everland", "Lớp học làm Kimchi", "Trải nghiệm mặc Hanbok"] },
      { day: 4, title: "Seoul - TP.HCM", activities: ["Cung điện Gyeongbokgung", "Mua sắm tại phố Myeongdong", "Khởi hành về Việt Nam"] }
    ],
    included: ["Vé máy bay khứ hồi", "Khách sạn 4 sao trung tâm", "Phí visa Hàn Quốc", "Bảo hiểm"],
    excluded: ["Tiền tip", "Chi phí cá nhân"],
    departureDates: ["05/06/2026", "12/06/2026", "19/06/2026", "26/06/2026"],
    highlights: ["Đảo Nami", "Cung điện Gyeongbokgung", "Công viên Everland"],
    seoTitle: "Tour Hàn Quốc Seoul Nami Everland 4 ngày 4 đêm",
    seoDescription: "Du lịch Hàn Quốc khám phá đảo Nami, công viên Everland và thủ đô Seoul sôi động."
  },
  {
    title: "Trung Quốc: Thượng Hải - Hàng Châu - Ô Trấn - Nam Kinh (5N4Đ)",
    slug: "tour-trung-quoc-giang-nam",
    shortDescription: "Tìm về một Giang Nam xưa cũ với Ô Trấn nghìn năm tuổi và vẻ đẹp kiều diễm của Tây Hồ.",
    overview: "Hành trình kết nối giữa quá khứ rực rỡ và tương lai hiện đại tại bến Thượng Hải sầm uất. Tìm về một Giang Nam xưa cũ với Ô Trấn nghìn năm tuổi.",
    destination: "Trung Quốc",
    region: "Trung Hoa",
    durationDays: 5,
    durationNights: 4,
    priceFrom: 18500000,
    featuredImage: "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=1200",
    images: ["https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=1200"],
    isFeatured: true,
    status: "Published",
    category: "Trung Hoa",
    itinerary: [
      { day: 1, title: "TP.HCM - Thượng Hải", activities: ["Khởi hành đến Thượng Hải", "Tham quan Bến Thượng Hải", "Phố Nam Kinh"] },
      { day: 2, title: "Thượng Hải - Hàng Châu", activities: ["Tham quan Tây Hồ", "Thưởng thức trà Long Tỉnh", "Di chuyển đến Hàng Châu"] },
      { day: 3, title: "Hàng Châu - Ô Trấn", activities: ["Khám phá cổ trấn Ô Trấn", "Trải nghiệm đi thuyền trên sông"] },
      { day: 4, title: "Ô Trấn - Nam Kinh", activities: ["Phu Tử Miếu Nam Kinh", "Sông Tần Hoài"] },
      { day: 5, title: "Nam Kinh - TP.HCM", activities: ["Mua sắm đặc sản", "Khởi hành về Việt Nam"] }
    ],
    included: ["Vé máy bay", "Khách sạn 4-5 sao", "Visa đoàn Trung Quốc", "Các bữa ăn"],
    excluded: ["Tiền tip", "Chi phí cá nhân"],
    departureDates: ["09/05/2026", "16/05/2026", "23/05/2026", "30/05/2026"],
    highlights: ["Bến Thượng Hải", "Tây Hồ Hàng Châu", "Cổ trấn Ô Trấn"],
    seoTitle: "Tour Trung Quốc Giang Nam: Thượng Hải - Hàng Châu - Ô Trấn",
    seoDescription: "Khám phá vẻ đẹp cổ kính và hiện đại của Trung Quốc qua tour Giang Nam."
  }
];

const blogs = [
  {
    title: "Nhật Bản - Khi Mùa Thu Khoác Lên Mình Tấm Áo Đỏ Rực",
    slug: "cam-nang-du-lich-nhat-ban-mua-thu",
    content: `Nhật Bản mùa lá đỏ (Momiji) không chỉ là một hiện tượng thiên nhiên, đó là một nét văn hóa, một khoảng lặng tinh tế trong tâm hồn người Nhật. Khi những cơn gió heo may tràn về, cả xứ sở mặt trời mọc bỗng chốc hóa thành một bức tranh sơn dầu khổng lồ với những gam màu nóng bỏng.

Lạc bước giữa cố đô Kyoto, bạn sẽ thấy những ngôi chùa cổ kính như Kiyomizu-dera nép mình dưới tán lá phong rực rỡ. Tiếng chuông chùa ngân vang trong không gian tĩnh lặng, hòa cùng sắc đỏ của lá, sắc vàng của nắng tạo nên một cảm giác bình yên đến lạ kỳ.

Đừng quên trải nghiệm tắm Onsen giữa tiết trời se lạnh, ngắm nhìn những cánh lá phong rơi rụng trên mặt nước. Đó là lúc mọi muộn phiền dường như tan biến, chỉ còn lại sự giao hòa tuyệt đối giữa con người và thiên nhiên.`,
    excerpt: "Khám phá vẻ đẹp tinh tế của Nhật Bản khi bước vào mùa lá đỏ, nơi văn hóa và thiên nhiên hòa quyện làm một.",
    author: "Tour Chọn Lọc",
    categoryId: "cam-nang",
    category: "Cẩm nang du lịch",
    thumbnail: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=800",
    status: "Published",
    tags: ["Nhật Bản", "Mùa thu", "Kinh nghiệm"],
    seoTitle: "Cẩm nang du lịch Nhật Bản mùa lá đỏ rực rỡ",
    seoDescription: "Tất tần tật kinh nghiệm ngắm lá đỏ tại Nhật Bản, từ thời điểm đến những địa điểm tuyệt vời nhất."
  },
  {
    title: "Đài Loan - Hòn Đảo Ngọc Với Những Góc Phố Đầy Hoài Niệm",
    slug: "kham-pha-dai-loan-hon-dao-ngoc",
    content: `Đài Loan mang trong mình một sức hút kỳ lạ, là sự kết hợp giữa nét hiện đại sầm uất của Taipei 101 và vẻ trầm mặc, hoài cổ của những ngôi làng ven biển. Nếu bạn là một tâm hồn yêu văn hóa và ẩm thực, Đài Loan chắc chắn sẽ không làm bạn thất vọng.

Hãy đến với phố cổ Cửu Phần (Jiufen) vào lúc hoàng hôn, khi những chiếc lồng đèn đỏ bắt đầu được thắp sáng dọc theo những con dốc nhỏ hẹp. Bạn sẽ cảm thấy như đang lạc vào thế giới thần tiên của 'Spirited Away'. Hương thơm từ các quầy trà quán, tiếng rao của những gánh hàng rong tạo nên một không gian đầy sức sống nhưng cũng rất đỗi dịu dàng.

Và tất nhiên, không thể bỏ qua trà sữa Đài Loan - 'quốc hồn quốc túy' của hòn đảo này. Thưởng thức một ly trà sữa truyền thống ngay tại nơi nó ra đời sẽ là một trải nghiệm khó quên cho hành trình của bạn.`,
    excerpt: "Từ tháp Taipei 101 hiện đại đến phố cổ Cửu Phần lung linh, Đài Loan luôn biết cách chiều lòng mọi lữ khách.",
    author: "Tour Chọn Lọc",
    categoryId: "cam-nang",
    category: "Cẩm nang du lịch",
    thumbnail: "https://images.unsplash.com/photo-1552250575-e508473b090f?auto=format&fit=crop&w=800",
    status: "Published",
    tags: ["Đài Loan", "Ẩm thực", "Phố cổ"],
    seoTitle: "Kinh nghiệm du lịch Đài Loan tự túc và theo tour",
    seoDescription: "Khám phá Đài Loan - hòn đảo ngọc với vẻ đẹp hiện đại xen lẫn nét cổ kính và ẩm thực đường phố đặc sắc."
  },
  {
    title: "Hàn Quốc - Lãng Mạn Bản Tình Ca Mùa Đông",
    slug: "han-quoc-lang-man-ban-tinh-ca",
    content: `Nếu có một đất nước biết cách làm say lòng người bằng những khung cảnh lãng mạn, đó chắc chắn phải là Hàn Quốc. Mỗi mùa tại xứ sở Kim Chi đều mang một vẻ đẹp riêng, nhưng mùa đông và mùa xuân có lẽ là lúc trái tim người lữ khách dễ rung động nhất.

Đảo Nami - phim trường của những bộ phim tình cảm bất hủ - là nơi bạn có thể đi dạo dưới những hàng cây tùng bách thẳng tắp, cảm nhận làn gió mát rượi và sự tĩnh lặng của thiên nhiên. Tại Seoul, sự đối lập giữa những cung điện nguy nga như Gyeongbokgung và những khu phố thời thượng như Gangnam tạo nên một sức hút khó cưỡng.

Đừng quên thử mặc bộ Hanbok truyền thống, dạo bước qua những con hẻm nhỏ tại làng cổ Bukchon Hanok để ghi lại những khoảnh khắc đẹp nhất của thanh xuân.`,
    excerpt: "Hàn Quốc không chỉ có K-Pop, đó còn là thế giới của những cung điện nguy nga và hòn đảo Nami lãng mạn.",
    author: "Tour Chọn Lọc",
    categoryId: "cam-nang",
    category: "Cẩm nang du lịch",
    thumbnail: "https://images.unsplash.com/photo-1538669715515-5c3758c07ba9?auto=format&fit=crop&w=800",
    status: "Published",
    tags: ["Hàn Quốc", "Seoul", "Du lịch lãng mạn"],
    seoTitle: "Du lịch Hàn Quốc: Bản tình ca mùa đông lãng mạn",
    seoDescription: "Khám phá vẻ đẹp lãng mạn của Hàn Quốc mùa đông, từ đảo Nami đến những cung điện cổ kính."
  }
];

async function main() {
  console.log('Seeding real tours and blogs...');

  for (const t of tours) {
    await prisma.tour.create({
      data: {
        ...t,
        itinerary: t.itinerary as any,
        priceByGroupSize: {},
      }
    });
  }

  for (const b of blogs) {
    await prisma.blog.create({
      data: {
        ...b,
        publishedDate: new Date(),
      }
    });
  }

  console.log('Real data seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
