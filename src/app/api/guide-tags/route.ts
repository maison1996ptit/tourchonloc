import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth-utils';

export async function GET() {
  try {
    const tags = await prisma.guideTag.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error in GET /api/guide-tags:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin role required.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const tag = await prisma.guideTag.create({
      data: { name, slug }
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/guide-tags:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
