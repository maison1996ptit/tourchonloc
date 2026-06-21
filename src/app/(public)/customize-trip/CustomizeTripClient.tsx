'use client';

import React from 'react';
import InquiryForm from '@/components/public/InquiryForm';
import styles from './customize.module.css';
import { useLanguage } from '@/hooks/useLanguage';

export default function CustomizeTripClient() {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1>{t('customize.header_title')}</h1>
          <p>{t('customize.header_subtitle')}</p>
        </header>

        <div className={styles.benefits}>
          <div className={styles.benefit}>
            <span className={styles.icon}>✨</span>
            <h3>{t('customize.benefit_unique_title')}</h3>
            <p>{t('customize.benefit_unique_desc')}</p>
          </div>
          <div className={styles.benefit}>
            <span className={styles.icon}>🕒</span>
            <h3>{t('customize.benefit_pace_title')}</h3>
            <p>{t('customize.benefit_pace_desc')}</p>
          </div>
          <div className={styles.benefit}>
            <span className={styles.icon}>👩‍💼</span>
            <h3>{t('customize.benefit_expert_title')}</h3>
            <p>{t('customize.benefit_expert_desc')}</p>
          </div>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2>{t('customize.form_title')}</h2>
            <p>{t('customize.form_subtitle')}</p>
          </div>
          <InquiryForm source="Customize Trip" />
        </div>
      </div>
    </div>
  );
}
