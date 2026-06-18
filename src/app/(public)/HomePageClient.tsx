'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SiteSettings } from '@/types/siteSettings';
import { Tour } from '@/types/tour';
import { Testimonial } from '@/types/testimonial';
import { mockGuideMaps } from '@/data/guideMaps';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import styles from './home.module.css';

interface HomePageClientProps {
  settings: SiteSettings;
  initialFeaturedTours: Tour[];
  initialTestimonials: Testimonial[];
}

export default function HomePageClient({
  settings,
  initialFeaturedTours,
  initialTestimonials
}: HomePageClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const scrollPrev = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.firstElementChild?.clientWidth || 300;
      sliderRef.current.scrollBy({ left: -(cardWidth + 30), behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.firstElementChild?.clientWidth || 300;
      sliderRef.current.scrollBy({ left: cardWidth + 30, behavior: 'smooth' });
    }
  };
  
  const [tourPage, setTourPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 6;

  const totalTourPages = Math.ceil(initialFeaturedTours.length / itemsPerPage);
  const currentTours = initialFeaturedTours.slice(tourPage * itemsPerPage, (tourPage + 1) * itemsPerPage);

  const handleNextPage = (type: 'tour') => {
    setTourPage(prev => Math.min(prev + 1, totalTourPages - 1));
  };

  const handlePrevPage = (type: 'tour') => {
    setTourPage(prev => Math.max(prev - 1, 0));
  };

  const [activeLandmark, setActiveLandmark] = useState<Record<string, number>>({});

  const handleNextLandmark = (tourId: string, max: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveLandmark(prev => ({
      ...prev,
      [tourId]: ((prev[tourId] || 0) + 1) % max
    }));
  };

  const handlePrevLandmark = (tourId: string, max: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveLandmark(prev => ({
      ...prev,
      [tourId]: ((prev[tourId] || 0) - 1 + max) % max
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tours?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Generate Organization JSON-LD Schema markup for Google
  const orgSchemaJson = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Tour Chọn Lọc",
    "url": "https://travelapp.com",
    "logo": "https://travelapp.com/logo.png",
    "description": settings.seoDefaultDescription || "Đại lý du lịch sang trọng, chuyên cung cấp các tour du lịch tinh hoa và bản đồ cẩm nang.",
    "telephone": settings.contactInfo ? (settings.contactInfo as any).phone : "",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Hanoi",
      "addressCountry": "VN"
    },
    "sameAs": settings.socialLinks ? Object.values(settings.socialLinks as any) : []
  };

  // Search box schema markup
  const searchSchemaJson = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://travelapp.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://travelapp.com/tours?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className={styles.home}>
      {/* Inject JSON-LD Schema for Homepage SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchemaJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(searchSchemaJson) }}
      />

      <section className={styles.hero} style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${settings.heroImage})` }}>
        <div className={styles.heroContent}>
          <h1>
            <span className={styles.titleHighlightWrapper}>
              <span className={styles.titleHighlightTextBase}>Bắt Đầu Hành Trình</span>
              <span className={styles.titleHighlightOverlayContainer} aria-hidden="true">
                <span className={styles.titleHighlightTextOverlay}>Bắt Đầu Hành Trình</span>
              </span>
              <span className={styles.paperPlaneTrail}>✈️</span>
            </span>
            <span className={styles.titleDream}>Trong Mơ</span>
            <span className={styles.titleMain}>Của Bạn</span>
          </h1>

          <form onSubmit={handleSearch} className={styles.heroSearch}>
            <div className={styles.searchInputWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input 
                type="text" 
                placeholder={t('tours.search_placeholder')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit">{t('common.search')}</button>
          </form>

          <div className={styles.heroActions}>
            <Link href={settings.heroCTA.link} className={styles.ctaBtn}>
              {t('common.book_now')}
            </Link>
          </div>
        </div>
      </section>

      {/* Country Interactive Guides Section */}
      <section className={styles.blogs}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Cẩm Nang Du Lịch</h2>
          </div>
          
          <div className={styles.countryGridWrapper}>
            <button className={`${styles.sliderNavBtn} ${styles.prevBtn}`} onClick={scrollPrev} aria-label="Previous card">❮</button>
            <div className={styles.countryGrid} ref={sliderRef}>
              {mockGuideMaps.map(country => (
                <Link 
                  key={country.id} 
                  href={`/guides/${country.countrySlug}`} 
                  className={styles.countryCard}
                >
                  <div 
                    className={styles.countryImage} 
                    style={{ backgroundImage: `url(${country.markers[0]?.imageUrl || '/logo.png'})` }}
                  >
                    <div className={styles.countryOverlay}>
                      <div className={styles.countryContent}>
                        <span className={styles.locationCount}>Top 40 địa điểm nổi tiếng</span>
                        <h2>{country.flag} {country.countryName}</h2>
                        <p>Khám phá bản đồ cẩm nang chi tiết của {country.countryName}</p>
                        <div className={styles.exploreBtn}>Khám phá ngay →</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <button className={`${styles.sliderNavBtn} ${styles.nextBtn}`} onClick={scrollNext} aria-label="Next card">❯</button>
          </div>
        </div>
      </section>

      {/* Tours Paginated Grid Section */}
      <section className={styles.tours}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('home.featured_tours')}</h2>
          
          <div className={styles.paginatedWrapper}>
            <div className={styles.gridContainer}>
              {currentTours.map(tour => (
                <div key={tour.id} className={styles.tourCard}>
                  <div className={styles.tourCardInner}>
                    <div className={styles.tourCardFront}>
                      <div 
                        className={styles.tourImage} 
                        style={{ backgroundImage: `url(${tour.featuredImage})` }}
                      ></div>
                    </div>

                    <div className={styles.landmarkContainer}>
                      <div 
                        className={styles.landmarkImage} 
                        style={{ backgroundImage: `url(${tour.images?.[activeLandmark[tour.id] || 0] || tour.featuredImage})` }}
                      ></div>
                    </div>

                    {tour.itinerary && (tour.itinerary as any[]).length > 0 && (
                      <div className={styles.itineraryControls}>
                        <button className={styles.ctrlBtn} onClick={(e) => handlePrevLandmark(tour.id, tour.images?.length || 1, e)}>↑</button>
                        <div className={styles.ctrlBtn} style={{ cursor: 'default', fontSize: '10px' }}>{t('common.days').charAt(0)}{(activeLandmark[tour.id] || 0) + 1}</div>
                        <button className={styles.ctrlBtn} onClick={(e) => handleNextLandmark(tour.id, tour.images?.length || 1, e)}>↓</button>
                      </div>
                    )}

                    <div className={styles.holographicDashboard}>
                      <div className={styles.dashboardHeader}>
                        <div>
                          <h3>{tour.title}</h3>
                          <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>{tour.destination}</p>
                        </div>
                        <div className={styles.priceDisplay}>
                          <span className={styles.priceLabel}>{t('common.from')}</span>
                          <span className={styles.priceValue}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.priceFrom)}</span>
                        </div>
                      </div>

                      <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                          <span className={styles.statIcon}>🕒</span>
                          <span className={styles.statValue}>{tour.durationDays}{t('common.days').charAt(0)}/{tour.durationNights}{t('common.nights').charAt(0)}</span>
                          <span className={styles.statLabel}>{t('common.duration')}</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statIcon}>📍</span>
                          <span className={styles.statValue}>{(tour.itinerary as any[]).length || 0}</span>
                          <span className={styles.statLabel}>{t('common.stops')}</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statIcon}>⭐</span>
                          <span className={styles.statValue}>4.9</span>
                          <span className={styles.statLabel}>{t('common.rating')}</span>
                        </div>
                      </div>

                      <div className={styles.cardAction}>
                        <Link href={`/tours/${tour.slug}`} className={styles.glassBtn}>
                          {t('common.view_details')}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalTourPages > 1 && (
              <div className={styles.paginationControls}>
                <button className={styles.navBtn} onClick={() => handlePrevPage('tour')} disabled={tourPage === 0}>‹</button>
                <span className={styles.pageInfo}>{tourPage + 1} / {totalTourPages}</span>
                <button className={styles.navBtn} onClick={() => handleNextPage('tour')} disabled={tourPage >= totalTourPages - 1}>›</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.testimonials}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('home.traveler_say')}</h2>
          <div className={styles.testimonialGrid}>
            {initialTestimonials.map(testimonial => (
              <div key={testimonial.id} className={styles.testimonialCard}>
                <div className={styles.rating}>{'⭐'.repeat(testimonial.rating)}</div>
                <p className={styles.content}>&quot;{testimonial.content}&quot;</p>
                <div className={styles.author}>
                  {testimonial.avatar && (
                    <div className={styles.authorAvatar} style={{ backgroundImage: `url(${testimonial.avatar})` }} />
                  )}
                  <div className={styles.authorInfo}>
                    <strong>{testimonial.customerName}</strong>
                    <span>
                      {testimonial.flagCode && (
                        <img 
                          src={`https://flagcdn.com/24x18/${testimonial.flagCode.toLowerCase()}.png`} 
                          alt={testimonial.country} 
                          className={styles.flagIcon}
                        />
                      )}
                      {testimonial.country}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.about}>
        <div className={styles.container}>
          <h2>Về Chúng Tôi – Những Người Kiến Tạo Hành Trình</h2>
          <p>Chào mừng bạn đến với Tour Chọn Lọc – Nền tảng Tri thức Du lịch & Hệ thống Sàng lọc Tour Tinh hoa dành cho người Việt. Chúng tôi mang đến giải pháp khám phá thông minh, an tâm và đẳng cấp nhất tại một điểm chạm duy nhất.</p>
          <Link href="/about" className={styles.readMore} style={{ marginTop: '20px', display: 'inline-block', fontSize: '1.1rem', fontWeight: 'bold' }}>
            Xem chi tiết câu chuyện thương hiệu của chúng tôi →
          </Link>
        </div>
      </section>
    </div>
  );
}
