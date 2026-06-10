'use client';

import React, { useEffect, useState } from 'react';
import { tourService } from '@/services/tourService';
import { Tour } from '@/types/tour';
import Link from 'next/link';
import styles from './tours.module.css';
import BulkImport from '@/components/admin/BulkImport';

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTours = async () => {
    const data = await tourService.getTours();
    setTours(data);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTours();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this tour?')) {
      const result = await tourService.deleteTour(id) as any;
      if (result.success) {
        setTours(tours.filter(t => t.id !== id));
      }
    }
  };

  if (loading) return <div>Loading tours...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Tours Management</h1>
        <Link href="/admin/tours/create" className={styles.createBtn}>Create New Tour</Link>
      </div>

      <BulkImport onSuccess={fetchTours} />

      <div className={styles.filters}>
        <input type="text" placeholder="Search tours..." className={styles.searchInput} />
        <select className={styles.filterSelect}>
          <option value="">All Categories</option>
          <option value="Cultural">Cultural</option>
          <option value="Leisure">Leisure</option>
        </select>
        <select className={styles.filterSelect}>
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Destination</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tours.map(tour => (
              <tr key={tour.id}>
                <td><strong>{tour.title}</strong></td>
                <td>{tour.destination}</td>
                <td>{tour.durationDays}D / {tour.durationNights}N</td>
                <td>${tour.priceFrom}</td>
                <td>
                  <span className={`${styles.statusTag} ${styles[tour.status.toLowerCase()]}`}>
                    {tour.status}
                  </span>
                </td>
                <td className={styles.actions}>
                  <Link href={`/admin/tours/${tour.id}/edit`} className={styles.editBtn}>Edit</Link>
                  <button onClick={() => handleDelete(tour.id)} className={styles.deleteBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
