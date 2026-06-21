'use client';

import React, { useState, useEffect } from 'react';
import styles from './BackToTop.module.css';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger on mount in case page is already scrolled
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button 
      className={`${styles.backToTop} ${isVisible ? styles.backToTopVisible : ''}`}
      onClick={handleScrollToTop}
      title="Quay lại đầu trang"
      aria-label="Back to Top"
      type="button"
    >
      <span className={styles.backToTopIcon}>▲</span>
    </button>
  );
}
