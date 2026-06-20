'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';
import { useLanguage } from '@/hooks/useLanguage';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: t('nav.dashboard'), path: '/admin/dashboard', icon: '📊' },
    { label: t('common.tours'), path: '/admin/tours', icon: '✈️' },
    { label: t('common.blogs'), path: '/admin/blogs', icon: '📝' },
    { label: 'Quản lý Memo', path: '/admin/memos', icon: '💡' },
    { label: 'Quản lý Cẩm Nang', path: '/admin/guides', icon: '📖' },
    { label: t('nav.leads'), path: '/admin/leads', icon: '🤝' },
    { label: t('nav.testimonials'), path: '/admin/testimonials', icon: '⭐' },
    { label: t('nav.visas'), path: '/admin/visas', icon: '🛂' },
    { label: t('nav.theme'), path: '/admin/theme', icon: '🎨' },
    { label: t('nav.settings'), path: '/admin/site-settings', icon: '⚙️' },
    { label: t('nav.users'), path: '/admin/users', icon: '👥' },
    { label: t('nav.audit_logs'), path: '/admin/audit-logs', icon: '📋' },
  ];

  useEffect(() => {
    if (!loading && user) {
      const restrictedForEditor = ['/admin/theme', '/admin/site-settings', '/admin/users', '/admin/audit-logs'];
      if (user.role === 'Editor' && restrictedForEditor.some(path => pathname.startsWith(path))) {
        alert(t('admin.access_denied'));
        router.push('/admin/dashboard');
      }
    }
    if (!loading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, loading, pathname, router, t]);

  if (loading) {
    return <div className={styles.loading}>{t('common.loading')}</div>;
  }

  if (!user && pathname !== '/admin/login') {
    return null;
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <h2>{t('nav.admin_cms')}</h2>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const restrictedForEditor = ['/admin/theme', '/admin/site-settings', '/admin/users', '/admin/audit-logs'];
            if (user?.role === 'Editor' && restrictedForEditor.includes(item.path)) {
              return null;
            }
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`${styles.navItem} ${pathname.startsWith(item.path) ? styles.active : ''}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <p>{user?.name}</p>
            <span>{user?.role}</span>
          </div>
          <button onClick={logout} className={styles.logoutBtn}>{t('nav.logout')}</button>
        </div>
      </aside>
      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}>
            Quản trị / <span>{pathname.split('/').pop()?.replace('-', ' ')}</span>
          </div>
          <div className={styles.topbarActions}>
            <Link href="/" target="_blank" className={styles.previewBtn}>
              <span style={{fontSize: '1.2rem'}}>🌐</span> Xem Website
            </Link>
          </div>
        </header>
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
}

