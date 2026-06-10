'use client';

import React, { useState, useEffect } from 'react';
import { menuService } from '@/services/menuService';
import { MenuItem } from '@/types/menu';
import styles from '../tours/tours.module.css';

export default function MenusPage() {
  const [headerMenu, setHeaderMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const data = await menuService.getMenus();
        setHeaderMenu(data.header);
      } catch (error) {
        console.error('Error fetching menus:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  const toggleActive = async (id: string) => {
    const item = headerMenu.find(m => m.id === id);
    if (!item) return;

    const newStatus = !item.isActive;
    setHeaderMenu(headerMenu.map(m => m.id === id ? { ...m, isActive: newStatus } : m));
    
    try {
      await menuService.updateMenuItem(id, { isActive: newStatus });
    } catch (error) {
      console.error('Error updating menu item:', error);
      // Revert on error
      setHeaderMenu(headerMenu.map(m => m.id === id ? { ...m, isActive: !newStatus } : m));
    }
  };

  if (loading) return <div>Loading menus...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Menu Management</h1>
      </div>

      <div className={styles.section}>
        <h3>Header Menu</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Label</th>
                <th>URL</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {headerMenu.sort((a,b) => a.order - b.order).map(m => (
                <tr key={m.id}>
                  <td>{m.order}</td>
                  <td><strong>{m.label}</strong></td>
                  <td>{m.url}</td>
                  <td>
                    <span className={`${styles.statusTag} ${m.isActive ? styles.published : styles.draft}`}>
                      {m.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    <button onClick={() => toggleActive(m.id)} className={styles.editBtn}>
                      {m.isActive ? 'Hide' : 'Show'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
