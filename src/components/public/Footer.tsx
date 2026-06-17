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
                src="/logo.png" 
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
                <a href={settings.socialLinks.zalo} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0068FF', color: 'white', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', fontWeight: 'bold' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.5 11.5C21.5 16.1944 17.2464 20 12 20C10.7431 20 9.54413 19.7423 8.44857 19.2785C8.01633 19.0955 7.5146 19.1672 7.12643 19.4678L3.89973 21.965C3.39697 22.3541 2.6685 21.9542 2.7486 21.3283L3.1979 17.8184C3.27878 17.1866 2.97334 16.5683 2.45785 16.177C1.52044 15.4652 0.5 13.5654 0.5 11.5C0.5 6.80558 4.75355 3 10 3C15.2464 3 19.5 6.80558 19.5 11.5Z" fill="white"/>
                  </svg>
                  Zalo
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
