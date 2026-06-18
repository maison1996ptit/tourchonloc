'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { siteSettingsService } from '@/services/siteSettingsService';
import { menuService } from '@/services/menuService';
import { SiteSettings } from '@/types/siteSettings';
import { MenuItem } from '@/types/menu';
import styles from './public-shared.module.css';
import { useLanguage } from '@/hooks/useLanguage';
import Link from 'next/link';

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [footerMenu, setFooterMenu] = useState<MenuItem[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      const [s, m] = await Promise.all([
        siteSettingsService.getSettings(),
        menuService.getMenus()
      ]);
      setSettings(s);
      setFooterMenu(m.footer);
    };
    fetchData();
  }, []);

  if (!settings) return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerGrid}>
          <div>
            <div className={styles.footerLogoContainer}>
              <Image 
                src="/logo.svg" 
                alt={settings.websiteName} 
                width={50} 
                height={50} 
                className={styles.footerLogo}
              />
              <h3 style={{ margin: 0 }}>{settings.websiteName}</h3>
            </div>
            <p>{settings.footerDescription}</p>
          </div>
          <div>
            <h3>{t('footer.contact_info')}</h3>
            <p>Email: {settings.contactInfo.email[0]}</p>
            <p>Phone: {settings.contactInfo.phone[0]}</p>
            <p>Address: {settings.contactInfo.officeAddresses[0]}</p>
          </div>
          <div>
            <h3>{t('footer.quick_links')}</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
              {footerMenu.map(item => (
                <li key={item.id} style={{ marginBottom: '8px' }}>
                  <Link href={item.url} style={{ color: '#a0aec0', textDecoration: 'none' }}>{item.label}</Link>
                </li>
              ))}
            </ul>
            <div className={styles.socials}>
              {settings.socialLinks.zalo && (
                <a href={settings.socialLinks.zalo} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#0068FF', color: 'white', padding: '10px 20px', borderRadius: '24px', textDecoration: 'none', fontWeight: '600', fontSize: '15px', transition: 'all 0.3s ease', boxShadow: '0 4px 10px rgba(0, 104, 255, 0.2)' }}>
                  <svg width="22" height="22" viewBox="0 0 460.1 436.01" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                    <path d="M460.1 202.04c0-111.45-103.01-202.04-230.05-202.04C102.93 0 0 90.59 0 202.04c0 62.77 32.55 119.5 86.6 156.97 1.55 1.09 2.58 2.8 2.76 4.7l4.02 44.29c1.65 18.06 20.88 28.53 36.87 20.08l52.12-27.68c1.64-.87 3.51-.95 5.2-.23 13.56 5.8 28 8.87 42.48 8.87 127.04 0 230.05-90.59 230.05-202.04z" fill="#0068FF"/>
                    <path d="M127.52 144.38h32.1v96.65c0 14.88-12.06 26.94-26.94 26.94h-10.42c-12.82 0-23.22-10.4-23.22-23.22V144.38h28.48zm120.35 120.47c-26.65 0-48.24-21.6-48.24-48.24v-.48c0-26.65 21.6-48.24 48.24-48.24 26.65 0 48.24 21.6 48.24 48.24v.48c0 26.64-21.59 48.24-48.24 48.24zm0-24.84c12.92 0 23.4-10.48 23.4-23.4v-.48c0-12.92-10.48-23.4-23.4-23.4-12.92 0-23.4 10.48-23.4 23.4v.48c0 12.92 10.48 23.4 23.4 23.4zm76.53-70.79H354.3v96.65c0 12.82-10.4 23.22-23.22 23.22h-6.68c-12.82 0-23.22-10.4-23.22-23.22v-96.65h23.22zm44.25-11.45c8.66 0 15.68 7.02 15.68 15.68s-7.02 15.68-15.68 15.68-15.68-7.02-15.68-15.68 7.02-15.68 15.68-15.68zm55.33 107.08c-26.65 0-48.24-21.6-48.24-48.24v-.48c0-26.65 21.6-48.24 48.24-48.24 26.65 0 48.24 21.6 48.24 48.24v.48c0 26.64-21.59 48.24-48.24 48.24zm0-24.84c12.92 0 23.4-10.48 23.4-23.4v-.48c0-12.92-10.48-23.4-23.4-23.4-12.92 0-23.4 10.48-23.4 23.4v.48c0 12.92 10.48 23.4 23.4 23.4z" fill="white"/>
                  </svg>
                  <span>Chat Zalo</span>
                </a>
              )}
            </div>
          </div>
        </div>
        <div style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid #2d3748', paddingTop: '20px', color: '#718096', fontSize: '0.875rem' }}>
          &copy; {new Date().getFullYear()} {settings.websiteName}. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
