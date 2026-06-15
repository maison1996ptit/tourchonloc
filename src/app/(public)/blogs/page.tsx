import { Metadata } from 'next';
import { blogService } from '@/services/blogService';
import BlogsPageClient from './BlogsPageClient';

export const metadata: Metadata = {
  title: 'Tin Tức & Cẩm Nang Du Lịch Mới Nhất | TravelApp',
  description: 'Cập nhật tin tức du lịch, cẩm nang chia sẻ kinh nghiệm đi tour, thông tin khuyến mãi và các bài viết PR báo chí mới nhất từ TravelApp.',
  keywords: ['tin tức du lịch', 'cẩm nang du lịch', 'kinh nghiệm du lịch', 'khuyến mãi du lịch', 'bài báo du lịch'],
  openGraph: {
    title: 'Tin Tức & Cẩm Nang Du Lịch | TravelApp',
    description: 'Cập nhật tin tức du lịch mới nhất, kinh nghiệm đi tour và cẩm nang từ chuyên gia.',
    url: 'https://travelapp.com/blogs',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 600,
        height: 600,
        alt: 'TravelApp Logo'
      }
    ]
  }
};

export default async function BlogsPage() {
  // Fetch all blogs from database
  const allBlogs = await blogService.getBlogs();
  
  // Filter for public display: only Published blogs
  const publishedBlogs = allBlogs.filter(b => b.status === 'Published');
  
  return <BlogsPageClient initialBlogs={publishedBlogs} />;
}
