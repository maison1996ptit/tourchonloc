import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const blogs = [
  {
    title: "Nhật Bản - Hành Trình Chạm Đến Linh Hồn Của Xứ Sở Phù Tang",
    slug: "nhat-ban-hanh-trinh-linh-hon",
    content: `
![Kiyomizu-dera](https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200)

Nếu có một nơi mà thời gian như ngừng lại để nhường chỗ cho sự giao thoa tuyệt mỹ giữa quá khứ và tương lai, đó chính là Nhật Bản. Tôi đã dành nhiều tuần lạc bước từ những con hẻm nhỏ tại Kyoto cho đến nhịp sống hối hả của Tokyo, và đây là những gì tôi muốn kể cho bạn.

### Những "Tọa Độ" Không Thể Bỏ Lỡ
1. **Kyoto - Linh hồn của truyền thống:** Đừng chỉ đến Chùa Thanh Thủy (Kiyomizu-dera) để check-in. Hãy đến vào sáng sớm, khi những làn sương mỏng còn vương trên mái ngói rêu phong, bạn mới cảm nhận được sự thanh tịnh thực sự. Lạc bước vào rừng tre Arashiyama, tiếng xào xạc của lá tre như một bản nhạc thiền giúp tâm hồn nhẹ bẫng.
2. **Núi Phú Sĩ - Biểu tượng kiêu hãnh:** Phú Sĩ đẹp nhất là khi nhìn từ hồ Kawaguchi. Cảm giác ngồi bên bờ hồ, nhâm nhi một tách trà nóng và ngắm nhìn đỉnh núi phủ tuyết trắng xóa soi bóng xuống mặt nước tĩnh lặng là trải nghiệm "đắt giá" nhất trong đời tôi.
3. **Osaka - Gian bếp của thế giới:** Nếu bạn là một "tín đồ" ẩm thực, Dotonbori sẽ là thiên đường. Takoyaki nóng hổi, cua Tuyết nướng... hương vị đậm đà lan tỏa sẽ khiến bạn quên lối về.

![Fuji Mountain](https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=1200)

### Thời Điểm Nào "Tình" Nhất?
Nhật Bản mỗi mùa một vẻ, nhưng với tôi:
- **Tháng 4 (Mùa Hoa Anh Đào):** Cả đất nước nhuộm trong sắc hồng nhạt. Tuy nhiên, lượng khách sẽ rất đông.
- **Tháng 11 (Mùa Lá Đỏ - Momiji):** Đây là lúc tôi thích nhất. Sắc đỏ, vàng rực rỡ bao phủ các ngôi đền cổ tạo nên khung cảnh huyền ảo như trong phim.

### Điều Thú Vị Chỉ Có Tại Nhật
Bạn có biết rằng việc đi tàu Shinkansen không chỉ là di chuyển, mà là một trải nghiệm văn hóa? Những hộp cơm Ekiben được chuẩn bị tỉ mỉ, hương vị tươi ngon đặc trưng của từng vùng miền mà tàu đi qua sẽ khiến hành trình của bạn thú vị hơn bao giờ hết. Và đừng quên thử tắm Onsen – hãy rũ bỏ mọi lo âu (và cả quần áo) để hòa mình vào dòng nước khoáng nóng ấm áp, cảm nhận sự thư giãn đến từng tế bào.

![Onsen Experience](https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200)
    `,
    excerpt: "Lạc bước giữa cố đô Kyoto cổ kính hay đắm chìm trong nhịp sống hiện đại của Tokyo. Nhật Bản không chỉ là một chuyến đi, đó là một hành trình tìm về bản ngã.",
    author: "Nhà Lữ Hành Tâm Huyết",
    categoryId: "cam-nang",
    category: "Cẩm nang du lịch",
    thumbnail: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800",
    status: "Published",
    tags: ["Nhật Bản", "Kinh nghiệm", "Văn hóa"],
    seoTitle: "Cẩm nang du lịch Nhật Bản từ góc nhìn nhà lữ hành",
    seoDescription: "Khám phá Nhật Bản trọn vẹn với những địa điểm độc bản, thời điểm du lịch lý tưởng và những điều thú vị chưa từng kể."
  },
  {
    title: "Đài Loan - Nơi Những Hoài Niệm Gõ Cửa Trái Tim",
    slug: "dai-loan-hoai-niem",
    content: `
![Jiufen Old Street](https://images.unsplash.com/photo-1571474004502-c1def214ac6d?auto=format&fit=crop&w=1200)

Đài Loan trong mắt tôi là một hòn đảo ngọc đầy quyến rũ, nơi bạn có thể tìm thấy sự hiện đại bậc nhất nép mình bên cạnh những giá trị xưa cũ đầy trân quý.

### Những Điểm Đến "Gây Thương Nhớ"
- **Phố cổ Cửu Phần (Jiufen):** Hãy ghé thăm nơi này vào lúc chạng vạng tối. Khi hàng ngàn chiếc đèn lồng đỏ được thắp sáng dọc theo các con dốc nhỏ, Cửu Phần hiện lên như một thế giới cổ tích. Tôi đã ngồi hàng giờ trong một quán trà cổ, nhìn xuống thung lũng sương mù và cảm nhận hơi thở của thời gian.
- **Tháp Taipei 101:** Đứng trên tầng quan sát, nhìn toàn cảnh thành phố Đài Bắc lung linh ánh đèn, bạn sẽ thấy sự vươn mình mạnh mẽ của vùng đất này.
- **Hồ Nhật Nguyệt:** Đúng như tên gọi, hồ mang một vẻ đẹp thoát tục. Đạp xe quanh bờ hồ vào buổi sáng sớm là cách tuyệt vời nhất để tận hưởng không khí trong lành và cảnh sắc non nước hữu tình.

![Taipei 101](https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?auto=format&fit=crop&w=1200)

### Khi Nào Nên Xách Balo Lên Và Đi?
Đài Loan đẹp nhất vào **mùa Thu (tháng 9 đến tháng 11)**. Thời tiết lúc này dịu mát, khô ráo, cực kỳ thích hợp cho các hoạt động tham quan ngoài trời. Ngoài ra, **tháng 2 (mùa xuân)** cũng rất thú vị với các lễ hội đèn trời lung linh tại Thập Phần.

### Những Điều Thú Vị Bạn Cần Biết
Đài Loan là "vương quốc của những chợ đêm". Đừng chỉ ăn trà sữa, hãy thử đậu phụ thối (nếu bạn đủ can đảm!), lườn gà chiên khổng lồ hay hàu chiên trứng. Người Đài Loan vô cùng hiếu khách và thân thiện, bạn sẽ luôn nhận được những nụ cười ấm áp dù ở bất cứ đâu.

![Taiwan Food](https://images.unsplash.com/photo-1562601579-599dec554e8d?auto=format&fit=crop&w=1200)
    `,
    excerpt: "Khám phá sự giao thoa tuyệt vời giữa nét hiện đại sầm uất và vẻ trầm mặc hoài cổ của hòn đảo ngọc Đài Loan qua lăng kính người lữ hành.",
    author: "Nhà Lữ Hành Tâm Huyết",
    categoryId: "cam-nang",
    category: "Cẩm nang du lịch",
    thumbnail: "https://images.unsplash.com/photo-1583116631143-0370428d0976?auto=format&fit=crop&w=800",
    status: "Published",
    tags: ["Đài Loan", "Chợ đêm", "Cửu Phần"],
    seoTitle: "Đài Loan: Review chi tiết hành trình từ Bắc đến Nam",
    seoDescription: "Kinh nghiệm du lịch Đài Loan thực tế: Cửu Phần lung linh, Taipei 101 kiêu hãnh và thiên đường ẩm thực chợ đêm."
  },
  {
    title: "Hàn Quốc - Bản Tình Ca Ngọt Ngào Giữa Lòng Á Đông",
    slug: "han-quoc-ban-tinh-ca",
    content: `
![Gyeongbokgung Palace](https://images.unsplash.com/photo-1540959733332-e9ab65cca611?auto=format&fit=crop&w=1200)

Hàn Quốc không chỉ có trên phim ảnh. Khi trực tiếp đặt chân đến đây, bạn mới thấy vùng đất này tràn đầy năng lượng nhưng cũng không kém phần lãng mạn.

### Hành Trình Qua Những Thước Phim
- **Đảo Nami:** Bất kể bạn đến vào mùa thu lá vàng hay mùa đông tuyết trắng, Nami luôn mang một vẻ đẹp buồn man mác nhưng vô cùng quyến rũ. Đi dạo dưới hàng cây ngân hạnh thẳng tắp, bạn sẽ ngỡ như mình là nhân vật chính trong một bản tình ca.
- **Cung điện Gyeongbokgung:** Trải nghiệm mặc bộ Hanbok truyền thống và dạo bước trong cung điện nguy nga là điều bắt buộc. Cảm giác như được xuyên không trở về thời kỳ Joseon huy hoàng.
- **Tháp Namsan (N Seoul Tower):** Nơi lưu giữ hàng ngàn ổ khóa tình yêu. Hãy lên đây vào buổi tối để ngắm nhìn Seoul hoa lệ rực rỡ ánh đèn.

![Nami Island](https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1200)

### Mùa Nào Hàn Quốc Đẹp Nhất?
- **Mùa Xuân (Tháng 3 - 5):** Mùa hoa anh đào nở rộ trên khắp các nẻo đường Seoul.
- **Mùa Thu (Tháng 9 - 11):** Đây là mùa "vàng" của du lịch Hàn Quốc khi lá phong và lá ngân hạnh chuyển màu rực rỡ. Không khí mát mẻ, dễ chịu vô cùng.

### Những Trải Nghiệm "Rất Hàn"
Hàn Quốc là thiên đường của mỹ phẩm và thời trang. Nhưng điều làm tôi ấn tượng nhất lại là văn hóa "Palli-palli" (nhanh lên) hòa quyện cùng sự tỉ mỉ trong từng bữa ăn. Một bàn ăn với hàng chục đĩa Panchan (món phụ) nhỏ nhắn sẽ khiến bạn choáng ngợp về sự cầu kỳ của ẩm thực nơi đây. Hãy thử ngồi tại một quán lều ven đường (Pojangmacha), nhâm nhi chén rượu Soju và ăn bánh gạo cay Tteokbokki giữa tiết trời se lạnh – đó là lúc bạn thực sự chạm vào nhịp sống của người dân bản địa.

![Korean Street Food](https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=1200)
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
  
  // Clean up existing blogs to avoid duplicates
  await prisma.blog.deleteMany({});

  for (const b of blogs) {
    await prisma.blog.create({
      data: {
        ...b,
        publishedDate: new Date(),
      }
    });
  }

  console.log('High-quality blogs seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
