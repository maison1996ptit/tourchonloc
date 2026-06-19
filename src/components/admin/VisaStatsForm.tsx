'use client';

import React, { useState, useEffect } from 'react';
import { getVisaStats, updateVisaStats } from '@/actions/visaActions';
import styles from './AdminComponents.module.css';

interface VisaStats {
  passRate: number;
  successfulClients: number;
  experienceYears: number;
}

export default function VisaStatsForm() {
  const [stats, setStats] = useState<VisaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getVisaStats();
        setStats(data);
      } catch (e: any) {
        setError('Không thể tải chỉ số Visa.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!stats) return;
    const { name, value } = e.target;
    setStats({
      ...stats,
      [name]: value === '' ? '' : Number(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stats) return;

    if (stats.passRate < 0 || stats.successfulClients < 0 || stats.experienceYears < 0) {
      setError('Các chỉ số không được là số âm.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      await updateVisaStats(stats);
      setSuccess('Cập nhật chỉ số thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Lỗi khi cập nhật chỉ số.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className={styles.formContainer}>Đang tải form chỉ số...</div>;
  }

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.subHeader}>Chỉ số Trang Visa</h2>
      <form onSubmit={handleSubmit} className={styles.statsForm}>
        <div className={styles.formGroup}>
          <label htmlFor="passRate">Tỷ lệ đậu (%)</label>
          <input
            type="number"
            id="passRate"
            name="passRate"
            value={stats?.passRate ?? ''}
            onChange={handleChange}
            className={styles.input}
            step="0.1"
            min="0"
            max="100"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="successfulClients">Khách hàng thành công (+)</label>
          <input
            type="number"
            id="successfulClients"
            name="successfulClients"
            value={stats?.successfulClients ?? ''}
            onChange={handleChange}
            className={styles.input}
            min="0"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="experienceYears">Năm kinh nghiệm (+)</label>
          <input
            type="number"
            id="experienceYears"
            name="experienceYears"
            value={stats?.experienceYears ?? ''}
            onChange={handleChange}
            className={styles.input}
            min="0"
            required
          />
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Đang lưu...' : 'Lưu chỉ số'}
          </button>
        </div>
        {error && <p className={styles.errorText}>{error}</p>}
        {success && <p className={styles.successText}>{success}</p>}
      </form>
    </div>
  );
}
