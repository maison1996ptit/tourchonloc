'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import styles from './blogs.module.css';
import { useLanguage } from '@/hooks/useLanguage';

interface GuideItem {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  category: string;
  author: string;
  thumbnail: string;
  excerpt: string;
  tags: string[];
  publishedDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  isGuide: boolean;
  views: number;
  country: string;
  city: string;
  readTime: number;
  hasTours: boolean;
}

interface TourItem {
  id: string;
  title: string;
  slug: string;
  destination: string;
  priceFrom: number;
  durationDays: number;
  durationNights: number;
  featuredImage: string;
  departureDates: string[];
}

interface BlogsPageClientProps {
  initialBlogs: GuideItem[];
  initialTours?: TourItem[];
}

export default function BlogsPageClient({ initialBlogs, initialTours = [] }: BlogsPageClientProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [selectedType, setSelectedType] = useState('All'); // All, Visa, KinhNghiem, AmThuc, TourNoiBat, MeoDuLich
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Extract unique countries and cities dynamically from guides
  const countries = useMemo(() => {
    const list = new Set<string>();
    initialBlogs.forEach(b => {
      if (b.country && b.country.trim() !== '') {
        list.add(b.country.trim());
      }
    });
    return ['All', ...Array.from(list)];
  }, [initialBlogs]);

  const cities = useMemo(() => {
    const list = new Set<string>();
    initialBlogs.forEach(b => {
      // If a country is selected, only show cities in that country
      if (selectedCountry !== 'All' && b.country !== selectedCountry) return;
      if (b.city && b.city.trim() !== '') {
        list.add(b.city.trim());
      }
    });
    return ['All', ...Array.from(list)];
  }, [initialBlogs, selectedCountry]);

  // Normalize Vietnamese tones for search
  const removeVietnameseTones = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  };

  // Filter logic
  const filteredBlogs = useMemo(() => {
    return initialBlogs.filter(blog => {
      // 1. Search Query
      const titleNorm = removeVietnameseTones(blog.title);
      const excerptNorm = removeVietnameseTones(blog.excerpt || '');
      const tagsNorm = blog.tags.map(tag => removeVietnameseTones(tag));
      const queryNorm = removeVietnameseTones(searchQuery);

      const matchesSearch = 
        searchQuery.trim() === '' || 
        titleNorm.includes(queryNorm) || 
        excerptNorm.includes(queryNorm) ||
        tagsNorm.some(t => t.includes(queryNorm));

      if (!matchesSearch) return false;

      // 2. Country filter
      if (selectedCountry !== 'All' && blog.country !== selectedCountry) {
        return false;
      }

      // 3. City filter
      if (selectedCity !== 'All' && blog.city !== selectedCity) {
        return false;
      }

      // 4. Type filter
      if (selectedType !== 'All') {
        const titleLower = blog.title.toLowerCase();
        const excerptLower = blog.excerpt.toLowerCase();
        const tagsLower = blog.tags.map(t => t.toLowerCase());

        switch (selectedType) {
          case 'Visa':
            const hasVisaWord = titleLower.includes('visa') || excerptLower.includes('visa') || tagsLower.includes('visa');
            if (!hasVisaWord) return false;
            break;
          case 'KinhNghiem':
            const isKinhNghiem = 
              blog.categoryId === 'cam-nang-du-lich' || 
              titleLower.includes('kinh nghiệm') || 
              excerptLower.includes('kinh nghiệm') || 
              tagsLower.some(t => t.includes('kinh nghiệm'));
            if (!isKinhNghiem) return false;
            break;
          case 'AmThuc':
            const isAmThuc = 
              blog.categoryId === 'kinh-nghiem-an-uong' || 
              titleLower.includes('ẩm thực') || titleLower.includes('ăn uống') || 
              excerptLower.includes('ẩm thực') || excerptLower.includes('ăn uống') ||
              tagsLower.some(t => t.includes('ẩm thực') || t.includes('ăn uống'));
            if (!isAmThuc) return false;
            break;
          case 'TourNoiBat':
            if (!blog.hasTours) return false;
            break;
          case 'MeoDuLich':
            const isMeo = 
              blog.categoryId === 'cam-nang-tu-tuc' || 
              titleLower.includes('mẹo') || titleLower.includes('bí quyết') || 
              excerptLower.includes('mẹo') || excerptLower.includes('bí quyết') ||
              tagsLower.some(t => t.includes('mẹo') || t.includes('bí quyết'));
            if (!isMeo) return false;
            break;
        }
      }

      return true;
    });
  }, [initialBlogs, searchQuery, selectedType, selectedCountry, selectedCity]);

  // Featured Post: latest premium post on first page
  const isDefaultView = currentPage === 1 && searchQuery.trim() === '' && selectedType === 'All' && selectedCountry === 'All';
  const hasFeatured = isDefaultView && filteredBlogs.length > 0;
  
  const featuredPost = hasFeatured ? filteredBlogs[0] : null;
  const displayList = hasFeatured ? filteredBlogs.slice(1) : filteredBlogs;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(displayList.length / itemsPerPage));
  const paginatedPosts = displayList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 10-second Promo Popup Timer
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    // Set 3 seconds timer
    const timer = setTimeout(() => {
      setShowPromo(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Context-aware matched tour logic (related to user's browsing country)
  const matchedTour = useMemo(() => {
    if (!initialTours || initialTours.length === 0) return null;

    // 1. Match selected country filter
    if (selectedCountry !== 'All') {
      const targetCountry = selectedCountry.toLowerCase();
      const filtered = initialTours.filter(t => 
        t.destination.toLowerCase().includes(targetCountry) || 
        t.title.toLowerCase().includes(targetCountry)
      );
      if (filtered.length > 0) return filtered[0];
    }

    // 2. Match country of featured post or first post on screen
    const currentPostCountry = featuredPost?.country || paginatedPosts[0]?.country;
    if (currentPostCountry) {
      const targetCountry = currentPostCountry.toLowerCase();
      const filtered = initialTours.filter(t => 
        t.destination.toLowerCase().includes(targetCountry) || 
        t.title.toLowerCase().includes(targetCountry)
      );
      if (filtered.length > 0) return filtered[0];
    }

    // 3. Fallback to first available tour
    return initialTours[0];
  }, [initialTours, selectedCountry, featuredPost, paginatedPosts]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedCountry('All');
    setSelectedCity('All');
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.magazineLabel}>Premium Travel Journal</span>
        <h1>CẨM NANG DU LỊCH</h1>
        <p>Hành trình tìm kiếm cảm hứng, chia sẻ những bí quyết độc quyền, ẩm thực bản địa và cẩm nang sống động từ các chuyên gia du lịch.</p>
      </header>

      {/* Advanced Filter Panel */}
      <div className={styles.magazineFilterPanel}>
        <div className={styles.filterSectionRow}>
          {/* Realtime Search */}
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm cẩm nang, thẻ, quốc gia..."
              className={styles.searchInputCustom}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Selectors for Country & City */}
          <div className={styles.selectorGroup}>
            <div className={styles.selectorWrapper}>
              <label>Quốc gia</label>
              <select 
                value={selectedCountry} 
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedCity('All'); // Reset city on country change
                  setCurrentPage(1);
                }}
              >
                <option value="All">Tất cả quốc gia</option>
                {countries.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className={styles.selectorWrapper}>
              <label>Thành phố</label>
              <select 
                value={selectedCity} 
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">Tất cả thành phố</option>
                {cities.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Categories Pills */}
        <div className={styles.typeFilterContainer}>
          <div className={styles.pillsLabel}>Loại bài viết:</div>
          <div className={styles.pills}>
            {[
              { id: 'All', label: 'Tất cả' },
              { id: 'KinhNghiem', label: '⭐ Kinh nghiệm du lịch' },
              { id: 'Visa', label: '🛂 Thông tin Visa' },
              { id: 'AmThuc', label: '🍽️ Ẩm thực & Nhà hàng' },
              { id: 'TourNoiBat', label: '🔥 Tour nổi bật' },
              { id: 'MeoDuLich', label: '💡 Mẹo du lịch hay' }
            ].map(type => (
              <button
                key={type.id}
                className={`${styles.pillBtn} ${selectedType === type.id ? styles.activePillBtn : ''}`}
                onClick={() => {
                  setSelectedType(type.id);
                  setCurrentPage(1);
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Highlight Card */}
      {featuredPost && (
        <div className={styles.featuredSection}>
          <Link href={`/cam-nang/${featuredPost.slug}`} className={styles.featuredCard}>
            <div 
              className={styles.featuredImage} 
              style={{ backgroundImage: `url(${featuredPost.thumbnail})` }}
            >
              {featuredPost.hasTours && <span className={styles.featuredBadgeTour}>🔥 ĐẶT TOUR NGAY</span>}
            </div>
            <div className={styles.featuredContent}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={styles.badge}>{featuredPost.category}</span>
                {featuredPost.country && <span className={styles.countryBadge}>📍 {featuredPost.country}</span>}
              </div>
              <h2>{featuredPost.title}</h2>
              <p>{featuredPost.excerpt}</p>
              <div className={styles.metaInfo}>
                <span>📅 {new Date(featuredPost.publishedDate).toLocaleDateString('vi-VN')}</span>
                <span>•</span>
                <span>⏱️ {featuredPost.readTime} phút đọc</span>
                <span>•</span>
                <span>👁️ {featuredPost.views} lượt xem</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Articles Grid */}
      {paginatedPosts.length === 0 ? (
        <div className={styles.noResults}>
          <p>Không tìm thấy bài viết nào phù hợp với bộ lọc của bạn.</p>
          <button onClick={resetFilters} className={styles.resetBtn}>Xóa tất cả bộ lọc</button>
        </div>
      ) : (
        <>
          <div className={styles.blogGrid}>
            {paginatedPosts.map(post => (
              <Link href={`/cam-nang/${post.slug}`} key={post.id} className={styles.blogCard}>
                <div className={styles.cardImageWrapper}>
                  <div 
                    className={styles.cardImage} 
                    style={{ backgroundImage: `url(${post.thumbnail})` }}
                  />
                  {post.hasTours && <span className={styles.cardBadgeTour}>Đính kèm Tour</span>}
                </div>
                <div className={styles.cardContent}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span className={styles.badge}>{post.category}</span>
                    {post.country && <span className={styles.countryBadge}>📍 {post.country}</span>}
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  
                  <div className={styles.cardFooter}>
                    <div className={styles.metaInfo}>
                      <span>📅 {new Date(post.publishedDate).toLocaleDateString('vi-VN')}</span>
                      <span>•</span>
                      <span>⏱️ {post.readTime} phút</span>
                      <span>•</span>
                      <span>👁️ {post.views} lượt xem</span>
                    </div>
                    <span className={styles.readMoreBtn}>Đọc bài →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  className={`${styles.pageBtn} ${currentPage === idx + 1 ? styles.activePageBtn : ''}`}
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          )}
        </>
      )}

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
