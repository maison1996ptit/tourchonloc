import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- DEFINITIVE SURGICAL RESTORATION: REAL MASTERPIECES (V12) ---');

  await prisma.regionMarker.deleteMany({});
  await prisma.countryGuide.deleteMany({});

  const vn = await prisma.countryGuide.create({
    data: { id: 'vn-map', countryName: 'Việt Nam', countrySlug: 'viet-nam', centerLat: 16.4637, centerLng: 107.5909, zoom: 6, maxBounds: [[8, 102], [23.5, 110]] }
  });
  const jp = await prisma.countryGuide.create({
    data: { id: 'japan-map', countryName: 'Nhật Bản', countrySlug: 'nhat-ban', centerLat: 36.2048, centerLng: 138.2529, zoom: 5, maxBounds: [[24, 122], [46, 154]] }
  });

  // THE 100% PROVEN ONES - LOCAL FILES
  const coreVN = [
    { id: 'v1', name: 'Hà Nội (Lăng Bác)', img: '/images/guides/v1_REAL_FINAL_V12.jpg', desc: 'Lăng Chủ tịch Hồ Chí Minh uy nghiêm.' },
    { id: 'v2', name: 'Vịnh Hạ Long', img: '/images/guides/REAL_v2.jpg', desc: 'Kỳ quan thiên nhiên thế giới UNESCO.' },
    { id: 'v3', name: 'Sapa', img: '/images/guides/REAL_v3.jpg', desc: 'Ruộng bậc thang Mường Hoa hùng vĩ.' }
  ];

  const coreJP = [
    { id: 'j1', name: 'Tokyo (Shibuya)', img: '/images/guides/j1_REAL_FINAL_V12.jpg', desc: 'Giao lộ Shibuya sầm uất rực rỡ.' },
    { id: 'j5', name: 'Núi Phú Sĩ', img: '/images/guides/j5_REAL_FINAL_V12.jpg', desc: 'Biểu tượng linh hồn của Nhật Bản.' },
    { id: 'j3', name: 'Osaka Castle', img: '/images/guides/REAL_j3.jpg', desc: 'Lâu đài Osaka uy nghiêm, hùng vĩ.' }
  ];

  for (const m of coreVN) {
    await prisma.regionMarker.create({
      data: {
        id: m.id, name: m.name, lat: 21.0367, lng: 105.8347,
        markerType: 'Spot', contentSlug: m.id, shortDescription: m.desc,
        imageUrl: m.img, countryGuideId: vn.id, priority: 1, metadata: {}
      }
    });
  }

  for (const m of coreJP) {
    await prisma.regionMarker.create({
      data: {
        id: m.id, name: m.name, lat: 35.6595, lng: 139.7005,
        markerType: 'Spot', contentSlug: m.id, shortDescription: m.desc,
        imageUrl: m.img, countryGuideId: jp.id, priority: 1, metadata: {}
      }
    });
  }

  console.log('[OK] Seeded 6 REAL masterpieces.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
