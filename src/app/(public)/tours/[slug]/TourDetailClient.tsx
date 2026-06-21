'use client';

import React, { useEffect, useState, useRef } from 'react';
import { tourService } from '@/services/tourService';
import { siteSettingsService } from '@/services/siteSettingsService';
import { Tour } from '@/types/tour';
import styles from './tour-detail.module.css';
import Link from 'next/link';
import InquiryForm from '@/components/public/InquiryForm';
import { useLanguage } from '@/hooks/useLanguage';

interface TourDetailClientProps {
  initialTour: Tour | null;
}

export default function TourDetailClient({ initialTour }: TourDetailClientProps) {
  const { t } = useLanguage();
  const [tour, setTour] = useState<Tour | null>(initialTour);
  const [relatedTours, setRelatedTours] = useState<Tour[]>([]);
  const [gearList, setGearList] = useState<any[]>([]);
  const [loading, setLoading] = useState(!initialTour);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStickyBadge, setShowStickyBadge] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeDay, setActiveDay] = useState<number | null>(1);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const gallerySliderRef = useRef<HTMLDivElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);

  // Utility to handle various date formats (ISO and DD/MM/YYYY)
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    
    // Check if format is DD/MM/YYYY
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }
    
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  useEffect(() => {
    const fetchTourData = async () => {
      if (initialTour) {
        setTour(initialTour);
        try {
          const allTours = await tourService.getTours();
          const related = allTours.filter(tData => 
            tData.id !== initialTour.id && 
            tData.status === 'Published' &&
            (tData.destination === initialTour.destination || tData.category === initialTour.category)
          ).slice(0, 3);
          setRelatedTours(related);
        } catch (err) {
          console.error('Error loading related tours', err);
        }
      }
      setLoading(false);
    };
    fetchTourData();

    const fetchGearData = async () => {
      try {
        const settings = await siteSettingsService.getSettings();
        if (settings && settings.affiliateGear) {
          setGearList(settings.affiliateGear as any[]);
        }
      } catch (err) {
        console.error('Error loading gear list', err);
      }
    };
    fetchGearData();

  }, [initialTour]);

  // Dynamically show sticky booking badge only when the hero badge is completely out of view
  useEffect(() => {
    if (loading) return;

    const handleScroll = () => {
      const heroBadge = heroBadgeRef.current;
      if (!heroBadge) {
        setShowStickyBadge(false);
        return;
      }

      const rect = heroBadge.getBoundingClientRect();
      // The hero badge is visible if its bottom is above the viewport fold and top is below the screen top
      const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;

      // Force hide sticky badge if hero badge is visible, or if we are near the top
      if (isVisible || window.scrollY < 100) {
        setShowStickyBadge(false);
      } else {
        setShowStickyBadge(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [loading]);

  // Handle auto-scroll
  useEffect(() => {
    const slider = sliderRef.current;
    const itemsCount = Math.min(gearList.length, 20);
    if (!slider || itemsCount <= 4) return;

    const interval = setInterval(() => {
      if (isPaused) return;

      const maxScroll = slider.scrollWidth - slider.clientWidth;
      if (slider.scrollLeft >= maxScroll - 5) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const cardWidth = slider.clientWidth / 4;
        slider.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [gearList, isPaused]);

  if (loading) return <div className={styles.loading}>{t('common.loading')}</div>;
  if (!tour) return <div className={styles.error}>{t('tours.no_results')} <Link href="/tours">{t('tour_detail.back_to_tours')}</Link></div>;

  const BookingBadge = ({ isSticky = false, innerRef }: { isSticky?: boolean; innerRef?: React.RefObject<HTMLDivElement | null> }) => (
    <div 
      ref={innerRef}
      className={`${styles.bookingBadge} ${isSticky ? styles.stickyBadge : ''}`}
      onClick={() => setIsModalOpen(true)}
    >
      <div className={styles.badgeIcon}>
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 10V6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V10C3.1 10 4 10.9 4 12C4 13.1 3.1 14 2 14V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V14C20.9 14 20 13.1 20 12C20 10.9 20.9 10 22 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 4V20" stroke="white" strokeWidth="2" strokeDasharray="3 3"/>
        </svg>
      </div>
      <div className={styles.badgeContent}>
        <span className={styles.badgeLabel}>{t('tour_detail.departure_label')}</span>
        <span className={styles.badgeDate}>
          {tour.departureDates && tour.departureDates.length > 0 
            ? parseDate(tour.departureDates[0]).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : t('common.book_now')}
        </span>
      </div>
    </div>
  );

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": tour.title,
    "image": tour.featuredImage,
    "description": tour.shortDescription || tour.overview,
    "offers": {
      "@type": "Offer",
      "price": tour.priceFrom,
      "priceCurrency": "VND",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/tours" className={styles.backLink}>← {t('tour_detail.back_to_tours')}</Link>
          <h1>{tour.title}</h1>
          <div className={styles.metaBadges}>
            <span className={styles.metaBadge}>📍 {tour.destination}</span>
            <span className={styles.metaBadge}>⏱️ {tour.durationDays}{t('common.days').charAt(0)}/{tour.durationNights}{t('common.nights').charAt(0)}</span>
            <span className={styles.metaBadge}>🏷️ {tour.category}</span>
          </div>
        </div>
      </header>

      <div className={styles.hero} style={{ backgroundImage: `url(${tour.featuredImage})` }}>
        <BookingBadge innerRef={heroBadgeRef} />
      </div>

      {showStickyBadge && <BookingBadge isSticky={true} />}

      <main className={styles.main}>
        <div className={styles.trustBanner}>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>🛡️</span>
            <div className={styles.trustText}>
              <strong>Dịch vụ uy tín</strong>
              <span>Khởi hành chắc chắn, bảo hiểm trọn gói</span>
            </div>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>🏨</span>
            <div className={styles.trustText}>
              <strong>Lưu trú cao cấp</strong>
              <span>Hệ thống khách sạn 4-5 sao chuẩn quốc tế</span>
            </div>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>🗣️</span>
            <div className={styles.trustText}>
              <strong>HDV chuyên nghiệp</strong>
              <span>Am hiểu sâu sắc, tận tâm suốt tuyến</span>
            </div>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>💎</span>
            <div className={styles.trustText}>
              <strong>Giá trị độc quyền</strong>
              <span>Lộ trình chọn lọc, trải nghiệm khác biệt</span>
            </div>
          </div>
        </div>

        <section className={styles.section}>
          <h2>{t('tour_detail.overview')}</h2>
          <p className={styles.overview}>{tour.overview}</p>
        </section>

        {tour.images && tour.images.length > 0 && (
          <section className={styles.section}>
            <h2>{t('tour_detail.moments') || 'Khoảnh khắc chuyến đi'}</h2>
            <div className={styles.gallerySliderWrapper}>
              {tour.images.length > 4 && (
                <button
                  type="button"
                  className={`${styles.galleryNavBtn} ${styles.galleryPrevBtn}`}
                  onClick={() => {
                    if (gallerySliderRef.current) {
                      const cardWidth = gallerySliderRef.current.clientWidth / 4;
                      gallerySliderRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
                    }
                  }}
                  aria-label="Previous images"
                >
                  ‹
                </button>
              )}

              <div className={styles.gallerySlider} ref={gallerySliderRef}>
                {tour.images.map((imgUrl, idx) => (
                  <div 
                    key={idx} 
                    className={styles.galleryItem}
                    onClick={() => {
                      setTour(prev => prev ? { ...prev, featuredImage: imgUrl } : null);
                    }}
                    title="Click to view as main photo"
                  >
                    <div 
                      className={styles.galleryImage} 
                      style={{ backgroundImage: `url(${imgUrl})` }}
                    />
                    <div className={styles.galleryOverlay}>
                      <span>Ảnh điểm đến #{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>

              {tour.images.length > 4 && (
                <button
                  type="button"
                  className={`${styles.galleryNavBtn} ${styles.galleryNextBtn}`}
                  onClick={() => {
                    if (gallerySliderRef.current) {
                      const cardWidth = gallerySliderRef.current.clientWidth / 4;
                      gallerySliderRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
                    }
                  }}
                  aria-label="Next images"
                >
                  ›
                </button>
              )}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <h2>{t('tour_detail.highlights')}</h2>
          <ul className={styles.highlights}>
            {tour.highlights?.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2>{t('tour_detail.itinerary')}</h2>
          <div className={styles.itinerary}>
            {tour.itinerary?.map((item) => {
              const isOpen = activeDay === item.day;
              return (
                <div 
                  key={item.day} 
                  className={`${styles.day} ${isOpen ? styles.dayOpen : ''}`}
                  onClick={() => setActiveDay(isOpen ? null : item.day)}
                >
                  <div className={styles.dayNumber}>{t('common.days').charAt(0)}{item.day}</div>
                  <div className={styles.dayContent}>
                    <div className={styles.dayHeader}>
                      <h3>{item.title}</h3>
                      <span className={styles.accordionArrow}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                    {isOpen && (
                      <div className={styles.dayDescription}>
                        <p>{item.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {tour.departureDates && tour.departureDates.length > 0 && (
          <section className={styles.section}>
            <h2>{t('tour_detail.departure_dates')}</h2>
            <p className={styles.urgencyAlert}>{t('tour_detail.limited_offer')}</p>
            <p className={styles.sectionDesc}>{t('tour_detail.departure_dates_desc')}</p>
            <div className={styles.dateGrid}>
              {tour.departureDates.map((dateStr, idx) => {
                const dateObj = parseDate(dateStr);
                const spotsLeft = Math.floor(Math.random() * 5) + 2; // Simulated dynamic spots
                return (
                  <div key={idx} className={styles.dateCard}>
                    <div className={styles.dateInfo}>
                      <span className={styles.dateDay}>{dateObj.getDate()}</span>
                      <div className={styles.dateMonthYear}>
                        <span>{dateObj.toLocaleString('vi-VN', { month: 'short' })}</span>
                        <span>{dateObj.getFullYear()}</span>
                      </div>
                    </div>
                    <div className={styles.dateAction}>
                      <span className={styles.spotsLeft}>{t('tour_detail.spots_left').replace('{count}', spotsLeft.toString())}</span>
                      <button className={styles.bookDateBtn} onClick={() => setIsModalOpen(true)}>{t('tour_detail.select_date')}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className={styles.grid}>
          <section className={styles.section}>
            <h2>{t('tour_detail.inclusions')}</h2>
            <ul className={styles.included}>
              {tour.included?.map((item, i) => (
                <li key={i}>✓ {item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h2>{t('tour_detail.exclusions')}</h2>
            <ul className={styles.excluded}>
              {tour.excluded?.map((item, i) => (
                <li key={i}>✕ {item}</li>
              ))}
            </ul>
          </section>
        </div>

        {(() => {
          const visibleGear = gearList.slice(0, 20);
          if (visibleGear.length === 0) return null;
          return (
            <section className={styles.section}>
              <h2>{t('tour_detail.essential_gear')}</h2>
              <p className={styles.sectionDesc}>{t('tour_detail.essential_gear_desc')}</p>
              
              <div 
                className={styles.sliderWrapper}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
              >
                {visibleGear.length > 4 && (
                  <button 
                    type="button"
                    className={`${styles.navBtn} ${styles.prevBtn}`}
                    onClick={() => {
                      if (sliderRef.current) {
                        const cardWidth = sliderRef.current.clientWidth / 4;
                        sliderRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
                      }
                    }}
                    aria-label="Previous items"
                  >
                    ‹
                  </button>
                )}

                <div className={styles.affiliateSlider} ref={sliderRef}>
                  {visibleGear.map((item, idx) => (
                    <div key={idx} className={styles.affiliateCard}>
                      <div 
                        className={styles.affiliateImage} 
                        style={{ backgroundImage: `url(${item.imageUrl || '/images/guides/v1.jpg'})` }}
                      ></div>
                      <div className={styles.affiliateInfo}>
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                        <a 
                          href={item.affiliateUrl || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={styles.affiliateLink}
                        >
                          {t('tour_detail.buy_now') || 'Mua ngay →'}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {visibleGear.length > 4 && (
                  <button 
                    type="button"
                    className={`${styles.navBtn} ${styles.nextBtn}`}
                    onClick={() => {
                      if (sliderRef.current) {
                        const cardWidth = sliderRef.current.clientWidth / 4;
                        sliderRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
                      }
                    }}
                    aria-label="Next items"
                  >
                    ›
                  </button>
                )}
              </div>
            </section>
          );
        })()}

        {relatedTours.length > 0 && (
          <section className={styles.section}>
            <h2>{t('tour_detail.related_tours')}</h2>
            <div className={styles.relatedGrid}>
              {relatedTours.map(tData => (
                <Link href={`/tours/${tData.slug}`} key={tData.id} className={styles.relatedCard}>
                  <div className={styles.relatedImage} style={{ backgroundImage: `url(${tData.featuredImage})` }}>
                    <span className={styles.relatedPrice}>{t('common.from')} {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tData.priceFrom)}</span>
                  </div>
                  <div className={styles.relatedInfo}>
                    <h4>{tData.title}</h4>
                    <p>{tData.destination} • {tData.durationDays} {t('common.days')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <div className={styles.bookNowSection}>
          <h3>{t('tour_detail.ready_to_start')}</h3>
          <button className={styles.mainBookBtn} onClick={() => setIsModalOpen(true)}>{t('tour_detail.book_this_tour')}</button>
        </div>
      </footer>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setIsModalOpen(false)}>&times;</button>
            <div className={styles.modalHeader}>
              <h3>{t('common.book_now')}</h3>
              <p>{tour.title}</p>
            </div>
            <div className={styles.modalBody}>
              <InquiryForm 
                source="Tour Inquiry" 
                tourTitle={tour.title} 
                preferredDate={tour.departureDates && tour.departureDates.length > 0 ? tour.departureDates[0] : undefined}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
