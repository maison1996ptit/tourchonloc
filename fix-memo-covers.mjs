import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Đang kiểm tra và sửa đổi các đường dẫn ảnh bìa memo bị thiếu trong database...');

  try {
    // 1. Update Blog Table
    const blogs = await prisma.blog.findMany();
    let updatedBlogsCount = 0;
    for (const blog of blogs) {
      let updatedCover = blog.coverImage;
      let updatedThumbnail = blog.thumbnail;
      
      if (blog.coverImage && blog.coverImage.startsWith('/images/memos/')) {
        updatedCover = '/images/about-bg.jpg';
      }
      if (blog.thumbnail && blog.thumbnail.startsWith('/images/memos/')) {
        updatedThumbnail = '/images/guides/v1.jpg';
      }
      
      if (updatedCover !== blog.coverImage || updatedThumbnail !== blog.thumbnail) {
        await prisma.blog.update({
          where: { id: blog.id },
          data: {
            coverImage: updatedCover,
            thumbnail: updatedThumbnail
          }
        });
        updatedBlogsCount++;
      }
    }
    console.log(`- Đã cập nhật ${updatedBlogsCount} blogs.`);

    // 2. Update Guide Table
    const guides = await prisma.guide.findMany();
    let updatedGuidesCount = 0;
    for (const guide of guides) {
      let updatedCover = guide.coverImage;
      let updatedThumbnail = guide.thumbnail;
      
      if (guide.coverImage && guide.coverImage.startsWith('/images/memos/')) {
        updatedCover = '/images/about-bg.jpg';
      }
      if (guide.thumbnail && guide.thumbnail.startsWith('/images/memos/')) {
        updatedThumbnail = '/images/guides/v1.jpg';
      }
      
      if (updatedCover !== guide.coverImage || updatedThumbnail !== guide.thumbnail) {
        await prisma.guide.update({
          where: { id: guide.id },
          data: {
            coverImage: updatedCover,
            thumbnail: updatedThumbnail
          }
        });
        updatedGuidesCount++;
      }
    }
    console.log(`- Đã cập nhật ${updatedGuidesCount} guides.`);

    // 3. Update SiteSettings if any reference exists
    const settings = await prisma.siteSettings.findFirst();
    if (settings && settings.heroImage.startsWith('/images/memos/')) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          heroImage: '/images/about-bg.jpg'
        }
      });
      console.log('- Đã cập nhật Site Settings heroImage.');
    }

    console.log('✅ THÀNH CÔNG! Đã loại bỏ tất cả các đường dẫn ảnh memo 404.');
  } catch (error) {
    console.error('❌ LỖI trong quá trình cập nhật:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
