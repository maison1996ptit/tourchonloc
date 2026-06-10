'use server';

import { prisma } from '@/lib/prisma';
import { SiteSettings } from '@/types/siteSettings';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/auth-utils';
import { mockSiteSettings } from '@/data/siteSettings';

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'main_settings' }
  });
  
  if (!settings) return null;

  return {
    websiteName: settings.websiteName,
    tagline: settings.tagline,
    heroHeadline: settings.heroHeadline,
    heroSubtitle: settings.heroSubtitle,
    heroImage: settings.heroImage,
    heroCTA: settings.heroCTA as any,
    footerDescription: settings.footerDescription,
    contactInfo: settings.contactInfo as any,
    socialLinks: settings.socialLinks as any,
    seoDefaultTitle: settings.seoDefaultTitle,
    seoDefaultDescription: settings.seoDefaultDescription,
    affiliateGear: settings.affiliateGear as any,
  } as SiteSettings;
}

export async function updateSiteSettings(updates: Partial<SiteSettings>) {
  if (!(await isAdmin())) throw new Error('Unauthorized');

  const current = (await getSiteSettings()) || mockSiteSettings;
  const updated = { ...current, ...updates };
  
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'main_settings' },
    update: {
      websiteName: updated.websiteName,
      tagline: updated.tagline,
      heroHeadline: updated.heroHeadline,
      heroSubtitle: updated.heroSubtitle,
      heroImage: updated.heroImage,
      heroCTA: updated.heroCTA as any,
      footerDescription: updated.footerDescription,
      contactInfo: updated.contactInfo as any,
      socialLinks: updated.socialLinks as any,
      seoDefaultTitle: updated.seoDefaultTitle,
      seoDefaultDescription: updated.seoDefaultDescription,
      affiliateGear: updated.affiliateGear as any,
    },
    create: {
      id: 'main_settings',
      websiteName: updated.websiteName,
      tagline: updated.tagline,
      heroHeadline: updated.heroHeadline,
      heroSubtitle: updated.heroSubtitle,
      heroImage: updated.heroImage,
      heroCTA: updated.heroCTA as any,
      footerDescription: updated.footerDescription,
      contactInfo: updated.contactInfo as any,
      socialLinks: updated.socialLinks as any,
      seoDefaultTitle: updated.seoDefaultTitle,
      seoDefaultDescription: updated.seoDefaultDescription,
      affiliateGear: updated.affiliateGear as any,
    }
  });

  revalidatePath('/', 'layout');
  revalidatePath('/admin/site-settings');

  return {
    websiteName: settings.websiteName,
    tagline: settings.tagline,
    heroHeadline: settings.heroHeadline,
    heroSubtitle: settings.heroSubtitle,
    heroImage: settings.heroImage,
    heroCTA: settings.heroCTA as any,
    footerDescription: settings.footerDescription,
    contactInfo: settings.contactInfo as any,
    socialLinks: settings.socialLinks as any,
    seoDefaultTitle: settings.seoDefaultTitle,
    seoDefaultDescription: settings.seoDefaultDescription,
    affiliateGear: settings.affiliateGear as any,
  } as SiteSettings;
}
