import { Metadata } from 'next';
import { tourService } from '@/services/tourService';
import TourDetailClient from './TourDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tour = await tourService.getTourBySlug(slug);
  
  if (!tour) {
    return {
      title: 'Tour không tìm thấy | Tour Chọn Lọc',
      description: 'Không tìm thấy thông tin chi tiết của chuyến đi được yêu cầu.'
    };
  }
  
  return {
    title: tour.seoTitle || `${tour.title} | Tour Chọn Lọc`,
    description: tour.seoDescription || tour.shortDescription,
    openGraph: {
      title: tour.seoTitle || tour.title,
      description: tour.seoDescription || tour.shortDescription,
      images: [
        {
          url: tour.featuredImage,
          alt: tour.title
        }
      ]
    }
  };
}

export default async function TourDetailPage({ params }: Props) {
  const { slug } = await params;
  const tour = await tourService.getTourBySlug(slug);
  
  return <TourDetailClient initialTour={tour} />;
}
