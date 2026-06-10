'use server';

import { prisma } from '@/lib/prisma';
import { ThemeSettings, ThemePreset } from '@/types/theme';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/auth-utils';

export async function getThemeSettings() {
  const settings = await prisma.themeSettings.findUnique({
    where: { id: 'main_theme' }
  });

  if (!settings) return null;

  return {
    activePreset: settings.activePreset as ThemePreset,
    useSeasonalTheme: settings.useSeasonalTheme,
    customConfig: settings.customConfig as any
  } as ThemeSettings;
}

export async function updateThemeSettings(updates: Partial<ThemeSettings>) {
  if (!(await isAdmin())) throw new Error('Unauthorized');

  const current = await getThemeSettings();
  if (!current) throw new Error('Theme settings not found');

  const updated = { ...current, ...updates };
  
  const settings = await prisma.themeSettings.upsert({
    where: { id: 'main_theme' },
    update: {
      activePreset: updated.activePreset,
      useSeasonalTheme: updated.useSeasonalTheme,
      customConfig: updated.customConfig as any
    },
    create: {
      id: 'main_theme',
      activePreset: updated.activePreset,
      useSeasonalTheme: updated.useSeasonalTheme,
      customConfig: updated.customConfig as any
    }
  });

  revalidatePath('/', 'layout');
  revalidatePath('/admin/theme');

  return {
    activePreset: settings.activePreset as ThemePreset,
    useSeasonalTheme: settings.useSeasonalTheme,
    customConfig: settings.customConfig as any
  } as ThemeSettings;
}
