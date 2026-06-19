'use client';

import React from 'react';
import { Blog } from '@/types/blog';
import styles from './blog-detail.module.css';
import memoStyles from '@/components/public/memo/Memo.module.css';
import Link from 'next/link';

// Import Memo components
import HighlightBox from '@/components/public/memo/HighlightBox';
import CTABlock from '@/components/public/memo/CTABlock';
import TableOfContents from '@/components/public/memo/TableOfContents';
import FAQ from '@/components/public/memo/FAQ';

interface BlogDetailClientProps {
  initialBlog: Blog | null;
}

const toAnchor = (text: string) => text.toLowerCase().replace(/ /g, '-');

function renderMemo(blog: Blog) {
  const memo = blog.memoContent as any;
  if (!memo) return <div>Nội dung memo không hợp lệ.</div>;

  return (
    <div className={memoStyles.memoContainer}>
      {blog.coverImage && (
        <div className={memoStyles.coverImage} style={{ backgroundImage: `url(${blog.coverImage})` }} />
      )}
      
      <HighlightBox
        icon="🎣"
        title="Hook"
        content={memo.hook}
      />
      
      {memo.tableOfContents && <TableOfContents items={memo.tableOfContents} />}

      <section id={toAnchor("Vấn đề thường gặp khi săn sale")} className={memoStyles.memoSection}>
        <h3>🤔 Vấn đề</h3>
        <p>{memo.problem}</p>
      </section>

      <section id={toAnchor("Giải pháp công nghệ từ Tour Chọn Lọc")} className={memoStyles.memoSection}>
        <h3>💡 Giải pháp</h3>
        <p>{memo.solution}</p>
      </section>

      <section id={toAnchor("Kinh nghiệm đặt tour giá tốt")} className={memoStyles.memoSection}>
        <h3>⭐ Kinh nghiệm thực tế</h3>
        <p>{memo.experience}</p>
      </section>

      <section id={toAnchor("Lợi ích khi đặt qua chúng tôi")} className={memoStyles.memoSection}>
        <h3>💎 Lợi ích</h3>
        <p>{memo.benefits}</p>
      </section>

      {memo.cta && <CTABlock text={memo.cta.text} link={memo.cta.link} />}
      
      {memo.faq && <FAQ items={memo.faq} />}
    </div>
  );
}

function renderStandardBlog(blog: Blog) {
  // Assuming blog.content is pre-sanitized HTML from Markdown
  return (
    <>
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
          dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }} 
        />
      </div>
    </>
  );
}


export default function BlogDetailClient({ initialBlog }: BlogDetailClientProps) {
  if (!initialBlog) {
    return <div className={styles.error}>Không tìm thấy bài viết. <Link href="/cam-nang">Quay lại</Link></div>;
  }
  
  const blog = initialBlog;

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
      "name": blog.author || "Chuyên gia Tour Chọn Lọc"
    }
  };

  return (
    <article className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <header className={styles.header}>
        <Link href="/cam-nang" className={styles.backLink}>← Quay lại Cẩm nang</Link>
        <div className={styles.meta}>
          <span className={styles.category}>{blog.category || blog.categoryId}</span>
          <span className={styles.divider}>•</span>
          <span className={styles.date}>{new Date(blog.publishedDate).toLocaleDateString('vi-VN')}</span>
        </div>
        <h1>{blog.title}</h1>
      </header>

      {blog.isMemo ? renderMemo(blog) : renderStandardBlog(blog)}

      <footer className={styles.footer}>
        <div className={styles.tags}>
          {blog.tags.map(tag => (
            <span key={tag} className={styles.tag}>#{tag}</span>
          ))}
        </div>
        <div className={styles.share}>
          <h3>Chia sẻ bài viết</h3>
          <div className={styles.shareBtns}>
            <button className={styles.shareBtn}>Facebook</button>
            <button className={styles.shareBtn}>Twitter</button>
          </div>
        </div>
      </footer>
    </article>
  );
}
