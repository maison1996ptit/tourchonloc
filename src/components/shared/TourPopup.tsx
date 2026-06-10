'use client';

import React, { useEffect, useState } from 'react';
import { tourService } from '@/services/tourService';
import { Tour } from '@/types/tour';
import Link from 'next/link';
import styles from './tour-popup.module.css';
import { useLanguage } from '@/hooks/useLanguage';

interface TourPopupProps {
  delayMs?: number;
}

const TourPopup: React.FC<TourPopupProps> = ({ delayMs = 5000 }) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [tours, setTours] = useState<Tour[]>([]);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const fetchTours = async () => {
      const allTours = await tourService.getTours();
      const featured = allTours.filter(t => t.status === 'Published').slice(0, 2);
      setTours(featured);
    };
    fetchTours();

    const timer = setTimeout(() => {
      if (!isClosed) {
        setIsVisible(true);
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs, isClosed]);

  if (!isVisible || isClosed || tours.length === 0) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <button className={styles.closeBtn} onClick={() => setIsClosed(true)}>×</button>
        
        <div className={styles.header}>
          <h2>🔥 {t('home.featured_tours')}</h2>
          <p>{t('home.popup_subtitle')}</p>
        </div>

        <div className={styles.tourList}>
          {tours.map(tour => (
            <div key={tour.id} className={styles.tourItem}>
              <div 
                className={styles.tourImage} 
                style={{ backgroundImage: `url(${tour.featuredImage})` }}
              >
                <span className={styles.priceTag}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.priceFrom)}</span>
              </div>
              <div className={styles.tourInfo}>
                <h3>{tour.title}</h3>
                <p>{tour.destination} • {tour.durationDays}{t('common.days').charAt(0)}</p>
                <Link href={`/tours/${tour.slug}`} className={styles.bookBtn}>
                  {t('common.book_now')}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <Link href="/tours" className={styles.viewAll}>
          {t('tours.view_all')} →
        </Link>
      </div>
    </div>
  );
};

export default TourPopup;
