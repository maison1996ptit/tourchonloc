import React from 'react';
import { Metadata } from 'next';
import CustomizeTripClient from './CustomizeTripClient';

export const metadata: Metadata = {
  title: 'Thiết Kế Tour Du Lịch Theo Yêu Cầu | Tour Chọn Lọc',
  description: 'Tự hào mang đến dịch vụ thiết kế hành trình tour du lịch độc bản, cá nhân hóa theo đúng sở thích, tốc độ di chuyển và ngân sách của bạn với đội ngũ chuyên gia giàu kinh nghiệm.',
  keywords: ['thiết kế tour', 'tour theo yêu cầu', 'tour độc bản', 'cá nhân hóa du lịch', 'lên lịch trình tour'],
  openGraph: {
    title: 'Thiết Kế Tour Du Lịch Theo Yêu Cầu | Tour Chọn Lọc',
    description: 'Thiết kế lịch trình tour du lịch cao cấp độc bản theo sở thích cá nhân của bạn.',
    url: 'https://tourchonloc.com/customize-trip',
    type: 'website',
  }
};

export default function CustomizeTripPage() {
  return <CustomizeTripClient />;
}
