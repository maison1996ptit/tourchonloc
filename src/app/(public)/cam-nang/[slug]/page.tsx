import { Metadata } from 'next';
import { blogService } from '@/services/blogService';
import { prisma } from '@/lib/prisma';
import { Blog } from '@/types/blog';
import BlogDetailClient from './BlogDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // 1. Try to fetch Guide
  const guide = await prisma.guide.findUnique({
    where: { slug },
    include: { seo: true }
  });

  if (guide) {
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

  // 2. Fallback to standard Blog
  const blog = await blogService.getBlogBySlug(slug);
  if (!blog) {
    return {
      title: 'Bài viết không tìm thấy | Tour Chọn Lọc',
      description: 'Không tìm thấy nội dung bài viết cẩm nang du lịch được yêu cầu.'
    };
  }

  return {
    title: blog.seoTitle || `${blog.title} | Tour Chọn Lọc`,
    description: blog.seoDescription || blog.excerpt,
      openGraph: {
        title: blog.seoTitle || blog.title,
        description: blog.seoDescription || blog.excerpt,
        type: 'article',
        images: [
          {
            url: blog.thumbnail,
            alt: blog.title
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.seoTitle || blog.title,
        description: blog.seoDescription || blog.excerpt,
        images: [blog.thumbnail]
      }
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  
  // 1. Try fetching Guide
  const guide = await prisma.guide.findUnique({
    where: { slug },
    include: { category: true, tags: true, seo: true, blocks: { orderBy: { order: 'asc' } } }
  });

  let blogData: any = null;
  if (guide) {
    blogData = {
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
      seoData: guide.seo
    };
  } else {
    // 2. Fallback to standard Blog
    blogData = await blogService.getBlogBySlug(slug);
  }

  let relatedBlogs: Blog[] = [];
  if (blogData) {
    const allBlogs = await blogService.getBlogs();
    const publishedBlogs = allBlogs.filter(b => b.status === 'Published' && b.id !== blogData.id);
    
    const allGuides = await prisma.guide.findMany({
      where: { status: 'Published', id: { not: blogData.id } },
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
      updatedAt: g.updatedAt.toISOString()
    }));

    relatedBlogs = [...publishedBlogs, ...mappedGuides]
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
      .slice(0, 3) as any[];
  }
  
  return <BlogDetailClient initialBlog={blogData} relatedBlogs={relatedBlogs} />;
}
