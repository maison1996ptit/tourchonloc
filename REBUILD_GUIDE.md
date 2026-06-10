# THE ULTIMATE REBUILD BLUEPRINT: PREMIUM TRAVEL OTA
**Target Audience:** AI CLI Agents, Senior Fullstack Developers, Software Architects.
**Objective:** A step-by-step, zero-to-hero manual to reconstruct the exact "TravelApp" ecosystem, preserving 100% of its data architecture, security protocols, and complex UI/UX animations.

---

## PHẦN 1: TECH STACK & KIẾN TRÚC TỔNG THỂ
Để tái tạo dự án này, AI Agent cần cài đặt môi trường với cấu hình chuẩn sau:
- **Framework:** Next.js 14+ (Sử dụng App Router).
- **Core Library:** React 19, TypeScript (Strict Mode).
- **Database:** PostgreSQL chạy qua Docker.
- **ORM:** Prisma Client (`prisma`, `@prisma/client`).
- **Styling:** CSS Modules (`*.module.css`) thuần túy. KHÔNG sử dụng TailwindCSS (để đảm bảo khả năng can thiệp keyframes và 3D Transform chuyên sâu).
- **Maps:** `react-leaflet`, `leaflet`.

---

## PHẦN 2: THIẾT KẾ DATABASE (PRISMA SCHEMA)
Hệ thống xoay quanh 10 Models lõi. Cần khởi tạo `schema.prisma` với các thực thể sau:

1.  **User:** `id`, `name`, `email`, `password` (Lưu ý: Chứa Hash, không chứa Plaintext), `role` (Admin/Editor), `isActive`.
2.  **Tour:** Khối dữ liệu khổng lồ. Cần các trường: `title`, `slug`, `featuredImage`, `images` (Mảng text lưu 4-5 ảnh), `itinerary` (JSON lưu lịch trình), `priceFrom`, `destination`, `durationDays`, vv.
3.  **CountryGuide & RegionMarker (Quan hệ 1-N):** Đây là lõi của Bản đồ Tương tác.
    - `CountryGuide`: Lưu trung tâm bản đồ (`centerLat`, `centerLng`), `zoom`, `flag` (Quốc kỳ), `mascot` (Linh vật), `introduction`, `cultureInfo`.
    - `RegionMarker`: Lưu `lat`, `lng`, `shortDescription`, `imageUrl` (BẮT BUỘC dùng ảnh local, không dùng link ngoài).
4.  **Blog, Testimonial, Lead, Menu, SiteSettings, ThemeSettings.**

> **🔥 CRITICAL STEP:** Sau khi tạo Schema, phải viết một `seed.ts` khổng lồ. Tuyệt đối không dùng thư viện faker. Dữ liệu mồi phải là dữ liệu thực tế (Các tour Đài Loan, Nhật Bản, 80 địa danh thực tế của VN/JP với tọa độ GPS chuẩn xác).

---

## PHẦN 3: BẢO MẬT & XÁC THỰC (ZERO-TRUST ARCHITECTURE)
Để tái tạo hệ thống bảo mật không lỗ hổng, tuyệt đối không dùng JWT thư viện ngoài (như `jsonwebtoken` hay `next-auth`) mà phải tự code bằng `crypto` của Node.js:

1.  **Password Hashing:** Viết hàm PBKDF2 (SHA-512) tạo salt 16 bytes, lặp 1000 lần, sinh ra hash 64 bytes. Lưu theo format `salt:hash`.
2.  **JWT Signing:** Dùng `crypto.createHmac('sha256', process.env.AUTH_SECRET)`.
3.  **Session Management:** Token BẮT BUỘC lưu vào **HttpOnly Cookies** (qua `next/headers`). Tuyệt đối không lưu vào `localStorage` để chống XSS.
4.  **Server Actions Guard:** Mọi hàm trong thư mục `/src/actions/` phải được bọc bởi `isAdmin()` hoặc `isEditor()`. Throw `Error('Unauthorized')` ngay dòng đầu tiên nếu Cookie không hợp lệ.
5.  **Chống Mass Assignment:** Trong các hàm `create` / `update`, không bao giờ được dùng `...data`. Phải map tường minh từng trường hợp lệ (`title: data.title`,...).

---

## PHẦN 4: HỆ THỐNG THIẾT KẾ UI/UX (THEME & STYLING)

### 1. Bảng màu Chuẩn OTA (OTA Color Palette)
Tạo file `src/app/globals.css` và inject bộ màu biến CSS:
- `--primary-color: #4F46E5` (Deep Indigo - Kích thích sự tin cậy).
- `--accent-color: #0EA5E9` (Vibrant Sky Blue - Dùng riêng cho Call-to-Action).
- **Màu chữ (Khoa học):** Tránh đen/trắng tuyệt đối. Dùng `#1E293B` (Chữ chính) và `#64748B` (Chữ phụ).

### 2. Kiểu chữ (Typography)
- Import `Raleway` từ `next/font/google` cho toàn bộ dự án.
- Import `Caveat` để dùng riêng cho các điểm nhấn mang tính "Nhật ký du lịch" (như chữ *Trong Mơ*).

### 3. Nền tảng Glassmorphism (Kính mờ Toàn cục)
- Cài đặt ảnh nền abstract nghệ thuật (đường cong mềm mại tối màu) gán vào `body` với `background-attachment: fixed`.
- Phủ một lớp `publicPageOverlay` toàn màn hình: `background: rgba(248, 250, 252, 0.85); backdrop-filter: blur(12px) saturate(0.6);`.
- Toàn bộ các trang (Home, About, Tours) đều KHÔNG CÓ NỀN (`background: transparent`), chỉ nổi các thẻ (Card) trắng trên lớp kính mờ này.

---

## PHẦN 5: TÁI TẠO CÁC ANIMATION ĐỘC QUYỀN (CRITICAL UI)
Đây là phần khó nhất. AI Agent cần chép chính xác cấu trúc CSS sau:

### 1. Hiệu ứng "Máy Bay Giấy Đổi Màu Chữ" (Hero Text Wipe)
Không dùng `clip-path` (bị lỗi trên Safari). Bắt buộc dùng cấu trúc **2 lớp (Dual-layer width mask)**:
*   **HTML:** 
    ```jsx
    <span className="titleHighlightWrapper"> /* position: relative; white-space: nowrap */
      <span className="titleHighlightTextBase">Bắt Đầu Hành Trình</span> /* Màu trắng */
      <span className="titleHighlightOverlayContainer"> /* position: absolute; overflow: hidden; animation: textWipe 12s linear infinite */
        <span className="titleHighlightTextOverlay">Bắt Đầu Hành Trình</span> /* Màu Cam/Xanh Accent */
      </span>
      <span className="paperPlaneTrail">✈️</span> /* transform-origin: left center; animation: planeFlight 12s linear infinite */
    </span>
    ```
*   **CSS Sync:** Animation của `textWipe` (thay đổi `width: 0% -> 100%`) phải khớp CHÍNH XÁC phần trăm thời gian với animation `planeFlight` (thay đổi `left: 0% -> 100%`). Đuôi máy bay sẽ quét ra màu cam/xanh bên dưới.

### 2. Thẻ Tour 3D (3D Holographic Card)
*   Container ngoài cùng cần `perspective: 2000px`.
*   Phần tử Inner cần `transform-style: preserve-3d` và khi `:hover` sẽ `rotateX(15deg) rotateY(-15deg) translateZ(20px)`.
*   Khung ảnh đại diện nổi bật lên (`translateZ(160px)`) tạo ra cảm giác lơ lửng ngoài màn hình.

### 3. Lịch Trình Tàu Điện Ngầm (Transit Map Itinerary)
Tại trang chi tiết Tour (`tour-detail.module.css`):
*   Tạo đường dọc xuyên suốt bằng `::before` của Container.
*   Mỗi ngày (Day 1) là một trạm hình tròn (`border: 6px solid var(--primary-color)`).
*   Có một đường rẽ nhánh (`::before` của thẻ Day) đâm ngang vào khối Text bên cạnh.

---

## PHẦN 6: QUY TRÌNH THỰC THI CHO CLI AGENT (REBUILD WORKFLOW)

Nếu một AI Agent khác nhận nhiệm vụ build lại từ đầu, hãy chạy theo thứ tự sau:

1.  **Bước 1: Setup Framework:** `npx create-next-app@latest travel-app --ts --eslint --app`
2.  **Bước 2: Cài đặt Libs:** `npm i prisma @prisma/client react-leaflet leaflet`
3.  **Bước 3: Khởi tạo DB:** Viết `schema.prisma` -> `npx prisma db push`
4.  **Bước 4: Crawl Assets (RẤT QUAN TRỌNG):** 
    - Viết script Node.js download 80 hình ảnh phong cảnh độ phân giải cao từ Pexels/Unsplash vào mục `/public/images/guides/`. 
    - Phải download vật lý, KHÔNG nhúng link URL ngoài vào CSDL để tránh 404.
5.  **Bước 5: Viết Seed:** Chạy `npx tsx prisma/seed.ts` để nạp 80 ảnh, thông tin Quốc gia, Tours, Blogs, và User Admin.
6.  **Bước 6: Dựng Layout.tsx:** Tích hợp Font, Global Overlay (Glassmorphism).
7.  **Bước 7: Dựng Components:** Tách nhỏ Header, Footer, GuideMapCard (Leaflet).
8.  **Bước 8: Ghép Page:** Lắp ráp trang Chủ (với Animation Máy bay), trang About (với background Đồng Văn mờ), trang Tour Detail (với sơ đồ Transit Map).
9.  **Bước 9: Khởi chạy:** `npm run dev`.

**Đạt được 9 bước này, bạn sẽ tái tạo được 100% linh hồn của dự án TravelApp.**