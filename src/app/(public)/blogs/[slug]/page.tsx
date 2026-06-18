import { Metadata } from 'next';
import { blogService } from '@/services/blogService';
import BlogDetailClient from './BlogDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
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
    }
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = await blogService.getBlogBySlug(slug);
  
  return <BlogDetailClient initialBlog={blog} />;
}
