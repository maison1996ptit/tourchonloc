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

export interface InfoBoxBlockContent {
  title: string;
  text: string;
  type: 'warning' | 'tip' | 'info';
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQBlockContent {
  items: FAQItem[];
}

export interface TourRelatedBlockContent {
  tourId: string;
  customTitle?: string;
}

export interface DividerBlockContent {
  style: 'solid' | 'dashed' | 'double' | 'none';
}

export type GuideBlockContent = 
  | TextBlockContent 
  | ImageBlockContent 
  | GalleryBlockContent 
  | QuoteBlockContent 
  | VideoBlockContent 
  | CTABlockContent 
  | TimelineBlockContent
  | InfoBoxBlockContent
  | FAQBlockContent
  | TourRelatedBlockContent
  | DividerBlockContent;

export interface GuideBlock {
  id: string;
  guideId: string;
  type: 'Text' | 'Image' | 'Gallery' | 'Quote' | 'Video' | 'CTA' | 'Timeline' | 'InfoBox' | 'FAQ' | 'TourRelated' | 'Divider';
  order: number;
  content: GuideBlockContent;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuideRelatedTour {
  id: string;
  guideId: string;
  tourId: string;
  tour?: {
    id: string;
    title: string;
    slug: string;
    priceFrom: number;
    durationDays: number;
    durationNights: number;
    featuredImage: string;
  };
}

export interface GuideFAQ {
  id: string;
  guideId: string;
  question: string;
  answer: string;
  order: number;
}

export interface Guide {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  thumbnail?: string | null;
  country?: string | null;
  city?: string | null;
  status: GuideStatus;
  views: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  categoryId?: string | null;
  category?: GuideCategory | null;
  tags?: GuideTag[];
  seo?: GuideSEO | null;
  blocks?: GuideBlock[];
  relatedTours?: GuideRelatedTour[];
  faqs?: GuideFAQ[];
}

export interface GuideMedia {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
}
