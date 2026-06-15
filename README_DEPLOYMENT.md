# HƯỚNG DẪN TRIỂN KHAI DỰ ÁN TRAVELAPP LÊN UBUNTU VỚI DOCKER

Tài liệu này cung cấp hướng dẫn từng bước để triển khai ứng dụng Next.js TravelApp lên máy chủ chạy hệ điều hành Ubuntu bằng Docker và Docker Compose, kết hợp với Nginx làm Reverse Proxy và SSL Certbot để kích hoạt HTTPS miễn phí.

---

## MỤC LỤC
0. [Triển khai nhanh bằng Script Tự Động (Khuyên dùng)](#triển-khai-nhanh-bằng-script-tự-động-khuyên-dùng)
1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Cài đặt Docker & Docker Compose trên Ubuntu](#2-cài-đặt-docker--docker-compose-trên-ubuntu)
3. [Chuẩn bị mã nguồn và Biến môi trường](#3-chuẩn-bị-mã-nguồn-và-biến-môi-trường)
4. [Tìm hiểu cấu hình Docker trong dự án](#4-tìm-hiểu-cấu-hình-docker-trong-dự-án)
5. [Khởi chạy dự án với Docker Compose](#5-khởi-chạy-dự-án-với-docker-compose)
6. [Cấu hình Nginx và SSL (HTTPS)](#6-cấu-hình-nginx-và-ssl-https)
7. [Bảo trì và Cập nhật ứng dụng](#7-bảo-trì-và-cập-nhật-ứng-dụng)

---

## TRIỂN KHAI NHANH BẰNG SCRIPT TỰ ĐỘNG (KHUYÊN DÙNG)

Dự án đã tích hợp sẵn script tự động hóa toàn bộ quá trình cài đặt và cấu hình: [deploy.sh](file:///D:/TravelApp/deploy.sh). Bạn chỉ cần mở terminal trên server Ubuntu, di chuyển vào thư mục dự án và chạy:

```bash
# Cấp quyền thực thi cho script
chmod +x deploy.sh

# Chạy script tự động với quyền root
sudo ./deploy.sh
```

Script sẽ thực thi tuần tự các công việc và hiển thị thông báo tiến trình rõ ràng cho bạn.

---


## 1. Yêu cầu hệ thống
*   **Hệ điều hành:** Ubuntu Server 20.04 LTS / 22.04 LTS / 24.04 LTS.
*   **Phần cứng tối thiểu:** 1 vCPU, 1 GB RAM, 15 GB SSD.
*   **Tên miền (Domain name):** Đã trỏ bản ghi A về địa chỉ IP Public của máy chủ Ubuntu (ví dụ: `travelapp.yourdomain.com`).

---

## 2. Cài đặt Docker & Docker Compose trên Ubuntu

Chạy các lệnh sau trên terminal của server Ubuntu để cài đặt Docker Engine mới nhất:

```bash
# 1. Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# 2. Cài đặt các gói cần thiết
sudo apt install -y ca-certificates curl gnupg lsb-release

# 3. Thêm khóa GPG chính thức của Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 4. Thiết lập repository của Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Cài đặt Docker Engine và Docker Compose plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. Kiểm tra cài đặt
docker --version
docker compose version
```

---

## 3. Chuẩn bị mã nguồn và Biến môi trường

### 3.1. Clone mã nguồn
Clone dự án từ Git repository của bạn vào thư mục `/var/www/travelapp` trên server:

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone <URL_REPOSITORY_CỦA_BẠN> travelapp
cd travelapp
```

### 3.2. Cấu hình file `.env`
Sao chép file cấu hình mẫu `.env.example` và chỉnh sửa:

```bash
cp .env.example .env
nano .env
```

Thiết lập các biến môi trường chính xác cho môi trường sản xuất (Production):

```env
# ĐỊA CHỈ KẾT NỐI DATABASE
# Lưu ý: Trong mạng nội bộ của Docker, chúng ta dùng host "db" thay vì "localhost"
DATABASE_URL="postgresql://admin:YOUR_SECURE_PASSWORD@db:5432/travelapp?schema=public"

# AUTH SECRET (Khóa bảo mật phiên đăng nhập, tối thiểu 32 ký tự ngẫu nhiên)
AUTH_SECRET="khởi_tạo_mỗi_chuỗi_ký_tự_ngẫu_nhiên_ở_đây"

# GEMINI AI API KEY (Bắt buộc cho các tính năng hỗ trợ AI)
GEMINI_API_KEY="AIzaSy..."

# CẤU HÌNH GỬI EMAIL SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="maisonptit@gmail.com"
SMTP_PASS="mật_khẩu_ứng_dụng_gmail"
SMTP_FROM="maisonptit@gmail.com"
ADMIN_EMAIL="fit.saletourchonloc@gmail.com"

# BIẾN CẤU HÌNH DOCKER COMPOSE (Phải khớp với DATABASE_URL bên trên)
DB_USER=admin
DB_PASSWORD=YOUR_SECURE_PASSWORD
DB_NAME=travelapp
```

> [!WARNING]
> Tuyệt đối không để mật khẩu mặc định `password123` ở môi trường production để tránh rủi ro bảo mật dữ liệu.

---

## 4. Tìm hiểu cấu hình Docker trong dự án

Dự án đã được tích hợp sẵn 2 file cấu hình cốt lõi:

1.  **[Dockerfile](file:///D:/TravelApp/Dockerfile):** Sử dụng cơ chế xây dựng tối ưu (`node:20-alpine`) để cài đặt các package, sinh mã nguồn Prisma Client thông qua `npx prisma generate`, tiến hành build mã nguồn Next.js ở chế độ tối ưu nhất và tự động thực thi quá trình cập nhật database schema (`prisma migrate deploy`) trước khi khởi chạy ứng dụng web.
2.  **[docker-compose.prod.yml](file:///D:/TravelApp/docker-compose.prod.yml):** Định nghĩa hai container chạy song song:
    *   `db`: Container chạy cơ sở dữ liệu **PostgreSQL 16**. Có cấu hình kiểm tra sức khỏe (`healthcheck`) nhằm bảo đảm cơ sở dữ liệu đã sẵn sàng nhận kết nối trước khi khởi động ứng dụng web. Dữ liệu của DB được ghi đè lưu trữ liên tục (persistent) tại volume `postgres_data_prod`.
    *   `web`: Container chạy ứng dụng **Next.js**. Được cấu hình lắng nghe tại cổng `3000` và sử dụng các biến môi trường cấu hình tại file `.env`.

---

## 5. Khởi chạy dự án với Docker Compose

### 5.1. Build & Chạy container
Từ thư mục dự án `/var/www/travelapp`, khởi chạy toàn bộ dịch vụ:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Lệnh trên sẽ:
*   Tải image PostgreSQL 16 và khởi tạo container dữ liệu.
*   Chạy quy trình build Dockerfile cho container Next.js.
*   Tự động chạy `npx prisma migrate deploy` để khởi tạo các bảng trong PostgreSQL.
*   Khởi chạy server ứng dụng Next.js trên cổng `3000`.

### 5.2. Nạp dữ liệu mẫu (Seeding)
Sau khi container web đã được khởi chạy thành công, chạy lệnh sau **chỉ một lần duy nhất** để nạp dữ liệu mẫu ban đầu (danh sách Tour, Blog, Cài đặt giao diện, tài khoản Admin):

```bash
docker compose -f docker-compose.prod.yml exec web npx prisma db seed
```

> [!IMPORTANT]
> Tài khoản quản trị mặc định sau khi seed:
> *   **Email:** `ngocha@gmail.com`
> *   **Mật khẩu:** `29022000@`

### 5.3. Kiểm tra logs hoạt động
Để kiểm tra xem hệ thống hoạt động ổn định hay có lỗi phát sinh hay không, hãy chạy lệnh xem logs:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

---

## 6. Cấu hình Nginx và SSL (HTTPS)

Để người dùng có thể truy cập thông qua Domain Name dạng HTTPS, chúng ta cấu hình Nginx làm cổng trung gian điều hướng (Reverse Proxy).

### 6.1. Cài đặt Nginx và Certbot
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 6.2. Cấu hình Server Block trong Nginx
Tạo một file cấu hình Nginx mới cho ứng dụng:

```bash
sudo nano /etc/nginx/sites-available/travelapp
```

Dán nội dung cấu hình sau (thay đổi `travelapp.yourdomain.com` thành domain thật của bạn):

```nginx
server {
    listen 80;
    server_name travelapp.yourdomain.com;

    # Cấu hình giới hạn kích thước upload (khớp với bodySizeLimit của Next.js: 10MB)
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Kích hoạt cấu hình mới và khởi động lại Nginx:

```bash
# Tạo liên kết symbolic link đến thư mục sites-enabled
sudo ln -s /etc/nginx/sites-available/travelapp /etc/nginx/sites-enabled/

# Kiểm tra cú pháp cấu hình Nginx
sudo nginx -t

# Khởi động lại dịch vụ Nginx
sudo systemctl restart nginx
```

### 6.3. Cài đặt chứng chỉ SSL tự động (Let's Encrypt)
Chạy Certbot để tự động lấy và cài đặt cấu hình SSL/HTTPS cho domain của bạn:

```bash
sudo certbot --nginx -d travelapp.yourdomain.com
```

Nhập email của bạn và chọn `Y` khi được hỏi. Certbot sẽ tự động cấu hình lại file Nginx để redirect toàn bộ lưu lượng HTTP sang HTTPS.

---

## 7. Bảo trì và Cập nhật ứng dụng

### 7.1. Cập nhật mã nguồn mới
Khi có sự thay đổi về mã nguồn trên Git, chạy chuỗi lệnh sau để cập nhật ứng dụng:

```bash
cd /var/www/travelapp

# 1. Kéo code mới về
git pull

# 2. Build lại container mới và restart dịch vụ mà không gây downtime lớn
docker compose -f docker-compose.prod.yml up -d --build
```
*Lưu ý: Quá trình build sẽ tự động áp dụng các migration mới của Prisma (nếu có).*

### 7.2. Các câu lệnh quản lý Docker thường gặp

*   **Dừng hệ thống:**
    ```bash
    docker compose -f docker-compose.prod.yml down
    ```
*   **Dừng hệ thống và XÓA TOÀN BỘ dữ liệu DB (Cẩn trọng!):**
    ```bash
    docker compose -f docker-compose.prod.yml down -v
    ```
*   **Kiểm tra trạng thái các container:**
    ```bash
    docker compose -f docker-compose.prod.yml ps
    ```
*   **Truy cập vào shell của container web:**
    ```bash
    docker compose -f docker-compose.prod.yml exec web sh
    ```
