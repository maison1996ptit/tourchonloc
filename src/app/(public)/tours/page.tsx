import React from 'react';
import { Metadata } from 'next';
import { tourService } from '@/services/tourService';
import ToursPageClient from './ToursPageClient';

export const metadata: Metadata = {
  title: 'Danh Sách Tour Du Lịch Cao Cấp & Bản Sắc | Tour Chọn Lọc',
  description: 'Khám phá các tour du lịch cao cấp, được sàng lọc kỹ càng về dịch vụ, hành trình độc bản trên khắp thế giới: Châu Âu, Nhật Bản, Hàn Quốc, Trung Quốc, Việt Nam...',
  keywords: ['danh sách tour du lịch', 'tour du lịch cao cấp', 'tour du lịch châu âu', 'tour nhật bản', 'đặt tour du lịch'],
  openGraph: {
    title: 'Danh Sách Tour Du Lịch Cao Cấp | Tour Chọn Lọc',
    description: 'Danh sách các tour du lịch tinh hoa và dịch vụ lữ hành quốc tế đẳng cấp.',
    url: 'https://tourchonloc.com/tours',
    type: 'website',
  }
};

export default async function ToursPage() {
  const tours = await tourService.getTours();
  const publishedTours = tours.filter(t => t.status === 'Published');

  return <ToursPageClient initialTours={publishedTours} />;
}
