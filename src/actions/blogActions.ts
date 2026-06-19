'use server';

import { prisma } from '@/lib/prisma';
import { Blog, BlogStatus, MemoContent } from '@/types/blog';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getBlogs(): Promise<Blog[]> {
  const data = await prisma.blog.findMany({
    orderBy: { publishedDate: 'desc' }
  });

  const blogs: Blog[] = data.map(b => ({
    ...b,
    id: b.id,
    publishedDate: b.publishedDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    status: b.status as BlogStatus,
    category: b.category ?? undefined,
    author: b.author ?? undefined,
    isMemo: b.isMemo ?? undefined,
    coverImage: b.coverImage ?? undefined,
    memoContent: (b.memoContent as MemoContent) ?? undefined,
  }));

  const pinnedId = 'about-us-pinned';
  const pinnedBlog = blogs.find(b => b.id === pinnedId);
  const otherBlogs = blogs.filter(b => b.id !== pinnedId);
  
  return pinnedBlog ? [pinnedBlog, ...otherBlogs] : blogs;
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
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
    isMemo: b.isMemo ?? undefined,
    coverImage: b.coverImage ?? undefined,
    memoContent: (b.memoContent as MemoContent) ?? undefined,
  };
}

export async function createBlog(blog: Omit<Blog, 'id' | 'createdAt' | 'updatedAt'>): Promise<Blog> {
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
      isMemo: blog.isMemo,
      coverImage: blog.coverImage,
      memoContent: (blog.memoContent as Prisma.JsonObject) || Prisma.JsonNull,
    }
  });

  revalidatePath('/cam-nang');
  revalidatePath('/admin/blogs');

  return {
    ...b,
    publishedDate: b.publishedDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    status: b.status as BlogStatus,
    memoContent: (b.memoContent as MemoContent) ?? undefined,
  };
}

export async function updateBlog(id: string, updates: Partial<Blog>): Promise<Blog> {
  const allowedUpdates: Prisma.BlogUpdateInput = {};
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
  if (updates.isMemo !== undefined) allowedUpdates.isMemo = updates.isMemo;
  if (updates.coverImage !== undefined) allowedUpdates.coverImage = updates.coverImage;
  if (updates.memoContent !== undefined) {
    allowedUpdates.memoContent = (updates.memoContent as Prisma.JsonObject) || Prisma.JsonNull;
  }

  const b = await prisma.blog.update({
    where: { id },
    data: allowedUpdates
  });

  revalidatePath('/cam-nang');
  revalidatePath(`/cam-nang/${b.slug}`);
  revalidatePath('/admin/blogs');

  return {
    ...b,
    publishedDate: b.publishedDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    status: b.status as BlogStatus,
    memoContent: (b.memoContent as MemoContent) ?? undefined,
  };
}

  export async function deleteBlog(id: string) {
  try {
    await prisma.blog.delete({
      where: { id }
    });
    revalidatePath('/cam-nang');
    revalidatePath('/admin/blogs');
    return { success: true };
  } catch (e) {
    return { success: false };
  }
  }
