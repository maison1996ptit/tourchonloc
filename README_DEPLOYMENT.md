# HƯỚNG DẪN TRIỂN KHAI DỰ ÁN TRAVELAPP LÊN UBUNTU

Tài liệu này cung cấp hướng dẫn triển khai ứng dụng Next.js TravelApp lên máy chủ chạy hệ điều hành Ubuntu. Theo yêu cầu giữ nguyên cấu hình, ứng dụng sẽ chạy theo mô hình:
1. **Cơ sở dữ liệu (PostgreSQL):** Chạy trong Docker container bằng tệp [docker-compose.yml](file:///D:/TravelApp/docker-compose.yml) gốc của dự án.
2. **Ứng dụng Next.js:** Chạy trực tiếp trên Host Ubuntu bằng Node.js và quản lý quy trình chạy ngầm bằng **PM2**.

---

## MỤC LỤC
1. [Triển khai nhanh bằng Script Tự Động (Khuyên dùng)](#triển-khai-nhanh-bằng-script-tự-động-khuyên-dùng)
2. [Các bước chuẩn bị thủ công](#2-các-bước-chuẩn-bị-thủ-công)
3. [Cấu hình Nginx và SSL (HTTPS)](#3-cấu-hình-nginx-và-ssl-https)
4. [Bảo trì và Cập nhật ứng dụng](#4-bảo-trì-và-cập-nhật-ứng-dụng)

---

## TRIỂN KHAI NHANH BẰNG SCRIPT TỰ ĐỘNG (KHUYÊN DÙNG)

Để thuận tiện nhất, dự án tích hợp sẵn script tự động hóa toàn bộ quá trình dựng Database, cấu hình di cư và chạy ứng dụng: [deploy.sh](file:///D:/TravelApp/deploy.sh).

Chỉ cần chạy lệnh sau trên server Ubuntu:

```bash
# 1. Cấp quyền thực thi cho file script
chmod +x deploy.sh

# 2. Xóa bỏ định dạng xuống dòng của Windows (CRLF -> LF)
sed -i 's/\r$//' deploy.sh

# 3. Khởi chạy script tự động với quyền root
sudo ./deploy.sh
```

**Các việc script tự động thực hiện:**
* Khởi chạy Postgres container từ tệp `docker-compose.yml`.
* Đợi Postgres khởi động và sẵn sàng nhận kết nối.
* Cài đặt các gói npm trên Host (`npm install`).
* Dựng cấu hình cơ sở dữ liệu (`npx prisma migrate deploy`).
* Nạp dữ liệu mẫu ban đầu (`npx prisma db seed`).
* Thực hiện biên dịch ứng dụng (`npm run build`).
* Cài đặt PM2 (nếu chưa có) và khởi chạy ứng dụng chạy ngầm trên cổng 3000.

---

## 2. Các bước chuẩn bị thủ công

Nếu bạn không muốn chạy script tự động, đây là các bước thủ công tương đương:

### Bước 2.1: Cấu hình biến môi trường
Tạo tệp `.env` tại thư mục gốc của dự án trên server Ubuntu. Ví dụ:

```env
DATABASE_URL="postgresql://admin:password123@localhost:5432/travelapp?schema=public"
AUTH_SECRET="your-super-secret-key-at-least-32-chars-long"
GEMINI_API_KEY="AIzaSy..."

SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password-here"
SMTP_FROM="your-email@gmail.com"
ADMIN_EMAIL="fit.saletourchonloc@gmail.com"
```

### Bước 2.2: Khởi chạy PostgreSQL trong Docker
Khởi chạy container cơ sở dữ liệu:
```bash
docker compose up -d db
```

### Bước 2.3: Dựng Database & Seed Dữ liệu
Cài đặt package và chạy lệnh migrate của Prisma để dựng bảng, sau đó nạp dữ liệu mẫu:
```bash
npm install
npx prisma migrate deploy
npx prisma db seed
```

### Bước 2.4: Biên dịch và chạy ứng dụng Next.js
Biên dịch ứng dụng và khởi chạy ứng dụng bằng PM2:
```bash
npm run build
npm install -g pm2
pm2 start npm --name "travelapp" -- start
```

---

## 3. Cấu hình Nginx và SSL (HTTPS)

Để người dùng có thể truy cập thông qua Domain Name dạng HTTPS, chúng ta cấu hình Nginx làm cổng trung gian điều hướng (Reverse Proxy).

### 3.1. Cài đặt Nginx và Certbot
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 3.2. Cấu hình Server Block trong Nginx
Tạo một file cấu hình Nginx mới cho ứng dụng:

```bash
sudo nano /etc/nginx/sites-available/travelapp
```

Dán nội dung cấu hình sau (thay đổi `travelapp.yourdomain.com` thành domain thật của bạn):

```nginx
server {
    listen 80;
    server_name travelapp.yourdomain.com;

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

### 3.3. Cài đặt chứng chỉ SSL tự động (Let's Encrypt)
Chạy Certbot để tự động cấu hình SSL/HTTPS cho domain của bạn:

```bash
sudo certbot --nginx -d travelapp.yourdomain.com
```

---

## 4. Bảo trì và Cập nhật ứng dụng

Khi có sự thay đổi về mã nguồn trên Git, chạy chuỗi lệnh sau để cập nhật ứng dụng:

```bash
cd /var/www/travelapp
git pull
npm install
npx prisma migrate deploy
npm run build
pm2 restart travelapp
```
