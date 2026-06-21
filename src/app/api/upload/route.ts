import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session || (session.role !== 'Admin' && session.role !== 'Editor')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    // Ensure uploads directory exists
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique filename to avoid collision
    const timestamp = Date.now();
    const rawFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${rawFilename}`;
    const filePath = path.join(uploadsDir, filename);

    // Save file
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    // Store in DB
    const media = await prisma.guideMedia.create({
      data: {
        url: fileUrl,
        filename: file.name,
        mimeType: file.type,
        size: file.size
      }
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/upload:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
