import { ThemeSettings } from '@/types/theme';

export const mockThemeSettings: ThemeSettings = {
  activePreset: 'Luxury Emerald',
  useSeasonalTheme: false,
  customConfig: {
    primaryColor: '#4F46E5', // Deep Indigo (Premium & Trust)
    secondaryColor: '#F8FAFC',
    accentColor: '#0EA5E9', // Vibrant Sky Blue (Action & Sale)
    backgroundColor: '#ffffff',
    textColor: '#1E293B',
    fontFamily: 'var(--font-body), sans-serif',
    borderRadius: '16px',
    buttonStyle: 'rounded',
    cardStyle: 'elevated',
    headerStyle: 'fixed',
    footerStyle: 'dark'
  }
};
