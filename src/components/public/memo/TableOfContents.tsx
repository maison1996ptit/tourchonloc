import styles from './Memo.module.css';

interface TableOfContentsProps {
  items: string[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const toAnchor = (text: string) => text.toLowerCase().replace(/ /g, '-');

  return (
    <div className={styles.tocContainer}>
      <h4>Mục lục</h4>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <a href={`#${toAnchor(item)}`}>{item}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
