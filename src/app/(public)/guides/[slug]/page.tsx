import { Metadata } from 'next';
import { guideService } from '@/services/guideService';
import { notFound } from 'next/navigation';
import CountryGuideClient from './CountryGuideClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await guideService.getCountryGuideBySlug(slug);
  if (!guide) {
    return {
      title: 'Cẩm nang du lịch - Không tìm thấy',
      description: 'Không tìm thấy cẩm nang du lịch của quốc gia được yêu cầu.'
    };
  }
  
  const keywords = [
    `du lịch ${guide.countryName}`, 
    `cẩm nang ${guide.countryName}`, 
    `bản đồ ${guide.countryName}`, 
    `địa điểm du lịch ${guide.countryName}`, 
    `kinh nghiệm du lịch ${guide.countryName}`,
    `bản đồ du lịch ${guide.countryName}`,
    guide.countryName,
    ...guide.markers.slice(0, 5).map(m => m.name)
  ];

  const markerCount = guide.markers.length;
  const label = markerCount >= 40 ? '40+ Địa Danh' : `${markerCount} Địa Danh Nổi Tiếng`;

  return {
    title: `Cẩm Nang Du Lịch ${guide.countryName} | Bản Đồ ${label} | TravelApp`,
    description: guide.introduction || `Kinh nghiệm du lịch ${guide.countryName} chi tiết từ A-Z. Khám phá bản đồ ${markerCount} điểm đến nổi bật nhất cùng TravelApp.`,
    keywords: keywords,
    openGraph: {
      title: `Cẩm Nang Du Lịch ${guide.countryName} | TravelApp`,
      description: guide.introduction || `Khám phá các địa danh nổi tiếng, cẩm nang bản đồ, kinh nghiệm văn hóa tại ${guide.countryName}.`,
      type: 'article',
      url: `https://travelapp.com/guides/${guide.countrySlug}`,
      images: [
        {
          url: guide.markers[0]?.imageUrl || '/images/default-share.jpg',
          alt: `Cẩm nang du lịch ${guide.countryName}`,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Cẩm Nang Du Lịch ${guide.countryName} | TravelApp`,
      description: guide.introduction || `Khám phá các địa danh nổi tiếng tại ${guide.countryName}.`,
      images: [guide.markers[0]?.imageUrl || '/images/default-share.jpg'],
    }
  };
}

export default async function CountryGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await guideService.getCountryGuideBySlug(slug);
  if (!guide) {
    notFound();
  }

  return <CountryGuideClient guide={guide} />;
}
