import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    const tours = await prisma.tour.findMany({
      where: {
        status: 'Published',
        title: { contains: query, mode: 'insensitive' }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        priceFrom: true,
        durationDays: true,
        durationNights: true,
        featuredImage: true
      },
      take: 10
    });

    return NextResponse.json(tours);
  } catch (error) {
    console.error('Error in GET /api/tours/search:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
