import { Metadata } from 'next';
import { blogService } from '@/services/blogService';
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
  
  // Filter for public display: only Published blogs
  const publishedBlogs = allBlogs.filter(b => b.status === 'Published');
  
  return <CamNangPageClient initialBlogs={publishedBlogs} />;
}
