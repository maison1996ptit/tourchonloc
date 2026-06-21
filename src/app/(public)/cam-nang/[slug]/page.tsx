import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import BlogDetailClient from './BlogDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const guide = await prisma.guide.findUnique({
    where: { slug },
    include: { seo: true }
  });

  if (!guide) {
    return {
      title: 'Bài viết không tìm thấy | Tour Chọn Lọc',
      description: 'Không tìm thấy nội dung bài viết cẩm nang du lịch được yêu cầu.'
    };
  }

  return {
    title: guide.seo?.title || `${guide.title} | Tour Chọn Lọc`,
    description: guide.seo?.description || guide.excerpt,
    keywords: guide.seo?.keywords ? guide.seo.keywords.split(',').map(k => k.trim()) : [],
    openGraph: {
      title: guide.seo?.ogTitle || guide.title,
      description: guide.seo?.ogDescription || guide.excerpt,
      images: guide.seo?.ogImage ? [{ url: guide.seo.ogImage }] : [{ url: guide.coverImage }],
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.seo?.twitterTitle || guide.seo?.title || guide.title,
      description: guide.seo?.twitterDescription || guide.seo?.description || guide.excerpt,
      images: guide.seo?.twitterImage ? [guide.seo.twitterImage] : [guide.coverImage]
    }
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  
  const guide = await prisma.guide.findUnique({
    where: { slug },
    include: { 
      category: true, 
      tags: true, 
      seo: true, 
      blocks: { orderBy: { order: 'asc' } },
      relatedTours: {
        include: {
          tour: true
        }
      },
      faqs: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!guide) {
    return <BlogDetailClient initialBlog={null} relatedBlogs={[]} />;
  }

  const blogData = {
    id: guide.id,
    title: guide.title,
    slug: guide.slug,
    categoryId: guide.categoryId || 'cam-nang',
    category: guide.category?.name || 'Cẩm nang du lịch',
    author: 'Chuyên gia Tour Chọn Lọc',
    thumbnail: guide.coverImage,
    excerpt: guide.excerpt,
    content: '',
    seoTitle: guide.seo?.title || guide.title,
    seoDescription: guide.seo?.description || guide.excerpt,
    tags: guide.tags.map(t => t.name),
    publishedDate: (guide.publishedAt || guide.createdAt).toISOString(),
    status: guide.status,
    createdAt: guide.createdAt.toISOString(),
    updatedAt: guide.updatedAt.toISOString(),
    isGuide: true,
    blocks: guide.blocks,
    seoData: guide.seo,
    relatedTours: guide.relatedTours,
    faqs: guide.faqs,
    country: guide.country,
    city: guide.city
  };

  // Fetch related guides
  const relatedGuides = await prisma.guide.findMany({
    where: { 
      status: 'Published', 
      id: { not: guide.id } 
    },
    include: { 
      category: true 
    },
    take: 3,
    orderBy: {
      publishedAt: 'desc'
    }
  });

  const relatedBlogs = relatedGuides.map(g => ({
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
    updatedAt: g.updatedAt.toISOString()
  }));

  // Query published tours for contextual popup in the details view
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

  return <BlogDetailClient initialBlog={blogData} relatedBlogs={relatedBlogs as any[]} allTours={activeTours as any[]} />;
}
