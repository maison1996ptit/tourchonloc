import { Metadata } from 'next';
import { blogService } from '@/services/blogService';
import { prisma } from '@/lib/prisma';
import CamNangPageClient from './CamNangPageClient';

export const metadata: Metadata = {
  title: 'Tin Tức & Cẩm Nang Du Lịch Mới Nhất | Tour Chọn Lọc',
  description: 'Cập nhật tin tức du lịch, cẩm nang chia sẻ kinh nghiệm đi tour, thông tin khuyến mãi và các bài viết PR báo chí mới nhất từ Tour Chọn Lọc.',
  keywords: ['tin tức du lịch', 'cẩm nang du lịch', 'kinh nghiệm du lịch', 'khuyến mãi du lịch', 'bài báo du lịch'],
  openGraph: {
    title: 'Tin Tức & Cẩm Nang Du Lịch | Tour Chọn Lọc',
    description: 'Cập nhật tin tức du lịch mới nhất, kinh nghiệm đi tour và cẩm nang từ chuyên gia.',
    url: 'https://travelapp.com/cam-nang',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 600,
        height: 600,
        alt: 'Tour Chọn Lọc Logo'
      }
    ]
  }
};

export default async function BlogsPage() {
  // Fetch all blogs from database
  const allBlogs = await blogService.getBlogs();
  const publishedBlogs = allBlogs.filter(b => b.status === 'Published');

  // Fetch all guides from database
  const allGuides = await prisma.guide.findMany({
    where: { status: 'Published' },
    include: { category: true }
  });

  const mappedGuides = allGuides.map(g => ({
    id: g.id,
    title: g.title,
    slug: g.slug,
    categoryId: g.categoryId || 'cam-nang',
    category: g.category?.name || 'Cẩm nang du lịch',
    author: 'Chuyên gia Tour Chọn Lọc',
    thumbnail: g.coverImage,
    excerpt: g.excerpt,
    content: '',
    seoTitle: g.title,
    seoDescription: g.excerpt,
    tags: [],
    publishedDate: (g.publishedAt || g.createdAt).toISOString(),
    status: 'Published' as const,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
    isMemo: true // Trigger magazine storytelling renderer style
  }));

  // Combine and sort by date descending
  const combined = [...publishedBlogs, ...mappedGuides].sort(
    (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  );

  return <CamNangPageClient initialBlogs={combined} />;
}
