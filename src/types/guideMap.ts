export interface RegionMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  markerType?: 'Spot' | 'Airport';
  contentSlug: string;
  shortDescription: string;
  imageUrl?: string;
  microCopy?: string;
  priority?: 1 | 2 | 3;
  metadata?: {
    flights?: Array<{ from: string; duration: string }>;
  };
}

export interface CountryGuideMap {
  id: string;
  countryName: string;
  countrySlug: string;
  center: [number, number];
  zoom: number;
  maxBounds: [[number, number], [number, number]];
  borderPolygon: [number, number][]; 
  markers: RegionMarker[];
  introduction?: string;
  cultureInfo?: string;
  historyInfo?: string;
  geographyInfo?: string;
  populationInfo?: string;
  flag?: string;
  mascot?: string;
}
