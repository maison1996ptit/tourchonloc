import { Testimonial } from '@/types/testimonial';

export const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    customerName: 'Sarah Jenkins',
    country: 'Australia',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
    flagCode: 'AU',
    rating: 5,
    content: 'Our trip to Vietnam was absolutely incredible! Everything from the pick-up at the airport to the luxury cruise in Ha Long Bay was perfectly organized. Highly recommended!',
    language: 'English',
    status: 'Published',
    createdAt: '2026-04-20T00:00:00Z'
  },
  {
    id: '2',
    customerName: 'Marcus Weber',
    country: 'Germany',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150',
    flagCode: 'DE',
    rating: 5,
    content: 'The Japan Zen Journey was a life-changing experience. The private temple visits and the attention to detail by our guides were second to none.',
    language: 'English',
    status: 'Published',
    createdAt: '2026-04-25T10:00:00Z'
  },
  {
    id: '3',
    customerName: 'Elena Rodriguez',
    country: 'Spain',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150',
    flagCode: 'ES',
    rating: 4,
    content: 'Bali was magical. The retreat was exactly what I needed to recharge. Thank you for the wonderful recommendation and the seamless planning.',
    language: 'English',
    status: 'Published',
    createdAt: '2026-05-01T15:00:00Z'
  }
];
