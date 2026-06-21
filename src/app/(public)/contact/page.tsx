import React from 'react';
import { Metadata } from 'next';
import { siteSettingsService } from '@/services/siteSettingsService';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
  title: 'Liên Hệ Với Chúng Tôi | Tour Chọn Lọc',
  description: 'Liên hệ với Tour Chọn Lọc để nhận tư vấn chi tiết về các tour du lịch cao cấp, hỗ trợ visa và thiết kế lịch trình tour theo yêu cầu.',
  keywords: ['liên hệ tour chọn lọc', 'địa chỉ tour chọn lọc', 'số điện thoại tour chọn lọc', 'tư vấn du lịch'],
  openGraph: {
    title: 'Liên Hệ Với Chúng Tôi | Tour Chọn Lọc',
    description: 'Liên hệ với Tour Chọn Lọc để nhận tư vấn chi tiết về các tour du lịch cao cấp, hỗ trợ visa và thiết kế tour.',
    url: 'https://tourchonloc.com/contact',
    type: 'website',
  }
};

export default async function ContactPage() {
  const settings = await siteSettingsService.getSettings();

  if (!settings) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        <p>Cấu hình website (Site Settings) chưa được thiết lập. Vui lòng liên hệ quản trị viên.</p>
      </div>
    );
  }

  return <ContactPageClient settings={settings} />;
}
