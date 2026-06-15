import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Kiểm tra trạng thái cơ sở dữ liệu ---');
  try {
    // Đếm số lượng user trong database
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('Database chưa có dữ liệu. Bắt đầu chảy seed dữ liệu mẫu...');
      execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
      console.log('Seed dữ liệu mẫu hoàn tất.');
    } else {
      console.log(`Database đã có ${userCount} người dùng. Bỏ qua bước seed dữ liệu mẫu để bảo vệ dữ liệu hiện tại.`);
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra hoặc seed database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
