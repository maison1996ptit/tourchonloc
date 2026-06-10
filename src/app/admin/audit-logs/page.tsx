'use client';

import React, { useEffect, useState } from 'react';
import { auditLogService } from '@/services/auditLogService';
import { AuditLog } from '@/types/auditLog';
import styles from '../tours/tours.module.css';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchLogs = async () => {
      try {
        const data = await auditLogService.getAuditLogs();
        setLogs(data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div>Loading audit logs...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Audit Logs</h1>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>
                  <small>
                    {mounted ? new Date(log.time).toLocaleString() : '...'}
                  </small>
                </td>
                <td>{log.userName}</td>
                <td><strong>{log.action}</strong></td>
                <td>{log.entityType}: {log.entityName}</td>
                <td>{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
