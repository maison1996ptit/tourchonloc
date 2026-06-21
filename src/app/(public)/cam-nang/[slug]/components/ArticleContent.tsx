'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './ArticleContent.module.css';

interface Block {
  type: string;
  content: any;
}

interface ArticleContentProps {
  blocks?: Block[];
  content?: string;
  relatedTours?: any[];
  faqs?: any[];
}

// Interactive FAQ Accordion Item
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

// Safe simple inline markdown parser
function parseInlineMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

// Convert markdown to markup (with support for callouts and drop-cap helper classes)
function renderMarkdownToHtml(markdown: string) {
  if (!markdown) return '';
  const lines = markdown.split('\n');
  let inList = false;
  let paragraphCount = 0;
  
  const htmlLines = lines.map(line => {
    const trimmed = line.trim();
    
    // Headers
    if (trimmed.startsWith('### ')) {
      const text = trimmed.substring(4);
      const id = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
      return `<h3 id="${id}" class="${styles.h3Heading}">${text}</h3>`;
    }
    if (trimmed.startsWith('## ')) {
      const text = trimmed.substring(3);
      const id = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
      return `<h2 id="${id}" class="${styles.h2Heading}">${text}</h2>`;
    }
    if (trimmed.startsWith('# ')) {
      const text = trimmed.substring(2);
      const id = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
      return `<h1 id="${id}" class="${styles.h1Heading}">${text}</h1>`;
    }
    
    // Callouts / Blockquotes
    if (trimmed.startsWith('> ')) {
      const text = trimmed.substring(2);
      if (text.startsWith('[!TIP]')) {
        return `<div class="${styles.infoBox} ${styles.infoBoxTip}">
          <div class="${styles.infoBoxHeader}">💡 MẸO DU LỊCH HAY</div>
          <p>${parseInlineMarkdown(text.substring(6))}</p>
        </div>`;
      }
      if (text.startsWith('[!WARNING]') || text.startsWith('[!CAUTION]')) {
        return `<div class="${styles.infoBox} ${styles.infoBoxWarning}">
          <div class="${styles.infoBoxHeader}">⚠️ LƯU Ý QUAN TRỌNG</div>
          <p>${parseInlineMarkdown(text.substring(10))}</p>
        </div>`;
      }
      if (text.startsWith('[!NOTE]') || text.startsWith('[!IMPORTANT]')) {
        return `<div class="${styles.infoBox} ${styles.infoBoxInfo}">
          <div class="${styles.infoBoxHeader}">ℹ️ THÔNG TIN HỮU ÍCH</div>
          <p>${parseInlineMarkdown(text.substring(7))}</p>
        </div>`;
      }
      return `<blockquote class="${styles.quoteBlock}"><p>${parseInlineMarkdown(text)}</p></blockquote>`;
    }
    
    // Lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const text = trimmed.substring(2);
      const formattedText = parseInlineMarkdown(text);
      if (!inList) {
        inList = true;
        return `<ul class="${styles.list}"><li>${formattedText}</li>`;
      }
      return `<li>${formattedText}</li>`;
    } else {
      if (inList) {
        inList = false;
        return `</ul><p class="${styles.paragraph}">${parseInlineMarkdown(trimmed)}</p>`;
      }
    }
    
    if (trimmed === '') return '';
    
    // Assign a class for the first paragraph to trigger drop cap
    paragraphCount++;
    const pClass = paragraphCount === 1 ? `${styles.paragraph} ${styles.dropCapPara}` : styles.paragraph;
    return `<p class="${pClass}">${parseInlineMarkdown(trimmed)}</p>`;
  });

  let result = htmlLines.join('\n');
  if (inList) {
    result += '</ul>';
  }
  return result;
}

export default function ArticleContent({ blocks, content, relatedTours = [], faqs = [] }: ArticleContentProps) {
  // Render standard markdown (traditional blog post)
  if (!blocks || blocks.length === 0) {
    return (
      <div className={styles.articleBody} id="article-content-body">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(content) }} />
        ) : (
          <p className={styles.emptyText}>Bài viết không có nội dung hiển thị.</p>
        )}
      </div>
    );
  }

  // Helper to render Destination Facts from InfoBox content
  const renderFactsCard = (title: string, text: string) => {
    // Attempt to split text by newline or comma to list facts nicely
    const factsList = text.split('\n').filter(t => t.trim() !== '');
    
    return (
      <div className={styles.factsCard}>
        <div className={styles.factsCardHeader}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className={styles.factsIcon}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <h4>{title}</h4>
        </div>
        <div className={styles.factsGrid}>
          {factsList.map((fact, index) => {
            const parts = fact.split(':');
            const label = parts[0]?.trim() || '';
            const value = parts.slice(1).join(':')?.trim() || '';

            return (
              <div key={index} className={styles.factsItem}>
                {value ? (
                  <>
                    <span className={styles.factsLabel}>{label}</span>
                    <span className={styles.factsValue}>{value}</span>
                  </>
                ) : (
                  <span className={styles.factsSingleText}>{fact}</span>
                )}
              </div>
            );
          })}
          {factsList.length === 0 && <p>{text}</p>}
        </div>
      </div>
    );
  };

  // Otherwise render the dynamic blocks layout (Guides)
  return (
    <div className={styles.articleBody} id="article-content-body">
      {blocks.map((block, idx) => {
        const { type, content: blockContent } = block;

        switch (type) {
          case 'Text':
            return (
              <div 
                key={idx} 
                className={styles.textBlock}
                dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(blockContent.text) }}
              />
            );

          case 'Image':
            return (
              <figure key={idx} className={styles.imageBlock}>
                <div className={styles.imageWrapper}>
                  <img 
                    src={blockContent.url} 
                    alt={blockContent.caption || 'Cẩm nang hình ảnh'} 
                    loading="lazy" 
                    className={styles.articleImage}
                  />
                </div>
                {blockContent.caption && (
                  <figcaption className={styles.imageCaption}>
                    {blockContent.caption}
                  </figcaption>
                )}
              </figure>
            );

          case 'Quote':
            return (
              <div key={idx} className={styles.pullQuoteContainer}>
                <blockquote className={styles.pullQuote}>
                  <p className={styles.pullQuoteText}>"{blockContent.text}"</p>
                  {blockContent.author && <cite className={styles.pullQuoteAuthor}>— {blockContent.author}</cite>}
                </blockquote>
              </div>
            );

          case 'Video':
            return (
              <div key={idx} className={styles.videoBlock}>
                {blockContent.platform === 'youtube' && (
                  <iframe 
                    src={blockContent.url.includes('youtube.com/embed/') ? blockContent.url : `https://www.youtube.com/embed/${blockContent.url.split('v=')[1]?.split('&')[0] || blockContent.url}`}
                    title="Youtube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className={styles.videoIframe}
                  />
                )}
                {blockContent.platform !== 'youtube' && (
                  <iframe src={blockContent.url} title="Video player" frameBorder="0" allowFullScreen className={styles.videoIframe} />
                )}
              </div>
            );

          case 'CTA':
            return (
              <div key={idx} className={styles.ctaBlock}>
                <a 
                  href={blockContent.link} 
                  className={blockContent.type === 'secondary' ? styles.ctaBtnSecondary : styles.ctaBtn}
                >
                  {blockContent.text}
                </a>
              </div>
            );

          case 'Gallery':
            return (
              <div key={idx} className={styles.galleryBlock}>
                <h4 className={styles.galleryHeader}>📸 BỘ SƯU TẬP HÌNH ẢNH</h4>
                <div className={styles.galleryTrack}>
                  {(blockContent.images || []).map((img: any, i: number) => (
                    <div key={i} className={styles.gallerySlide}>
                      <img src={img.url} alt={img.caption || 'Slide'} loading="lazy" />
                      {img.caption && <p className={styles.galleryCaption}>{img.caption}</p>}
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'Timeline':
            return (
              <div key={idx} className={styles.timelineBlock}>
                <h4 className={styles.timelineHeader}>🍂 LỊCH TRÌNH CHI TIẾT</h4>
                <div className={styles.timelineContainer}>
                  {(blockContent.items || []).map((item: any, i: number) => (
                    <div key={i} className={styles.timelineItem}>
                      <div className={styles.timelineStation}>
                        <span className={styles.stationCircle}>{item.icon || '✓'}</span>
                      </div>
                      <div className={styles.timelineContent}>
                        <h4 className={styles.timelineTitle}>{item.title}</h4>
                        <p className={styles.timelineDesc}>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'InfoBox': {
            const boxType = blockContent.type || 'info';
            const boxTitle = blockContent.title || '';

            // Check if this box is meant to be a Destination Facts card
            const isFacts = boxTitle.toLowerCase().includes('facts') || 
                            boxTitle.toLowerCase().includes('tổng quan') || 
                            boxTitle.toLowerCase().includes('điểm đến');

            if (isFacts) {
              return renderFactsCard(boxTitle, blockContent.text);
            }

            let boxClass = styles.infoBoxInfo;
            let icon = 'ℹ️';
            let defaultTitle = 'THÔNG TIN HỮU ÍCH';

            if (boxType === 'warning') {
              boxClass = styles.infoBoxWarning;
              icon = '⚠️';
              defaultTitle = 'LƯU Ý QUAN TRỌNG';
            } else if (boxType === 'tip') {
              boxClass = styles.infoBoxTip;
              icon = '💡';
              defaultTitle = 'MẸO DU LỊCH HAY';
            } else if (boxType === 'experience') {
              boxClass = styles.infoBoxExperience;
              icon = '⭐';
              defaultTitle = 'KINH NGHIỆM THỰC TẾ';
            }

            return (
              <div key={idx} className={`${styles.infoBox} ${boxClass}`}>
                <div className={styles.infoBoxHeader}>
                  <span className={styles.infoBoxIcon}>{icon}</span>
                  <span>{blockContent.title || defaultTitle}</span>
                </div>
                <div className={styles.infoBoxText}>{blockContent.text}</div>
              </div>
            );
          }

          case 'Divider':
            return (
              <div key={idx} className={styles.dividerBlock}>
                <hr className={`${styles.dividerLine} ${styles['divider-' + (blockContent.style || 'solid')]}`} />
              </div>
            );

          case 'FAQ':
            return (
              <div key={idx} className={styles.faqBlock}>
                <h3 id={`faq-section-${idx}`} className={styles.h2Heading}>❓ GIẢI ĐÁP CÂU HỎI THƯỜNG GẶP</h3>
                <div className={styles.faqList}>
                  {(blockContent.items || []).map((faqItem: any, i: number) => (
                    <FAQAccordionItem key={i} question={faqItem.question} answer={faqItem.answer} />
                  ))}
                </div>
              </div>
            );

          case 'TourRelated': {
            const linkedTour = relatedTours?.find((rt: any) => rt.tourId === blockContent.tourId)?.tour;
            if (!linkedTour) return null;
            
            const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(linkedTour.priceFrom);

            return (
              <div key={idx} className={styles.tourRelated}>
                <div className={styles.tourCard}>
                  <div 
                    className={styles.tourCardImage} 
                    style={{ backgroundImage: `url(${linkedTour.featuredImage || '/logo.png'})` }}
                  />
                  <div className={styles.tourCardBody}>
                    <span className={styles.tourCardLabel}>{blockContent.customTitle || 'CHƯƠNG TRÌNH TOUR ĐỀ XUẤT'}</span>
                    <h3 className={styles.tourTitle}>{linkedTour.title}</h3>
                    <div className={styles.tourMeta}>
                      <span className={styles.duration}>⏱️ {linkedTour.durationDays} Ngày {linkedTour.durationNights} Đêm</span>
                      <span className={styles.price}>Từ {formattedPrice}</span>
                    </div>
                    <p className={styles.tourDesc}>{linkedTour.shortDescription}</p>
                    <div className={styles.tourActions}>
                      <Link href={`/tours/${linkedTour.slug}`} className={styles.btnView}>Xem Chi Tiết</Link>
                      <Link href={`/contact?tour=${linkedTour.slug}`} className={styles.btnBook}>Đặt Tour Ngay</Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          default:
            return null;
        }
      })}

      {/* Render additional FAQs if they exist */}
      {faqs && faqs.length > 0 && (
        <div className={styles.faqBlock} style={{ marginTop: '3rem' }}>
          <h3 id="general-faqs" className={styles.h2Heading}>❓ CÁC CÂU HỎI THƯỜNG GẶP KHÁC</h3>
          <div className={styles.faqList}>
            {faqs.map((faqItem: any, i: number) => (
              <FAQAccordionItem key={i} question={faqItem.question} answer={faqItem.answer} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
