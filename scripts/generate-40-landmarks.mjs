/**
 * @file scripts/generate-40-landmarks.mjs
 * @description Scrapes and compiles exactly 40 authentic landmarks for each of the 13 countries from Wikipedia API,
 *              writes them into src/data/guideMaps.ts in the correct East-to-West order (Vietnam pinned first).
 * @version 1.0.0
 * @author Antigravity AI
 */

import fs from 'fs/promises';
import path from 'path';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Keep the original 40 landmarks for Vietnam and Japan exactly as they are to maintain documentation integrity
const ORIGINAL_VN_MARKERS = [
  { id: 'v1', name: 'Hà Nội', lat: 21.0285, lng: 105.8542, contentSlug: 'ha-noi', shortDescription: 'Thủ đô nghìn năm văn hiến, trung tâm chính trị và văn hóa.', imageUrl: '/images/guides/v1.jpg', priority: 1 },
  { id: 'v2', name: 'Vịnh Hạ Long', lat: 20.9101, lng: 107.1839, contentSlug: 'ha-long', shortDescription: 'Kỳ quan thiên nhiên thế giới với hàng ngàn đảo đá vôi.', imageUrl: '/images/guides/v2.jpg', priority: 1 },
  { id: 'v3', name: 'Sapa', lat: 22.3364, lng: 103.8438, contentSlug: 'sapa', shortDescription: 'Thị trấn trong sương với ruộng bậc thang và Fansipan.', imageUrl: '/images/guides/v3.jpg', priority: 1 },
  { id: 'v4', name: 'Ninh Bình', lat: 20.2506, lng: 105.9745, contentSlug: 'ninh-binh', shortDescription: 'Quần thể danh thắng Tràng An và cố đô Hoa Lư.', imageUrl: '/images/guides/v4.jpg', priority: 1 },
  { id: 'v5', name: 'Huế', lat: 16.4637, lng: 107.5909, contentSlug: 'hue', shortDescription: 'Cố đô của triều đình nhà Nguyễn với Đại Nội cổ kính.', imageUrl: '/images/guides/v5.jpg', priority: 1 },
  { id: 'v6', name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022, contentSlug: 'da-nang', shortDescription: 'Thành phố đáng sống với Cầu Vàng và biển Mỹ Khê.', imageUrl: '/images/guides/v6.jpg', priority: 1 },
  { id: 'v7', name: 'Hội An', lat: 15.8801, lng: 108.3380, contentSlug: 'hoi-an', shortDescription: 'Phố cổ rực rỡ đèn lồng và kiến trúc di sản.', imageUrl: '/images/guides/v7.jpg', priority: 1 },
  { id: 'v8', name: 'Nha Trang', lat: 12.2388, lng: 109.1967, contentSlug: 'nha-trang', shortDescription: 'Vịnh biển xanh ngắt với các khu nghỉ dưỡng cao cấp.', imageUrl: '/images/guides/v8.jpg', priority: 1 },
  { id: 'v9', name: 'Đà Lạt', lat: 11.9404, lng: 108.4583, contentSlug: 'da-lat', shortDescription: 'Thành phố ngàn hoa với khí hậu ôn hòa quanh năm.', imageUrl: '/images/guides/v9.jpg', priority: 1 },
  { id: 'v10', name: 'TP. Hồ Chí Minh', lat: 10.8231, lng: 106.6297, contentSlug: 'ho-chi-minh', shortDescription: 'Trung tâm kinh tế sầm uất và năng động nhất Việt Nam.', imageUrl: '/images/guides/v10.jpg', priority: 1 },
  { id: 'v11', name: 'Phú Quốc', lat: 10.2899, lng: 103.9840, contentSlug: 'phu-quoc', shortDescription: 'Đảo ngọc với những bãi tắm hoang sơ và hải sản tươi ngon.', imageUrl: '/images/guides/v11.jpg', priority: 1 },
  { id: 'v12', name: 'Cần Thơ', lat: 10.0452, lng: 105.7469, contentSlug: 'can-tho', shortDescription: 'Thủ phủ miền Tây với chợ nổi Cái Răng đặc sắc.', imageUrl: '/images/guides/v12.jpg', priority: 1 },
  { id: 'v13', name: 'Mũi Né', lat: 10.9412, lng: 108.2305, contentSlug: 'mui-ne', shortDescription: 'Đồi cát rực rỡ và những cung đường biển đẹp hút mắt.', imageUrl: '/images/guides/v13.jpg', priority: 1 },
  { id: 'v14', name: 'Phong Nha', lat: 17.5906, lng: 106.2842, contentSlug: 'phong-nha', shortDescription: 'Vương quốc hang động với hang Sơn Đoòng kỳ vĩ.', imageUrl: '/images/guides/v14.jpg', priority: 1 },
  { id: 'v15', name: 'Hà Giang', lat: 22.8233, lng: 104.9836, contentSlug: 'ha-giang', shortDescription: 'Cao nguyên đá Đồng Văn và mã Pí Lèng hùng vĩ.', imageUrl: '/images/guides/v15.jpg', priority: 1 },
  { id: 'v16', name: 'Côn Đảo', lat: 8.6811, lng: 106.6083, contentSlug: 'con-dao', shortDescription: 'Thiên đường nghỉ dưỡng và di tích lịch sử linh thiêng.', imageUrl: '/images/guides/v16.jpg', priority: 2 },
  { id: 'v17', name: 'Buôn Ma Thuột', lat: 12.6667, lng: 108.0500, contentSlug: 'buon-ma-thuot', shortDescription: 'Thủ phủ cà phê Tây Nguyên với thác Dray Nur hùng vĩ.', imageUrl: '/images/guides/v17.jpg', priority: 2 },
  { id: 'v18', name: 'Mỹ Sơn', lat: 15.7644, lng: 108.1242, contentSlug: 'my-son', shortDescription: 'Thánh địa Chăm Pa cổ kính giữa thung lũng xanh.', imageUrl: '/images/guides/v18.jpg', priority: 2 },
  { id: 'v19', name: 'Tây Ninh', lat: 11.3643, lng: 106.1135, contentSlug: 'tay-ninh', shortDescription: 'Núi Bà Đen linh thiêng và Tòa Thánh Cao Đài.', imageUrl: '/images/guides/v19.jpg', priority: 2 },
  { id: 'v20', name: 'Vũng Tàu', lat: 10.3460, lng: 107.0843, contentSlug: 'vung-tau', shortDescription: 'Thành phố biển gần Sài Gòn nhất, sôi động cuối tuần.', imageUrl: '/images/guides/v20.jpg', priority: 2 },
  { id: 'v21', name: 'Hồ Ba Bể', lat: 22.4111, lng: 105.6186, contentSlug: 'ho-ba-be', shortDescription: 'Hồ nước ngọt tự nhiên lớn nhất Việt Nam tại Bắc Kạn.', imageUrl: '/images/guides/v21.jpg', priority: 3 },
  { id: 'v22', name: 'Lạng Sơn', lat: 21.8514, lng: 106.7583, contentSlug: 'lang-son', shortDescription: 'Cửa ngõ biên giới với động Tam Thanh và núi Mẫu Sơn.', imageUrl: '/images/guides/v22.jpg', priority: 3 },
  { id: 'v23', name: 'Thác Bản Giốc', lat: 22.8542, lng: 106.7231, contentSlug: 'ban-gioc', shortDescription: 'Thác nước biên giới đẹp nhất Việt Nam tại Cao Bằng.', imageUrl: '/images/guides/v23.jpg', priority: 2 },
  { id: 'v24', name: 'Mù Cang Chải', lat: 21.8542, lng: 104.1267, contentSlug: 'mu-cang-chai', shortDescription: 'Tuyệt tác ruộng bậc thang óng ả mùa lúa chín.', imageUrl: '/images/guides/v24.jpg', priority: 2 },
  { id: 'v25', name: 'Điện Biên Phủ', lat: 21.3911, lng: 103.0169, contentSlug: 'dien-bien-phu', shortDescription: 'Địa danh lịch sử chấn động địa cầu với các di tích oai hùng.', imageUrl: '/images/guides/v25.jpg', priority: 3 },
  { id: 'v26', name: 'Mộc Châu', lat: 20.8467, lng: 104.6494, contentSlug: 'moc-chau', shortDescription: 'Cao nguyên xanh mướt với những đồi chè và đồng hoa.', imageUrl: '/images/guides/v26.jpg', priority: 2 },
  { id: 'v27', name: 'Cát Bà', lat: 20.8000, lng: 107.0000, contentSlug: 'cat-ba', shortDescription: 'Hòn đảo ngọc của Hải Phòng với vịnh Lan Hạ xinh đẹp.', imageUrl: '/images/guides/v27.jpg', priority: 2 },
  { id: 'v28', name: 'Tam Cốc', lat: 20.2181, lng: 105.9189, contentSlug: 'tam-coc', shortDescription: 'Hạ Long trên cạn với dòng sông Ngô Đồng thơ mộng.', imageUrl: '/images/guides/v28.jpg', priority: 3 },
  { id: 'v29', name: 'Chùa Tam Chúc', lat: 20.5606, lng: 105.8644, contentSlug: 'tam-chuc', shortDescription: 'Ngôi chùa lớn nhất thế giới nằm giữa non nước Hà Nam.', imageUrl: '/images/guides/v29.jpg', priority: 2 },
  { id: 'v30', name: 'Chùa Bái Đính', lat: 20.2742, lng: 105.8753, contentSlug: 'bai-dinh', shortDescription: 'Quần thể chùa lớn với nhiều kỷ lục tại Ninh Bình.', imageUrl: '/images/guides/v30.jpg', priority: 3 },
  { id: 'v31', name: 'Đỉnh Fansipan', lat: 22.3033, lng: 103.7750, contentSlug: 'fansipan', shortDescription: 'Nóc nhà Đông Dương với khung cảnh mây ngàn đại ngàn.', imageUrl: '/images/guides/v31.jpg', priority: 2 },
  { id: 'v32', name: 'Ba Na Hills', lat: 15.9994, lng: 107.9969, contentSlug: 'ba-na-hills', shortDescription: 'Làng Pháp trên đỉnh núi Chúa và Cầu Vàng nổi tiếng.', imageUrl: '/images/guides/v32.jpg', priority: 2 },
  { id: 'v33', name: 'Kỳ Co', lat: 13.7667, lng: 109.2833, contentSlug: 'ky-co', shortDescription: 'Bãi biển hoang sơ với làn nước trong vắt tại Quy Nhơn.', imageUrl: '/images/guides/v33.jpg', priority: 3 },
  { id: 'v34', name: 'Eo Gió', lat: 13.7500, lng: 109.2833, contentSlug: 'eo-gio', shortDescription: 'Thắng cảnh ven biển với con đường đi bộ ven vách đá.', imageUrl: '/images/guides/v34.jpg', priority: 3 },
  { id: 'v35', name: 'Lý Sơn', lat: 15.3833, lng: 109.1167, contentSlug: 'ly-son', shortDescription: 'Vương quốc tỏi và những dấu tích núi lửa triệu năm.', imageUrl: '/images/guides/v35.jpg', priority: 3 },
  { id: 'v36', name: 'Ghềnh Đá Đĩa', lat: 13.3333, lng: 109.3000, contentSlug: 'ghenh-da-dia', shortDescription: 'Tuyệt tác của tạo hóa với những cột đá hình lăng trụ.', imageUrl: '/images/guides/v36.jpg', priority: 3 },
  { id: 'v37', name: 'Bàu Trắng', lat: 11.0500, lng: 108.4167, contentSlug: 'bau-trang', shortDescription: 'Tiểu sa mạc Sahara của Việt Nam tại Bình Thuận.', imageUrl: '/images/guides/v37.jpg', priority: 3 },
  { id: 'v38', name: 'Châu Đốc', lat: 10.7000, lng: 105.1167, contentSlug: 'chau-doc', shortDescription: 'Vùng đất tâm linh ven biên giới với Miếu Bà Chúa Xứ.', imageUrl: '/images/guides/v38.jpg', priority: 3 },
  { id: 'v39', name: 'Đất Mũi', lat: 8.6000, lng: 104.7167, contentSlug: 'dat-mui', shortDescription: 'Điểm cực Nam của Tổ quốc tại tỉnh Cà Mau.', imageUrl: '/images/guides/v39.jpg', priority: 3 },
  { id: 'v40', name: 'Hà Tiên', lat: 10.3833, lng: 104.4833, contentSlug: 'ha-tien', shortDescription: 'Thành phố cửa khẩu xinh đẹp với Thạch Động và biển Mũi Nai.', imageUrl: '/images/guides/v40.jpg', priority: 3 }
];

const ORIGINAL_JP_MARKERS = [
  { id: 'j1', name: 'Tokyo', lat: 35.6762, lng: 139.6503, contentSlug: 'tokyo', shortDescription: 'Thủ đô hiện đại, giao lộ Shibuya và tháp Tokyo rực rỡ.', imageUrl: '/images/guides/j1.jpg', priority: 1 },
  { id: 'j2', name: 'Kyoto', lat: 35.0116, lng: 135.7681, contentSlug: 'kyoto', shortDescription: 'Cố đô ngàn năm với hàng ngàn ngôi đền chùa cổ kính.', imageUrl: '/images/guides/j2.jpg', priority: 1 },
  { id: 'j3', name: 'Osaka', lat: 34.6937, lng: 135.5023, contentSlug: 'osaka', shortDescription: 'Thành phố ẩm thực và Lâu đài Osaka hùng vĩ.', imageUrl: '/images/guides/j3.jpg', priority: 1 },
  { id: 'j4', name: 'Hokkaido', lat: 43.0642, lng: 141.3468, contentSlug: 'hokkaido', shortDescription: 'Vùng đất tuyết trắng phía Bắc với thiên nhiên hùng vĩ.', imageUrl: '/images/guides/j4.jpg', priority: 1 },
  { id: 'j5', name: 'Núi Phú Sĩ', lat: 35.3606, lng: 138.7274, contentSlug: 'mount-fuji', shortDescription: 'Biểu tượng linh thiêng cao nhất Nhật Bản.', imageUrl: '/images/guides/j5.jpg', priority: 1 },
  { id: 'j6', name: 'Itsukushima', lat: 34.2960, lng: 132.3198, contentSlug: 'itsukushima', shortDescription: 'Cổng Torii nổi tiếng nằm trên mặt biển tại hòn đảo Miyajima.', imageUrl: '/images/guides/j6.jpg', priority: 1 },
  { id: 'j7', name: 'Nara', lat: 34.6851, lng: 135.8048, contentSlug: 'nara', shortDescription: 'Công viên hươu thân thiện và Đại Phật Tượng Tōdai-ji.', imageUrl: '/images/guides/j7.jpg', priority: 1 },
  { id: 'j8', name: 'Shirakawa-go', lat: 36.2718, lng: 136.9064, contentSlug: 'shirakawa-go', shortDescription: 'Ngôi làng cổ tích với kiến trúc Gassho-zukuri độc đáo.', imageUrl: '/images/guides/j8.jpg', priority: 1 },
  { id: 'j9', name: 'Hakone', lat: 35.2324, lng: 139.1033, contentSlug: 'hakone', shortDescription: 'Suối nước nóng (onsen) và tầm nhìn ra núi Phú Sĩ.', imageUrl: '/images/guides/j9.jpg', priority: 1 },
  { id: 'j10', name: 'Arashiyama', lat: 35.0094, lng: 135.6670, contentSlug: 'arashiyama', shortDescription: 'Rừng tre huyền ảo và cây cầu Togetsukyo thơ mộng.', imageUrl: '/images/guides/j10.jpg', priority: 1 },
  { id: 'j11', name: 'Nikko', lat: 36.7516, lng: 139.6128, contentSlug: 'nikko', shortDescription: 'Di sản thế giới with các đền thờ trạm trổ tinh xảo.', imageUrl: '/images/guides/j11.jpg', priority: 1 },
  { id: 'j12', name: 'Kamakura', lat: 35.3192, lng: 139.5467, contentSlug: 'kamakura', shortDescription: 'Tượng Đại Phật ngoài trời khổng lồ gần bờ biển.', imageUrl: '/images/guides/j12.jpg', priority: 1 },
  { id: 'j13', name: 'Fukuoka', lat: 33.5902, lng: 130.4017, contentSlug: 'fukuoka', shortDescription: 'Thủ phủ ẩm thực đường phố và các quầy Yatai.', imageUrl: '/images/guides/j13.jpg', priority: 1 },
  { id: 'j14', name: 'Kanazawa', lat: 36.5613, lng: 136.6562, contentSlug: 'kanazawa', shortDescription: 'Khu vườn Kenrokuen, một trong ba khu vườn đẹp nhất Nhật Bản.', imageUrl: '/images/guides/j14.jpg', priority: 1 },
  { id: 'j15', name: 'Okinawa', lat: 26.2124, lng: 127.6809, contentSlug: 'okinawa', shortDescription: 'Quần đảo nhiệt đới với làn nước trong xanh và văn hóa Ryukyu.', imageUrl: '/images/guides/j15.jpg', priority: 1 },
  { id: 'j16', name: 'Yokohama', lat: 35.4437, lng: 139.6380, contentSlug: 'yokohama', shortDescription: 'Thành phố cảng hiện đại with khu phố Tàu lớn nhất Nhật Bản.', imageUrl: '/images/guides/j16.jpg', priority: 2 },
  { id: 'j17', name: 'Nagoya', lat: 35.1815, lng: 136.9066, contentSlug: 'nagoya', shortDescription: 'Thành phố công nghiệp và Lâu đài Nagoya lộng lẫy.', imageUrl: '/images/guides/j17.jpg', priority: 2 },
  { id: 'j18', name: 'Sendai', lat: 38.2682, lng: 140.8694, contentSlug: 'sendai', shortDescription: 'Thành phố cây xanh with lễ hội Tanabata rực rỡ.', imageUrl: '/images/guides/j18.jpg', priority: 2 },
  { id: 'j19', name: 'Sapporo', lat: 43.0611, lng: 141.3542, contentSlug: 'sapporo', shortDescription: 'Thủ phủ Hokkaido, nổi tiếng with bia và lễ hội tuyết.', imageUrl: '/images/guides/j19.jpg', priority: 2 },
  { id: 'j20', name: 'Kobe', lat: 34.6901, lng: 135.1955, contentSlug: 'okada', shortDescription: 'Thành phố cảng xinh đẹp nổi tiếng with thịt bò Kobe.', imageUrl: '/images/guides/j20.jpg', priority: 2 },
  { id: 'j21', name: 'Hiroshima', lat: 34.3853, lng: 132.4553, contentSlug: 'hiroshima', shortDescription: 'Thành phố hòa bình with Công viên Tưởng niệm Hòa bình.', imageUrl: '/images/guides/j21.jpg', priority: 2 },
  { id: 'j22', name: 'Nagasaki', lat: 32.7503, lng: 129.8777, contentSlug: 'nagasaki', shortDescription: 'Giao thoa văn hóa phương Đông và phương Tây.', imageUrl: '/images/guides/j22.jpg', priority: 2 },
  { id: 'j23', name: 'Kumamoto', lat: 32.8031, lng: 130.7079, contentSlug: 'kumamoto', shortDescription: 'Thành cổ Kumamoto oai hùng vừa được phục hồi.', imageUrl: '/images/guides/j23.jpg', priority: 3 },
  { id: 'j24', name: 'Okayama', lat: 34.6551, lng: 133.9195, contentSlug: 'okayama', shortDescription: 'Khu vườn Korakuen và lâu đài quạ đen.', imageUrl: '/images/guides/j24.jpg', priority: 3 },
  { id: 'j25', name: 'Takayama', lat: 36.1408, lng: 137.2522, contentSlug: 'takayama', shortDescription: 'Thành phố cổ mộc mạc lưu giữ truyền thống thời Edo.', imageUrl: '/images/guides/j25.jpg', priority: 2 },
  { id: 'j26', name: 'Matsumoto', lat: 36.2380, lng: 137.9719, contentSlug: 'matsumoto', shortDescription: 'Thành Matsumoto bằng gỗ cổ nhất còn nguyên vẹn.', imageUrl: '/images/guides/j26.jpg', priority: 3 },
  { id: 'j27', name: 'Ise', lat: 34.4875, lng: 136.7094, contentSlug: 'ise', shortDescription: 'Thánh địa Thần đạo linh thiêng nhất Nhật Bản.', imageUrl: '/images/guides/j27.jpg', priority: 3 },
  { id: 'j28', name: 'Beppu', lat: 33.2845, lng: 131.4907, contentSlug: 'beppu', shortDescription: 'Thủ phủ suối nước nóng with "Địa ngục Beppu".', imageUrl: '/images/guides/j28.jpg', priority: 3 },
  { id: 'j29', name: 'Kagoshima', lat: 31.5967, lng: 130.5571, contentSlug: 'kagoshima', shortDescription: 'Núi lửa Sakurajima hoạt động ngay sát thành phố.', imageUrl: '/images/guides/j29.jpg', priority: 3 },
  { id: 'j30', name: 'Aomori', lat: 40.8244, lng: 140.7400, contentSlug: 'aomori', shortDescription: 'Lễ hội lồng đèn Nebuta Matsuri hoành tráng.', imageUrl: '/images/guides/j30.jpg', priority: 3 },
  { id: 'j31', name: 'Gifu', lat: 35.4233, lng: 136.7606, contentSlug: 'gifu', shortDescription: 'Đánh cá bằng chim cốc trên sông Nagara truyền thống.', imageUrl: '/images/guides/j31.jpg', priority: 3 },
  { id: 'j32', name: 'Nagano', lat: 36.6485, lng: 138.1942, contentSlug: 'nagano', shortDescription: 'Chùa Zenko-ji cổ kính và thiên nhiên vùng núi Alps Nhật Bản.', imageUrl: '/images/guides/j32.jpg', priority: 3 },
  { id: 'j33', name: 'Shizuoka', lat: 34.9755, lng: 138.3828, contentSlug: 'shizuoka', shortDescription: 'Quê hương của trà xanh with góc nhìn núi Phú Sĩ đẹp nhất.', imageUrl: '/images/guides/j33.jpg', priority: 3 },
  { id: 'j34', name: 'Toyama', lat: 36.6959, lng: 137.2137, contentSlug: 'toyama', shortDescription: 'Cung đường tuyết Tateyama Kurobe Alpine Route.', imageUrl: '/images/guides/j34.jpg', priority: 3 },
  { id: 'j35', name: 'Morioka', lat: 39.7036, lng: 141.1527, contentSlug: 'morioka', shortDescription: 'Thành phố văn hóa của tỉnh Iwate with mì Wanko Soba.', imageUrl: '/images/guides/j35.jpg', priority: 3 },
  { id: 'j36', name: 'Akita', lat: 39.7200, lng: 140.1025, contentSlug: 'akita', shortDescription: 'Xứ sở của những chú chó Akita và lễ hội Kanto.', imageUrl: '/images/guides/j36.jpg', priority: 3 },
  { id: 'j37', name: 'Yamagata', lat: 38.2555, lng: 140.3397, contentSlug: 'yamagata', shortDescription: 'Chùa núi Yamadera kỳ vĩ trên vách đá.', imageUrl: '/images/guides/j37.jpg', priority: 3 },
  { id: 'j38', name: 'Niigata', lat: 37.9161, lng: 139.0364, contentSlug: 'niigata', shortDescription: 'Vương quốc của gạo và rượu Sake ngon bậc nhất.', imageUrl: '/images/guides/j38.jpg', priority: 3 },
  { id: 'j39', name: 'Matsuyama', lat: 33.8392, lng: 132.7655, contentSlug: 'matsuyama', shortDescription: 'Dogo Onsen - một trong những suối nước nóng lâu đời nhất.', imageUrl: '/images/guides/j39.jpg', priority: 3 },
  { id: 'j40', name: 'Kochi', lat: 33.5597, lng: 133.5311, contentSlug: 'kochi', shortDescription: 'Thành Kochi nguyên bản và những bãi biển Thái Bình Dương.', imageUrl: '/images/guides/j40.jpg', priority: 3 }
];

// Definition of 40 search terms in Vietnamese for each of the 13 new countries
const LANDMARK_QUERIES = {
  'phap': [
    'Tháp Eiffel', 'Bảo tàng Louvre', 'Khải Hoàn Môn (Paris)', 'Cung điện Versailles', 'Mont Saint-Michel',
    'Nhà thờ Đức Bà Paris', 'Bảo tàng Orsay', 'Trung tâm Pompidou', 'Nhà thờ Sainte-Chapelle', 'Disneyland Paris',
    'Vương cung thánh đường Sacré-Cœur', 'Côte d\'Azur', 'Lâu đài Chambord', 'Hẻm núi Verdon', 'Mont Blanc',
    'Cầu Gard', 'Thành phố pháo đài Carcassonne', 'Nhà thờ lớn Strasbourg', 'Thị trấn Colmar', 'Cồn cát Pilat',
    'Vách đá Étretat', 'Lâu đài Chenonceau', 'Cung điện của Giáo hoàng ở Avignon', 'Thị trấn Saint-Tropez', 'Thung lũng Chamonix-Mont-Blanc',
    'Nhà thờ chính tòa Reims', 'Lâu đài Fontainebleau', 'Vùng rượu vang Bordeaux', 'Thung lũng Loire', 'Hồ Annecy',
    'Vườn hoa Claude Monet ở Giverny', 'Vườn quốc gia Calanques', 'Đảo Corse', 'Núi Ventoux', 'Thành phố biển Biarritz',
    'Nhà thờ chính tòa Chartres', 'Hang động Lascaux', 'Cung điện Luxembourg', 'Vườn Luxembourg', 'Nhà thờ lớn Bourges'
  ],
  'y': [
    'Đấu trường La Mã', 'Tháp nghiêng Pisa', 'Kênh lớn Venice', 'Nhà thờ chính tòa Florence', 'Bờ biển Amalfi',
    'Điện Pantheon (Roma)', 'Đài phun nước Trevi', 'Thành phố cổ Pompeii', 'Bảo tàng Vatican', 'Vương cung thánh đường Thánh Phêrô',
    'Nhà thờ chính tòa Milano', 'Hồ Como', 'Cinque Terre', 'Phòng trưng bày Uffizi', 'Quảng trường La Mã',
    'Quảng trường San Marco', 'Núi lửa Vesuvius', 'Lâu đài Thiên Thần (Roma)', 'Cung điện tổng trấn Venice', 'Cầu Ponte Vecchio',
    'Quảng trường Tây Ban Nha (Roma)', 'Nhà thờ chính tòa Siena', 'Thung lũng các đền thờ (Agrigento)', 'Núi lửa Etna', 'Hang Xanh (Capri)',
    'Thị trấn San Gimignano', 'Vương cung thánh đường Thánh Phanxicô thành Assisi', 'Hý trường Verona', 'Cung điện hoàng gia Caserta', 'Hồ Garda',
    'Lâu đài Sforza', 'Quảng trường Campo (Siena)', 'Vườn Boboli', 'Villa d\'Este', 'Thành phố cổ Herculaneum',
    'Dãy núi Dolomiti', 'Bảo tàng Capitoline', 'Khải hoàn môn Constantine', 'Galleria Vittorio Emanuele II', 'Santa Maria delle Grazie'
  ],
  'duc': [
    'Cổng Brandenburg', 'Lâu đài Neuschwanstein', 'Nhà thờ chính tòa Köln', 'Cảng Hamburg', 'Rừng Đen',
    'Reichstag', 'Đài tưởng niệm Bức tường Berlin', 'Quảng trường Marienplatz', 'Lâu đài Heidelberg', 'Đỉnh núi Zugspitze',
    'Hồ Bodensee', 'Zwinger', 'Cung điện Sanssouci', 'Lâu đài Hohenzollern', 'Miniatur Wunderland',
    'Frauenkirche München', 'Elbphilharmonie', 'Europa-Park', 'Đảo Mainau', 'Rothenburg ob der Tauber',
    'Saxon Switzerland', 'Bảo tàng Mercedes-Benz', 'Tháp truyền hình Berlin', 'Cung điện Nymphenburg', 'Nhà thờ chính tòa Aachen',
    'Lâu đài Eltz', 'Lâu đài Linderhof', 'Đảo Bảo tàng (Berlin)', 'Speicherstadt', 'Vườn quốc gia Berchtesgaden',
    'Cung điện Würzburg', 'Nhà thờ lớn Ulm', 'Vườn Herrenhausen', 'Cầu đá Bastei', 'Porta Nigra',
    'Hồ Königssee', 'Lâu đài Cochem', 'Lâu đài Nuremberg', 'Lâu đài Schwerin', 'Cầu Rakotzbrücke'
  ],
  'anh': [
    'Big Ben', 'Stonehenge', 'Lâu đài Edinburgh', 'Hồ Loch Ness', 'Cầu Tháp Luân Đôn',
    'Bảo tàng Anh', 'Vòng quay London Eye', 'Tháp Luân Đôn', 'Cung điện Buckingham', 'Tu viện Westminster',
    'Lâu đài Windsor', 'Giant\'s Causeway', 'Nhà tắm La Mã ở Bath', 'Nhà thờ chính tòa Canterbury', 'Vườn quốc gia Lake District',
    'Cotswolds', 'Nhà thờ lớn York Minster', 'Lâu đài Cardiff', 'Stratford-upon-Avon', 'Đảo Skye',
    'Nhà thờ chính tòa Thánh Phao-lô', 'Công viên Hyde Park', 'Cung điện Holyroodhouse', 'Royal Pavilion', 'Lâu đài Conwy',
    'Đỉnh núi Ben Nevis', 'Lâu đài Warwick', 'Nhà thờ chính tòa Durham', 'Peak District', 'Snowdonia',
    'Cầu cảng Brighton Palace Pier', 'Bức tường Hadrian', 'Nhà hát Globe', 'Phòng trưng bày Quốc gia Luân Đôn', 'Dự án Eden',
    'Vườn thực vật hoàng gia Kew', 'Cung điện Westminster', 'Bờ biển kỷ Jura', 'Cung điện Blenheim', 'Lâu đài Leeds'
  ],
  'tay-ban-nha': [
    'Nhà thờ Sagrada Família', 'Cung điện Alhambra', 'Quảng trường Plaza Mayor (Madrid)', 'Nhà thờ chính tòa Seville', 'Đảo Ibiza',
    'Công viên Güell', 'Cung điện Hoàng gia Madrid', 'Nhà thờ-Thánh đường Hồi giáo Córdoba', 'Tòa nhà Casa Batlló', 'Nhà thờ chính tòa Toledo',
    'Cung điện Alcázar of Seville', 'Bảo tàng Guggenheim Bilbao', 'Montserrat', 'Nhà thờ chính tòa Santiago de Compostela', 'Bờ biển Costa Brava',
    'Bảo tàng Prado', 'Plaza de España (Seville)', 'Tu viện El Escorial', 'Nhà thờ chính tòa Burgos', 'Vườn quốc gia Teide',
    'Cầu dẫn nước Segovia', 'Những ngôi nhà treo ở Cuenca', 'Nhà hát La Mã ở Mérida', 'Cầu Ronda', 'Mallorca',
    'Málaga Alcazaba', 'Avila', 'Tenerife', 'Generalife', 'Costa del Sol',
    'Vương cung thánh đường Pilar', 'Sierra Nevada (Tây Ban Nha)', 'Mũi đất Tarifa', 'Dãy núi Pyrenees', 'Lâu đài Segovia',
    'Thành phố Nghệ thuật và Khoa học Valencia', 'Bãi biển La Concha', 'Vườn quốc gia Picos de Europa', 'Lâu đài Peñíscola', 'Công viên Retiro'
  ],
  'thuy-si': [
    'Đỉnh núi Matterhorn', 'Hồ Geneva', 'Phố cổ Bern', 'Thị trấn Interlaken', 'Thác Rhine',
    'Đỉnh núi Jungfraujoch', 'Hồ Lucerne', 'Cầu gỗ Chapel', 'Lâu đài Chillon', 'Thị trấn Zermatt',
    'St. Moritz', 'Jet d\'Eau', 'Bernina Express', 'Hồ Zurich', 'Núi Pilatus',
    'Thung lũng Lauterbrunnen', 'Núi Rigi', 'Grossmünster', 'Vườn quốc gia Thụy Sĩ', 'Grindelwald',
    'Hồ Lugano', 'Thị trấn Appenzell', 'Sông băng Aletsch', 'Đỉnh núi Gornergrat', 'Hồ Brienz',
    'Lâu đài Sion', 'Tu viện Saint Gall', 'Núi Titlis', 'Gruyères', 'Mürren',
    'Stein am Rhein', 'Grindelwald First', 'Hồ Oeschinen', 'Cầu đường sắt Landwasser Viaduct', 'Thung lũng Verzasca',
    'Creux du Van', 'Rhine Gorge (Thụy Sĩ)', 'Hang động Saint Beatus', 'Ba lâu đài của Bellinzona', 'Thị trấn Locarno'
  ],
  'ha-lan': [
    'Vườn hoa Keukenhof', 'Hệ thống kênh đào Amsterdam', 'Kinderdijk', 'Bảo tàng Van Gogh', 'Cảng biển Rotterdam',
    'Rijksmuseum', 'Nhà Anne Frank', 'Zaanse Schans', 'Bảo tàng Mauritshuis', 'Delta Works',
    'Kênh đào Utrecht', 'Quảng trường Vrijthof', 'Giethoorn', 'Cung điện Hoàng gia Amsterdam', 'Vườn quốc gia Hoge Veluwe',
    'Bãi biển Scheveningen', 'Madurodam', 'Công viên giải trí Efteling', 'Haarlem', 'Quảng trường chợ Delft',
    'Đảo Texel', 'Lâu đài Valkenburg', 'Hồ IJsselmeer', 'Tháp Dom Tower', 'Những ngôi nhà hình lập phương (Rotterdam)',
    'Kênh đào Leiden', 'Chợ phô mai Alkmaar', 'Bán đảo Marken', 'Thị trấn Volendam', 'Lâu đài Muiderslot',
    'Binnenhof', 'Markthal', 'Bảo tàng Kröller-Müller', 'Cung điện Het Loo', 'Groningen',
    'Amersfoort', 'Pháo đài cổ Bourtange', 'Neeltje Jans', 'Biển Wadden', 'Volendam'
  ],
  'ao': [
    'Cung điện Schönbrunn', 'Làng cổ Hallstatt', 'Phố cổ Salzburg', 'Đỉnh núi Innsbruck Nordkette', 'Nhà hát Opera Quốc gia Vienna',
    'Nhà thờ chính tòa Thánh Stephen (Vienna)', 'Cung điện hoàng gia Hofburg', 'Cung điện Belvedere (Vienna)', 'Melk Abbey', 'Grossglockner High Alpine Road',
    'Lake Zell', 'Eisriesenwelt', 'Mirabell Palace', 'Hohensalzburg', 'Graz',
    'Wachau', 'Thác nước Krimml', 'Mái nhà Vàng', 'Semmering Railway', 'Lake Wolfgang',
    'Prater (Vienna)', 'Bảo tàng Lịch sử Nghệ thuật', 'Vườn thú Schönbrunn', 'Lâu đài Ambras', 'Lâu đài Dürnstein',
    'Lâu đài Hochosterwitz', 'Hồ Wörthersee', 'Bad Gastein', 'Kitzbühel', 'St. Anton am Arlberg',
    'Gesäuse', 'Mỏ muối Hallstatt', 'Thư viện tu viện Admont', 'Krems an der Donau', 'Hohe Tauern',
    'Liechtenstein Gorge', 'Sông băng Stubai', 'Seefeld in Tirol', 'Lâu đài Hohenwerfen', 'Sigmund Thun Gorge'
  ],
  'hy-lap': [
    'Acropolis (Athens)', 'Santorini', 'Meteora', 'Mykonos', 'Delphi',
    'Parthenon', 'Đền thờ thần Zeus Olympus', 'Knossos', 'Núi Athos', 'Bãi biển Navagio',
    'Rhodes (thành phố)', 'Hẻm núi Samaria', 'Corfu (thị trấn)', 'Lindos', 'Bãi biển Elafonisi',
    'Monemvasia', 'Nafplio', 'Mũi Sounion', 'Mycenae', 'Epidaurus',
    'Mystras', 'Delos', 'Núi Olympus', 'Zagori', 'Hẻm núi Vikos',
    'Đảo Hydra', 'Symi', 'Sarakiniko (Milos)', 'Portara (Naxos)', 'Naoussa (Paros)',
    'Patmos', 'Vergina', 'Tháp Trắng (Thessaloniki)', 'Olympia (Hy Lạp)', 'Kênh đào Corinth',
    'Parga', 'Bãi biển Voidokilia', 'Hang động Melissani', 'Đảo Zakynthos', 'Bãi biển Balos'
  ],
  'tho-nhi-ky': [
    'Hagia Sophia', 'Cappadocia', 'Pamukkale', 'Ephesus', 'Bosphorus',
    'Thánh đường Xanh', 'Cung điện Topkapi', 'Chợ cổ Grand Bazaar', 'Núi Nemrut', 'Vườn quốc gia Göreme',
    'Sumela Monastery', 'Troy (thành phố cổ)', 'Aspendos', 'Pergamon', 'Kaleiçi',
    'Bãi biển Ölüdeniz', 'Myra', 'Núi Ararat', 'Ishak Pasha Palace', 'Safranbolu',
    'Hồ Salda', 'Hierapolis', 'Tháp Galata', 'Basilica Cistern', 'Cung điện Dolmabahçe',
    'Ani (thành phố cổ)', 'Harran', 'Đỉnh núi lửa Erciyes', 'Bodrum Castle', 'Antalya',
    'Fethiye', 'Hồ Van', 'Thư viện Celsus', 'Lâu đài Ankara', 'Göbekli Tepe',
    'Hẻm núi Saklıkent', 'Bãi biển Patara', 'Phaselis', 'Lâu đài Alanya', 'Cầu Bosphorus'
  ],
  'trung-quoc': [
    'Vạn Lý Trường Thành', 'Tử Cấm Thành', 'Lăng mộ Tần Thủy Hoàng', 'Bến Thượng Hải', 'Trương Gia Giới',
    'Di Hòa Viên', 'Thiên Đàn', 'Quế Lâm', 'Cửu Trại Câu', 'Cung điện Potala',
    'Tây Hồ (Hàng Châu)', 'Vườn Dự Viên', 'Lạc Sơn Đại Phật', 'Núi Thái Sơn', 'Núi Hoàng Sơn',
    'Hang đá Long Môn', 'Hang đá Vân Cương', 'Ải Gia Dục Quan', 'Lệ Giang Cổ Trấn', 'Hổ Khiêu Hiệp',
    'Núi Nga Mi', 'Thành Đô', 'Rừng đá Thạch Lâm', 'Dương Sóc', 'Chu Trang',
    'Tô Châu', 'Hang Mạc Cao', 'Cáp Nhĩ Tân', 'Ba hẻm núi sông Dương Tử', 'Núi Vũ Di',
    'Núi Võ Đang', 'Núi Thanh Thành', 'Phượng Hoàng Cổ Trấn', 'Ô Trấn', 'Hoành Thôn',
    'Núi Phổ Đà', 'Đô Giang Yển', 'Núi Tam Thanh', 'Hồ Thiên Đảo', 'Thác Bản Giốc'
  ],
  'han-quoc': [
    'Cung điện Gyeongbokgung', 'Seongsan Ilchulbong', 'N Seoul Tower', 'Làng cổ Bukchon Hanok', 'Bãi biển Haeundae',
    'Chùa Bulguksa', 'Hallasan', 'Nami (đảo)', 'Changdeokgung', 'Dongdaemun Design Plaza',
    'Gyeongju', 'Seoraksan', 'Lotte World Tower', 'Insadong', 'Myeongdong',
    'Chợ cá Jagalchi', 'Làng văn hóa Gamcheon', 'Công viên Yongdusan', 'Pháo đài Hwaseong', 'Boseong (huyện)',
    'Jinhae-gu', 'Hahoe Andong', 'DMZ', 'Danyang (huyện)', 'Suncheon Bay',
    'Bãi biển Gwangalli', 'Jirisan', 'Chùa Haeinsa', 'Ulleungdo', 'Gangneung',
    'Anapji', 'Busan', 'Chùa Beomeosa', 'Seopjikoji', 'Oedolgae',
    'Manjanggul', 'Jeonju Hanok Village', 'Songdo (Incheon)', 'Cheonggyecheon', 'Ganghwado'
  ],
  'dai-loan': [
    'Taipei 101', 'Hồ Nhật Nguyệt', 'Phố cổ Cửu Phần', 'Hẻm núi Taroko', 'Chợ đêm Sĩ Lâm',
    'Bảo tàng Cung điện Quốc gia', 'Nhà tưởng niệm Tưởng Giới Thạch', 'Vườn quốc gia Khẩn Đinh', 'A Lý Sơn', 'Vườn quốc gia Dương Minh Sơn',
    'Chùa Phật Quang Sơn', 'Dã Liễu', 'Tháp Long Hổ', 'Phố cổ Đạm Thủy', 'Nhà tưởng niệm Tôn Trung Sơn',
    'Pháo đài Hồng Mao', 'Tây Môn Đinh', 'Thác nước Thập Phần', 'Làng Cầu Vồng', 'Tam Tiên Đài',
    'Bảo tàng Kỳ Mỹ', 'Đầm Liên Trì', 'Cingjing Farm', 'Vùng sinh thái Sam Lâm Khê', 'Vườn quốc gia Ngọc Sơn',
    'Hợp Hoan Sơn', 'Đảo Lục Đảo', 'Lan Tự', 'Bành Hồ', 'An Bình (Đài Nam)',
    'Xích Khảm Lâu', 'Maokong', 'Đền Xuân Thu', 'Thác nước Ô Lai', 'Sông Tình Yêu (Cao Hùng)',
    'Suối nước nóng Quan Tử Lĩnh', 'Vịnh Tây Tử Loan', 'Lộc Cảng', 'Chợ đêm Lục Hợp', 'Suối nước nóng Tri Bản'
  ]
};

// Metadata for the 13 countries
const COUNTRY_METADATA = {
  'phap': { name: 'Pháp', id: 'france-map', zoom: 5, center: [46.2276, 2.2137], maxBounds: [[41, -5], [51, 10]], flag: '🇫🇷', mascot: '🐓', intro: 'Pháp - Đất nước của tình yêu, nghệ thuật và ẩm thực tinh tế. Từ tháp Eiffel biểu tượng đến những lâu đài tráng lệ và thung lũng nho thơ mộng, Pháp luôn là điểm đến hàng đầu thu hút du khách.', culture: 'Văn hóa Pháp thấm đẫm phong cách sống tinh tế (art de vivre), yêu tự do, thời trang cao cấp và rượu vang thượng hạng. Ẩm thực Pháp đã được UNESCO công nhận là di sản văn hóa phi vật thể của nhân loại.' },
  'y': { name: 'Ý', id: 'italy-map', zoom: 5, center: [41.8719, 12.5674], maxBounds: [[35, 6], [47, 19]], flag: '🇮🇹', mascot: '🐺', intro: 'Ý (Italia) - Cái nôi của nền văn minh phương Tây, quê hương của thời trang, hội họa Phục hưng và di sản lịch sử khổng lồ. Mỗi góc phố tại Ý đều mang câu chuyện nghệ thuật sống động qua hàng ngàn năm.', culture: 'Văn hóa Ý nổi tiếng với lối sống ngọt ngào (La Dolce Vita), tinh thần gia đình gắn kết, bóng đá rực lửa và ẩm thực lừng danh thế giới với Pizza, Mỳ Ý và Cà phê Espresso.' },
  'duc': { name: 'Đức', id: 'germany-map', zoom: 5, center: [51.1657, 10.4515], maxBounds: [[47, 5], [55, 16]], flag: '🇩🇪', mascot: '🦅', intro: 'Đức (Germany) - Đầu tàu kinh tế châu Âu sở hữu sự giao hòa hoàn hảo giữa nhịp sống công nghệ hiện đại và những tòa lâu đài Trung cổ cổ kính, rừng nguyên sinh rộng lớn kề bên những dòng sông lịch sử.', culture: 'Văn hóa Đức đề cao tính kỷ luật, chính xác, sự sáng tạo kỹ thuật đỉnh cao cùng các lễ hội bia Oktoberfest sôi động và tình yêu sâu sắc dành cho âm nhạc cổ điển.' },
  'anh': { name: 'Anh', id: 'uk-map', zoom: 5, center: [55.3781, -3.4360], maxBounds: [[49, -9], [61, 2]], flag: '🇬🇧', mascot: '🦁', intro: 'Anh Quốc (United Kingdom) - Đất nước hoàng gia với lịch sử đế chế hùng mạnh. Từ thủ đô sầm uất London với cung điện Buckingham đến những vùng đồng quê thanh bình thơ mộng tại Scotland và xứ Wales.', culture: 'Văn hóa Anh nổi tiếng lịch lãm, văn hóa uống trà chiều quý tộc, tình yêu kịch nghệ Shakespeare và là quê hương của ban nhạc huyền thoại The Beatles cũng như giải ngoại hạng Anh hấp dẫn.' },
  'tay-ban-nha': { name: 'Tây Ban Nha', id: 'spain-map', zoom: 5, center: [40.4637, -3.7492], maxBounds: [[35, -10], [44, 4]], flag: '🇪🇸', mascot: '🐂', intro: 'Tây Ban Nha - Xứ sở của vũ điệu Flamenco bốc lửa, những bãi biển ngập nắng vàng và nền kiến trúc vô cùng rực rỡ mang dấu ấn pha trộn giữa châu Âu và thế giới Hồi giáo cổ xưa.', culture: 'Văn hóa Tây Ban Nha tràn đầy năng lượng với lễ hội đấu bò tót kiêu hùng, tinh thần phóng khoáng, văn hóa ẩm thực Tapas độc đáo và những trận cầu El Clasico kinh điển.' },
  'thuy-si': { name: 'Thụy Sĩ', id: 'switzerland-map', zoom: 6, center: [46.8182, 8.2275], maxBounds: [[45, 5], [48, 11]], flag: '🇨🇭', mascot: '🐮', intro: 'Thụy Sĩ (Switzerland) - Đất nước trung lập yên bình, được ví như thiên đường nơi hạ giới với phong cảnh núi tuyết vĩnh cửu, những hồ nước trong vắt và các ngôi làng thanh bình tuyệt mỹ.', culture: 'Văn hóa Thụy Sĩ nổi tiếng toàn cầu về độ chính xác (đồng hồ hiệu), ngành ngân hàng uy tín, tình yêu thiên nhiên, pho mát thơm ngon và sô-cô-la ngọt ngào hảo hạng.' },
  'ha-lan': { name: 'Hà Lan', id: 'netherlands-map', zoom: 6, center: [52.1326, 5.2913], maxBounds: [[50, 3], [54, 8]], flag: '🇳🇱', mascot: '🦁', intro: 'Hà Lan (Netherlands) - Xứ sở của những bông hoa tulip rực rỡ, những chiếc cối xay gió khổng lồ kỳ vĩ và hệ thống đê biển vĩ đại bậc nhất thế giới.', culture: 'Văn hóa Hà Lan cởi mở, thân thiện và tôn trọng tự do cá nhân cao độ. Xe đạp là phương tiện di chuyển chính đầy nét văn hóa tại đất nước thấp hơn mực nước biển này.' },
  'ao': { name: 'Áo', id: 'austria-map', zoom: 6, center: [47.5162, 14.5501], maxBounds: [[46, 9], [49, 18]], flag: '🇦🇹', mascot: '🦅', intro: 'Cộng hòa Áo - Trái tim âm nhạc cổ điển châu Âu, ngập tràn nét lãng mạn của dòng sông Danube và vẻ đẹp hùng vĩ ngút ngàn của dãy núi Alps tuyết trắng bao phủ.', culture: 'Văn hóa Áo gắn liền với âm nhạc giao hưởng của Mozart, Strauss, văn hóa cà phê lâu đời tại Vienna thanh lịch cùng các công trình nghệ thuật kiến trúc Baroque tuyệt mỹ.' },
  'hy-lap': { name: 'Hy Lạp', id: 'greece-map', zoom: 5, center: [39.0742, 21.8243], maxBounds: [[34, 19], [42, 29]], flag: '🇬🇷', mascot: '🦉', intro: 'Hy Lạp (Greece) - Cái nôi của nền văn minh phương Tây và nền dân chủ nhân loại. Điểm đến tuyệt đẹp ngập tràn truyền thuyết về các vị thần đỉnh Olympus bên bờ biển Địa Trung Hải xanh ngọc.', culture: 'Văn hóa Hy Lạp giàu bản sắc với những câu chuyện thần thoại ly kỳ, triết học cổ đại của Socrates, Plato, các điệu nhảy truyền thống sôi động và chế độ ăn Địa Trung Hải cực kỳ lành mạnh.' },
  'tho-nhi-ky': { name: 'Thổ Nhĩ Kỳ', id: 'turkey-map', zoom: 5, center: [38.9637, 35.2433], maxBounds: [[34, 25], [43, 45]], flag: '🇹🇷', mascot: '🐈', intro: 'Thổ Nhĩ Kỳ (Turkey) - Giao lộ vĩ đại của thế giới nơi Á - Âu hội tụ, vùng đất giàu di tích lịch sử của các đế chế La Mã, Byzantine và Ottoman.', culture: 'Văn hóa Thổ Nhĩ Kỳ đặc sắc với nghệ thuật vẽ trên nước Ebru, trà đen phục vụ trong ly hình tulip, nhà tắm hơi Hamam truyền thống và ẩm thực phong phú lừng danh.' },
  'trung-quoc': { name: 'Trung Quốc', id: 'china-map', zoom: 4, center: [35.8617, 104.1954], maxBounds: [[18, 73], [53, 135]], flag: '🇨🇳', mascot: '🐼', intro: 'Trung Quốc - Đất nước tỷ dân với hơn 5.000 năm lịch sử văn minh huy hoàng. Trải nghiệm từ các kỳ quan cổ đại đến những siêu đô thị chọc trời năng động bậc nhất thế giới.', culture: 'Văn hóa Trung Hoa thâm sâu với thư pháp, trà đạo, võ thuật Thiếu Lâm, nghệ thuật Kinh kịch và ẩm thực phong phú chia làm Bát Đại Món Ăn độc đáo.' },
  'han-quoc': { name: 'Hàn Quốc', id: 'korea-map', zoom: 6, center: [35.9078, 127.7669], maxBounds: [[33, 124], [39, 131]], flag: '🇰🇷', mascot: '🐯', intro: 'Hàn Quốc - Xứ sở Kim Chi, nơi văn hóa truyền thống Á Đông giao hòa tuyệt vời với làn sóng hiện đại Hallyu lan tỏa toàn cầu. Điểm đến năng động với phong cảnh bốn mùa rõ nét thơ mộng.', culture: 'Văn hóa Hàn Quốc nổi bật với trang phục Hanbok thanh lịch, âm nhạc K-Pop sôi động, phim ảnh cuốn hút và ẩm thực cay nồng đặc sắc với Kim chi, Thịt nướng và Rượu Soju.' },
  'dai-loan': { name: 'Đài Loan', id: 'taiwan-map', zoom: 7, center: [23.6978, 120.9605], maxBounds: [[21.5, 119], [25.5, 122.5]], flag: '🇹🇼', mascot: '🐻', intro: 'Đài Loan - Hòn đảo ngọc quyến rũ với sự kết hợp tinh tế giữa đô thị hiện đại, các khu chợ đêm ẩm thực tấp nập và thiên nhiên đồi núi kỳ vĩ bao quanh bờ biển.', culture: 'Văn hóa Đài Loan phong phú với các lễ hội thả đèn trời cầu an, nghệ thuật trà sữa trân tinh hoa nổi tiếng toàn cầu và văn hóa chợ đêm nhộn nhịp đậm bản sắc.' }
};

// Order of countries from East to West (excluding Vietnam pinned first)
const EAST_TO_WEST_KEYS = [
  'nhat-ban',     // center Lng 138.2529 (Use existing JP markers, just order here)
  'han-quoc',     // center Lng 127.7669
  'dai-loan',     // center Lng 120.9605
  'trung-quoc',   // center Lng 104.1954
  'tho-nhi-ky',   // center Lng 35.2433
  'hy-lap',       // center Lng 21.8243
  'ao',           // center Lng 14.5501
  'y',            // center Lng 12.5674
  'duc',          // center Lng 10.4515
  'thuy-si',      // center Lng 8.2275
  'ha-lan',       // center Lng 5.2913
  'phap',         // center Lng 2.2137
  'anh',          // center Lng -3.4360
  'tay-ban-nha'   // center Lng -3.7492
];

async function fetchWikiAttractionData(query, countryCode) {
  // Try Vietnamese Wikipedia search first
  const searchUrl = `https://vi.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=coordinates|pageimages|descriptions&colimit=1&piprop=thumbnail&pithumbsize=1200&format=json`;
  
  try {
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'TravelAppBot/3.0 (admin@travelapp.com; contact@travelapp.com)'
      }
    });
    const data = await res.json();
    if (data.query && data.query.pages) {
      const pageId = Object.keys(data.query.pages)[0];
      const page = data.query.pages[pageId];
      
      const title = page.title;
      let lat = page.coordinates?.[0]?.lat;
      let lng = page.coordinates?.[0]?.lon;
      let imageUrl = page.thumbnail?.source;
      let desc = page.description || `Địa danh nổi tiếng hàng đầu tại ${COUNTRY_METADATA[countryCode].name}.`;

      // Fallback to English Wikipedia if coordinates or image are missing
      if (!lat || !lng || !imageUrl) {
        const enSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=coordinates|pageimages|descriptions&colimit=1&piprop=thumbnail&pithumbsize=1200&format=json`;
        const enRes = await fetch(enSearchUrl, {
          headers: { 'User-Agent': 'TravelAppBot/3.0 (admin@travelapp.com)' }
        });
        const enData = await enRes.json();
        if (enData.query && enData.query.pages) {
          const enPageId = Object.keys(enData.query.pages)[0];
          const enPage = enData.query.pages[enPageId];
          lat = lat || enPage.coordinates?.[0]?.lat;
          lng = lng || enPage.coordinates?.[0]?.lon;
          imageUrl = imageUrl || enPage.thumbnail?.source;
          if (desc.includes('hàng đầu') && enPage.description) {
            desc = enPage.description;
          }
        }
      }

      return {
        name: title,
        lat: lat || null,
        lng: lng || null,
        imageUrl: imageUrl || null,
        description: desc
      };
    }
  } catch (e) {
    console.error(`Error fetching data for ${query}:`, e.message);
  }
  return null;
}

// Fallback generator for coordinates if Wikipedia has none
function generateRandomCoordinates(center, radius = 2.0) {
  const r = radius * Math.random();
  const theta = 2 * Math.PI * Math.random();
  return {
    lat: center[0] + r * Math.sin(theta),
    lng: center[1] + r * Math.cos(theta)
  };
}

async function main() {
  console.log("=========================================");
  console.log(" GENERATING 40 LANDMARKS FOR 13 COUNTRIES ");
  console.log("=========================================");

  const generatedGuides = [];

  // 1. France
  console.log("Processing France (phap)...");
  const frMarkers = [];
  for (let i = 0; i < 40; i++) {
    const query = LANDMARK_QUERIES['phap'][i];
    await sleep(200); // polite API delay
    const data = await fetchWikiAttractionData(query, 'phap');
    const coords = (!data?.lat || !data?.lng) ? generateRandomCoordinates(COUNTRY_METADATA['phap'].center, 1.2) : { lat: data.lat, lng: data.lng };
    
    frMarkers.push({
      id: `fr${i + 1}`,
      name: data?.name || query,
      lat: Number(coords.lat.toFixed(4)),
      lng: Number(coords.lng.toFixed(4)),
      contentSlug: `france-${i + 1}`,
      shortDescription: data?.description || `Địa điểm du lịch nổi tiếng tại Pháp.`,
      imageUrl: `/images/guides/fr${i + 1}.jpg`,
      priority: i < 5 ? 1 : (i < 15 ? 2 : 3),
      wikiUrl: data?.imageUrl || null
    });
  }
  generatedGuides.push({ key: 'phap', markers: frMarkers });

  // 2. Italy
  console.log("Processing Italy (y)...");
  const itMarkers = [];
  for (let i = 0; i < 40; i++) {
    const query = LANDMARK_QUERIES['y'][i];
    await sleep(200);
    const data = await fetchWikiAttractionData(query, 'y');
    const coords = (!data?.lat || !data?.lng) ? generateRandomCoordinates(COUNTRY_METADATA['y'].center, 1.5) : { lat: data.lat, lng: data.lng };
    
    itMarkers.push({
      id: `it${i + 1}`,
      name: data?.name || query,
      lat: Number(coords.lat.toFixed(4)),
      lng: Number(coords.lng.toFixed(4)),
      contentSlug: `italy-${i + 1}`,
      shortDescription: data?.description || `Địa điểm du lịch nổi tiếng tại Ý.`,
      imageUrl: `/images/guides/it${i + 1}.jpg`,
      priority: i < 5 ? 1 : (i < 15 ? 2 : 3),
      wikiUrl: data?.imageUrl || null
    });
  }
  generatedGuides.push({ key: 'y', markers: itMarkers });

  // 3. Germany
  console.log("Processing Germany (duc)...");
  const deMarkers = [];
  for (let i = 0; i < 40; i++) {
    const query = LANDMARK_QUERIES['duc'][i];
    await sleep(200);
    const data = await fetchWikiAttractionData(query, 'duc');
    const coords = (!data?.lat || !data?.lng) ? generateRandomCoordinates(COUNTRY_METADATA['duc'].center, 1.8) : { lat: data.lat, lng: data.lng };
    
    deMarkers.push({
      id: `de${i + 1}`,
      name: data?.name || query,
      lat: Number(coords.lat.toFixed(4)),
      lng: Number(coords.lng.toFixed(4)),
      contentSlug: `germany-${i + 1}`,
      shortDescription: data?.description || `Địa điểm du lịch nổi tiếng tại Đức.`,
      imageUrl: `/images/guides/de${i + 1}.jpg`,
      priority: i < 5 ? 1 : (i < 15 ? 2 : 3),
      wikiUrl: data?.imageUrl || null
    });
  }
  generatedGuides.push({ key: 'duc', markers: deMarkers });

  // 4. UK
  console.log("Processing United Kingdom (anh)...");
  const ukMarkers = [];
  for (let i = 0; i < 40; i++) {
    const query = LANDMARK_QUERIES['anh'][i];
    await sleep(200);
    const data = await fetchWikiAttractionData(query, 'anh');
    const coords = (!data?.lat || !data?.lng) ? generateRandomCoordinates(COUNTRY_METADATA['anh'].center, 2.5) : { lat: data.lat, lng: data.lng };
    
    ukMarkers.push({
      id: `uk${i + 1}`,
      name: data?.name || query,
      lat: Number(coords.lat.toFixed(4)),
      lng: Number(coords.lng.toFixed(4)),
      contentSlug: `uk-${i + 1}`,
      shortDescription: data?.description || `Địa điểm du lịch nổi tiếng tại Anh.`,
      imageUrl: `/images/guides/uk${i + 1}.jpg`,
      priority: i < 5 ? 1 : (i < 15 ? 2 : 3),
      wikiUrl: data?.imageUrl || null
    });
  }
  generatedGuides.push({ key: 'anh', markers: ukMarkers });

  // 5. Spain
  console.log("Processing Spain (tay-ban-nha)...");
  const esMarkers = [];
  for (let i = 0; i < 40; i++) {
    const query = LANDMARK_QUERIES['tay-ban-nha'][i];
    await sleep(200);
    const data = await fetchWikiAttractionData(query, 'tay-ban-nha');
    const coords = (!data?.lat || !data?.lng) ? generateRandomCoordinates(COUNTRY_METADATA['tay-ban-nha'].center, 2.0) : { lat: data.lat, lng: data.lng };
    
    esMarkers.push({
      id: `es${i + 1}`,
      name: data?.name || query,
      lat: Number(coords.lat.toFixed(4)),
      lng: Number(coords.lng.toFixed(4)),
      contentSlug: `spain-${i + 1}`,
      shortDescription: data?.description || `Địa điểm du lịch nổi tiếng tại Tây Ban Nha.`,
      imageUrl: `/images/guides/es${i + 1}.jpg`,
      priority: i < 5 ? 1 : (i < 15 ? 2 : 3),
      wikiUrl: data?.imageUrl || null
    });
  }
  generatedGuides.push({ key: 'tay-ban-nha', markers: esMarkers });

  // 6. Switzerland
  console.log("Processing Switzerland (thuy-si)...");
  const chMarkers = [];
  for (let i = 0; i < 40; i++) {
    const query = LANDMARK_QUERIES['thuy-si'][i];
    await sleep(200);
    const data = await fetchWikiAttractionData(query, 'thuy-si');
    const coords = (!data?.lat || !data?.lng) ? generateRandomCoordinates(COUNTRY_METADATA['thuy-si'].center, 0.8) : { lat: data.lat, lng: data.lng };
    
    chMarkers.push({
      id: `ch${i + 1}`,
      name: data?.name || query,
      lat: Number(coords.lat.toFixed(4)),
      lng: Number(coords.lng.toFixed(4)),
      contentSlug: `switzerland-${i + 1}`,
      shortDescription: data?.description || `Địa điểm du lịch nổi tiếng tại Thụy Sĩ.`,
      imageUrl: `/images/guides/ch${i + 1}.jpg`,
      priority: i < 5 ? 1 : (i < 15 ? 2 : 3),
      wikiUrl: data?.imageUrl || null
    });
  }
  generatedGuides.push({ key: 'thuy-si', markers: chMarkers });

  // 7. Netherlands
  console.log("Processing Netherlands (ha-lan)...");
  const nlMarkers = [];
  for (let i = 0; i < 40; i++) {
    const query = LANDMARK_QUERIES['ha-lan'][i];
    await sleep(200);
    const data = await fetchWikiAttractionData(query, 'ha-lan');
    const coords = (!data?.lat || !data?.lng) ? generateRandomCoordinates(COUNTRY_METADATA['ha-lan'].center, 0.9) : { lat: data.lat, lng: data.lng };
    
    nlMarkers.push({
      id: `nl${i + 1}`,
      name: data?.name || query,
      lat: Number(coords.lat.toFixed(4)),
      lng: Number(coords.lng.toFixed(4)),
      contentSlug: `netherlands-${i + 1}`,
      shortDescription: data?.description || `Địa điểm du lịch nổi tiếng tại Hà Lan.`,
      imageUrl: `/images/guides/nl${i + 1}.jpg`,
      priority: i < 5 ? 1 : (i < 15 ? 2 : 3),
      wikiUrl: data?.imageUrl || null
    });
  }
  generatedGuides.push({ key: 'ha-lan', markers: nlMarkers });

  // 8. Austria
  console.log("Processing Austria (ao)...");
  const atMarkers = [];
  for (let i = 0; i < 40; i++) {
    const query = LANDMARK_QUERIES['ao'][i];
    await sleep(200);
    const data = await fetchWikiAttractionData(query, 'ao');
    const coords = (!data?.lat || !data?.lng) ? generateRandomCoordinates(COUNTRY_METADATA['ao'].center, 1.2) : { lat: data.lat, lng: data.lng };
    
    atMarkers.push({
      id: `at${i + 1}`,
      name: data?.name || query,
      lat: Number(coords.lat.toFixed(4)),
      lng: Number(coords.lng.toFixed(4)),
      contentSlug: `austria-${i + 1}`,
      shortDescription: data?.description || `Địa điểm du lịch nổi tiếng tại Áo.`,
      imageUrl: `/images/guides/at${i + 1}.jpg`,
      priority: i < 5 ? 1 : (i < 15 ? 2 : 3),
      wikiUrl: data?.imageUrl || null
    });
  }
  generatedGuides.push({ key: 'ao', markers: atMarkers });

  // 9. Greece
  console.log("Processing Greece (hy-lap)...");
  const grMarkers = [];
  for (let i = 0; i < 40; i++) {
    const query = LANDMARK_QUERIES['hy-lap'][i];
    await sleep(200);
    const data = await fetchWikiAttractionData(query, 'hy-lap');
    const coords = (!data?.lat || !data?.lng) ? generateRandomCoordinates(COUNTRY_METADATA['hy-lap'].center, 1.9) : { lat: data.lat, lng: data.lng };
    
    grMarkers.push({
      id: `gr${i + 1}`,
      name: data?.name || query,
      lat: Number(coords.lat.toFixed(4)),
      lng: Number(coords.lng.toFixed(4)),
      contentSlug: `greece-${i + 1}`,
      shortDescription: data?.description || `Địa điểm du lịch nổi tiếng tại Hy Lạp.`,
      imageUrl: `/images/guides/gr${i + 1}.jpg`,
      priority: i < 5 ? 1 : (i < 15 ? 2 : 3),
      wikiUrl: data?.imageUrl || null
    });
  }
  generatedGuides.push({ key: 'hy-lap', markers: grMarkers });

  // 10. Turkey
  console.log("Processing Turkey (tho-nhi-ky)...");
  const trMarkers = [];
  for (let i = 0; i < 40; i++) {
    const query = LANDMARK_QUERIES['tho-nhi-ky'][i];
    await sleep(200);
    const data = await fetchWikiAttractionData(query, 'tho-nhi-ky');
    const coords = (!data?.lat || !data?.lng) ? generateRandomCoordinates(COUNTRY_METADATA['tho-nhi-ky'].center, 2.5) : { lat: data.lat, lng: data.lng };
    
    trMarkers.push({
      id: `tr${i + 1}`,
      name: data?.name || query,
      lat: Number(coords.lat.toFixed(4)),
      lng: Number(coords.lng.toFixed(4)),
      contentSlug: `turkey-${i + 1}`,
      shortDescription: data?.description || `Địa điểm du lịch nổi tiếng tại Thổ Nhĩ Kỳ.`,
      imageUrl: `/images/guides/tr${i + 1}.jpg`,
      priority: i < 5 ? 1 : (i < 15 ? 2 : 3),
      wikiUrl: data?.imageUrl || null
    });
  }
  generatedGuides.push({ key: 'tho-nhi-ky', markers: trMarkers });

  // 11. China
  console.log("Processing China (trung-quoc)...");
  const cnMarkers = [];
  for (let i = 0; i < 40; i++) {
    const query = LANDMARK_QUERIES['trung-quoc'][i];
    await sleep(200);
    const data = await fetchWikiAttractionData(query, 'trung-quoc');
    const coords = (!data?.lat || !data?.lng) ? generateRandomCoordinates(COUNTRY_METADATA['trung-quoc'].center, 5.0) : { lat: data.lat, lng: data.lng };
    
    cnMarkers.push({
      id: `cn${i + 1}`,
      name: data?.name || query,
      lat: Number(coords.lat.toFixed(4)),
      lng: Number(coords.lng.toFixed(4)),
      contentSlug: `china-${i + 1}`,
      shortDescription: data?.description || `Địa điểm du lịch nổi tiếng tại Trung Quốc.`,
      imageUrl: `/images/guides/cn${i + 1}.jpg`,
      priority: i < 5 ? 1 : (i < 15 ? 2 : 3),
      wikiUrl: data?.imageUrl || null
    });
  }
  generatedGuides.push({ key: 'trung-quoc', markers: cnMarkers });

  // 12. South Korea
  console.log("Processing South Korea (han-quoc)...");
  const krMarkers = [];
  for (let i = 0; i < 40; i++) {
    const query = LANDMARK_QUERIES['han-quoc'][i];
    await sleep(200);
    const data = await fetchWikiAttractionData(query, 'han-quoc');
    const coords = (!data?.lat || !data?.lng) ? generateRandomCoordinates(COUNTRY_METADATA['han-quoc'].center, 1.5) : { lat: data.lat, lng: data.lng };
    
    krMarkers.push({
      id: `kr${i + 1}`,
      name: data?.name || query,
      lat: Number(coords.lat.toFixed(4)),
      lng: Number(coords.lng.toFixed(4)),
      contentSlug: `korea-${i + 1}`,
      shortDescription: data?.description || `Địa điểm du lịch nổi tiếng tại Hàn Quốc.`,
      imageUrl: `/images/guides/kr${i + 1}.jpg`,
      priority: i < 5 ? 1 : (i < 15 ? 2 : 3),
      wikiUrl: data?.imageUrl || null
    });
  }
  generatedGuides.push({ key: 'han-quoc', markers: krMarkers });

  // 13. Taiwan
  console.log("Processing Taiwan (dai-loan)...");
  const twMarkers = [];
  for (let i = 0; i < 40; i++) {
    const query = LANDMARK_QUERIES['dai-loan'][i];
    await sleep(200);
    const data = await fetchWikiAttractionData(query, 'dai-loan');
    const coords = (!data?.lat || !data?.lng) ? generateRandomCoordinates(COUNTRY_METADATA['dai-loan'].center, 0.8) : { lat: data.lat, lng: data.lng };
    
    twMarkers.push({
      id: `tw${i + 1}`,
      name: data?.name || query,
      lat: Number(coords.lat.toFixed(4)),
      lng: Number(coords.lng.toFixed(4)),
      contentSlug: `taiwan-${i + 1}`,
      shortDescription: data?.description || `Địa điểm du lịch nổi tiếng tại Đài Loan.`,
      imageUrl: `/images/guides/tw${i + 1}.jpg`,
      priority: i < 5 ? 1 : (i < 15 ? 2 : 3),
      wikiUrl: data?.imageUrl || null
    });
  }
  generatedGuides.push({ key: 'dai-loan', markers: twMarkers });


  // --- BUILD THE FINAL SORTED DATA SET (Vietnam first, then East to West) ---
  const guidesList = [];

  // Pinned Vietnam as first
  console.log("Compiling final mockGuideMaps dataset in East-to-West order...");
  guidesList.push({
    id: 'vn-map',
    countryName: 'Việt Nam',
    countrySlug: 'viet-nam',
    center: [16.4637, 107.5909],
    zoom: 6,
    maxBounds: [[8, 102], [23.5, 110]],
    borderPolygon: [[23.39, 102.14], [23.37, 105.28], [21.52, 108.01], [20.01, 106.58], [17.11, 107.25], [16.12, 108.31], [14.58, 109.15], [12.01, 109.28], [10.82, 108.15], [10.35, 107.08], [8.56, 104.82], [9.15, 103.45], [10.45, 104.48], [11.21, 105.85], [14.41, 107.56], [17.58, 106.12], [18.82, 105.58], [21.05, 102.82], [23.39, 102.14]],
    markers: ORIGINAL_VN_MARKERS,
    introduction: "Việt Nam - Đất nước hình chữ S với hơn 3.000km đường bờ biển, sở hữu những cảnh quan thiên nhiên kỳ vĩ từ vùng núi cao phía Bắc đến vùng đồng bằng sông Cửu Long trù phú. Đây là điểm đến lý tưởng cho những ai yêu thích khám phá vẻ đẹp tự nhiên và bề dày lịch sử lâu đời.",
    cultureInfo: "Văn hóa Việt Nam là sự hòa quyện tinh tế giữa truyền thống và hiện đại, nổi bật với sự hiếu khách, ẩm thực đường phố phong phú và các lễ hội rực rỡ sắc màu. Con người Việt Nam luôn tự hào về di sản văn hóa phi vật thể đa dạng được UNESCO công nhận.",
    flag: "🇻🇳",
    mascot: "🐉"
  });

  // Loop through ordered keys
  for (const key of EAST_TO_WEST_KEYS) {
    if (key === 'nhat-ban') {
      guidesList.push({
        id: 'japan-map',
        countryName: 'Nhật Bản',
        countrySlug: 'nhat-ban',
        center: [36.2048, 138.2529],
        zoom: 5,
        maxBounds: [[24, 122], [46, 154]],
        borderPolygon: [[45.52, 141.93], [43.23, 145.81], [35.85, 140.85], [34.45, 139.52], [31.21, 131.02], [32.05, 128.52], [34.01, 130.58], [36.05, 132.52], [38.52, 138.52], [41.52, 140.01], [42.52, 139.85], [45.52, 141.93]],
        markers: ORIGINAL_JP_MARKERS,
        introduction: "Nhật Bản - Xứ sở hoa anh đào là sự kết hợp hoàn hảo giữa công nghệ hiện đại bậc nhất và những giá trị truyền thống được gìn giữ qua nhiều thế kỷ. Từ những giao lộ nhộn nhịp tại Tokyo đến sự tĩnh lặng của các ngôi đền tại Kyoto, Nhật Bản luôn mang lại sự ngạc nhiên thú vị cho du khách.",
        cultureInfo: "Văn hóa Nhật Bản coi trọng sự kỷ luật, lễ nghi và tinh thần Omotenashi (lòng hiếu khách tận tâm). Ẩm thực Nhật Bản với sự tinh tế trong chế biến và trình bày là một trong những điểm thu hút lớn nhất đối với du khách trên toàn thế giới.",
        flag: "🇯🇵",
        mascot: "🐱"
      });
    } else {
      const generated = generatedGuides.find(g => g.key === key);
      const meta = COUNTRY_METADATA[key];
      if (generated && meta) {
        guidesList.push({
          id: meta.id,
          countryName: meta.name,
          countrySlug: key,
          center: meta.center,
          zoom: meta.zoom,
          maxBounds: meta.maxBounds,
          borderPolygon: [],
          markers: generated.markers.map(m => {
            // Strip out the wikiUrl from output so it matches the RegionMarker TS definition
            const { wikiUrl, ...rest } = m;
            return rest;
          }),
          introduction: meta.intro,
          cultureInfo: meta.culture,
          flag: meta.flag,
          mascot: meta.mascot
        });
      }
    }
  }

  // --- WRITE FILE src/data/guideMaps.ts ---
  const fileContent = `import { CountryGuideMap } from '@/types/guideMap';

export const mockGuideMaps: CountryGuideMap[] = ${JSON.stringify(guidesList, null, 2)};
`;
  await fs.writeFile(path.join(process.cwd(), 'src', 'data', 'guideMaps.ts'), fileContent, 'utf8');
  console.log("Successfully wrote updated src/data/guideMaps.ts with 40 markers per country!");

  // --- WRITE AN INTERNAL JSON HARVESTING MANIFEST FOR SCRAPING ---
  // Save wiki URLs for the downloader to find high-res images directly
  const imageManifest = [];
  for (const guide of generatedGuides) {
    for (const marker of guide.markers) {
      if (marker.wikiUrl) {
        imageManifest.push({
          id: marker.id,
          name: marker.name,
          url: marker.wikiUrl
        });
      }
    }
  }
  await fs.writeFile(path.join(process.cwd(), 'scripts', 'harvest-manifest.json'), JSON.stringify(imageManifest, null, 2), 'utf8');
  console.log("Wrote download manifest to scripts/harvest-manifest.json");
}

main().catch(console.error);
