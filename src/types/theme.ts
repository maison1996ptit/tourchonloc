export type ThemePreset = 'Luxury Emerald' | 'Ocean Blue' | 'Golden Heritage' | 'Minimal White' | 'Dark Premium' | 'Seasonal';

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: 'rounded' | 'square' | 'pill';
  cardStyle: 'flat' | 'elevated' | 'bordered';
  headerStyle: 'fixed' | 'static' | 'transparent';
  footerStyle: 'simple' | 'detailed' | 'dark';
  seasonCharacteristics?: {
    icon: string;
    overlayImage?: string;
    description: string;
  };
}

export interface ThemeSettings {
  activePreset: ThemePreset;
  customConfig: ThemeConfig;
  useSeasonalTheme: boolean;
}
