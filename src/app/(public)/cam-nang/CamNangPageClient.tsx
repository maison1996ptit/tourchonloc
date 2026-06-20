'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Blog } from '@/types/blog';
import styles from './blogs.module.css';
import { useLanguage } from '@/hooks/useLanguage';

interface BlogsPageClientProps {
  initialBlogs: Blog[];
}

export default function BlogsPageClient({ initialBlogs }: BlogsPageClientProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;



  // Extract unique categories dynamically from database articles
  const categories = ['All', ...Array.from(new Set(initialBlogs.map(b => b.category).filter((c): c is string => !!c)))];

  const removeVietnameseTones = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  };

  // Filter logic
  const filteredBlogs = initialBlogs.filter(blog => {
    const matchesCategory = activeCategory === 'All' || blog.category === activeCategory;
    const titleNormalized = removeVietnameseTones(blog.title);
    const excerptNormalized = removeVietnameseTones(blog.excerpt || '');
    const queryNormalized = removeVietnameseTones(searchQuery);
    const matchesSearch = titleNormalized.includes(queryNormalized) || excerptNormalized.includes(queryNormalized);
    return matchesCategory && matchesSearch;
  });

  // Featured Post Logic: Show the latest post as featured only on the first page when no search/category filter is active
  const isDefaultView = currentPage === 1 && searchQuery.trim() === '' && activeCategory === 'All';
  const hasFeatured = isDefaultView && filteredBlogs.length > 0;
  
  const featuredPost = hasFeatured ? filteredBlogs[0] : null;
  const displayList = hasFeatured ? filteredBlogs.slice(1) : filteredBlogs;

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(displayList.length / itemsPerPage));
  const paginatedPosts = displayList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>{t('blogs.header_title')}</h1>
        <p>Cảm hứng, câu chuyện, cẩm nang và những tin tức mới nhất về hành trình khám phá thế giới của chúng tôi.</p>
      </header>

      {/* Search and Filters */}
      <div className={styles.searchAndFilter}>
        <div className={styles.tabs}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.tab} ${activeCategory === cat ? styles.activeTab : ''}`}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
            >
              {cat === 'All' ? 'Tất cả bài viết' : cat}
            </button>
          ))}
        </div>

        <div className={styles.searchContainer}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Featured Highlight Card */}
      {featuredPost && (
        <div className={styles.featuredSection}>
          <Link href={`/cam-nang/${featuredPost.slug}`} className={styles.featuredCard}>
            <div 
              className={styles.featuredImage} 
              style={{ backgroundImage: `url(${featuredPost.thumbnail})` }}
            />
            <div className={styles.featuredContent}>
              {featuredPost.category && (
                <span className={styles.badge}>{featuredPost.category}</span>
              )}
              <h2>{featuredPost.title}</h2>
              <p>{featuredPost.excerpt}</p>
              <div className={styles.metaInfo}>
                <span>✍️ {featuredPost.author || 'TravelApp Specialist'}</span>
                <span>•</span>
                <span>📅 {new Date(featuredPost.publishedDate).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Articles Grid */}
      {paginatedPosts.length === 0 ? (
        <div className={styles.noResults}>
          Không tìm thấy bài viết nào phù hợp với từ khóa của bạn.
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
                </div>
                <div className={styles.cardContent}>
                  {post.category && (
                    <span className={styles.badge}>{post.category}</span>
                  )}
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div className={styles.metaInfo}>
                      <span>📅 {new Date(post.publishedDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <span className={styles.readMoreBtn}>Đọc tiếp →</span>
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
    </div>
  );
}
