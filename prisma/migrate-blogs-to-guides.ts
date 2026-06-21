import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Starting Migration: Blogs/Memos to Guides ===');

  // 1. Fetch all Blogs (including Memos)
  const blogs = await prisma.blog.findMany();
  console.log(`Found ${blogs.length} blogs/memos in the Blog table.`);

  for (const blog of blogs) {
    console.log(`\nMigrating: "${blog.title}" (slug: ${blog.slug})`);

    // Check if Guide with same slug already exists
    const existingGuide = await prisma.guide.findUnique({
      where: { slug: blog.slug },
    });

    if (existingGuide) {
      console.log(`- Guide with slug "${blog.slug}" already exists. Skipping.`);
      continue;
    }

    // 2. Resolve Category
    let categoryId = null;
    if (blog.categoryId) {
      // Find or create GuideCategory
      const guideCategorySlug = blog.categoryId;
      const guideCategoryName = blog.category || 'Cẩm nang du lịch';

      let guideCategory = await prisma.guideCategory.findUnique({
        where: { slug: guideCategorySlug },
      });

      if (!guideCategory) {
        console.log(`- Creating GuideCategory: "${guideCategoryName}" (${guideCategorySlug})`);
        guideCategory = await prisma.guideCategory.create({
          data: {
            name: guideCategoryName,
            slug: guideCategorySlug,
            description: `Danh mục được di chuyển tự động cho ${guideCategoryName}`,
          },
        });
      }
      categoryId = guideCategory.id;
    }

    // 3. Resolve Tags
    const tagConnects: { id: string }[] = [];
    if (blog.tags && blog.tags.length > 0) {
      for (const tagName of blog.tags) {
        const tagSlug = tagName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim();

        if (!tagSlug) continue;

        let tag = await prisma.guideTag.findUnique({
          where: { slug: tagSlug },
        });

        if (!tag) {
          tag = await prisma.guideTag.create({
            data: {
              name: tagName,
              slug: tagSlug,
            },
          });
        }
        tagConnects.push({ id: tag.id });
      }
    }

    // 4. Create Guide
    const views = 120 + Math.floor((new Date(blog.publishedDate).getTime() % 350));
    const guide = await prisma.guide.create({
      data: {
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt || '',
        coverImage: blog.coverImage || blog.thumbnail || '/logo.png',
        thumbnail: blog.thumbnail || null,
        status: blog.status,
        views: views,
        publishedAt: blog.publishedDate,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
        categoryId: categoryId,
        tags: {
          connect: tagConnects,
        },
      },
    });

    console.log(`- Guide created with ID: ${guide.id}`);

    // 5. Create SEO metadata
    await prisma.guideSEO.create({
      data: {
        guideId: guide.id,
        title: blog.seoTitle || blog.title,
        description: blog.seoDescription || blog.excerpt,
        keywords: blog.tags.join(', '),
      },
    });

    // 6. Generate Blocks
    const blocksData: { type: string; order: number; content: any }[] = [];
    const faqsData: { question: string; answer: string; order: number }[] = [];

    if (blog.isMemo && blog.memoContent) {
      // Parse Memo Content
      const memo = blog.memoContent as any;
      let order = 0;

      if (memo.hook) {
        blocksData.push({
          type: 'Quote',
          order: order++,
          content: { text: memo.hook, author: '' },
        });
      }

      if (memo.problem) {
        blocksData.push({
          type: 'Text',
          order: order++,
          content: { text: `## 🤔 Vấn đề thường gặp khi lên kế hoạch\n\n${memo.problem}` },
        });
      }

      if (memo.solution) {
        blocksData.push({
          type: 'Text',
          order: order++,
          content: { text: `## 💡 Giải pháp công nghệ từ Tour Chọn Lọc\n\n${memo.solution}` },
        });
      }

      if (memo.experience) {
        blocksData.push({
          type: 'Text',
          order: order++,
          content: { text: `## ⭐ Kinh nghiệm thực tế từ chuyên gia hành trình\n\n${memo.experience}` },
        });
      }

      if (memo.benefits) {
        blocksData.push({
          type: 'Text',
          order: order++,
          content: { text: `## 💎 Lợi ích khi đồng hành cùng Tour Chọn Lọc\n\n${memo.benefits}` },
        });
      }

      if (memo.cta && memo.cta.text && memo.cta.link) {
        blocksData.push({
          type: 'CTA',
          order: order++,
          content: { text: memo.cta.text, link: memo.cta.link, type: 'primary' },
        });
      }

      // Memo FAQs -> Guide FAQ model relation
      if (memo.faq && Array.isArray(memo.faq)) {
        memo.faq.forEach((faqItem: any, idx: number) => {
          if (faqItem.q && faqItem.a) {
            faqsData.push({
              question: faqItem.q,
              answer: faqItem.a,
              order: idx,
            });
          }
        });
      }
    } else {
      // Standard blog post content -> single text block
      blocksData.push({
        type: 'Text',
        order: 0,
        content: { text: blog.content || '' },
      });
    }

    // Insert Blocks to DB
    for (const block of blocksData) {
      await prisma.guideBlock.create({
        data: {
          guideId: guide.id,
          type: block.type,
          order: block.order,
          content: block.content,
        },
      });
    }
    console.log(`- Created ${blocksData.length} content blocks.`);

    // Insert FAQs to DB
    for (const faq of faqsData) {
      await prisma.guideFAQ.create({
        data: {
          guideId: guide.id,
          question: faq.question,
          answer: faq.answer,
          order: faq.order,
        },
      });
    }
    if (faqsData.length > 0) {
      console.log(`- Created ${faqsData.length} FAQ accordion items.`);
    }
  }

  console.log('\n=== Migration Completed Successfully ===');
}

main()
  .catch(e => console.error('Migration error:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });
