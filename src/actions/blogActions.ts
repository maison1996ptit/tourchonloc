'use server';

import { prisma } from '@/lib/prisma';
import { Blog, BlogStatus } from '@/types/blog';
import { revalidatePath } from 'next/cache';

export async function getBlogs() {
  const data = await prisma.blog.findMany({
    orderBy: { publishedDate: 'desc' }
  });

  const blogs = data.map(b => ({
    ...b,
    id: b.id,
    publishedDate: b.publishedDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    status: b.status as BlogStatus,
    category: b.category ?? undefined,
    author: b.author ?? undefined,
  }));

  const pinnedId = 'about-us-pinned';
  const pinnedBlog = blogs.find(b => b.id === pinnedId);
  const otherBlogs = blogs.filter(b => b.id !== pinnedId);
  
  return pinnedBlog ? [pinnedBlog, ...otherBlogs] : blogs;
}

export async function getBlogBySlug(slug: string) {
  const b = await prisma.blog.findUnique({
    where: { slug }
  });
  if (!b) return null;
  
  return {
    ...b,
    publishedDate: b.publishedDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    status: b.status as BlogStatus,
    category: b.category ?? undefined,
    author: b.author ?? undefined,
  };
}

export async function createBlog(blog: Omit<Blog, 'id' | 'createdAt' | 'updatedAt'>) {
  const b = await prisma.blog.create({
    data: {
      title: blog.title,
      slug: blog.slug,
      categoryId: blog.categoryId,
      category: blog.category,
      author: blog.author,
      thumbnail: blog.thumbnail,
      excerpt: blog.excerpt,
      content: blog.content,
      seoTitle: blog.seoTitle,
      seoDescription: blog.seoDescription,
      tags: blog.tags,
      publishedDate: new Date(blog.publishedDate),
      status: blog.status || 'Published',
    }
  });

  revalidatePath('/blogs');
  revalidatePath('/admin/blogs');
  
  return {
    ...b,
    publishedDate: b.publishedDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    status: b.status as BlogStatus,
  };
}

export async function updateBlog(id: string, updates: Partial<Blog>) {
  const allowedUpdates: any = {};
  if (updates.title !== undefined) allowedUpdates.title = updates.title;
  if (updates.slug !== undefined) allowedUpdates.slug = updates.slug;
  if (updates.categoryId !== undefined) allowedUpdates.categoryId = updates.categoryId;
  if (updates.category !== undefined) allowedUpdates.category = updates.category;
  if (updates.author !== undefined) allowedUpdates.author = updates.author;
  if (updates.thumbnail !== undefined) allowedUpdates.thumbnail = updates.thumbnail;
  if (updates.excerpt !== undefined) allowedUpdates.excerpt = updates.excerpt;
  if (updates.content !== undefined) allowedUpdates.content = updates.content;
  if (updates.seoTitle !== undefined) allowedUpdates.seoTitle = updates.seoTitle;
  if (updates.seoDescription !== undefined) allowedUpdates.seoDescription = updates.seoDescription;
  if (updates.tags !== undefined) allowedUpdates.tags = updates.tags;
  if (updates.publishedDate !== undefined) allowedUpdates.publishedDate = new Date(updates.publishedDate);
  if (updates.status !== undefined) allowedUpdates.status = updates.status;

  const b = await prisma.blog.update({
    where: { id },
    data: allowedUpdates
  });

  revalidatePath('/blogs');
  revalidatePath(`/blogs/${b.slug}`);
  revalidatePath('/admin/blogs');

  return {
    ...b,
    publishedDate: b.publishedDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    status: b.status as BlogStatus,
  };
}

export async function deleteBlog(id: string) {
  try {
    await prisma.blog.delete({
      where: { id }
    });
    revalidatePath('/blogs');
    revalidatePath('/admin/blogs');
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}
