'use client';
import { useState } from 'react';
import styles from './Memo.module.css';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQProps {
  items: FAQItem[];
}

export default function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.faqContainer}>
      <h3>Các câu hỏi thường gặp</h3>
      {items.map((item, index) => (
        <div key={index} className={styles.faqItem}>
          <button className={styles.faqQuestion} onClick={() => toggle(index)}>
            <span>{item.q}</span>
            <span className={openIndex === index ? styles.faqIconRotate : styles.faqIcon}>+</span>
          </button>
          <div
            className={styles.faqAnswer}
            style={{
              maxHeight: openIndex === index ? '200px' : '0',
            }}
          >
            <p>{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
