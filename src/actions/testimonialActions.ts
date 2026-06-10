'use server';

import { prisma } from '@/lib/prisma';
import { Testimonial, TestimonialStatus } from '@/types/testimonial';
import { revalidatePath } from 'next/cache';

export async function getTestimonials() {
  const data = await prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  return data.map(t => ({
    ...t,
    status: t.status as TestimonialStatus,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  })) as Testimonial[];
}

export async function createTestimonial(data: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>) {
  const testimonial = await prisma.testimonial.create({
    data: {
      ...data,
      status: data.status || 'Draft',
    }
  });

  revalidatePath('/');
  revalidatePath('/admin/testimonials');

  return {
    ...testimonial,
    status: testimonial.status as TestimonialStatus,
    createdAt: testimonial.createdAt.toISOString(),
    updatedAt: testimonial.updatedAt.toISOString(),
  } as Testimonial;
}

export async function updateTestimonial(id: string, data: Partial<Testimonial>) {
  const updated = await prisma.testimonial.update({
    where: { id },
    data: {
      ...data as any,
    }
  });

  revalidatePath('/');
  revalidatePath('/admin/testimonials');

  return {
    ...updated,
    status: updated.status as TestimonialStatus,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  } as Testimonial;
}

export async function deleteTestimonial(id: string) {
  try {
    await prisma.testimonial.delete({
      where: { id }
    });
    revalidatePath('/');
    revalidatePath('/admin/testimonials');
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}
