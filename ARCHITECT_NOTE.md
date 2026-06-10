# System Architecture Design: TravelApp Ecosystem
**Author:** Software Architect (10+ Years Experience)
**Status:** Production Ready / Secure Baseline
**Tech Stack:** Next.js 14 (App Router), TypeScript, Prisma ORM, PostgreSQL, Docker, Leaflet.

---

## 1. Tầm nhìn Kiến trúc (Architectural Vision)
Hệ thống được thiết kế theo mô hình **Hybrid Monolith**, tận dụng tối đa sức mạnh của Next.js App Router để phục vụ cả giao diện người dùng (Public Facing) và hệ thống quản trị (Admin Dashboard) trên cùng một codebase nhưng tách biệt hoàn toàn về mặt logic bảo mật.

### Nguyên tắc cốt lõi:
*   **Security-First:** Bảo vệ dữ liệu ở mức Server Action, không dựa dẫm vào Client-side validation.
*   **Data-Driven UI:** Mọi thành phần từ Menu, Theme đến Bản đồ đều được cấu hình hóa trong Database.
*   **Performance:** Sử dụng Local Asset Localization để triệt tiêu phụ thuộc vào bên thứ ba (Unsplash/Pexels), đảm bảo 99.9% uptime hình ảnh.

---

## 2. Cấu trúc thư mục (Folder Structure)

```text
D:\TravelApp\
├── prisma/                 # Database Schema & Migration Layer
│   ├── schema.prisma       # Chứa định nghĩa Single Source of Truth của dữ liệu
│   └── seed.ts             # Master Data Restoration (Khôi phục toàn bộ hệ thống trong 1 lệnh)
├── public/                 # Tĩnh (Assets)
│   └── images/guides/      # Kho lưu trữ 80+ ảnh địa điểm đã được local hóa
├── scripts/                # Công cụ vận hành (DevOps Tools)
│   ├── final-harvest-80.mjs# Script thu thập dữ liệu tự động cho 80 điểm đến
│   └── final-pentest.mjs   # Công cụ kiểm tra tính toàn vẹn vật lý của tài nguyên
├── src/
│   ├── actions/            # Server Actions (Business Logic Layer)
│   │   ├── authActions.ts  # Xử lý phiên làm việc & phân quyền mức thấp
│   │   └── tourActions.ts  # Nghiệp vụ quản lý Tour với cơ chế chống Mass Assignment
│   ├── app/                # Routing & Page Components (Presentation Layer)
│   │   ├── (public)/       # Route Group cho khách hàng (SEO Optimized)
│   │   └── admin/          # Quản trị viên (Protected Route Group)
│   ├── components/         # Nguyên tử hóa UI (Atomic Design)
│   │   ├── public/Guides/  # Interactive Map Component (Leaflet Integration)
│   │   └── shared/         # Reusable components (Switcher, Popups)
│   ├── data/               # Mock & Master Data (Initial State)
│   ├── lib/                # Core Utilities (Auth, Prisma Client)
│   ├── services/           # Data Access Layer (Abstraction over Actions)
│   └── types/              # Type System (Contract Layer)
```

---

## 3. Các chức năng chính (Core Capabilities)

### 3.1. Cẩm Nang Du Lịch Tương Tác (Interactive Map Engine)
*   **Quy mô:** Hỗ trợ 80 điểm đến nổi tiếng (40 Việt Nam, 40 Nhật Bản).
*   **Công nghệ:** Tích hợp Leaflet với cơ chế `flyTo` mượt mà.
*   **Tính năng:**
    *   Đồng bộ cuộn (Sync-scroll) giữa Card và Map Marker.
    *   Hiệu ứng Pulse định vị điểm đến tức thì.
    *   Modal chi tiết tích hợp tải dữ liệu động từ Blog liên quan.
    *   Trang giới thiệu chi tiết Đất nước & Con người cho từng quốc gia.

### 3.2. Hệ thống Quản trị (Admin CMS)
*   **User Management:** Quản lý tài khoản Admin/Editor với mật khẩu băm PBKDF2.
*   **Content Management:** Soạn thảo Tour, Blog, Địa điểm du lịch.
*   **Site Configuration:** Thay đổi Logo, Hotline, Màu sắc chủ đạo (Theme) ngay trên giao diện mà không cần can thiệp code.

---

## 4. Thiết kế Bảo mật (Security Architecture)

Dự án áp dụng mô hình bảo mật **Zero-Trust** tại tầng máy chủ:
1.  **Authentication:** Sử dụng Signed JWT Token lưu trong HttpOnly Cookie. Chống tấn công XSS lấy cắp phiên làm việc.
2.  **Authorization:** Mọi Server Action đều được bọc bởi middleware `isAdmin()` hoặc `isEditor()`. Việc gọi Action từ Console sẽ bị chặn ngay lập tức.
3.  **Data Protection:**
    *   **Password Hashing:** PBKDF2 với Salt ngẫu nhiên (Crypto Node.js module).
    *   **Sensitive Field Masking:** Sử dụng Prisma `select` để loại bỏ trường mật khẩu khỏi các truy vấn API.
    *   **Mass Assignment Mitigation:** Áp dụng Explicit Mapping (gán dữ liệu tường minh), ngăn chặn việc chèn thêm trường trái phép vào DB.

---

## 5. Mô hình dữ liệu (ERD Highlights)
*   **CountryGuide:** Thực thể cha chứa thông tin giới thiệu đất nước & con người (introduction, cultureInfo).
*   **RegionMarker:** 80+ điểm đến gắn liền với tọa độ GPS, hình ảnh và loại marker (Spot/Airport).
*   **Tour & Blog:** Liên kết linh hoạt qua slug để hiển thị nội dung liên quan trong Popup.

---

## 6. Hướng dẫn Vận hành (Ops Guide)

### Khởi tạo môi trường nhanh:
```bash
# 1. Khởi động DB
npm run db:up

# 2. Cài đặt thư viện
npm install

# 3. Đồng bộ DB & Nạp 80 điểm đến
npx prisma migrate dev
npm run db:seed
```

---

## 7. Lộ trình phát triển (Roadmap)
1.  **Giai đoạn 2:** Tích hợp hệ thống thanh toán (VNPay/Stripe).
2.  **Giai đoạn 3:** Chuyển đổi Interactive Map sang dạng Vector Tile để hỗ trợ hàng ngàn Marker không lag.
3.  **Giai đoạn 4:** Ứng dụng AI để tự động sinh nội dung cẩm nang dựa trên địa điểm được chọn.

---
*Tài liệu này được soạn thảo để phục vụ mục đích bàn giao và bảo trì hệ thống bền vững.*
