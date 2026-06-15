#!/bin/bash

# Thiết lập chế độ dừng script nếu có lỗi xảy ra
set -e

# Khai báo bảng màu để hiển thị giao diện console đẹp mắt
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN}   BẮT ĐẦU TỰ ĐỘNG TRIỂN KHAI TRAVELAPP LÊN UBUNTU VỚI DOCKER       ${NC}"
echo -e "${GREEN}==================================================================${NC}"

# 1. Kiểm tra quyền Root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[LỖI] Vui lòng chạy script này với quyền root hoặc sử dụng sudo!${NC}"
  echo -e "Ví dụ: sudo ./deploy.sh"
  exit 1
fi

# 2. Cài đặt Docker & Docker Compose nếu chưa có
echo -e "\n${YELLOW}[1/5] Kiểm tra môi trường Docker...${NC}"
if ! [ -x "$(command -v docker)" ]; then
    echo -e "${YELLOW}Docker chưa được cài đặt. Tiến hành cài đặt Docker...${NC}"
    apt-get update
    apt-get install -y ca-certificates curl gnupg lsb-release
    
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null
      
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    echo -e "${GREEN}[OK] Cài đặt Docker thành công.${NC}"
else
    echo -e "${GREEN}[OK] Docker đã được cài đặt: $(docker --version)${NC}"
fi

# 3. Khởi tạo file cấu hình môi trường .env
echo -e "\n${YELLOW}[2/5] Kiểm tra cấu hình file .env...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}Không tìm thấy file .env. Tự động tạo file .env mới từ file .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        # Tạo ngẫu nhiên một chuỗi AUTH_SECRET an toàn
        RANDOM_SECRET=$(openssl rand -base64 32 | tr -d '\n')
        sed -i "s|your-super-secret-key-at-least-32-chars-long|$RANDOM_SECRET|g" .env
        echo -e "${GREEN}[OK] Đã tạo file .env thành công với AUTH_SECRET ngẫu nhiên.${NC}"
    else
        echo -e "${RED}[LỖI] Không tìm thấy file .env.example để tạo .env!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}[OK] File .env đã tồn tại.${NC}"
fi

# Yêu cầu cập nhật các API Key nếu là mật khẩu mặc định
echo -e "${YELLOW}------------------------------------------------------------${NC}"
echo -e "Hãy kiểm tra và cập nhật file .env (đặc biệt là GEMINI_API_KEY)."
echo -e "Nếu bạn muốn chỉnh sửa thủ công, hãy mở một cửa sổ terminal khác."
echo -e "${YELLOW}------------------------------------------------------------${NC}"
read -p "Ấn [ENTER] để tiếp tục quá trình xây dựng Docker..."

# 4. Build và khởi chạy Docker Compose
echo -e "\n${YELLOW}[3/5] Build và khởi chạy Docker Container...${NC}"
docker compose -f docker-compose.prod.yml down --remove-orphans || true
docker compose -f docker-compose.prod.yml up -d --build

# 5. Đợi ứng dụng khởi chạy (tự động chạy Migration & Seed bên trong Container)
echo -e "\n${YELLOW}[4/5] Đợi cơ sở dữ liệu và ứng dụng khởi chạy...${NC}"
for i in {1..20}; do
    if docker compose -f docker-compose.prod.yml exec db pg_isready -U admin -d travelapp >/dev/null 2>&1; then
        echo -e "${GREEN}[OK] Cơ sở dữ liệu và ứng dụng Next.js đang khởi động và chạy di cư dữ liệu tự động...${NC}"
        break
    fi
    if [ $i -eq 20 ]; then
        echo -e "${RED}[LỖI] Quá thời gian chờ cơ sở dữ liệu khởi động!${NC}"
        exit 1
    fi
    echo -e "Đang chờ cơ sở dữ liệu sẵn sàng... ($i/20)"
    sleep 2
done

# Đợi thêm vài giây để Prisma chạy xong check-and-seed
sleep 5
echo -e "${GREEN}[OK] Quá trình tự động dựng database & nạp dữ liệu mẫu đang diễn ra trong container.${NC}"

# 6. Hỏi người dùng có muốn cài đặt Nginx Reverse Proxy và SSL không
echo -e "\n${YELLOW}[5/5] Cấu hình Nginx Reverse Proxy & SSL HTTPS...${NC}"
read -p "Bạn có muốn cài đặt và cấu hình tự động Nginx + SSL HTTPS Let's Encrypt không? (y/n): " confirm_nginx

if [[ "$confirm_nginx" =~ ^[Yy]$ ]]; then
    # Yêu cầu nhập domain
    read -p "Nhập tên miền của bạn (ví dụ: travelapp.yourdomain.com): " domain_name
    
    if [ -z "$domain_name" ]; then
        echo -e "${RED}Tên miền không hợp lệ. Bỏ qua cấu hình Nginx...${NC}"
    else
        echo -e "Đang cài đặt Nginx và Certbot..."
        apt-get update
        apt-get install -y nginx certbot python3-certbot-nginx
        
        echo -e "Tạo cấu hình server block Nginx cho domain: $domain_name..."
        cat > /etc/nginx/sites-available/travelapp <<EOF
server {
    listen 80;
    server_name $domain_name;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

        # Kích hoạt site mới
        ln -sf /etc/nginx/sites-available/travelapp /etc/nginx/sites-enabled/
        # Xóa cấu hình mặc định nếu có xung đột trùng port 80
        rm -f /etc/nginx/sites-enabled/default || true
        
        # Test nginx và restart
        nginx -t
        systemctl restart nginx
        
        echo -e "Bắt đầu đăng ký chứng chỉ SSL cho domain $domain_name..."
        certbot --nginx -d "$domain_name" --non-interactive --agree-tos --register-unsafely-without-email || true
        
        echo -e "${GREEN}[OK] Đã hoàn thành thiết lập Nginx & SSL HTTPS cho $domain_name!${NC}"
    fi
else
    echo -e "${YELLOW}Bỏ qua bước thiết lập Nginx & SSL. Bạn có thể truy cập dự án trực tiếp thông qua cổng 3000.${NC}"
fi

echo -e "\n${GREEN}==================================================================${NC}"
echo -e "${GREEN}   HOÀN TẤT TRIỂN KHAI TRAVELAPP THÀNH CÔNG!                     ${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo -e "Truy cập Website: http://localhost:3000 hoặc HTTPS tên miền của bạn."
echo -e "Đăng nhập trang quản trị Admin: /admin/login"
echo -e "Tài khoản Admin: ngocha@gmail.com / 29022000@"
echo -e "${GREEN}==================================================================${NC}"
