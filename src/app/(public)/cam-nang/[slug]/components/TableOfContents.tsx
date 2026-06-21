'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './TableOfContents.module.css';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false); // Mobile drawer/collapse state
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Give Next.js time to hydrate and load dynamically
    const timer = setTimeout(() => {
      const articleBody = document.getElementById('article-content-body');
      if (!articleBody) return;

      const headings = articleBody.querySelectorAll('h2, h3');
      const parsedItems: TocItem[] = Array.from(headings).map((heading, i) => {
        // Ensure the heading has an ID
        if (!heading.id) {
          const cleanText = heading.textContent
            ? heading.textContent
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
            : `section-${i}`;
          heading.id = cleanText || `section-${i}`;
        }
        return {
          id: heading.id,
          text: heading.textContent || '',
          level: heading.tagName === 'H2' ? 2 : 3
        };
      });

      setItems(parsedItems);

      // Set up IntersectionObserver to track active heading
      if (observerRef.current) observerRef.current.disconnect();

      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        // Find entries that are intersecting
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Highlight the first visible entry
          setActiveId(visibleEntries[0].target.id);
        }
      };

      observerRef.current = new IntersectionObserver(observerCallback, {
        rootMargin: '-80px 0px -60% 0px', // Trigger when heading is near the top
        threshold: 0.1
      });

      headings.forEach(heading => {
        if (observerRef.current) observerRef.current.observe(heading);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Offset for sticky header (e.g. 80px)
      const offset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setActiveId(id);
      setIsOpen(false); // Close mobile menu on click
      
      // Update hash in URL silently
      window.history.pushState(null, '', `#${id}`);
    }
  };

  if (items.length === 0) return null;

  return (
    <nav className={styles.tocWrapper}>
      {/* Mobile Header Collapse Toggle */}
      <button 
        className={styles.mobileToggle} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        type="button"
      >
        <span className={styles.toggleTitle}>
          <span className={styles.toggleIcon}>📋</span> Mục lục bài viết
        </span>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▼</span>
      </button>

      {/* Menu List */}
      <div className={`${styles.tocContainer} ${isOpen ? styles.containerOpen : ''}`}>
        <h4 className={styles.tocTitle}>MỤC LỤC CHI TIẾT</h4>
        <ul className={styles.tocList}>
          {items.map((item) => (
            <li 
              key={item.id} 
              className={`${styles.tocListItem} ${item.level === 3 ? styles.level3 : styles.level2} ${activeId === item.id ? styles.active : ''}`}
            >
              <a 
                href={`#${item.id}`} 
                onClick={(e) => handleClick(e, item.id)}
                className={styles.tocLink}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
