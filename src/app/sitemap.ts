import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tourchonloc.com';

  // Fetch published tours and blogs
  const [tours, blogs] = await Promise.all([
    prisma.tour.findMany({
      where: { status: 'Published' },
      select: { slug: true, updatedAt: true }
    }),
    prisma.blog.findMany({
      where: { status: 'Published' },
      select: { slug: true, updatedAt: true }
    })
  ]);

  const staticPages = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/tours`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/cam-nang`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/visa`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ] as MetadataRoute.Sitemap;

  const tourUrls = tours.map(t => ({
    url: `${baseUrl}/tours/${t.slug}`,
    lastModified: t.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8
  })) as MetadataRoute.Sitemap;

  const blogUrls = blogs.map(b => ({
    url: `${baseUrl}/blogs/${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7
  })) as MetadataRoute.Sitemap;

  return [...staticPages, ...tourUrls, ...blogUrls];
}
