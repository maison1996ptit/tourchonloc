'use client';

import React from 'react';
import styles from './ArticleSidebar.module.css';

interface ArticleSidebarProps {
  children: React.ReactNode;
}

export default function ArticleSidebar({ children }: ArticleSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarSticky}>
        {children}
      </div>
    </aside>
  );
}
