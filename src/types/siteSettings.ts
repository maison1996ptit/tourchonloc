export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
}

export interface ContactInfo {
  phone: string[];
  email: string[];
  officeAddresses: string[];
}

export interface SiteSettings {
  websiteName: string;
  tagline: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroImage: string;
  heroCTA: {
    text: string;
    link: string;
  };
  footerDescription: string;
  contactInfo: ContactInfo;
  socialLinks: SocialLinks;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
  affiliateGear?: {
    title: string;
    description: string;
    imageUrl: string;
    affiliateUrl: string;
  }[];
}
