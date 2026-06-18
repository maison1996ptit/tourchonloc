'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './public-shared.module.css';
import { siteSettingsService } from '@/services/siteSettingsService';
import { menuService } from '@/services/menuService';
import { SiteSettings } from '@/types/siteSettings';
import { MenuItem } from '@/types/menu';
import { useLanguage } from '@/hooks/useLanguage';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

export default function Header() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, setLocale } = useLanguage();

  useEffect(() => {
    // Lock app language to Vietnamese only
    setLocale('vi');
  }, [setLocale]);

  useEffect(() => {
    const fetchData = async () => {
      const [s, m] = await Promise.all([
        siteSettingsService.getSettings(),
        menuService.getMenus()
      ]);
      setSettings(s);
      setMenuItems(m.header);
    };
    fetchData();
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link href="/" className={styles.logo}>
          <Image 
            src="/logo.png" 
            alt={settings?.websiteName || 'TravelApp Logo'} 
            width={120} 
            height={120} 
            className={styles.logoImage}
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </Link>
        <div className={styles.navContainer}>
          {/* Desktop Navigation */}
          <nav className={styles.nav}>
            {menuItems.length > 0 ? (
              menuItems.map(item => (
                <Link key={item.id} href={item.url} className={styles.navLink}>
                  {item.label}
                </Link>
              ))
            ) : (
              <>
                <Link href="/" className={styles.navLink}>{t('common.home')}</Link>
                <Link href="/tours" className={styles.navLink}>{t('common.tours')}</Link>
                <Link href="/contact" className={styles.navLink}>{t('common.contact')}</Link>
              </>
            )}
          </nav>

          {/* Hamburger Menu Button */}
          <button 
            className={`${styles.hamburger} ${isMenuOpen ? styles.hamburgerActive : ''}`} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className={styles.hamburgerBar}></span>
            <span className={styles.hamburgerBar}></span>
            <span className={styles.hamburgerBar}></span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`${styles.mobileDrawer} ${isMenuOpen ? styles.drawerActive : ''}`}>
        <nav className={styles.mobileNav}>
          {menuItems.length > 0 ? (
            menuItems.map((item, idx) => (
              <Link 
                key={item.id} 
                href={item.url} 
                className={styles.mobileNavLink}
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))
          ) : (
            <>
              <Link href="/" className={styles.mobileNavLink} style={{ animationDelay: '0.05s' }} onClick={() => setIsMenuOpen(false)}>{t('common.home')}</Link>
              <Link href="/tours" className={styles.mobileNavLink} style={{ animationDelay: '0.1s' }} onClick={() => setIsMenuOpen(false)}>{t('common.tours')}</Link>
              <Link href="/contact" className={styles.mobileNavLink} style={{ animationDelay: '0.15s' }} onClick={() => setIsMenuOpen(false)}>{t('common.contact')}</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
