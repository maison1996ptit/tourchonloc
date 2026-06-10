'use client';

import React, { useEffect, useState } from 'react';
import { blogService } from '@/services/blogService';
import { Blog } from '@/types/blog';
import Link from 'next/link';
import styles from '../tours/tours.module.css'; // Reusing tour list styles

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const fetchBlogs = async () => {
      const data = await blogService.getBlogs();
      setBlogs(data);
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      const result = await blogService.deleteBlog(id) as any;
      if (result.success) {
        setBlogs(blogs.filter(b => b.id !== id));
      }
    }
  };

  if (loading) return <div>Loading blogs...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Blog Management</h1>
        <Link href="/admin/blogs/create" className={styles.createBtn}>Create New Post</Link>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Published Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map(blog => (
              <tr key={blog.id}>
                <td><strong>{blog.title}</strong></td>
                <td>{blog.categoryId}</td>
                <td>{mounted ? blog.publishedDate : '...'}</td>
                <td>
                  <span className={`${styles.statusTag} ${styles[blog.status.toLowerCase()]}`}>
                    {blog.status}
                  </span>
                </td>
                <td className={styles.actions}>
                  <Link href={`/admin/blogs/${blog.id}/edit`} className={styles.editBtn}>Edit</Link>
                  <button onClick={() => handleDelete(blog.id)} className={styles.deleteBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
