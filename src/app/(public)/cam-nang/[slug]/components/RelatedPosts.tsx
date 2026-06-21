'use client';

import React from 'react';
import Link from 'next/link';
import styles from './RelatedPosts.module.css';

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  publishedDate: string;
  thumbnail: string;
  excerpt: string;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className={styles.relatedSection}>
      <h3 className={styles.sectionTitle}>Bài viết liên quan cẩm nang</h3>
      <div className={styles.grid}>
        {posts.map((post) => {
          const formattedDate = new Date(post.publishedDate).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });

          return (
            <Link href={`/cam-nang/${post.slug}`} key={post.id} className={styles.card}>
              <div className={styles.thumbWrapper}>
                <div 
                  className={styles.thumbnail} 
                  style={{ backgroundImage: `url(${post.thumbnail})` }}
                />
                <span className={styles.category}>{post.category}</span>
              </div>
              <div className={styles.info}>
                <span className={styles.date}>📅 {formattedDate}</span>
                <h4 className={styles.title}>{post.title}</h4>
                <p className={styles.excerpt}>{post.excerpt}</p>
                <span className={styles.readMore}>Đọc bài viết →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
