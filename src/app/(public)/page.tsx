import { Metadata } from 'next';
import { siteSettingsService } from '@/services/siteSettingsService';
import { tourService } from '@/services/tourService';
import { testimonialService } from '@/services/testimonialService';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
  title: 'Tour Chọn Lọc | Cẩm Nang Du Lịch & Tour Cao Cấp Tinh Hoa',
  description: 'Nền tảng du lịch cao cấp hàng đầu Việt Nam. Khám phá cẩm nang du lịch với bản đồ 15 quốc gia nổi tiếng: Việt Nam, Nhật Bản, Châu Âu (Pháp, Ý, Đức, Anh, Tây Ban Nha, Thụy Sĩ, Hà Lan, Áo, Hy Lạp, Thổ Nhĩ Kỳ), Trung Quốc, Hàn Quốc và Đài Loan.',
  keywords: [
    'tour du lịch cao cấp',
    'đặt tour du lịch',
    'đại lý du lịch uy tín',
    'cẩm nang du lịch',
    'bản đồ du lịch',
    'du lịch châu âu',
    'du lịch nhật bản',
    'du lịch việt nam',
    'du lịch đông á',
    'kinh nghiệm du lịch',
    'địa điểm du lịch nổi tiếng'
  ],
  openGraph: {
    title: 'Tour Chọn Lọc | Cẩm Nang Du Lịch & Tour Cao Cấp Tinh Hoa',
    description: 'Bản đồ du lịch với hơn 100+ địa danh nổi bật toàn thế giới cùng các tour du lịch sang trọng, tinh hoa được sàng lọc kỹ càng.',
    url: 'https://tourchonloc.com',
    type: 'website',
    images: [
      {
        url: '/images/guides/v1.jpg',
        width: 1200,
        height: 750,
        alt: 'Tour Chọn Lọc Cẩm nang du lịch và Tour cao cấp',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tour Chọn Lọc | Cẩm Nang Du Lịch & Tour Cao Cấp Tinh Hoa',
    description: 'Trải nghiệm du lịch cao cấp theo phong cách riêng cùng hệ thống bản đồ du lịch chuẩn xác.',
    images: ['/images/guides/v1.jpg'],
  }
};

export default async function HomePage() {
  const [settings, tours, testimonials] = await Promise.all([
    siteSettingsService.getSettings(),
    tourService.getTours(),
    testimonialService.getTestimonials()
  ]);

  if (!settings) {
    throw new Error('Cấu hình website (Site Settings) chưa được thiết lập. Vui lòng chạy prisma seed.');
  }

  // Filter featured published tours
  const featuredTours = tours.filter(tour => tour.isFeatured && tour.status === 'Published');
  // Filter active testimonials
  const activeTestimonials = testimonials.filter(item => item.status === 'Published').slice(0, 3);

  return (
    <HomePageClient 
      settings={settings}
      initialFeaturedTours={featuredTours}
      initialTestimonials={activeTestimonials}
    />
  );
}
