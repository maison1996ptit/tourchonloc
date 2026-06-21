import { Metadata } from 'next';
import { guideService } from '@/services/guideService';
import GuidesPageClient from './GuidesPageClient';

export const metadata: Metadata = {
  title: 'Cẩm Nang Du Lịch & Bản Đồ 15 Quốc Gia Lớn | Tour Chọn Lọc',
  description: 'Khám phá cẩm nang du lịch của 15 quốc gia hàng đầu thế giới bao gồm Việt Nam, Nhật Bản, 10 nước châu Âu (Pháp, Ý, Đức, Anh, Tây Ban Nha, Thụy Sĩ, Hà Lan, Áo, Hy Lạp, Thổ Nhĩ Kỳ), Trung Quốc, Hàn Quốc và Đài Loan. Bản đồ chi tiết, kinh nghiệm du lịch, văn hóa và địa danh nổi bật.',
  keywords: [
    'cẩm nang du lịch',
    'bản đồ du lịch',
    'kinh nghiệm du lịch',
    'địa điểm du lịch nổi tiếng',
    'du lịch việt nam',
    'du lịch nhật bản',
    'du lịch châu âu',
    'du lịch pháp',
    'du lịch ý',
    'du lịch đức',
    'du lịch anh',
    'du lịch tây ban nha',
    'du lịch thụy sĩ',
    'du lịch hà lan',
    'du lịch áo',
    'du lịch hy lạp',
    'du lịch thổ nhĩ kỳ',
    'du lịch trung quốc',
    'du lịch hàn quốc',
    'du lịch đài loan'
  ],
  openGraph: {
    title: 'Cẩm Nang Du Lịch | Tour Chọn Lọc',
    description: 'Trải nghiệm cẩm nang du lịch bản đồ với hơn 100+ địa danh nổi tiếng tại Việt Nam, Nhật Bản, Châu Âu, Trung Quốc, Hàn Quốc, Đài Loan.',
    url: 'https://tourchonloc.com/guides',
    type: 'website',
    images: [
      {
        url: '/images/guides/v1.jpg',
        width: 1200,
        height: 750,
        alt: 'Cẩm nang du lịch Tour Chọn Lọc',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cẩm Nang Du Lịch | Tour Chọn Lọc',
    description: 'Bản đồ và cẩm nang du lịch chi tiết 15 quốc gia hàng đầu thế giới.',
    images: ['/images/guides/v1.jpg'],
  }
};

export default async function GuidesPage() {
  const guides = await guideService.getCountryGuides();
  return <GuidesPageClient initialGuides={guides} />;
}
