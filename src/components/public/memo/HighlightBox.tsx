import styles from './Memo.module.css';

interface HighlightBoxProps {
  title: string;
  content: string;
  icon: string;
}

export default function HighlightBox({ title, content, icon }: HighlightBoxProps) {
  return (
    <div className={styles.highlightBox}>
      <div className={styles.highlightIcon}>{icon}</div>
      <div className={styles.highlightContent}>
        <h4>{title}</h4>
        <p>{content}</p>
      </div>
    </div>
  );
}
