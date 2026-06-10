'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { blogService } from '@/services/blogService';
import { Blog } from '@/types/blog';
import styles from './blog-detail.module.css';
import Link from 'next/link';
import TourPopup from '@/components/shared/TourPopup';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (typeof slug === 'string') {
        const data = await blogService.getBlogBySlug(slug);
        setBlog(data || null);
      }
      setLoading(false);
    };
    fetchBlog();
  }, [slug]);

  if (loading) return <div className={styles.loading}>Loading story...</div>;
  if (!blog) return <div className={styles.error}>Blog post not found. <Link href="/blogs">Back to blog</Link></div>;

  return (
    <article className={styles.container}>
      <header className={styles.header}>
        <Link href="/blogs" className={styles.backLink}>← Back to Blog</Link>
        <div className={styles.meta}>
          <span className={styles.category}>{blog.categoryId}</span>
          <span className={styles.divider}>•</span>
          <span className={styles.date}>{new Date(blog.publishedDate).toLocaleDateString()}</span>
        </div>
        <h1>{blog.title}</h1>
      </header>

      <div 
        className={styles.hero} 
        style={{ backgroundImage: `url(${blog.thumbnail})` }}
      />

      <div className={styles.content}>
        <div className={styles.excerpt}>
          {blog.excerpt}
        </div>
        <div 
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: blog.content }} 
        />
      </div>

      <footer className={styles.footer}>
        <div className={styles.tags}>
          {blog.tags.map(tag => (
            <span key={tag} className={styles.tag}>#{tag}</span>
          ))}
        </div>
        <div className={styles.share}>
          <h3>Share this story</h3>
          <div className={styles.shareBtns}>
            <button className={styles.shareBtn}>Facebook</button>
            <button className={styles.shareBtn}>Twitter</button>
          </div>
        </div>
      </footer>

      <TourPopup delayMs={5000} />
    </article>
  );
}
