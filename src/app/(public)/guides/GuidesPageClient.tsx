'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { CountryGuideMap } from '@/types/guideMap';
import styles from '@/app/(public)/blogs/guides.module.css';
import { useLanguage } from '@/hooks/useLanguage';

const GuideMapCard = dynamic(() => import('@/components/public/Guides/GuideMapCard'), { 
  ssr: false,
  loading: () => <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '30px' }}>Khởi tạo bản đồ...</div>
});

interface GuidesPageClientProps {
  initialGuides: CountryGuideMap[];
}

export default function GuidesPageClient({ initialGuides }: GuidesPageClientProps) {
  const { t } = useLanguage();

  // Generate JSON-LD ItemList Schema markup for Google Rich Snippets
  const listSchemaJson = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Cẩm Nang Du Lịch - Danh Sách Quốc Gia",
    "description": "Hệ thống bản đồ và cẩm nang khám phá chi tiết các quốc gia hàng đầu thế giới từ TravelApp.",
    "numberOfItems": initialGuides.length,
    "itemListElement": initialGuides.map((guide, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `https://travelapp.com/guides/${guide.countrySlug}`,
      "name": `Cẩm Nang Du Lịch ${guide.countryName}`
    }))
  };

  return (
    <div className={styles.container}>
      {/* Inject JSON-LD Schema for listing page SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchemaJson) }}
      />

      <h1 className={styles.title}>{t('blogs.header_title')}</h1>
      <p className={styles.subtitle}>
        Khám phá hành trình chân thực nhất qua hệ thống bản đồ cẩm nang. Dữ liệu được cập nhật trực tiếp từ hệ thống quản trị, hỗ trợ định vị và thông tin chi tiết về văn hóa, con người của các điểm đến.
      </p>

      <div className={styles.grid}>
        {initialGuides.length > 0 ? initialGuides.map((country) => (
          <GuideMapCard 
            key={country.id} 
            countryMap={country} 
            onMarkerClick={() => {}} 
          />
        )) : (
          <div className={styles.noResults}>Hiện chưa có bản đồ cẩm nang nào được kích hoạt.</div>
        )}
      </div>
    </div>
  );
}
