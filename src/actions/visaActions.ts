'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getVisaServices() {
  const data = await prisma.visaService.findMany({
    orderBy: { country: 'asc' }
  });

  return data.map(v => ({
    id: v.id,
    country: v.country,
    price: v.price,
    description: v.description || '',
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString()
  }));
}

export async function createVisaService(data: { country: string; price: number; description?: string }) {
  const v = await prisma.visaService.create({
    data: {
      country: data.country,
      price: data.price,
      description: data.description || ''
    }
  });

  revalidatePath('/visa');
  revalidatePath('/admin/visas');

  return {
    id: v.id,
    country: v.country,
    price: v.price,
    description: v.description || '',
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString()
  };
}

export async function updateVisaService(id: string, updates: { country: string; price: number; description?: string }) {
  const v = await prisma.visaService.update({
    where: { id },
    data: {
      country: updates.country,
      price: updates.price,
      description: updates.description || ''
    }
  });

  revalidatePath('/visa');
  revalidatePath('/admin/visas');

  return {
    id: v.id,
    country: v.country,
    price: v.price,
    description: v.description || '',
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString()
  };
}

export async function deleteVisaService(id: string) {
  await prisma.visaService.delete({
    where: { id }
  });

  revalidatePath('/visa');
  revalidatePath('/admin/visas');

  return { success: true };
}

// === Visa Stats Actions ===

export async function getVisaStats() {
  const stats = await prisma.visaStats.findUnique({
    where: { id: 'singleton' },
  });

  if (stats) {
    return stats;
  }
  
  // If no stats exist, create them with default values
  const defaultStats = await prisma.visaStats.create({
    data: {
      id: 'singleton',
      passRate: 98.6,
      successfulClients: 10000,
      experienceYears: 10,
    }
  });
  return defaultStats;
}

export async function updateVisaStats(data: {
  passRate: number;
  successfulClients: number;
  experienceYears: number;
}) {
  const { passRate, successfulClients, experienceYears } = data;

  if (passRate < 0 || successfulClients < 0 || experienceYears < 0) {
    throw new Error('Số liệu không được là số âm.');
  }

  const stats = await prisma.visaStats.update({
    where: { id: 'singleton' },
    data: {
      passRate,
      successfulClients,
      experienceYears,
    },
  });

  revalidatePath('/visa');
  revalidatePath('/admin/visas');

  return stats;
}
