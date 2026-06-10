import { 
  getSiteSettings, 
  updateSiteSettings 
} from '@/actions/siteSettingsActions';

export const siteSettingsService = {
  getSettings: getSiteSettings,
  updateSettings: updateSiteSettings,
};
