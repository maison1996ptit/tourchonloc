import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const blogs = [
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
      problem: "Bạn cảm thấy choáng ngợp trước hàng tá việc cần chuẩn bị: đặt vé, chọn khách sạn, lên lịch trình, dự trù kinh phí? Bạn sợ bỏ sót những điểm đến thú vị hoặc gặp phải những vấn đề không lường trước?",
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

async function main() {
  console.log('Replacing blogs with high-quality content...');
  
  await prisma.blog.deleteMany({});

  for (const b of blogs) {
    await prisma.blog.create({
      data: {
        title: b.title,
        slug: b.slug,
        isMemo: b.isMemo,
        coverImage: b.coverImage,
        memoContent: b.isMemo ? (b.memoContent as any) : undefined,
        content: b.content,
        excerpt: b.excerpt,
        author: b.author,
        categoryId: b.categoryId,
        category: b.category,
        thumbnail: b.thumbnail,
        status: b.status,
        tags: b.tags,
        seoTitle: b.seoTitle,
        seoDescription: b.seoDescription,
        publishedDate: new Date(),
      }
    });
  }

  console.log('High-quality blogs and memos seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
