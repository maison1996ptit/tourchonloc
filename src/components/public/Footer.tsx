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
                <a href={settings.socialLinks.zalo} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'white', color: '#0068FF', padding: '8px 20px', borderRadius: '24px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px', transition: 'all 0.3s ease', border: '1px solid #0068FF', boxShadow: '0 4px 6px rgba(0, 104, 255, 0.1)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                    <path d="M21.822 10.28c0-5.674-4.885-10.28-10.91-10.28C4.887 0 0 4.606 0 10.28c0 3.197 1.554 6.064 3.992 7.952.127.098.204.254.195.412l-.248 3.55c-.062.88 1.05 1.353 1.705.726l3.968-3.79c.148-.142.348-.204.55-.168.895.158 1.826.242 2.75.242 6.025 0 10.91-4.606 10.91-10.28z" fill="#0068FF"/>
                    <path d="M7.74 13.91H5.454v-5.26h3.454c.732 0 1.312.585 1.312 1.306v.294c0 .72-.58 1.305-1.312 1.305H7.74v2.355zm2.986 0c0 1.258.98 2.278 2.193 2.278 1.213 0 2.193-1.02 2.193-2.278V8.65h-4.386v5.26zm6.262 0h-2.193V8.65h2.193v5.26zm3.567-2.982c0-1.258-.98-2.278-2.193-2.278-1.213 0-2.193 1.02-2.193 2.278v.294c0 1.258.98 2.278 2.193 2.278 1.213 0 2.193-1.02 2.193-2.278v-.294z" fill="white"/>
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
