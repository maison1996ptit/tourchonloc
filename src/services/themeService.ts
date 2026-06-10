import { 
  getThemeSettings, 
  updateThemeSettings 
} from '@/actions/themeActions';

export const themeService = {
  getTheme: getThemeSettings,
  updateTheme: updateThemeSettings,
};
