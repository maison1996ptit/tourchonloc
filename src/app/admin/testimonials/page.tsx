'use client';

import React, { useState, useEffect } from 'react';
import { testimonialService } from '@/services/testimonialService';
import { Testimonial } from '@/types/testimonial';
import styles from '../tours/tours.module.css';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await testimonialService.getTestimonials();
        setTestimonials(data);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      const result = await testimonialService.deleteTestimonial(id);
      if (result.success) {
        setTestimonials(testimonials.filter(t => t.id !== id));
      } else {
        alert('Failed to delete testimonial');
      }
    }
  };

  if (loading) return <div>Loading testimonials...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Testimonials</h1>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Country</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map(t => (
              <tr key={t.id}>
                <td>
                  <strong>{t.customerName}</strong><br />
                  <small>{t.content.substring(0, 50)}...</small>
                </td>
                <td>{t.country}</td>
                <td>{'⭐'.repeat(t.rating)}</td>
                <td>{t.status}</td>
                <td className={styles.actions}>
                  <button onClick={() => handleDelete(t.id)} className={styles.deleteBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
