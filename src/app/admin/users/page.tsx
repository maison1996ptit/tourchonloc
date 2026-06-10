'use client';

import React, { useState, useEffect } from 'react';
import { getUsers } from '@/actions/authActions';
import { User } from '@/types/user';
import styles from '../tours/tours.module.css';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const toggleStatus = (id: string) => {
    // In a real app, this should call a server action
    setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>User Management</h1>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <span className={`${styles.statusTag} ${u.isActive ? styles.published : styles.draft}`}>
                    {u.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className={styles.actions}>
                  <button onClick={() => toggleStatus(u.id)} className={styles.editBtn}>
                    {u.isActive ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
