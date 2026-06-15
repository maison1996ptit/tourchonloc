#!/bin/bash

# Thiết lập dừng script nếu có lỗi xảy ra
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN}   BẮT ĐẦU TỰ ĐỘNG DỰNG DATABASE VÀ TRIỂN KHAI ỨNG DỤNG           ${NC}"
echo -e "${GREEN}==================================================================${NC}"

# Kiểm tra file .env
if [ ! -f .env ]; then
    echo -e "${RED}[LỖI] Không tìm thấy file .env trong thư mục dự án trên máy chủ!${NC}"
    echo -e "Vì lý do bảo mật, file .env (chứa các API Key và cấu hình cơ sở dữ liệu) bị chặn bởi Git và không thể tự động đồng bộ."
    echo -e "Vui lòng tạo file .env bằng cách chạy lệnh sau và điền thông tin:"
    echo -e "nano .env"
    exit 1
fi

# 1. Khởi chạy Database Docker Container từ docker-compose.yml gốc
echo -e "\n${YELLOW}[1/6] Khởi chạy Database trong Docker...${NC}"
if ! [ -x "$(command -v docker)" ]; then
    echo -e "${RED}[LỖI] Docker chưa được cài đặt trên hệ thống! Vui lòng cài đặt Docker trước.${NC}"
    exit 1
fi

# Khởi chạy Postgres container
docker compose up -d db

# 2. Đợi cơ sở dữ liệu Postgres khởi động hoàn tất
echo -e "\n${YELLOW}[2/6] Đợi cơ sở dữ liệu sẵn sàng nhận kết nối...${NC}"
for i in {1..30}; do
    if docker compose exec db pg_isready -U admin -d travelapp >/dev/null 2>&1; then
        echo -e "${GREEN}[OK] Cơ sở dữ liệu PostgreSQL đã sẵn sàng!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}[LỖI] Quá thời gian chờ cơ sở dữ liệu khởi động!${NC}"
        exit 1
    fi
    echo -e "Đang chờ cơ sở dữ liệu khởi động... ($i/30)"
    sleep 2
done

# 3. Cài đặt các gói phụ thuộc trên Host
echo -e "\n${YELLOW}[3/6] Cài đặt dependencies dự án trên Host...${NC}"
if ! [ -x "$(command -v node)" ]; then
    echo -e "${RED}[LỖI] Node.js chưa được cài đặt trên server! Vui lòng cài đặt Node.js (phiên bản >= 18).${NC}"
    exit 1
fi
npm install

# 4. Tự động dựng cơ sở dữ liệu (Database Migrations)
echo -e "\n${YELLOW}[4/6] Tự động cập nhật cấu hình bảng (Prisma Migration)...${NC}"
npx prisma migrate deploy

# 5. Tự động nạp dữ liệu mẫu (Database Seeding)
echo -e "\n${YELLOW}[5/6] Tự động nạp dữ liệu mẫu ban đầu (Prisma Seed)...${NC}"
npx prisma db seed
echo -e "${GREEN}[OK] Đã dựng và nạp dữ liệu mẫu database thành công!${NC}"

# 6. Build và chạy ứng dụng Next.js trên Host bằng PM2
echo -e "\n${YELLOW}[6/6] Build và chạy ứng dụng Next.js...${NC}"
# Chạy build Next.js (bây giờ sẽ hoạt động bình thường vì DB đã chạy và có dữ liệu)
npm run build

# Kiểm tra và cài đặt PM2 để quản lý ứng dụng chạy ngầm
if ! [ -x "$(command -v pm2)" ]; then
    echo -e "${YELLOW}Đang cài đặt PM2 để quản lý ứng dụng chạy ngầm...${NC}"
    sudo npm install -g pm2
fi

# Khởi chạy/Khởi động lại ứng dụng trên PM2
echo -e "Khởi động ứng dụng trên PM2..."
pm2 restart travelapp || pm2 start npm --name "travelapp" -- start

echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN}   DỰNG DATABASE VÀ KHỞI CHẠY ỨNG DỤNG THÀNH CÔNG!                ${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo -e "Website đang chạy tại cổng 3000 (truy cập qua http://localhost:3000)"
echo -e "Quản lý ứng dụng Next.js bằng lệnh: pm2 status hoặc pm2 logs travelapp"
echo -e "Quản lý database Docker bằng lệnh: docker compose ps"
echo -e "Tài khoản Admin: ngocha@gmail.com / 29022000@"
echo -e "${GREEN}==================================================================${NC}"
