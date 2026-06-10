'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { ThemeSettings, Season, ThemeConfig } from '@/types/theme';
import { themeService } from '@/services/themeService';
import { mockThemeSettings } from '@/data/theme';

const getSeason = (): Season => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Autumn';
  return 'Winter';
};

const seasonalThemes: Record<Season, Partial<ThemeConfig>> = {
  Spring: {
    primaryColor: '#2D5A27', // Fresh Green
    secondaryColor: '#F0FFF0', // Honeydew
    accentColor: '#FF69B4', // Sakura Pink
    seasonCharacteristics: {
      icon: '🌸',
      description: 'Mùa xuân tươi mới - Khởi đầu những hành trình xanh'
    }
  },
  Summer: {
    primaryColor: '#0077BE', // Ocean Blue
    secondaryColor: '#FFFACD', // Lemon Chiffon
    accentColor: '#FFD700', // Gold Sun
    seasonCharacteristics: {
      icon: '☀️',
      description: 'Mùa hè rực rỡ - Tận hưởng biển xanh nắng vàng'
    }
  },
  Autumn: {
    primaryColor: '#8B4513', // Saddle Brown
    secondaryColor: '#FFF5EE', // Seashell
    accentColor: '#D2691E', // Chocolate
    seasonCharacteristics: {
      icon: '🍁',
      description: 'Mùa thu lãng mạn - Chạm vào sắc vàng quyến rũ'
    }
  },
  Winter: {
    primaryColor: '#1A2A6C', // Midnight Blue
    secondaryColor: '#F0F8FF', // Alice Blue
    accentColor: '#00BFFF', // Deep Sky Blue
    seasonCharacteristics: {
      icon: '❄️',
      description: 'Mùa đông ấm áp - Khám phá những vùng đất tuyết trắng'
    }
  }
};

interface ThemeContextType {
  theme: ThemeSettings | null;
  currentSeason: Season;
  updateTheme: (updates: Partial<ThemeSettings>) => Promise<void>;
  applyTheme: (theme: ThemeSettings) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawTheme, setRawTheme] = useState<ThemeSettings>(mockThemeSettings);
  const [currentSeason] = useState<Season>(getSeason());

  const applyTheme = useCallback((themeSettings: ThemeSettings) => {
    const root = document.documentElement;
    let config = { ...themeSettings.customConfig };

    if (themeSettings.useSeasonalTheme) {
      const seasonalConfig = seasonalThemes[getSeason()];
      config = { ...config, ...seasonalConfig };
    }

    root.style.setProperty('--primary-color', config.primaryColor);
    root.style.setProperty('--secondary-color', config.secondaryColor);
    root.style.setProperty('--accent-color', config.accentColor);
    root.style.setProperty('--background-color', config.backgroundColor);
    root.style.setProperty('--text-color', config.textColor);
    root.style.setProperty('--font-family', config.fontFamily);
    root.style.setProperty('--border-radius', config.borderRadius);
  }, []);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const data = await themeService.getTheme();
        if (data) {
          setRawTheme(data);
          applyTheme(data);
        }
      } catch (error) {
        console.error('Error fetching theme:', error);
      }
    };
    fetchTheme();
  }, [applyTheme]);

  const updateTheme = async (updates: Partial<ThemeSettings>) => {
    const updatedTheme = await themeService.updateTheme(updates);
    setRawTheme(updatedTheme);
    applyTheme(updatedTheme);
  };

  // Compute the "resolved" theme with seasonal overrides
  const theme = useMemo(() => {
    if (!rawTheme) return null;
    if (!rawTheme.useSeasonalTheme) return rawTheme;

    const seasonalConfig = seasonalThemes[currentSeason];
    return {
      ...rawTheme,
      customConfig: {
        ...rawTheme.customConfig,
        ...seasonalConfig
      }
    };
  }, [rawTheme, currentSeason]);

  return (
    <ThemeContext.Provider value={{ theme, currentSeason, updateTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
