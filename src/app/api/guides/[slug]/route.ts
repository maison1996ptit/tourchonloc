import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const guide = await prisma.guide.findUnique({
      where: { slug },
      include: {
        category: true,
        tags: true,
        seo: true,
        blocks: {
          orderBy: { order: 'asc' }
        },
        relatedTours: {
          include: {
            tour: true
          }
        },
        faqs: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    return NextResponse.json(guide);
  } catch (error) {
    console.error('Error in GET /api/guides/[slug]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
