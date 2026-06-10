'use client';

import React from 'react';
import { mockGuideMaps } from '@/data/guideMaps';
import Link from 'next/link';
import styles from './blogs.module.css';
import { useLanguage } from '@/hooks/useLanguage';

export default function BlogsPage() {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>{t('blogs.header_title')}</h1>
        <p>Khám phá các quốc gia du lịch hàng đầu qua hệ thống bản đồ cẩm nang thông minh.</p>
      </header>

      <div className={styles.countryGrid}>
        {mockGuideMaps.map(country => (
          <Link 
            key={country.id} 
            href={`/guides/${country.countrySlug}`} 
            className={styles.countryCard}
          >
            <div 
              className={styles.countryImage} 
              style={{ backgroundImage: `url(/images/guides/${country.id === 'vn-map' ? 'v1' : 'j5'}.jpg)` }}
            >
              <div className={styles.countryOverlay}>
                <div className={styles.countryContent}>
                  <span className={styles.locationCount}>{country.markers.length} Địa điểm nổi tiếng</span>
                  <h2>{country.flag} {country.countryName}</h2>
                  <p>Khám phá bản đồ cẩm nang chi tiết của {country.countryName}</p>
                  <div className={styles.exploreBtn}>Khám phá ngay →</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <section className={styles.infoSection}>
        <div className={styles.infoItem}>
          <h3>40+ Điểm đến</h3>
          <p>Mỗi quốc gia được tuyển chọn 40 địa điểm nổi tiếng nhất.</p>
        </div>
        <div className={styles.infoItem}>
          <h3>Bản đồ chuẩn</h3>
          <p>Hệ thống định vị chính xác và trực quan.</p>
        </div>
        <div className={styles.infoItem}>
          <h3>Thông tin đầy đủ</h3>
          <p>Hình ảnh đẹp và mô tả chi tiết cho từng điểm đến.</p>
        </div>
      </section>
    </div>
  );
}
