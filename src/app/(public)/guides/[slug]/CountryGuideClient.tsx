'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { CountryGuideMap } from '@/types/guideMap';
import styles from '@/app/(public)/cam-nang/guides.module.css';

const GuideMapCard = dynamic(() => import('@/components/public/Guides/GuideMapCard'), { 
  ssr: false,
  loading: () => <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '30px' }}>Khởi tạo bản đồ...</div>
});

interface CountryGuideClientProps {
  guide: CountryGuideMap;
}

export default function CountryGuideClient({ guide }: CountryGuideClientProps) {
  // Generate JSON-LD Schema markup for Google Rich Snippets
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "Article",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://travelapp.com/guides/${guide.countrySlug}`
    },
    "headline": `Cẩm Nang Du Lịch ${guide.countryName}`,
    "description": guide.introduction || `Kinh nghiệm du lịch ${guide.countryName} chi tiết từ A-Z.`,
    "image": guide.markers[0]?.imageUrl ? `https://travelapp.com${guide.markers[0].imageUrl}` : "https://travelapp.com/images/default-share.jpg",
    "author": {
      "@type": "Organization",
      "name": "TravelApp"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TravelApp",
      "logo": {
        "@type": "ImageObject",
        "url": "https://travelapp.com/logo.png"
      }
    },
    "about": {
      "@type": "Place",
      "name": guide.countryName,
      "description": guide.cultureInfo
    }
  };

  return (
    <div className={styles.container}>
      {/* Inject JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      <h1 className={styles.title}>Cẩm nang du lịch {guide.countryName}</h1>
      <p className={styles.subtitle}>
        Khám phá {guide.countryName} qua hệ thống bản đồ {guide.markers.length} địa điểm nổi tiếng nhất.
      </p>

      <div className={styles.singleGrid}>
        <GuideMapCard 
          countryMap={guide} 
          onMarkerClick={() => {}} 
        />
      </div>

      <section className={styles.countryContentSection}>
        {/* Main Introduction Card */}
        <div className={`${styles.contentCard} ${styles.fullWidthCard}`}>
          <div className={styles.contentHeader}>
            <span className={styles.icon}>🌏</span>
            <h2>Giới thiệu chung</h2>
          </div>
          <p className={styles.contentText}>{guide.introduction || "Đang cập nhật nội dung..."}</p>
        </div>

        {/* 2x2 Grid of specific details */}
        <div className={styles.detailsGrid}>
          {guide.historyInfo && (
            <div className={styles.contentCard}>
              <div className={styles.contentHeader}>
                <span className={styles.icon}>🏛️</span>
                <h2>Lịch sử & Hình thành</h2>
              </div>
              <p className={styles.contentText}>{guide.historyInfo}</p>
            </div>
          )}

          {guide.geographyInfo && (
            <div className={styles.contentCard}>
              <div className={styles.contentHeader}>
                <span className={styles.icon}>🏔️</span>
                <h2>Địa lý & Khí hậu</h2>
              </div>
              <p className={styles.contentText}>{guide.geographyInfo}</p>
            </div>
          )}

          {guide.cultureInfo && (
            <div className={styles.contentCard}>
              <div className={styles.contentHeader}>
                <span className={styles.icon}>🏮</span>
                <h2>Con người & Văn hóa</h2>
              </div>
              <p className={styles.contentText}>{guide.cultureInfo}</p>
            </div>
          )}

          {guide.populationInfo && (
            <div className={styles.contentCard}>
              <div className={styles.contentHeader}>
                <span className={styles.icon}>👥</span>
                <h2>Dân số & Xã hội</h2>
              </div>
              <p className={styles.contentText}>{guide.populationInfo}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
