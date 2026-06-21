import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session || (session.role !== 'Admin' && session.role !== 'Editor')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const mediaList = await prisma.guideMedia.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(mediaList);
  } catch (error) {
    console.error('Error in GET /api/media:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
