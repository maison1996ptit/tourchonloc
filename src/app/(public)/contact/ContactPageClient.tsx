'use client';

import React from 'react';
import { SiteSettings } from '@/types/siteSettings';
import InquiryForm from '@/components/public/InquiryForm';
import styles from './contact.module.css';
import { useLanguage } from '@/hooks/useLanguage';

interface ContactPageClientProps {
  settings: SiteSettings;
}

export default function ContactPageClient({ settings }: ContactPageClientProps) {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>{t('contact.header_title')}</h1>
        <p>{t('contact.header_subtitle')}</p>
      </header>

      <div className={styles.grid}>
        <div className={styles.contactInfo}>
          <section className={styles.infoSection}>
            <h3>{t('contact.offices')}</h3>
            {settings.contactInfo.officeAddresses.map((addr, i) => (
              <p key={i}>📍 {addr}</p>
            ))}
          </section>

          <section className={styles.infoSection}>
            <h3>{t('contact.email')}</h3>
            {settings.contactInfo.email.map((email, i) => (
              <p key={i}>✉️ <a href={`mailto:${email}`}>{email}</a></p>
            ))}
          </section>

          <section className={styles.infoSection}>
            <h3>{t('contact.call')}</h3>
            {settings.contactInfo.phone.map((phone, i) => (
              <p key={i}>📞 <a href={`tel:${phone}`}>{phone}</a></p>
            ))}
          </section>

          <section className={styles.infoSection}>
            <h3>{t('contact.follow')}</h3>
            <div className={styles.socials}>
              {settings.socialLinks.facebook && <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}
              {settings.socialLinks.instagram && <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
              {settings.socialLinks.twitter && <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>}
            </div>
          </section>
        </div>

        <div className={styles.formWrapper}>
          <h3>{t('contact.send_message')}</h3>
          <p>{t('contact.form_desc')}</p>
          <InquiryForm source="Customize Trip" />
        </div>
      </div>
    </div>
  );
}
