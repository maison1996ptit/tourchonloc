# Báo cáo Kiến trúc Tổng thể Dự án: TravelApp (Premium OTA)
**Tác giả:** Software Architect
**Phiên bản:** 1.0 (Production-Ready)
**Ngày cập nhật:** Cuối tháng 5/2026

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

Dự án **TravelApp** được thiết kế theo mô hình **Hybrid Monolith** hiện đại, tận dụng sức mạnh của **Next.js 14+ (App Router)**. Mô hình này cho phép kết hợp hoàn hảo giữa Server-Side Rendering (SSR) để tối ưu hóa SEO cho các trang công khai (Public) và Client-Side Rendering (CSR) mang lại trải nghiệm tương tác cao.

Hệ thống được chia làm hai phân hệ độc lập về bảo mật nhưng dùng chung một cơ sở hạ tầng dữ liệu:
1.  **Public Portal (Giao diện Khách hàng):** Tối ưu hóa tốc độ tải (Performance), hiệu ứng thị giác (UI/UX) và tỷ lệ chuyển đổi (Conversion Rate).
2.  **Admin CMS (Quản trị Hệ thống):** Bảo mật đa lớp (Zero-trust), quản lý dữ liệu động.

### Công nghệ Cốt lõi (Tech Stack)
*   **Core Framework:** Next.js 14 (React 19)
*   **Language:** TypeScript (Strict Typing)
*   **Database:** PostgreSQL
*   **ORM:** Prisma Client
*   **Styling:** CSS Modules (Vanilla CSS thuần, đảm bảo không đụng độ class và dễ dàng customize hiệu ứng phức tạp).
*   **Interactive Maps:** React-Leaflet
*   **Security:** Node.js Crypto (PBKDF2 Hashing, HMAC-SHA256 JWT)

---

## 2. CẤU TRÚC THƯ MỤC CHUẨN (DIRECTORY STRUCTURE)

Dự án tuân thủ nguyên tắc **Domain-Driven Design (DDD)** kết hợp **Atomic Design** trong cách chia file:

```text
D:\TravelApp\
├── prisma/                 # [DATA LAYER] Schema CSDL và Script Seeding dữ liệu
├── public/                 # [ASSET LAYER] Static assets, hình ảnh, icon
│   └── images/guides/      # Lưu trữ 80+ ảnh chất lượng cao đã Localize
├── scripts/                # [OPS LAYER] Các script DevOps (Tải ảnh, Audit, Clean)
├── src/
│   ├── actions/            # [BUSINESS LOGIC] Next.js Server Actions (Thao tác DB an toàn)
│   ├── app/                # [ROUTING LAYER] Phân tuyến ứng dụng (App Router)
│   │   ├── (public)/       # Cụm Route cho Khách hàng (Home, Tours, Blogs, About)
│   │   └── admin/          # Cụm Route cho Quản trị viên (Dashboard, Manage)
│   ├── components/         # [VIEW LAYER] Các khối UI tái sử dụng
│   │   ├── public/         # Components riêng cho giao diện khách
│   │   ├── admin/          # Components riêng cho CMS
│   │   └── shared/         # Components dùng chung (Buttons, Modals, Forms)
│   ├── data/               # [MOCK/SEED LAYER] Dữ liệu mẫu ban đầu để setup dự án
│   ├── dictionaries/       # [i18n] Đa ngôn ngữ (vi, en)
│   ├── hooks/              # [REACT HOOKS] Custom hooks (useAuth, useTheme)
│   ├── lib/                # [CORE LIBS] Tiện ích cốt lõi (Prisma Client, Auth Utils)
│   ├── services/           # [SERVICE LAYER] Abstraction bọc ngoài Server Actions để Client dễ gọi
│   └── types/              # [TYPE DEFINITIONS] Giao thức dữ liệu TypeScript (Interfaces)
```

---

## 3. PHÂN TÍCH CHI TIẾT COMPONENT & CHỨC NĂNG (FUNCTIONAL BREAKDOWN)

### 3.1. Phân hệ Khách hàng (Public Portal)

**A. Trang chủ (HomePage - `page.tsx`)**
Trái tim của việc chốt sale, được thiết kế theo phễu chuyển đổi (Conversion Funnel):
*   **Hero Section:** 
    *   *Chức năng:* Bảng điều khiển tìm kiếm đầu tiên đập vào mắt người dùng.
    *   *Hiệu ứng (UI):* 
        *   Sử dụng Mixed Typography (Kết hợp font cứng cáp và font viết tay Caveat).
        *   **Kỹ thuật độc quyền:** Hiệu ứng máy bay giấy bay dọc tiêu đề, đồng bộ toán học (Pixel-perfect Sync) với mặt nạ màu (CSS Mask-image/Clip-path) hé lộ dần dòng chữ màu Cam theo đúng đuôi máy bay.
*   **Interactive Guide Preview (Cẩm Nang Tương Tác):** Hiển thị các thẻ Quốc Gia (Country Cards) có gắn Quốc kỳ và Linh vật. Click để chuyển sang trang Bản đồ.
*   **Featured Tours (Hành trình Ưa chuộng):**
    *   *Chức năng:* Hiển thị danh sách Tour dạng lưới có phân trang (Pagination).
    *   *Hiệu ứng (UI):* 
        *   **3D Holographic Card:** Thẻ Tour được tạo hiệu ứng 3D perspective khi di chuột (hover).
        *   **Dynamic Background:** Bấm mũi tên (↑ / ↓) sẽ đổi ảnh nền card thành các điểm đến trong lịch trình.
        *   Khối thông tin Holographic Dashboard với nền Gradient tối và chữ Text-shadow nổi bật màu.
*   **Testimonials (Đánh giá):** Thẻ nhận xét từ người dùng, thiết kế Line-clamp (cắt chữ thông minh) để các thẻ luôn cao bằng nhau (Uniformity).

**B. Hệ thống Bản đồ Tương tác (Interactive Guides - `/guides`)**
*   **Chức năng:** Trình bày 80 địa điểm nổi tiếng (40 Việt Nam, 40 Nhật Bản) trên bản đồ tương tác.
*   **Components chính:** `GuideMapCard.tsx`.
*   **Kỹ thuật sử dụng:**
    *   Sử dụng `react-leaflet` để vẽ bản đồ. Kích hoạt thuộc tính `flyTo` để Camera mượt mà bay đến các điểm khi click.
    *   **Sync-Scrolling:** Bấm vào một thẻ địa điểm (Card), bản đồ sẽ dịch chuyển. Bấm vào một điểm (Marker) trên bản đồ, danh sách thẻ bên dưới tự động cuộn (scroll) tới đúng thẻ đó.
    *   **Pulse Marker:** Kỹ thuật CSS keyframes tạo vòng sóng lan tỏa (Pulse) xung quanh Marker để định vị điểm đang xem.
    *   **Detail Modal:** Cửa sổ nổi hiển thị chi tiết điểm đến và tự động tìm bài Blog tương ứng.

**C. Trang Về Chúng Tôi (About Us - `/about`)**
*   *Chức năng:* Giới thiệu hệ sinh thái, xây dựng niềm tin.
*   *UI:* 
    *   Hero Banner toàn màn hình với hiệu ứng ảnh nền cố định (Fixed Background Parallax) từ Công viên Đá Đồng Văn.
    *   Sử dụng Dark Overlay Gradient đảm bảo Text trắng luôn sắc nét.

**D. Header & Footer (`/components/public/`)**
*   *Chức năng:* Điều hướng toàn cục. Tối ưu responsive trên màn hình mobile (gom nhóm, tự động co giãn kích thước).

### 3.2. Phân hệ Quản trị (Admin CMS)

*   **Chức năng:** Khu vực dành riêng cho Nhân viên (Editor) và Quản lý (Admin).
*   **Modules:**
    *   `/admin/tours`: Thêm/Sửa/Xóa cấu trúc Tour, lịch trình.
    *   `/admin/blogs`: Viết bài Cẩm nang du lịch (Rich text).
    *   `/admin/site-settings` & `/admin/theme`: Thay đổi cấu hình toàn trang (Màu sắc, Logo, Nội dung Header) không cần lập trình viên. Cấu hình được lưu trong DB và Inject vào App qua `useTheme` hook.
    *   `/admin/users`: Quản lý tài khoản và phân quyền.

---

## 4. HỆ THỐNG THIẾT KẾ & GIAO DIỆN (UI/UX & DESIGN SYSTEM)

Dự án áp dụng bộ phối màu **"Modern OTA" (Chuẩn nền tảng Đặt phòng Trực tuyến)**:

*   **Màu chủ đạo (Primary Color): Indigo Blue (`#4F46E5`)**
    *   Đại diện cho sự chuyên nghiệp, tin cậy và chiều sâu (Trust & Premium).
*   **Màu nhấn (Accent Color): Vibrant Sky Blue (`#0EA5E9`)**
    *   Dùng riêng cho các hành động chốt sale (Nút Đặt Ngay, Nút Tìm Kiếm, Marker Bản đồ). Màu xanh da trời sáng kích thích hành động mà không gây nhức mắt như màu Đỏ/Cam.
*   **Màu chữ (Scientific Typography Palette):**
    *   Áp dụng tiêu chuẩn WCAG: Không dùng `#000000` (Đen tuyệt đối).
    *   Text Chính: `Slate 800 (#1E293B)`. Text phụ/Meta: `Slate 500 (#64748B)`.
*   **Font chữ:**
    *   **Roboto / Raleway** (Tùy cấu hình): Cung cấp độ tròn trịa, sắc nét và khả năng đọc (readability) tốt nhất trên điện thoại và máy tính.
    *   **Caveat:** Dùng cho các điểm nhấn (Ví dụ chữ "Trong Mơ") tạo cảm giác sổ tay nhật ký du lịch.

---

## 5. THIẾT KẾ BẢO MẬT (SECURITY & DATA ARCHITECTURE)

Dự án áp dụng triết lý **Secure-by-Design** từ gốc:

1.  **Authentication (Xác thực):**
    *   Không sử dụng thư viện nặng nề, tự xây dựng hệ thống **HMAC-SHA256 Signed JWT** bằng module `crypto` lõi của Node.js.
    *   Mật khẩu được băm bằng thuật toán **PBKDF2** kèm Salt ngẫu nhiên.
    *   Token được lưu trong **HttpOnly Cookie**, triệt tiêu hoàn toàn rủi ro tấn công XSS từ các plugin trình duyệt giả mạo.

2.  **Authorization (Phân quyền):**
    *   Tất cả Server Actions (Thao tác Database) đều bị chặn ở dòng đầu tiên bởi hàm `isAdmin()` hoặc `isEditor()`. Việc gọi Action trần từ Browser Console sẽ luôn bị từ chối (HTTP 401 Unauthorized).

3.  **Data Integrity (Toàn vẹn dữ liệu):**
    *   Chống **Mass Assignment**: Các hành động cập nhật DB (như `updateTour`) không dùng toán tử spread (`...updates`). Dữ liệu được gán tường minh (Explicit Mapping) từng trường một, loại bỏ nguy cơ hacker truyền thêm biến (như `role: "admin"`) vào payload.
    *   Mật khẩu không bao giờ được `select` từ CSDL khi gọi API danh sách người dùng.

---

## 6. QUẢN LÝ TÀI NGUYÊN (ASSET MANAGEMENT)

*   **Vấn đề:** Các link ảnh miễn phí (Unsplash, Pexels) thường xuyên bị lỗi 404 hoặc cấm truy cập nóng.
*   **Kiến trúc giải quyết:** 
    *   Xây dựng hệ thống Script tự động (`final-harvest-80.mjs`). 
    *   Cào và tải vật lý toàn bộ 80 hình ảnh chất lượng cao về thư mục `/public/images/guides/` của dự án. 
    *   Đảm bảo Website đạt **Uptime hình ảnh 100%**, có thể chạy Offline hoặc trong môi trường máy chủ nội bộ.

---
**Chữ ký Kiến trúc sư:** *Hệ thống đã đạt tiêu chuẩn triển khai thương mại (Production-ready). Có thể tiếp tục scale lên hàng ngàn người dùng đồng thời.*
