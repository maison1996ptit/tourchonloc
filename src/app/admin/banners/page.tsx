'use client';

import React from 'react';
import styles from '../tours/tours.module.css';

export default function BannersPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Banner / Hero Management</h1>
      </div>
      
      <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px' }}>
        <p>Hero banner settings are currently managed in <a href="/admin/site-settings" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Site Settings</a>.</p>
        <p style={{ marginTop: '20px', color: '#666' }}>Additional banner slider management will be implemented here.</p>
      </div>
    </div>
  );
}
