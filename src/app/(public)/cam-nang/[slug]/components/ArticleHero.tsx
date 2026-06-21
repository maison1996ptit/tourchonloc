'use client';

import React from 'react';
import styles from './ArticleHero.module.css';

interface ArticleHeroProps {
  title: string;
  category: string;
  publishedDate: string;
  readTime?: number;
  author: string;
  thumbnail: string;
  excerpt?: string;
}

export default function ArticleHero({
  title,
  category,
  publishedDate,
  readTime = 5,
  author,
  thumbnail,
  excerpt
}: ArticleHeroProps) {
  const formattedDate = new Date(publishedDate).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const handleScrollDown = () => {
    const nextSection = document.getElementById('article-main-layout');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.heroSection}>
      <div 
        className={styles.backgroundImage} 
        style={{ backgroundImage: `url(${thumbnail})` }} 
      />
      <div className={styles.overlay} />
      
      <div className={styles.heroContent}>
        <div className={styles.categoryWrapper}>
          <span className={styles.category}>{category}</span>
        </div>
        
        <h1 className={styles.title}>{title}</h1>
        
        {excerpt && <p className={styles.excerpt}>{excerpt}</p>}
        
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <span className={styles.authorPrefix}>Bởi</span> <strong>{author}</strong>
          </span>
          <span className={styles.separator}>•</span>
          <span className={styles.metaItem}>
            <span>📅</span> {formattedDate}
          </span>
          <span className={styles.separator}>•</span>
          <span className={styles.metaItem}>
            <span>⏱️</span> {readTime} phút đọc
          </span>
        </div>
      </div>

      {/* Elegant scroll indicator */}
      <button 
        className={styles.scrollIndicator} 
        onClick={handleScrollDown}
        aria-label="Cuộn xuống đọc bài viết"
        type="button"
      >
        <span className={styles.scrollText}>Khám phá câu chuyện</span>
        <div className={styles.mouseIcon}>
          <div className={styles.scrollWheel} />
        </div>
      </button>
    </section>
  );
}
