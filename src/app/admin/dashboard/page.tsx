'use client';

import React, { useEffect, useState } from 'react';
import { tourService } from '@/services/tourService';
import { blogService } from '@/services/blogService';
import { leadService } from '@/services/leadService';
import { Lead } from '@/types/lead';
import { Tour } from '@/types/tour';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    tours: 0,
    blogs: 0,
    leads: 0,
    testimonials: 1 // mock
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentTours, setRecentTours] = useState<Tour[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const fetchStats = async () => {
      const toursData = await tourService.getTours();
      const leadsData = await leadService.getLeads();
      
      let guidesCount = 0;
      try {
        const guidesRes = await fetch('/api/guides?status=All');
        if (guidesRes.ok) {
          const result = await guidesRes.json();
          guidesCount = result.data?.length || 0;
        }
      } catch (err) {
        console.error('Error fetching guides for dashboard stats:', err);
      }

      setStats({
        tours: toursData.length,
        blogs: guidesCount,
        leads: leadsData.length,
        testimonials: 1
      });
      setRecentLeads(leadsData.slice(0, 5));
      setRecentTours(toursData.slice(0, 5));
    };
    fetchStats();
  }, []);

  return (
    <div className={styles.dashboard}>
      <h1>Dashboard Overview</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>🚀 Total Tours</h3>
          <p className={styles.statNumber}>{stats.tours}</p>
        </div>
        <div className={styles.statCard}>
          <h3>📝 Total Articles</h3>
          <p className={styles.statNumber}>{stats.blogs}</p>
        </div>
        <div className={styles.statCard}>
          <h3>🤝 New Leads</h3>
          <p className={styles.statNumber}>{stats.leads}</p>
        </div>
        <div className={styles.statCard}>
          <h3>⭐ Testimonials</h3>
          <p className={styles.statNumber}>{stats.testimonials}</p>
        </div>
      </div>

      <div className={styles.recentGrid}>
        <div className={styles.recentSection}>
          <h2>Latest Leads <span>🆕</span></h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Customer</th>
                  <th className={styles.th}>Source</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map(lead => (
                  <tr key={lead.id}>
                    <td className={styles.td}>
                      <strong>{lead.fullName}</strong><br/>
                      <small style={{color: '#64748b'}}>{lead.email}</small>
                    </td>
                    <td className={styles.td}>{lead.sourceForm}</td>
                    <td className={styles.td}>
                      <span className={styles[`status${lead.status}`] || styles.statusNew}>
                        {lead.status}
                      </span>
                    </td>
                    <td className={styles.td}>
                      {mounted ? new Date(lead.createdAt).toLocaleDateString('vi-VN') : '...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={styles.recentSection}>
          <h2>Latest Tours <span>✈️</span></h2>
          <div className={styles.list}>
            {recentTours.map(tour => (
              <div key={tour.id} className={styles.listItem}>
                <span>{tour.title}</span>
                <span className={styles.tag}>{tour.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
