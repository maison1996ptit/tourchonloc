'use client';

import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import styles from './language-switcher.module.css';

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useLanguage();

  return (
    <div className={styles.container}>
      <button 
        className={`${styles.button} ${locale === 'vi' ? styles.active : ''}`}
        onClick={() => setLocale('vi')}
        aria-label="Tiếng Việt"
      >
        VI
      </button>
      <span className={styles.divider}>|</span>
      <button 
        className={`${styles.button} ${locale === 'en' ? styles.active : ''}`}
        onClick={() => setLocale('en')}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
