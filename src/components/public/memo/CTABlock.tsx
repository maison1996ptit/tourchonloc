import Link from 'next/link';
import styles from './Memo.module.css';

interface CTABlockProps {
  text: string;
  link: string;
}

export default function CTABlock({ text, link }: CTABlockProps) {
  return (
    <div className={styles.ctaBlock}>
      <Link href={link} className={styles.ctaButton}>
        {text}
      </Link>
    </div>
  );
}
