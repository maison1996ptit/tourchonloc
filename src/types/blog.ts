export type BlogStatus = 'Draft' | 'Published';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface MemoCTA {
  text: string;
  link: string;
}

export interface MemoFAQ {
  q: string;
  a: string;
}

export interface MemoContent {
  hook: string;
  problem: string;
  solution: string;
  experience: string;
  benefits: string;
  cta: MemoCTA;
  faq: MemoFAQ[];
  tableOfContents: string[];
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  category?: string;
  author?: string;
  thumbnail: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  publishedDate: string;
  status: BlogStatus;
  createdAt: string;
  updatedAt: string;

  // Memo fields
  isMemo?: boolean;
  coverImage?: string | null;
  memoContent?: MemoContent | null;
}
