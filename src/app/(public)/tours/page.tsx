'use client';

import React, { useEffect, useState } from 'react';
import { tourService } from '@/services/tourService';
import { Tour } from '@/types/tour';
import Link from 'next/link';
import styles from './tours-list.module.css';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

function ToursList() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: '',
    destination: '',
    search: initialSearch
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchTours = async () => {
      const data = await tourService.getTours();
      setTours(data.filter(t => t.status === 'Published'));
      setLoading(false);
    };
    fetchTours();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter.category, filter.destination, filter.search]);

  const categories = Array.from(new Set(tours.map(t => t.category)));
  const destinations = Array.from(new Set(tours.map(t => t.destination)));

  const filteredTours = tours.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(filter.search.toLowerCase()) || 
                          t.destination.toLowerCase().includes(filter.search.toLowerCase());
    return matchesSearch &&
           (filter.category === '' || t.category === filter.category) &&
           (filter.destination === '' || t.destination === filter.destination);
  });

  const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
  const paginatedTours = filteredTours.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className={styles.loading}>{t('common.loading')}</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>{t('tours.header_title')}</h1>
        <p>{t('tours.header_subtitle')}</p>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label>{t('common.search')}</label>
          <input 
            type="text"
            placeholder={t('tours.search_placeholder')}
            value={filter.search}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <label>{t('common.category')}</label>
          <select 
            value={filter.category} 
            onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="">{t('tours.all_categories')}</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>{t('common.destination')}</label>
          <select 
            value={filter.destination} 
            onChange={(e) => setFilter(prev => ({ ...prev, destination: e.target.value }))}
          >
            <option value="">{t('tours.all_destinations')}</option>
            {destinations.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.tourGrid}>
        {paginatedTours.map(tour => (
          <div key={tour.id} className={styles.tourCard}>
            <div 
              className={styles.tourImage} 
              style={{ backgroundImage: `url(${tour.featuredImage})` }}
            >
              <div className={styles.overlay}>
                <span className={styles.categoryTag}>{tour.category}</span>
              </div>
            </div>
            <div className={styles.tourInfo}>
              <h3>{tour.title}</h3>
              <p className={styles.destination}>{tour.destination} • {tour.durationDays} {t('common.days')}</p>
              <p className={styles.shortDesc}>{tour.shortDescription}</p>
              <div className={styles.cardFooter}>
                <div className={styles.miniBadge}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="15.5" cy="15.5" r="2.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                  <span>
                    {tour.departureDates && tour.departureDates.length > 0 
                      ? `${tour.departureDates[0]}`
                      : t('common.book_now')}
                  </span>
                </div>
                <Link href={`/tours/${tour.slug}`} className={styles.viewBtn}>{t('common.view_details')} →</Link>
              </div>
              <div className={styles.priceContainer}>
                <span className={styles.priceFrom}>{t('common.from')}</span>
                <span className={styles.priceAmount}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.priceFrom)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            {t('common.showing')} <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> - <strong>{Math.min(currentPage * itemsPerPage, filteredTours.length)}</strong> {t('common.of')} <strong>{filteredTours.length}</strong> {t('common.results')}
          </div>
          <div className={styles.paginationControls}>
            <button 
              disabled={currentPage === 1} 
              onClick={() => {
                setCurrentPage(p => p - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={styles.pageBtn}
            >
              ← {t('common.previous')}
            </button>
            <div className={styles.pageNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page} 
                  onClick={() => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`${styles.pageNumber} ${currentPage === page ? styles.activePage : ''}`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => {
                setCurrentPage(p => p + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={styles.pageBtn}
            >
              {t('common.next')} →
            </button>
          </div>
        </div>
      )}

      {filteredTours.length === 0 && (
        <div className={styles.noResults}>
          <p>{t('tours.no_results')}</p>
        </div>
      )}
    </div>
  );
}

export default function ToursPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div>{t('common.loading')}</div>}>
      <ToursList />
    </Suspense>
  );
}

