import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to map Unsplash images to local images based on keywords or index
function getLocalImage(url, index = 0) {
  if (!url || !url.startsWith('https://images.unsplash.com')) {
    return url;
  }

  const lowercaseUrl = url.toLowerCase();

  // Try to match destination keywords to select appropriate local images
  if (lowercaseUrl.includes('tokyo') || lowercaseUrl.includes('japan') || lowercaseUrl.includes('fuji') || lowercaseUrl.includes('kyoto')) {
    const num = (index % 10) + 1;
    return `/images/guides/j${num}.jpg`;
  }
  if (lowercaseUrl.includes('korea') || lowercaseUrl.includes('seoul')) {
    const num = (index % 10) + 1;
    return `/images/guides/kr${num}.jpg`;
  }
  if (lowercaseUrl.includes('vietnam') || lowercaseUrl.includes('hanoi') || lowercaseUrl.includes('halong') || lowercaseUrl.includes('viet-nam')) {
    const num = (index % 10) + 1;
    return `/images/guides/v${num}.jpg`;
  }
  if (lowercaseUrl.includes('china') || lowercaseUrl.includes('beijing') || lowercaseUrl.includes('shanghai')) {
    const num = (index % 10) + 1;
    return `/images/guides/cn${num}.jpg`;
  }
  if (lowercaseUrl.includes('taiwan') || lowercaseUrl.includes('taipei')) {
    const num = (index % 10) + 1;
    return `/images/guides/tw${num}.jpg`;
  }
  if (lowercaseUrl.includes('france') || lowercaseUrl.includes('paris')) {
    const num = (index % 10) + 1;
    return `/images/guides/fr${num}.jpg`;
  }
  if (lowercaseUrl.includes('germany') || lowercaseUrl.includes('berlin') || lowercaseUrl.includes('munich')) {
    const num = (index % 10) + 1;
    return `/images/guides/de${num}.jpg`;
  }
  if (lowercaseUrl.includes('italy') || lowercaseUrl.includes('rome') || lowercaseUrl.includes('venice')) {
    const num = (index % 10) + 1;
    return `/images/guides/it${num}.jpg`;
  }
  if (lowercaseUrl.includes('london') || lowercaseUrl.includes('uk') || lowercaseUrl.includes('england')) {
    const num = (index % 10) + 1;
    return `/images/guides/uk${num}.jpg`;
  }
  if (lowercaseUrl.includes('spain') || lowercaseUrl.includes('barcelona') || lowercaseUrl.includes('madrid')) {
    const num = (index % 10) + 1;
    return `/images/guides/es${num}.jpg`;
  }
  if (lowercaseUrl.includes('greece') || lowercaseUrl.includes('athens') || lowercaseUrl.includes('santorini')) {
    const num = (index % 10) + 1;
    return `/images/guides/gr${num}.jpg`;
  }
  if (lowercaseUrl.includes('turkey') || lowercaseUrl.includes('istanbul') || lowercaseUrl.includes('cappadocia')) {
    const num = (index % 10) + 1;
    return `/images/guides/tr${num}.jpg`;
  }

  // Fallback to random local images
  const prefixes = ['v', 'j', 'kr', 'cn', 'tw', 'fr', 'de', 'it', 'uk', 'es', 'gr', 'tr'];
  const prefix = prefixes[index % prefixes.length];
  const num = (index % 5) + 1;
  return `/images/guides/${prefix}${num}.jpg`;
}

// Special helper to clean JSON values
function replaceInJson(obj, index = 0) {
  if (!obj) return obj;
  let str = JSON.stringify(obj);
  
  // Find all Unsplash URLs and replace them
  const unsplashRegex = /https:\/\/images\.unsplash\.com\/[^"'\s?]+/g;
  str = str.replace(unsplashRegex, (match) => {
    return getLocalImage(match, index);
  });
  
  return JSON.parse(str);
}

async function main() {
  console.log('🔄 Đang kết nối database để xử lý Unsplash URLs...');

  try {
    // 1. Tour Table
    const tours = await prisma.tour.findMany();
    console.log(`- Đang cập nhật ${tours.length} tours...`);
    for (let i = 0; i < tours.length; i++) {
      const tour = tours[i];
      const updatedFeatured = getLocalImage(tour.featuredImage, i);
      const updatedImages = tour.images.map((img, idx) => getLocalImage(img, i + idx));
      const updatedItinerary = replaceInJson(tour.itinerary, i);
      
      await prisma.tour.update({
        where: { id: tour.id },
        data: {
          featuredImage: updatedFeatured,
          images: updatedImages,
          itinerary: updatedItinerary
        }
      });
    }

    // 2. Blog Table
    const blogs = await prisma.blog.findMany();
    console.log(`- Đang cập nhật ${blogs.length} blogs...`);
    for (let i = 0; i < blogs.length; i++) {
      const blog = blogs[i];
      await prisma.blog.update({
        where: { id: blog.id },
        data: {
          thumbnail: getLocalImage(blog.thumbnail, i),
          coverImage: blog.coverImage ? getLocalImage(blog.coverImage, i) : null
        }
      });
    }

    // 3. SiteSettings Table
    const settings = await prisma.siteSettings.findFirst();
    if (settings) {
      console.log(`- Đang cập nhật Site Settings...`);
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          heroImage: getLocalImage(settings.heroImage, 0),
          affiliateGear: replaceInJson(settings.affiliateGear, 0)
        }
      });
    }

    // 4. Testimonial Table
    const testimonials = await prisma.testimonial.findMany();
    console.log(`- Đang cập nhật ${testimonials.length} testimonials...`);
    for (let i = 0; i < testimonials.length; i++) {
      const item = testimonials[i];
      if (item.avatar && item.avatar.startsWith('https://images.unsplash.com')) {
        await prisma.testimonial.update({
          where: { id: item.id },
          data: {
            // Use chatbotLogo.png or local fallback
            avatar: '/chatbotLogo.png'
          }
        });
      }
    }

    // 5. RegionMarker Table
    const markers = await prisma.regionMarker.findMany();
    console.log(`- Đang cập nhật ${markers.length} markers...`);
    for (let i = 0; i < markers.length; i++) {
      const m = markers[i];
      if (m.imageUrl) {
        await prisma.regionMarker.update({
          where: { id: m.id },
          data: {
            imageUrl: getLocalImage(m.imageUrl, i)
          }
        });
      }
    }

    // 6. Guide Table
    const guides = await prisma.guide.findMany();
    console.log(`- Đang cập nhật ${guides.length} guides...`);
    for (let i = 0; i < guides.length; i++) {
      const g = guides[i];
      await prisma.guide.update({
        where: { id: g.id },
        data: {
          coverImage: getLocalImage(g.coverImage, i),
          thumbnail: g.thumbnail ? getLocalImage(g.thumbnail, i) : null
        }
      });
    }

    // 7. GuideBlock Table
    const blocks = await prisma.guideBlock.findMany();
    console.log(`- Đang cập nhật ${blocks.length} guide blocks...`);
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const updatedContent = replaceInJson(b.content, i);
      await prisma.guideBlock.update({
        where: { id: b.id },
        data: {
          content: updatedContent
        }
      });
    }

    // 8. GuideSEO Table
    const seos = await prisma.guideSEO.findMany();
    console.log(`- Đang cập nhật ${seos.length} SEO records...`);
    for (let i = 0; i < seos.length; i++) {
      const s = seos[i];
      await prisma.guideSEO.update({
        where: { id: s.id },
        data: {
          ogImage: s.ogImage ? getLocalImage(s.ogImage, i) : null,
          twitterImage: s.twitterImage ? getLocalImage(s.twitterImage, i) : null
        }
      });
    }

    console.log('✅ THÀNH CÔNG! Đã thay thế toàn bộ Unsplash URLs bằng ảnh local.');
  } catch (error) {
    console.error('❌ LỖI trong quá trình cập nhật:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
