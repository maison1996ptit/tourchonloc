export type TestimonialStatus = 'Published' | 'Draft';

export interface Testimonial {
  id: string;
  customerName: string;
  country: string;
  avatar?: string;
  flagCode?: string;
  rating: number; // 1-5
  content: string;
  language: string;
  status: TestimonialStatus;
  createdAt: string;
}
