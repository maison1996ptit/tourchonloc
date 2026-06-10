'use server';

import { prisma } from '@/lib/prisma';
import { MenuItem } from '@/types/menu';
import { revalidatePath } from 'next/cache';

export async function getMenus() {
  const items = await prisma.menuItem.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  const header = items.filter(item => item.type === 'Header').map(item => ({
    id: item.id,
    label: item.label,
    url: item.url,
    order: item.order,
    isActive: item.isActive,
    parentId: item.parentId || undefined,
  }));

  const footer = items.filter(item => item.type === 'Footer').map(item => ({
    id: item.id,
    label: item.label,
    url: item.url,
    order: item.order,
    isActive: item.isActive,
    parentId: item.parentId || undefined,
  }));

  return { header, footer };
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>) {
  await prisma.menuItem.update({
    where: { id },
    data: {
      ...data as any,
    }
  });
  revalidatePath('/');
}
