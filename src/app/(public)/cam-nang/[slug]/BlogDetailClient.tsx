'use client';

import React, { useState, useEffect } from 'react';
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
  initialBlog: any;
  relatedBlogs?: Blog[];
}

const toAnchor = (text: string) => text.toLowerCase().replace(/ /g, '-');

function renderMemo(blog: any) {
  const memo = blog.memoContent;
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

function renderStandardBlog(blog: any) {
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

const ScrollReveal: React.FC<{ children: React.ReactNode; id?: string }> = ({ children, id }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      className={`${styles.scrollReveal} ${isVisible ? styles.scrollRevealActive : ''}`}
    >
      {children}
    </div>
  );
};

export default function BlogDetailClient({ initialBlog, relatedBlogs = [] }: BlogDetailClientProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!initialBlog || !initialBlog.isGuide) return;

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initialBlog]);

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

  // 1. Google Arts & Culture Story Immersive Rendering
  if (blog.isGuide) {
    const tocItems: { label: string; anchor: string }[] = [];
    blog.blocks?.forEach((block: any, idx: number) => {
      if (block.type === 'Timeline' && block.content.items?.length > 0) {
        tocItems.push({ label: 'Lịch Trình Chi Tiết', anchor: `block-${idx}` });
      } else if (block.type === 'Gallery' && block.content.images?.length > 0) {
        tocItems.push({ label: 'Bộ Sưu Tập Ảnh', anchor: `block-${idx}` });
      } else if (block.type === 'Quote') {
        tocItems.push({ label: 'Góc Nhìn Chuyên Gia', anchor: `block-${idx}` });
      } else if (block.type === 'Text' && idx === 0) {
        tocItems.push({ label: 'Bắt Đầu Hành Trình', anchor: `block-${idx}` });
      } else if (block.type === 'CTA') {
        tocItems.push({ label: 'Đăng Ký & Nhận Ưu Đãi', anchor: `block-${idx}` });
      }
    });

    if (tocItems.length === 0) {
      tocItems.push({ label: 'Giới Thiệu Câu Chuyện', anchor: 'story-start' });
    }

    return (
      <div className={styles.immersiveWrapper}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        {/* Reading progress bar */}
        <div className={styles.progressBar} style={{ width: `${scrollProgress}%` }} />

        {/* Immersive Hero Header */}
        <div 
          className={styles.immersiveHero}
          style={{ backgroundImage: `url(${blog.thumbnail})` }}
        >
          <div className={styles.immersiveHeroContent}>
            <span className={styles.immersiveCategory}>{blog.category}</span>
            <h1 className={styles.immersiveTitle}>{blog.title}</h1>
            <p className={styles.immersiveExcerpt}>{blog.excerpt}</p>
            <div className={styles.immersiveMeta}>
              <span>✍️ {blog.author}</span>
              <span>•</span>
              <span>📅 {new Date(blog.publishedDate).toLocaleDateString('vi-VN')}</span>
              <span>•</span>
              <span>⏱️ Đọc khoảng 5 phút</span>
            </div>
          </div>
        </div>

        {/* Main story grid with sticky TOC */}
        <div className={styles.immersiveBodyGrid} id="story-start">
          <div className={styles.immersiveStoryContent}>
            {blog.blocks?.map((block: any, idx: number) => {
              const content = block.content;
              const id = `block-${idx}`;
              
              let blockEl = null;
              switch (block.type) {
                case 'Text':
                  blockEl = (
                    <div className={styles.textBlock}>
                      {content.text}
                    </div>
                  );
                  break;
                case 'Image':
                  blockEl = (
                    <div className={styles.imageBlock}>
                      <img src={content.url} alt={content.caption || 'Story Image'} loading="lazy" />
                      {content.caption && <p className={styles.imageCaption}>{content.caption}</p>}
                    </div>
                  );
                  break;
                case 'Quote':
                  blockEl = (
                    <blockquote className={styles.quoteBlock}>
                      <p className={styles.quoteText}>"{content.text}"</p>
                      {content.author && <cite className={styles.quoteAuthor}>— {content.author}</cite>}
                    </blockquote>
                  );
                  break;
                case 'Video':
                  blockEl = (
                    <div className={styles.videoBlock}>
                      {content.platform === 'youtube' && (
                        <iframe 
                          src={content.url.includes('youtube.com/embed/') ? content.url : `https://www.youtube.com/embed/${content.url.split('v=')[1]?.split('&')[0] || content.url}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                      {content.platform !== 'youtube' && (
                        <iframe src={content.url} title="Video player" frameBorder="0" allowFullScreen />
                      )}
                    </div>
                  );
                  break;
                case 'CTA':
                  blockEl = (
                    <div className={styles.ctaBlock}>
                      <a 
                        href={content.link} 
                        className={content.type === 'secondary' ? styles.ctaButtonSecondary : styles.ctaButton}
                      >
                        {content.text}
                      </a>
                    </div>
                  );
                  break;
                case 'Gallery':
                  blockEl = (
                    <div className={styles.galleryBlock}>
                      <h4 className={styles.galleryTitle}>🖼️ {content.title || 'Khoảnh khắc ấn tượng'}</h4>
                      <div className={styles.galleryTrack}>
                        {(content.images || []).map((img: any, i: number) => (
                          <div key={i} className={styles.gallerySlide}>
                            <img src={img.url} alt={img.caption || 'Slide'} loading="lazy" />
                            {img.caption && <p>{img.caption}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                  break;
                case 'Timeline':
                  blockEl = (
                    <div className={styles.timelineBlock}>
                      <h4 className={styles.timelineLabel}>🍂 Hành trình chặng chặng</h4>
                      {(content.items || []).map((item: any, i: number) => (
                        <div key={i} className={styles.timelineItem}>
                          <span className={styles.timelineIcon}>{item.icon || '✓'}</span>
                          <h4>{item.title}</h4>
                          <p>{item.description}</p>
                        </div>
                      ))}
                    </div>
                  );
                  break;
                default:
                  blockEl = null;
              }

              if (!blockEl) return null;
              return (
                <ScrollReveal key={idx} id={id}>
                  {blockEl}
                </ScrollReveal>
              );
            })}
          </div>

          <aside className={styles.sidebarTOC}>
            <h4 className={styles.tocTitle}>CÂU CHUYỆN</h4>
            <ul className={styles.tocList}>
              {tocItems.map((item, idx) => (
                <li key={idx}>
                  <a href={`#${item.anchor}`} className={styles.tocLink}>
                    {idx + 1}. {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {/* Related Section at the bottom */}
        {relatedBlogs.length > 0 && (
          <section className={styles.relatedSection} style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
            <h3 className={styles.relatedTitle} style={{ color: '#ffffff' }}>Cẩm Nang Liên Quan</h3>
            <div className={styles.relatedGrid}>
              {relatedBlogs.map((rBlog) => (
                <Link href={`/cam-nang/${rBlog.slug}`} key={rBlog.id} className={styles.relatedCard} style={{ background: '#1e293b' }}>
                  <div 
                    className={styles.relatedThumb} 
                    style={{ backgroundImage: `url(${rBlog.thumbnail})` }}
                  />
                  <div className={styles.relatedInfo}>
                    <span className={styles.relatedCardCategory}>{rBlog.category}</span>
                    <h4 style={{ color: '#ffffff' }}>{rBlog.title}</h4>
                    <p style={{ color: '#94a3b8' }}>{rBlog.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // 2. Fallback to Traditional Blog or Memo rendering
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

      {relatedBlogs.length > 0 && (
        <section className={styles.relatedSection}>
          <h3 className={styles.relatedTitle}>Cẩm Nang Liên Quan</h3>
          <div className={styles.relatedGrid}>
            {relatedBlogs.map((rBlog) => (
              <Link href={`/cam-nang/${rBlog.slug}`} key={rBlog.id} className={styles.relatedCard}>
                <div 
                  className={styles.relatedThumb} 
                  style={{ backgroundImage: `url(${rBlog.thumbnail})` }}
                />
                <div className={styles.relatedInfo}>
                  <span className={styles.relatedCardCategory}>{rBlog.category || rBlog.categoryId}</span>
                  <h4>{rBlog.title}</h4>
                  <p>{rBlog.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className={styles.footer}>
        <div className={styles.tags}>
          {blog.tags?.map((tag: string) => (
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
