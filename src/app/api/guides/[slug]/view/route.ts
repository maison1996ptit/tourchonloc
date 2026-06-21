import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const guide = await prisma.guide.findUnique({
      where: { slug }
    });
    
    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    const id = guide.id;
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    const userAgent = request.headers.get('user-agent') || '';

    // Atomically increment views count and log details in transaction
    await prisma.$transaction([
      prisma.guide.update({
        where: { id },
        data: { views: { increment: 1 } }
      }),
      prisma.guideViews.create({
        data: {
          guideId: id,
          ipAddress,
          userAgent
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/guides/[slug]/view:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
