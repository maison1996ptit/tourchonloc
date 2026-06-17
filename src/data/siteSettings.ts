import { SiteSettings } from '@/types/siteSettings';

export const mockSiteSettings: SiteSettings = {
  websiteName: 'Tour Chọn Lọc',
  tagline: 'Khám phá thế giới theo cách của bạn',
  heroHeadline: 'Experience Authentic Travel Like Never Before',
  heroSubtitle: 'Tailor-made journeys for the discerning traveler.',
  heroImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=2070',
  heroCTA: {
    text: 'Plan Your Trip',
    link: '/customize-trip'
  },
  footerDescription: 'Chúng tôi chuyên cung cấp các trải nghiệm du lịch độc đáo và đẳng cấp.',
  contactInfo: {
    phone: ['+84 372 521 237'],
    email: ['fit.saletourchonloc@gmail.com'],
    officeAddresses: ['535/25 Pham Van Dong Street, Binh Loi Trung Ward, Ho Chi Minh City, Vietnam']
  },
  socialLinks: {
     zalo: 'https://zalo.me/84372521237',
    // instagram: 'https://instagram.com/luxurytravel'
  },
  seoDefaultTitle: 'Tour Chọn Lọc - Luôn mang lại giá trị cốt lõi',
  seoDefaultDescription: 'Khám phá những trải nghiệm du lịch đẳng cấp và chân thực cùng đội ngũ chuyên gia của chúng tôi.',
  affiliateGear: [
    {
      title: 'Premium Travel Pillow',
      description: 'Ergonomic design for deep sleep during long flights.',
      imageUrl: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&q=80&w=300',
      affiliateUrl: '#'
    },
    {
      title: 'Compact Power Bank',
      description: 'High-capacity 20,000mAh battery for all your devices.',
      imageUrl: 'https://images.unsplash.com/photo-1585333127302-d29213242d2c?auto=format&fit=crop&q=80&w=300',
      affiliateUrl: '#'
    },
    {
      title: 'Hard Shell Luggage',
      description: 'Durable, lightweight, and TSA-approved lock system.',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=300',
      affiliateUrl: '#'
    },
    {
      title: 'Waterproof Daypack',
      description: 'Perfect for day trips and keeping your gear dry.',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=300',
      affiliateUrl: '#'
    }
  ]
};
