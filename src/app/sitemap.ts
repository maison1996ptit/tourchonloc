import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tourchonloc.com';

  // Fetch published tours, guides, and country guides
  const [tours, guides, countryGuides] = await Promise.all([
    prisma.tour.findMany({
      where: { status: 'Published' },
      select: { slug: true, updatedAt: true }
    }),
    prisma.guide.findMany({
      where: { status: 'Published' },
      select: { slug: true, updatedAt: true }
    }),
    prisma.countryGuide.findMany({
      select: { countrySlug: true, updatedAt: true }
    })
  ]);

  const staticPages = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/tours`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/cam-nang`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/visa`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/customize-trip`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ] as MetadataRoute.Sitemap;

  const tourUrls = tours.map(t => ({
    url: `${baseUrl}/tours/${t.slug}`,
    lastModified: t.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8
  })) as MetadataRoute.Sitemap;

  const guideUrls = guides.map(g => ({
    url: `${baseUrl}/cam-nang/${g.slug}`,
    lastModified: g.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7
  })) as MetadataRoute.Sitemap;

  const countryGuideUrls = countryGuides.map(cg => ({
    url: `${baseUrl}/guides/${cg.countrySlug}`,
    lastModified: cg.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8
  })) as MetadataRoute.Sitemap;

  return [...staticPages, ...tourUrls, ...guideUrls, ...countryGuideUrls];
}
