import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth-utils';
import { GuideStatus } from '@/types/guide';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'Published';
    const categorySlug = searchParams.get('category') || '';
    const country = searchParams.get('country') || '';
    const city = searchParams.get('city') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // 'createdAt' | 'views'
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (status !== 'All') {
      whereClause.status = status;
    }

    if (categorySlug) {
      whereClause.category = {
        slug: categorySlug
      };
    }

    if (country) {
      whereClause.country = country;
    }

    if (city) {
      whereClause.city = city;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { tags: { some: { name: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    const orderByClause: any = {};
    if (sortBy === 'views') {
      orderByClause.views = 'desc';
    } else {
      orderByClause.createdAt = 'desc';
    }

    const [total, data] = await Promise.all([
      prisma.guide.count({ where: whereClause }),
      prisma.guide.findMany({
        where: whereClause,
        include: {
          category: true,
          tags: true,
          seo: true,
          relatedTours: {
            include: {
              tour: true
            }
          },
          faqs: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: orderByClause,
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error in GET /api/guides:', error);
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
    const { 
      title, 
      slug, 
      excerpt, 
      coverImage, 
      thumbnail = '', 
      country = '', 
      city = '', 
      status, 
      categoryId, 
      tagIds = [], 
      seo = {}, 
      blocks = [],
      relatedTourIds = [],
      faqs = []
    } = body;

    if (!title || !slug || !excerpt || !coverImage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if slug is unique
    const existing = await prisma.guide.findUnique({
      where: { slug }
    });
    if (existing) {
      return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
    }

    const newGuide = await prisma.$transaction(async (tx) => {
      // 1. Create Guide
      const guide = await tx.guide.create({
        data: {
          title,
          slug,
          excerpt,
          coverImage,
          thumbnail: thumbnail || null,
          country: country || null,
          city: city || null,
          status: status as GuideStatus,
          publishedAt: status === 'Published' ? new Date() : null,
          categoryId: categoryId || null,
          tags: {
            connect: tagIds.map((id: string) => ({ id }))
          }
        }
      });

      // 2. Create SEO if provided
      if (seo) {
        await tx.guideSEO.create({
          data: {
            guideId: guide.id,
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

      // 3. Create blocks if provided
      if (blocks && blocks.length > 0) {
        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];
          await tx.guideBlock.create({
            data: {
              guideId: guide.id,
              type: block.type,
              order: i,
              content: block.content || {}
            }
          });
        }
      }

      // 4. Create related tours if provided
      if (relatedTourIds && relatedTourIds.length > 0) {
        for (let i = 0; i < relatedTourIds.length; i++) {
          await tx.guideRelatedTour.create({
            data: {
              guideId: guide.id,
              tourId: relatedTourIds[i],
              order: i
            }
          });
        }
      }

      // 5. Create FAQs if provided
      if (faqs && faqs.length > 0) {
        for (let i = 0; i < faqs.length; i++) {
          await tx.guideFAQ.create({
            data: {
              guideId: guide.id,
              question: faqs[i].question,
              answer: faqs[i].answer,
              order: i
            }
          });
        }
      }

      return tx.guide.findUnique({
        where: { id: guide.id },
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
    });

    return NextResponse.json(newGuide, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/guides:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
