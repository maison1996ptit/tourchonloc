export type GuideStatus = 'Draft' | 'Published' | 'Scheduled';

export interface GuideCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface GuideTag {
  id: string;
  name: string;
  slug: string;
}

export interface GuideSEO {
  id?: string;
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
}

export interface TextBlockContent {
  text: string;
}

export interface ImageBlockContent {
  url: string;
  caption?: string;
}

export interface GalleryBlockContent {
  images: { url: string; caption?: string }[];
}

export interface QuoteBlockContent {
  text: string;
  author?: string;
}

export interface VideoBlockContent {
  platform: 'youtube' | 'tiktok' | 'facebook' | 'embed';
  url: string;
}

export interface CTABlockContent {
  text: string;
  link: string;
  type?: 'primary' | 'secondary';
}

export interface TimelineItem {
  title: string;
  description: string;
  icon?: string;
}

export interface TimelineBlockContent {
  items: TimelineItem[];
}

export type GuideBlockContent = 
  | TextBlockContent 
  | ImageBlockContent 
  | GalleryBlockContent 
  | QuoteBlockContent 
  | VideoBlockContent 
  | CTABlockContent 
  | TimelineBlockContent;

export interface GuideBlock {
  id: string;
  guideId: string;
  type: 'Text' | 'Image' | 'Gallery' | 'Quote' | 'Video' | 'CTA' | 'Timeline';
  order: number;
  content: GuideBlockContent;
  createdAt?: string;
  updatedAt?: string;
}

export interface Guide {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  status: GuideStatus;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  categoryId?: string | null;
  category?: GuideCategory | null;
  tags?: GuideTag[];
  seo?: GuideSEO | null;
  blocks?: GuideBlock[];
}
