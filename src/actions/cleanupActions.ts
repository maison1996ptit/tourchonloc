import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteAllTours() {
  await prisma.tour.deleteMany({});
  revalidatePath('/tours');
  revalidatePath('/admin/tours');
}

export async function deleteAllBlogs() {
  await prisma.blog.deleteMany({});
  revalidatePath('/blogs');
  revalidatePath('/admin/blogs');
}
