'use client';

import React, { useEffect, useState } from 'react';
import { blogService } from '@/services/blogService';
import { Blog } from '@/types/blog';
import styles from './blog-detail.module.css';
import Link from 'next/link';
import TourPopup from '@/components/shared/TourPopup';

interface BlogDetailClientProps {
  initialBlog: Blog | null;
}

export default function BlogDetailClient({ initialBlog }: BlogDetailClientProps) {
  const [blog, setBlog] = useState<Blog | null>(initialBlog);
  const [loading, setLoading] = useState(!initialBlog);

  useEffect(() => {
    if (initialBlog) {
      setBlog(initialBlog);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [initialBlog]);

  if (loading) return <div className={styles.loading}>Loading story...</div>;
  if (!blog) return <div className={styles.error}>Blog post not found. <Link href="/blogs">Back to blog</Link></div>;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "image": blog.thumbnail,
    "datePublished": blog.publishedDate,
    "dateModified": blog.updatedAt || blog.publishedDate,
    "description": blog.excerpt,
    "author": {
      "@type": "Person",
      "name": blog.author || "TravelApp Specialist"
    }
  };

  return (
    <article className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <header className={styles.header}>
        <Link href="/blogs" className={styles.backLink}>← Back to Blog</Link>
        <div className={styles.meta}>
          <span className={styles.category}>{blog.category || blog.categoryId}</span>
          <span className={styles.divider}>•</span>
          <span className={styles.date}>{new Date(blog.publishedDate).toLocaleDateString('vi-VN')}</span>
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
