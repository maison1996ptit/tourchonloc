'use server';

import { prisma } from '@/lib/prisma';
import { CountryGuideMap, RegionMarker } from '@/types/guideMap';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { mockGuideMaps } from '@/data/guideMaps';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SLUG_ORDER = [
  'viet-nam',
  'nhat-ban',
  'han-quoc',
  'dai-loan',
  'trung-quoc',
  'tho-nhi-ky',
  'hy-lap',
  'ao',
  'y',
  'duc',
  'thuy-si',
  'ha-lan',
  'phap',
  'anh',
  'tay-ban-nha'
];

export async function getCountryGuides(): Promise<CountryGuideMap[]> {
  noStore(); // FORCE FRESH DATA ON EVERY LOAD
  try {
    const guides = await prisma.countryGuide.findMany({
      include: {
        markers: true,
      },
    });

    const mapped = guides.map((g) => {
      const borderPolygon = mockGuideMaps.find(m => m.countrySlug === g.countrySlug)?.borderPolygon || [];
      return {
        id: g.id,
        countryName: g.countryName,
        countrySlug: g.countrySlug,
        center: [g.centerLat, g.centerLng] as [number, number],
        zoom: g.zoom,
        maxBounds: g.maxBounds as [[number, number], [number, number]],
        borderPolygon,
        introduction: g.introduction || undefined,
        cultureInfo: g.cultureInfo || undefined,
        historyInfo: g.historyInfo || undefined,
        geographyInfo: g.geographyInfo || undefined,
        populationInfo: g.populationInfo || undefined,
        flag: g.flag || undefined,
        mascot: g.mascot || undefined,
        markers: g.markers.map((m) => ({
          id: m.id,
          name: m.name,
          lat: m.lat,
          lng: m.lng,
          markerType: m.markerType as 'Spot' | 'Airport',
          contentSlug: m.contentSlug,
          shortDescription: m.shortDescription,
          imageUrl: m.imageUrl || undefined, // CRITICAL FIX: Return the unique image URL
          microCopy: m.microCopy || undefined,
          priority: m.priority as 1 | 2 | 3,
          metadata: m.metadata as any,
        })),
      };
    });

    // Sort by SLUG_ORDER (Vietnam first, then East-to-West)
    mapped.sort((a, b) => {
      const idxA = SLUG_ORDER.indexOf(a.countrySlug);
      const idxB = SLUG_ORDER.indexOf(b.countrySlug);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    return mapped;
  } catch (error) {
    console.error('Error fetching country guides:', error);
    return [];
  }
}

export async function getCountryGuideBySlug(slug: string): Promise<CountryGuideMap | null> {
  try {
    const g = await prisma.countryGuide.findUnique({
      where: { countrySlug: slug },
      include: {
        markers: true,
      },
    });

    if (!g) return null;

    const borderPolygon = mockGuideMaps.find(m => m.countrySlug === g.countrySlug)?.borderPolygon || [];

    return {
      id: g.id,
      countryName: g.countryName,
      countrySlug: g.countrySlug,
      center: [g.centerLat, g.centerLng] as [number, number],
      zoom: g.zoom,
      maxBounds: g.maxBounds as [[number, number], [number, number]],
      borderPolygon,
      introduction: g.introduction || undefined,
      cultureInfo: g.cultureInfo || undefined,
      historyInfo: g.historyInfo || undefined,
      geographyInfo: g.geographyInfo || undefined,
      populationInfo: g.populationInfo || undefined,
      flag: g.flag || undefined,
      mascot: g.mascot || undefined,
      markers: g.markers.map((m) => ({
        id: m.id,
        name: m.name,
        lat: m.lat,
        lng: m.lng,
        markerType: m.markerType as 'Spot' | 'Airport',
        contentSlug: m.contentSlug,
        shortDescription: m.shortDescription,
        imageUrl: m.imageUrl || undefined, // CRITICAL FIX: Return the unique image URL
        microCopy: m.microCopy || undefined,
        priority: m.priority as 1 | 2 | 3,
        metadata: m.metadata as any,
      })),
    };
  } catch (error) {
    console.error('Error fetching country guide by slug:', error);
    return null;
  }
}

export async function getMarkerDetailContent(markerName: string, countryName: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return "Không thể kết nối dịch vụ thông tin.";
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash-8b'];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `
Bạn là một chuyên gia du lịch am hiểu sâu sắc. Hãy viết một bài giới thiệu chi tiết, cuốn hút và hấp dẫn bằng Tiếng Việt (khoảng 3-4 đoạn văn ngắn) về địa danh du lịch "${markerName}" thuộc quốc gia "${countryName}".
Yêu cầu:
- Viết văn phong lôi cuốn, truyền cảm hứng du lịch.
- Cung cấp các thông tin nổi bật về: nét đặc sắc kiến trúc/thiên nhiên, câu chuyện lịch sử/truyền thuyết thú vị liên quan (nếu có), các trải nghiệm không thể bỏ lỡ tại đây, và lời khuyên hữu ích cho du khách.
- Không chứa các ký tự markdown định dạng tiêu đề h1, h2, h3, chỉ dùng các đoạn văn bản cách nhau bằng dấu xuống dòng hoặc dùng các gạch đầu dòng ngắn gọn.
`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) {
        return text;
      }
    } catch (error) {
      console.warn(`Failed to generate marker detail with ${modelName}:`, (error as Error).message);
      lastError = error;
    }
  }

  return "Đang cập nhật nội dung giới thiệu chi tiết cho địa danh này...";
}
