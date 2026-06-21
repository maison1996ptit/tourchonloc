import React from 'react';
import { Metadata } from 'next';
import { getVisaServices, getVisaStats } from '@/actions/visaActions';
import VisaPageClient from './VisaPageClient';

export const metadata: Metadata = {
  title: 'Dịch Vụ Làm Visa Trọn Gói, Tỷ Lệ Đậu 99% | Tour Chọn Lọc',
  description: 'Dịch vụ tư vấn và làm hồ sơ visa các nước châu Âu (Schengen), Mỹ, Úc, Canada, Anh Quốc, Nhật Bản, Hàn Quốc, Đài Loan... trọn gói thủ tục đơn giản, uy tín hàng đầu.',
  keywords: ['dịch vụ làm visa', 'làm visa trọn gói', 'làm visa du lịch', 'tư vấn visa du lịch', 'lệ phí làm visa'],
  openGraph: {
    title: 'Dịch Vụ Làm Visa Trọn Gói, Tỷ Lệ Đậu Cao | Tour Chọn Lọc',
    description: 'Bảng phí dịch vụ visa du lịch các nước. Hỗ trợ chuẩn bị hồ sơ từ A-Z, tỷ lệ đậu cao nhất.',
    url: 'https://tourchonloc.com/visa',
    type: 'website',
  }
};

export default async function VisaPage() {
  let visas: any[] = [];
  let stats: any = null;
  
  try {
    const [servicesData, statsData] = await Promise.all([
      getVisaServices(),
      getVisaStats()
    ]);
    visas = servicesData;
    stats = statsData;
  } catch (error) {
    console.error('Error pre-fetching visa data on server:', error);
  }

  // Ensure dates are string-serialized for Next.js props
  const serializedVisas = visas.map((v: any) => ({
    ...v,
    createdAt: v.createdAt instanceof Date ? v.createdAt.toISOString() : String(v.createdAt),
    updatedAt: v.updatedAt instanceof Date ? v.updatedAt.toISOString() : String(v.updatedAt),
  }));

  return <VisaPageClient initialVisas={serializedVisas} initialStats={stats} />;
}
