import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth-utils';
import { GuideStatus } from '@/types/guide';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin role required.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, slug, excerpt, coverImage, status, categoryId, tagIds = [], seo = {}, blocks = [] } = body;

    // Check if Guide exists
    const existing = await prisma.guide.findUnique({
      where: { id }
    });
    if (!existing) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    // Check if new slug is unique if changed
    if (slug !== existing.slug) {
      const slugCheck = await prisma.guide.findUnique({
        where: { slug }
      });
      if (slugCheck) {
        return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
      }
    }

    const updatedGuide = await prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      const guide = await tx.guide.update({
        where: { id },
        data: {
          title,
          slug,
          excerpt,
          coverImage,
          status: status as GuideStatus,
          publishedAt: status === 'Published' && !existing.publishedAt ? new Date() : existing.publishedAt,
          categoryId: categoryId || null,
          tags: {
            set: [], // Clear connections
            connect: tagIds.map((tid: string) => ({ id: tid })) // Re-connect
          }
        }
      });

      // 2. Update/Create SEO
      if (seo) {
        await tx.guideSEO.upsert({
          where: { guideId: id },
          create: {
            guideId: id,
            title: seo.title || null,
            description: seo.description || null,
            keywords: seo.keywords || null,
            ogTitle: seo.ogTitle || null,
            ogDescription: seo.ogDescription || null,
            ogImage: seo.ogImage || null,
            twitterTitle: seo.twitterTitle || null,
            twitterDescription: seo.twitterDescription || null,
            twitterImage: seo.twitterImage || null
          },
          update: {
            title: seo.title || null,
            description: seo.description || null,
            keywords: seo.keywords || null,
            ogTitle: seo.ogTitle || null,
            ogDescription: seo.ogDescription || null,
            ogImage: seo.ogImage || null,
            twitterTitle: seo.twitterTitle || null,
            twitterDescription: seo.twitterDescription || null,
            twitterImage: seo.twitterImage || null
          }
        });
      }

      // 3. Sync blocks (delete old, insert new to ensure order matches exactly)
      await tx.guideBlock.deleteMany({
        where: { guideId: id }
      });

      if (blocks && blocks.length > 0) {
        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];
          await tx.guideBlock.create({
            data: {
              guideId: id,
              type: block.type,
              order: i,
              content: block.content || {}
            }
          });
        }
      }

      return tx.guide.findUnique({
        where: { id },
        include: {
          category: true,
          tags: true,
          seo: true,
          blocks: {
            orderBy: { order: 'asc' }
          }
        }
      });
    });

    return NextResponse.json(updatedGuide);
  } catch (error) {
    console.error('Error in PUT /api/guides/admin/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin role required.' }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.guide.findUnique({
      where: { id }
    });
    if (!existing) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    await prisma.guide.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/guides/admin/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
