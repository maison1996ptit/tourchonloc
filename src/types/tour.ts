export type TourStatus = 'Draft' | 'Published' | 'Archived';

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface GroupPrice {
  groupSize: string;
  pricePerPerson: number;
}

export interface Tour {
  id: string;
  title: string;
  slug: string;
  category: string;
  destination: string;
  region: string;
  durationDays: number;
  durationNights: number;
  priceFrom: number;
  departureDates: string[]; // Added this field
  shortDescription: string;
  overview: string;
  highlights: string[];
  itinerary: ItineraryDay[];
  included: string[];
  excluded: string[];
  priceByGroupSize: GroupPrice[];
  seoTitle: string;
  seoDescription: string;
  status: TourStatus;
  images: string[];
  featuredImage: string;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}
