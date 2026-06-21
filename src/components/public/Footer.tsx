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
              <img 
                src="/logo.png?v=2" 
                alt={settings.websiteName} 
                className={styles.footerLogo}
                style={{ width: 'auto', height: '50px', objectFit: 'contain' }}
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
                <a href={settings.socialLinks.zalo} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <img src="/zalo.png" alt="Zalo" width="32" height="32" style={{ display: 'block' }} />
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
