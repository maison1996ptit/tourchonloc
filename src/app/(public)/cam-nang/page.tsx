import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import CamNangPageClient from './CamNangPageClient';

export const metadata: Metadata = {
  title: 'Tin Tức & Cẩm Nang Du Lịch Mới Nhất | Tour Chọn Lọc',
  description: 'Cập nhật tin tức du lịch, cẩm nang chia sẻ kinh nghiệm đi tour, thông tin khuyến mãi và các bài viết PR báo chí mới nhất từ Tour Chọn Lọc.',
  keywords: ['tin tức du lịch', 'cẩm nang du lịch', 'kinh nghiệm du lịch', 'khuyến mãi du lịch', 'bài báo du lịch'],
  openGraph: {
    title: 'Tin Tức & Cẩm Nang Du Lịch | Tour Chọn Lọc',
    description: 'Cập nhật tin tức du lịch mới nhất, kinh nghiệm đi tour và cẩm nang từ chuyên gia.',
    url: 'https://tourchonloc.com/cam-nang',
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

function estimateReadingTime(blocks: any[]) {
  if (!blocks || blocks.length === 0) return 3;
  let wordCount = 0;
  blocks.forEach(block => {
    if (block.type === 'Text') {
      const text = (block.content as any)?.text || '';
      wordCount += text.trim().split(/\s+/).length || 0;
    }
  });
  // Average reading speed: 200 words per minute
  return Math.max(1, Math.ceil(wordCount / 200));
}

export default async function BlogsPage() {
  // Fetch all guides from database (which now includes all migrated blogs and memos)
  const allGuides = await prisma.guide.findMany({
    where: { status: 'Published' },
    include: { 
      category: true,
      tags: true,
      blocks: true,
      relatedTours: true
    },
    orderBy: {
      publishedAt: 'desc'
    }
  });

  // Fetch all published tours for the contextual promo popup
  const activeTours = await prisma.tour.findMany({
    where: { status: 'Published' },
    select: {
      id: true,
      title: true,
      slug: true,
      destination: true,
      priceFrom: true,
      durationDays: true,
      durationNights: true,
      featuredImage: true,
      departureDates: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const mappedGuides = allGuides.map(g => {
    const readTime = estimateReadingTime(g.blocks);
    const hasTours = g.relatedTours && g.relatedTours.length > 0;
    
    return {
      id: g.id,
      title: g.title,
      slug: g.slug,
      categoryId: g.categoryId || 'cam-nang',
      category: g.category?.name || 'Cẩm nang du lịch',
      author: 'Chuyên gia Tour Chọn Lọc',
      thumbnail: g.coverImage,
      excerpt: g.excerpt,
      content: '', // not needed for list preview
      seoTitle: g.title,
      seoDescription: g.excerpt,
      tags: g.tags.map(t => t.name),
      publishedDate: (g.publishedAt || g.createdAt).toISOString(),
      status: 'Published' as const,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
      isGuide: true,
      views: g.views,
      country: g.country || '',
      city: g.city || '',
      readTime,
      hasTours
    };
  });

  return <CamNangPageClient initialBlogs={mappedGuides as any[]} initialTours={activeTours as any[]} />;
}
