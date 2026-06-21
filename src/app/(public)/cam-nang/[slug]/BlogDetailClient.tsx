'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Blog } from '@/types/blog';
import styles from './blog-detail.module.css';

// Import New Redesigned Components
import ReadingProgress from './components/ReadingProgress';
import ArticleHero from './components/ArticleHero';
import ArticleContent from './components/ArticleContent';
import TableOfContents from './components/TableOfContents';
import ShareButtons from './components/ShareButtons';
import RelatedPosts from './components/RelatedPosts';
import ArticleSidebar from './components/ArticleSidebar';

interface BlogDetailClientProps {
  initialBlog: any;
  relatedBlogs?: any[];
  allTours?: any[];
}

const toAnchor = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

// Inline FAQ Accordion Item for unified look
const FAQAccordionItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={styles.faqItem}>
      <button 
        className={styles.faqHeader} 
        onClick={() => setIsOpen(!isOpen)} 
        type="button"
        aria-expanded={isOpen}
      >
        <span className={styles.faqQuestion}>{question}</span>
        <span className={`${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ''}`}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </button>
      <div className={`${styles.faqAnswer} ${isOpen ? styles.faqAnswerOpen : ''}`}>
        <div className={styles.faqAnswerInner}>
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
};

export default function BlogDetailClient({ initialBlog, relatedBlogs = [], allTours = [] }: BlogDetailClientProps) {
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  // 10-second Promo Popup Timer
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    // Set 3 seconds timer
    const timer = setTimeout(() => {
      setShowPromo(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const matchedTour = useMemo(() => {
    // 1. Check if blog has directly related tours mapped in db
    if (initialBlog?.relatedTours && initialBlog.relatedTours.length > 0) {
      const firstRel = initialBlog.relatedTours[0];
      if (firstRel && firstRel.tour) {
        return firstRel.tour;
      }
    }

    if (!allTours || allTours.length === 0) return null;

    // 2. Match by country field
    if (initialBlog?.country) {
      const targetCountry = initialBlog.country.toLowerCase();
      const matched = allTours.filter(t => 
        t.destination.toLowerCase().includes(targetCountry) || 
        t.title.toLowerCase().includes(targetCountry)
      );
      if (matched.length > 0) return matched[0];
    }

    // 3. Match by keywords in title
    const titleLower = (initialBlog?.title || '').toLowerCase();
    const keywords = ['hàn quốc', 'nhật bản', 'hồng kông', 'trung quốc', 'singapore', 'thái lan', 'đài loan', 'châu âu', 'pháp', 'úc', 'mỹ'];
    for (const keyword of keywords) {
      if (titleLower.includes(keyword)) {
        const matched = allTours.filter(t => 
          t.destination.toLowerCase().includes(keyword) || 
          t.title.toLowerCase().includes(keyword)
        );
        if (matched.length > 0) return matched[0];
      }
    }

    // 4. Default fallback
    return allTours[0];
  }, [initialBlog, allTours]);

  // 1. User View Tracking API call on mount
  useEffect(() => {
    if (initialBlog && initialBlog.slug && initialBlog.isGuide) {
      fetch(`/api/guides/${initialBlog.slug}/view`, { method: 'POST' })
        .then(res => {
          if (!res.ok) console.error('Failed to log views');
        })
        .catch(err => console.error('Error logging views:', err));
    }
  }, [initialBlog]);



  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    setTimeout(() => {
      setSubscribing(false);
      setSubscribeSuccess(true);
    }, 1200);
  };

  if (!initialBlog) {
    return (
      <div className={styles.error}>
        Không tìm thấy bài viết. <br />
        <Link href="/cam-nang" className={styles.backLink}>← Quay lại Cẩm nang</Link>
      </div>
    );
  }

  const blog = initialBlog;

  // Build JSON-LD structured schemas
  const schemas = useMemo(() => {
    if (!blog) return [];
    
    // Breadcrumbs Schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Trang chủ",
          "item": "https://tourchonloc.vn"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Cẩm nang du lịch",
          "item": "https://tourchonloc.vn/cam-nang"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": blog.title,
          "item": `https://tourchonloc.vn/cam-nang/${blog.slug}`
        }
      ]
    };

    // Article/NewsArticle Schema
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": blog.seoTitle || blog.title,
      "image": [blog.thumbnail],
      "datePublished": blog.publishedDate,
      "dateModified": blog.updatedAt || blog.publishedDate,
      "description": blog.seoDescription || blog.excerpt,
      "author": {
        "@type": "Person",
        "name": blog.author || "Chuyên gia Tour Chọn Lọc"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Tour Chọn Lọc",
        "logo": {
          "@type": "ImageObject",
          "url": "https://tourchonloc.vn/logo.png"
        }
      }
    };

    // FAQ Schema
    const faqItems: any[] = [];
    if (blog.faqs && blog.faqs.length > 0) {
      blog.faqs.forEach((f: any) => {
        faqItems.push({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.answer
          }
        });
      });
    }
    blog.blocks?.forEach((b: any) => {
      if (b.type === 'FAQ' && b.content.items) {
        b.content.items.forEach((item: any) => {
          if (item.question && item.answer) {
            faqItems.push({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
              }
            });
          }
        });
      }
    });

    const list = [breadcrumbSchema, articleSchema];
    if (faqItems.length > 0) {
      list.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems
      } as any);
    }
    return list;
  }, [blog]);

  // Dynamic Memo Content Renderer inside Editorial Layout
  const renderMemoContent = (memo: any) => {
    if (!memo) return null;

    return (
      <div className={styles.memoContentContainer} id="article-content-body">
        {/* Hook / Intro Quote */}
        {memo.hook && (
          <div className={styles.memoHookWrapper}>
            <blockquote className={styles.memoHookQuote}>
              <p className={styles.memoHookText}>"{memo.hook}"</p>
            </blockquote>
          </div>
        )}

        {/* Problem */}
        {memo.problem && (
          <section className={styles.memoSection}>
            <h2 id={toAnchor("Nỗi sợ khi tự lập kế hoạch")} className={styles.memoHeading}>
              🤔 Vấn đề thường gặp khi lên kế hoạch
            </h2>
            <p className={styles.memoParagraph}>{memo.problem}</p>
          </section>
        )}

        {/* Solution */}
        {memo.solution && (
          <section className={styles.memoSection}>
            <h2 id={toAnchor("Giải pháp từ các 'Kiến trúc sư' du lịch")} className={styles.memoHeading}>
              💡 Giải pháp công nghệ từ Tour Chọn Lọc
            </h2>
            <p className={styles.memoParagraph}>{memo.solution}</p>
          </section>
        )}

        {/* Experience */}
        {memo.experience && (
          <section className={styles.memoSection}>
            <h2 id={toAnchor("Quy trình làm việc khoa học")} className={styles.memoHeading}>
              ⭐ Kinh nghiệm thực tế từ chuyên gia hành trình
            </h2>
            <p className={styles.memoParagraph}>{memo.experience}</p>
          </section>
        )}

        {/* Benefits */}
        {memo.benefits && (
          <section className={styles.memoSection}>
            <h2 id={toAnchor("Tại sao nên chọn chúng tôi?")} className={styles.memoHeading}>
              💎 Lợi ích khi đồng hành cùng Tour Chọn Lọc
            </h2>
            <p className={styles.memoParagraph}>{memo.benefits}</p>
          </section>
        )}

        {/* CTA Button Block */}
        {memo.cta && (
          <div className={styles.memoCtaBlock}>
            <a href={memo.cta.link} className={styles.memoCtaBtn}>
              {memo.cta.text}
            </a>
          </div>
        )}

        {/* FAQ Accordions */}
        {memo.faq && memo.faq.length > 0 && (
          <div className={styles.memoFaqBlock}>
            <h2 id="cac-cau-hoi-thuong-gap" className={styles.memoHeading}>
              ❓ Giải đáp câu hỏi thường gặp
            </h2>
            <div className={styles.memoFaqList}>
              {memo.faq.map((item: any, i: number) => (
                <FAQAccordionItem key={i} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      {/* Inject SEO Schemas */}
      {schemas.map((schema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Reading Progress Indicator */}
      <ReadingProgress />

      {/* Full-width Magazine Cover Header */}
      <ArticleHero
        title={blog.title}
        category={blog.category || 'Cẩm nang du lịch'}
        publishedDate={blog.publishedDate}
        readTime={blog.readTime || 7}
        author={blog.author || 'Chuyên gia Tour Chọn Lọc'}
        thumbnail={blog.thumbnail}
        excerpt={blog.excerpt}
      />

      {/* Layout Grid */}
      <div className={styles.layoutContainer} id="article-main-layout">
        {/* Left Column: Share buttons */}
        <div className={styles.shareCol}>
          <ShareButtons title={blog.title} />
        </div>

        {/* Center Column: Main Content */}
        <div className={styles.contentCol}>
          {/* Mobile-only Table of Contents at the top of content */}
          <div className={styles.mobileTocCol}>
            <TableOfContents />
          </div>

          {/* Unified content render path for Memo, Guides and standard Blogs */}
          {blog.isMemo ? (
            renderMemoContent(blog.memoContent)
          ) : (
            <ArticleContent 
              blocks={blog.blocks} 
              content={blog.content} 
              relatedTours={blog.relatedTours} 
              faqs={blog.faqs} 
            />
          )}

          {/* Tags footer */}
          {blog.tags && blog.tags.length > 0 && (
            <div className={styles.articleTagsFooter}>
              {blog.tags.map((tag: string) => (
                <span key={tag} className={styles.tagBadge}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Premium Author Section */}
          <div className={styles.authorCard}>
            <img 
              src="/chatbotLogo.png" 
              alt={blog.author || 'Chuyên gia Tour Chọn Lọc'} 
              className={styles.authorAvatar} 
            />
            <div className={styles.authorInfo}>
              <span className={styles.authorRole}>Biên tập viên Du lịch</span>
              <h5 className={styles.authorName}>{blog.author || 'Chuyên gia Tour Chọn Lọc'}</h5>
              <p className={styles.authorBio}>
                Đam mê khám phá những mảnh đất xa xôi, chia sẻ những câu chuyện văn hóa chân thực và các mẹo du lịch chuyên sâu. Viết bài cho National Geographic Travel và Condé Nast Traveler.
              </p>
            </div>
          </div>

          {/* Luxury Newsletter Subscription Box */}
          <div className={styles.newsletterCard}>
            <h4 className={styles.newsletterTitle}>Nhận cảm hứng hành trình kế tiếp</h4>
            <p className={styles.newsletterDesc}>
              Đăng ký bản tin hàng tuần của chúng tôi để nhận những câu chuyện du lịch độc quyền, kinh nghiệm thực tế và các ưu đãi tour sớm nhất.
            </p>
            {subscribeSuccess ? (
              <div style={{ color: '#10b981', fontWeight: 600, fontSize: '1.05rem', marginTop: '1rem' }}>
                ✓ Cảm ơn bạn đã đăng ký! Chúng tôi sẽ sớm gửi thư đến bạn.
              </div>
            ) : (
              <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  placeholder="Địa chỉ email của bạn" 
                  className={styles.newsletterInput} 
                  required 
                  disabled={subscribing}
                />
                <button type="submit" className={styles.newsletterSubmit} disabled={subscribing}>
                  {subscribing ? 'Đang gửi...' : 'Đăng ký'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Desktop Table of Contents */}
        <div className={styles.sidebarCol}>
          <ArticleSidebar>
            <TableOfContents />
          </ArticleSidebar>
        </div>
      </div>

      {/* Related Posts magazine grid at the bottom */}
      {relatedBlogs && relatedBlogs.length > 0 && (
        <div className={styles.relatedWrapper}>
          <div className={styles.relatedContainer}>
            <RelatedPosts posts={relatedBlogs} />
          </div>
        </div>
      )}



      {/* Dynamic Contextual Tour Promotion Popup */}
      {showPromo && matchedTour && (
        <div className={styles.promoPopup}>
          <div className={styles.promoContent}>
            <button 
              className={styles.promoClose} 
              onClick={() => {
                setShowPromo(false);
              }}
              aria-label="Đóng quảng cáo"
            >
              ✕
            </button>
            <div className={styles.promoImageWrapper}>
              <div 
                className={styles.promoImage} 
                style={{ backgroundImage: `url(${matchedTour.featuredImage || '/images/default-tour.jpg'})` }}
              />
              <span className={styles.promoTag}>🔥 BÁN CHẠY</span>
            </div>
            <div className={styles.promoBody}>
              <span className={styles.promoLabel}>📍 GỢI Ý HÀNH TRÌNH CHO BẠN</span>
              <h4 className={styles.promoTitle}>{matchedTour.title}</h4>
              <div className={styles.promoDetails}>
                <span>⏳ Thời gian: {matchedTour.durationDays} ngày {matchedTour.durationNights} đêm</span>
                <span>🏷️ Giá từ: <strong className={styles.promoPrice}>{matchedTour.priceFrom.toLocaleString('vi-VN')} đ</strong></span>
              </div>
              <Link 
                href={`/tours/${matchedTour.slug}`} 
                className={styles.promoCta}
                onClick={() => {
                  setShowPromo(false);
                }}
              >
                Khám phá ngay →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
