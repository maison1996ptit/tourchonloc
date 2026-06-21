'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { CountryGuideMap } from '@/types/guideMap';
import styles from '@/app/(public)/cam-nang/guides.module.css';

const GuideMapCard = dynamic(() => import('@/components/public/Guides/GuideMapCard'), { 
  ssr: false,
  loading: () => <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '30px' }}>Khởi tạo bản đồ...</div>
});

interface CountryGuideClientProps {
  guide: CountryGuideMap;
  allTours?: any[];
}

export default function CountryGuideClient({ guide, allTours = [] }: CountryGuideClientProps) {
  // 10-second Promo Popup Timer
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    // Set 3 seconds timer
    const timer = setTimeout(() => {
      setShowPromo(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const matchedTour = useMemo(() => {
    if (!allTours || allTours.length === 0) return null;

    // Match by guide country name (e.g. guide.countryName)
    if (guide.countryName) {
      const targetCountry = guide.countryName.toLowerCase();
      const matched = allTours.filter(t => 
        t.destination.toLowerCase().includes(targetCountry) || 
        t.title.toLowerCase().includes(targetCountry)
      );
      if (matched.length > 0) return matched[0];
    }

    // Default fallback
    return allTours[0];
  }, [guide, allTours]);

  // Generate JSON-LD Schema markup for Google Rich Snippets
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "Article",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://tourchonloc.com/guides/${guide.countrySlug}`
    },
    "headline": `Cẩm Nang Du Lịch ${guide.countryName}`,
    "description": guide.introduction || `Kinh nghiệm du lịch ${guide.countryName} chi tiết từ A-Z.`,
    "image": guide.markers[0]?.imageUrl ? `https://tourchonloc.com${guide.markers[0].imageUrl}` : "https://tourchonloc.com/images/default-share.jpg",
    "author": {
      "@type": "Organization",
      "name": "Tour Chọn Lọc"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Tour Chọn Lọc",
      "logo": {
        "@type": "ImageObject",
        "url": "https://tourchonloc.com/logo.png"
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
            <div className={`${styles.contentCard} ${styles.historyCard}`}>
              <div className={styles.contentHeader}>
                <span className={styles.icon}>🏛️</span>
                <h2>Lịch sử & Hình thành</h2>
              </div>
              <p className={styles.contentText}>{guide.historyInfo}</p>
            </div>
          )}

          {guide.geographyInfo && (
            <div className={`${styles.contentCard} ${styles.geographyCard}`}>
              <div className={styles.contentHeader}>
                <span className={styles.icon}>🏔️</span>
                <h2>Địa lý & Khí hậu</h2>
              </div>
              <p className={styles.contentText}>{guide.geographyInfo}</p>
            </div>
          )}

          {guide.cultureInfo && (
            <div className={`${styles.contentCard} ${styles.cultureCard}`}>
              <div className={styles.contentHeader}>
                <span className={styles.icon}>🏮</span>
                <h2>Con người & Văn hóa</h2>
              </div>
              <p className={styles.contentText}>{guide.cultureInfo}</p>
            </div>
          )}

          {guide.populationInfo && (
            <div className={`${styles.contentCard} ${styles.populationCard}`}>
              <div className={styles.contentHeader}>
                <span className={styles.icon}>👥</span>
                <h2>Dân số & Xã hội</h2>
              </div>
              <p className={styles.contentText}>{guide.populationInfo}</p>
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Contextual Tour Promotion Popup */}
      {showPromo && matchedTour && (
        <div className={styles.promoPopup}>
          <div className={styles.promoContent}>
            <button 
              className={styles.promoClose} 
              onClick={() => {
                setShowPromo(false);
              }}
              aria-label="Đóng quảng cáo"
            >
              ✕
            </button>
            <div className={styles.promoImageWrapper}>
              <div 
                className={styles.promoImage} 
                style={{ backgroundImage: `url(${matchedTour.featuredImage || '/images/default-tour.jpg'})` }}
              />
              <span className={styles.promoTag}>🔥 BÁN CHẠY</span>
            </div>
            <div className={styles.promoBody}>
              <span className={styles.promoLabel}>📍 GỢI Ý HÀNH TRÌNH CHO BẠN</span>
              <h4 className={styles.promoTitle}>{matchedTour.title}</h4>
              <div className={styles.promoDetails}>
                <span>⏳ Thời gian: {matchedTour.durationDays} ngày {matchedTour.durationNights} đêm</span>
                <span>🏷️ Giá từ: <strong className={styles.promoPrice}>{matchedTour.priceFrom.toLocaleString('vi-VN')} đ</strong></span>
              </div>
              <Link 
                href={`/tours/${matchedTour.slug}`} 
                className={styles.promoCta}
                onClick={() => {
                  setShowPromo(false);
                }}
              >
                Khám phá ngay →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
