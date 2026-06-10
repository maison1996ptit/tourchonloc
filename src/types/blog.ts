export type BlogStatus = 'Draft' | 'Published';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  category?: string; // Added for flexibility
  author?: string;   // Added this field
  thumbnail: string;
  excerpt: string;
  content: string; // Markdown or HTML
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  publishedDate: string;
  status: BlogStatus;
  createdAt: string;
  updatedAt: string;
}
