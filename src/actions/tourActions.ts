'use server';

import { prisma } from '@/lib/prisma';
import { Tour, TourStatus } from '@/types/tour';
import { revalidatePath } from 'next/cache';
import { isEditor } from '@/lib/auth-utils';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function getTours() {
  const data = await prisma.tour.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return data.map(t => ({
    ...t,
    id: t.id,
    departureDates: t.departureDates,
    highlights: t.highlights,
    itinerary: t.itinerary as any,
    included: t.included,
    excluded: t.excluded,
    priceByGroupSize: t.priceByGroupSize as any,
    status: t.status as TourStatus,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));
}

export async function getTourBySlug(slug: string) {
  const t = await prisma.tour.findUnique({
    where: { slug }
  });
  if (!t) return null;

  return {
    ...t,
    id: t.id,
    departureDates: t.departureDates,
    highlights: t.highlights,
    itinerary: t.itinerary as any,
    included: t.included,
    excluded: t.excluded,
    priceByGroupSize: t.priceByGroupSize as any,
    status: t.status as TourStatus,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export async function createTour(tour: Omit<Tour, 'id' | 'createdAt' | 'updatedAt'>) {
  if (!(await isEditor())) throw new Error('Unauthorized');

  // Explicitly map fields to prevent mass assignment
  const t = await prisma.tour.create({
    data: {
      title: tour.title,
      slug: tour.slug,
      category: tour.category,
      destination: tour.destination,
      region: tour.region,
      durationDays: tour.durationDays,
      durationNights: tour.durationNights,
      priceFrom: tour.priceFrom,
      departureDates: tour.departureDates,
      shortDescription: tour.shortDescription,
      overview: tour.overview,
      highlights: tour.highlights,
      itinerary: tour.itinerary as any,
      included: tour.included,
      excluded: tour.excluded,
      priceByGroupSize: tour.priceByGroupSize as any,
      seoTitle: tour.seoTitle,
      seoDescription: tour.seoDescription,
      status: tour.status || 'Published',
      featuredImage: tour.featuredImage,
      images: tour.images,
      isFeatured: tour.isFeatured ?? false,
    }
  });

  revalidatePath('/');
  revalidatePath('/tours');
  revalidatePath(`/tours/${t.slug}`);
  revalidatePath('/admin/tours');

  return {
    ...t,
    id: t.id,
    departureDates: t.departureDates,
    highlights: t.highlights,
    itinerary: t.itinerary as any,
    included: t.included,
    excluded: t.excluded,
    priceByGroupSize: t.priceByGroupSize as any,
    status: t.status as TourStatus,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export async function updateTour(id: string, updates: Partial<Tour>) {
  if (!(await isEditor())) throw new Error('Unauthorized');

  // Explicitly map allowed fields
  const allowedUpdates: any = {};
  if (updates.title !== undefined) allowedUpdates.title = updates.title;
  if (updates.slug !== undefined) allowedUpdates.slug = updates.slug;
  if (updates.category !== undefined) allowedUpdates.category = updates.category;
  if (updates.destination !== undefined) allowedUpdates.destination = updates.destination;
  if (updates.region !== undefined) allowedUpdates.region = updates.region;
  if (updates.durationDays !== undefined) allowedUpdates.durationDays = updates.durationDays;
  if (updates.durationNights !== undefined) allowedUpdates.durationNights = updates.durationNights;
  if (updates.priceFrom !== undefined) allowedUpdates.priceFrom = updates.priceFrom;
  if (updates.departureDates !== undefined) allowedUpdates.departureDates = updates.departureDates;
  if (updates.shortDescription !== undefined) allowedUpdates.shortDescription = updates.shortDescription;
  if (updates.overview !== undefined) allowedUpdates.overview = updates.overview;
  if (updates.highlights !== undefined) allowedUpdates.highlights = updates.highlights;
  if (updates.itinerary !== undefined) allowedUpdates.itinerary = updates.itinerary as any;
  if (updates.included !== undefined) allowedUpdates.included = updates.included;
  if (updates.excluded !== undefined) allowedUpdates.excluded = updates.excluded;
  if (updates.priceByGroupSize !== undefined) allowedUpdates.priceByGroupSize = updates.priceByGroupSize as any;
  if (updates.seoTitle !== undefined) allowedUpdates.seoTitle = updates.seoTitle;
  if (updates.seoDescription !== undefined) allowedUpdates.seoDescription = updates.seoDescription;
  if (updates.status !== undefined) allowedUpdates.status = updates.status;
  if (updates.featuredImage !== undefined) allowedUpdates.featuredImage = updates.featuredImage;
  if (updates.images !== undefined) allowedUpdates.images = updates.images;
  if (updates.isFeatured !== undefined) allowedUpdates.isFeatured = updates.isFeatured;

  const t = await prisma.tour.update({
    where: { id },
    data: allowedUpdates
  });

  revalidatePath('/');
  revalidatePath('/tours');
  revalidatePath(`/tours/${t.slug}`);
  revalidatePath('/admin/tours');

  return {
    ...t,
    id: t.id,
    departureDates: t.departureDates,
    highlights: t.highlights,
    itinerary: t.itinerary as any,
    included: t.included,
    excluded: t.excluded,
    priceByGroupSize: t.priceByGroupSize as any,
    status: t.status as TourStatus,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export async function deleteTour(id: string) {
  if (!(await isEditor())) throw new Error('Unauthorized');
  
  try {
    const tour = await prisma.tour.findUnique({
      where: { id },
      select: { slug: true }
    });

    await prisma.tour.delete({
      where: { id }
    });

    revalidatePath('/');
    revalidatePath('/tours');
    if (tour?.slug) {
      revalidatePath(`/tours/${tour.slug}`);
    }
    revalidatePath('/admin/tours');
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

export async function bulkCreateTours(newTours: Omit<Tour, 'id' | 'createdAt' | 'updatedAt'>[]) {
  if (!(await isEditor())) throw new Error('Unauthorized');

  const createdTours = await Promise.all(
    newTours.map(tour => 
      prisma.tour.create({
        data: {
          title: tour.title,
          slug: tour.slug,
          category: tour.category,
          destination: tour.destination,
          region: tour.region,
          durationDays: tour.durationDays,
          durationNights: tour.durationNights,
          priceFrom: tour.priceFrom,
          departureDates: tour.departureDates,
          shortDescription: tour.shortDescription,
          overview: tour.overview,
          highlights: tour.highlights,
          itinerary: tour.itinerary as any,
          included: tour.included,
          excluded: tour.excluded,
          priceByGroupSize: tour.priceByGroupSize as any,
          seoTitle: tour.seoTitle,
          seoDescription: tour.seoDescription,
          status: tour.status || 'Published',
          featuredImage: tour.featuredImage,
          images: tour.images,
          isFeatured: tour.isFeatured ?? false,
        }
      })
    )
  );

  revalidatePath('/');
  revalidatePath('/tours');
  revalidatePath('/admin/tours');
  createdTours.forEach(t => revalidatePath(`/tours/${t.slug}`));

  return createdTours.map(t => ({
    ...t,
    id: t.id,
    departureDates: t.departureDates,
    highlights: t.highlights,
    itinerary: t.itinerary as any,
    included: t.included,
    excluded: t.excluded,
    priceByGroupSize: t.priceByGroupSize as any,
    status: t.status as TourStatus,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));
}

async function searchSingleLandmarkImage(q: string): Promise<string | null> {
  const subQueries = [`${q} skyline`, `${q} travel`, q];
  for (const sq of subQueries) {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(sq)}&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json&origin=*`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'TravelAppBot/1.0 (contact@travelapp.com)'
        }
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.query?.pages) {
        for (const pageId of Object.keys(data.query.pages)) {
          const page = data.query.pages[pageId];
          const imgUrl = page.imageinfo?.[0]?.url;
          if (imgUrl && (imgUrl.endsWith('.jpg') || imgUrl.endsWith('.jpeg') || imgUrl.endsWith('.png'))) {
            const lowerUrl = imgUrl.toLowerCase();
            const lowerTitle = page.title.toLowerCase();
            if (
              lowerUrl.includes('flag') || 
              lowerUrl.includes('map') || 
              lowerUrl.includes('icon') || 
              lowerUrl.includes('logo') || 
              lowerUrl.includes('stub') ||
              lowerUrl.includes('stamp') ||
              lowerUrl.includes('1945') ||
              lowerUrl.includes('history') ||
              lowerTitle.includes('flag') ||
              lowerTitle.includes('map') ||
              lowerTitle.includes('logo') ||
              lowerTitle.includes('document')
            ) {
              continue;
            }
            return imgUrl;
          }
        }
      }
    } catch (e) {
      console.warn(`Wiki query failed for: ${sq}`, e);
    }
  }
  return null;
}

const VERB_PREFIX_REGEX = /^(khám phá|tham quan|tự do mua sắm tại|mua sắm tại|di chuyển đến|đến|trải nghiệm|thưởng thức|ghé thăm|viếng|check-in tại|check-in|chụp ảnh tại|chụp ảnh)\s+/i;

function cleanSearchTerm(term: string): string {
  let clean = term.replace(VERB_PREFIX_REGEX, '').trim();
  // Remove day markers like Day 1, Ngày 1, vv
  clean = clean.replace(/^(ngày|day|ngay)\s+\d+[:\s\-]*/i, '').trim();
  return clean;
}

async function searchMultipleLandmarkImages(
  destinationStr?: string, 
  highlights: string[] = [], 
  itinerary: any[] = [], 
  category?: string,
  imageSearchTerms: string[] = []
): Promise<{ featuredImage: string; images: string[] }> {
  const terms: string[] = [];

  // 1. Primary priority: Use English image search terms returned by Gemini if available
  if (Array.isArray(imageSearchTerms) && imageSearchTerms.length > 0) {
    for (const term of imageSearchTerms) {
      const trimmed = term.trim();
      if (trimmed && trimmed.length >= 3 && !terms.includes(trimmed)) {
        terms.push(trimmed);
      }
    }
  }

  // 2. Fallback: If no English search terms were returned, compile from other fields
  if (terms.length === 0) {
    const rawTerms: string[] = [];
    if (destinationStr) {
      const dests = destinationStr.split(/[-–,]| và /).map((d: string) => d.trim()).filter(Boolean);
      rawTerms.push(...dests);
    }
    rawTerms.push(...highlights);
    if (Array.isArray(itinerary)) {
      for (const day of itinerary) {
        if (day.title) {
          const parts = day.title.split(/[-–,]| và /).map((d: string) => d.trim()).filter(Boolean);
          rawTerms.push(...parts);
        }
        if (Array.isArray(day.activities)) {
          rawTerms.push(...day.activities);
        } else if (typeof day.description === 'string' && day.description) {
          const lines = day.description.split(/[\n;]/).map((l: string) => l.trim()).filter((l: string) => l.length > 2 && l.length < 50);
          rawTerms.push(...lines);
        }
      }
    }
    if (category) {
      rawTerms.push(category);
    }

    for (const term of rawTerms) {
      const cleaned = cleanSearchTerm(term);
      if (cleaned && cleaned.length >= 3 && cleaned.length <= 45 && !terms.includes(cleaned)) {
        terms.push(cleaned);
      }
    }
  }

  console.log('Terms to search for landmark images:', terms);

  const termsToSearch = terms.slice(0, 15);
  const results = await Promise.all(termsToSearch.map(t => searchSingleLandmarkImage(t)));
  const urls: string[] = [];
  for (let i = 0; i < termsToSearch.length; i++) {
    const url = results[i];
    if (url && !urls.includes(url)) {
      console.log(`- Found image for term "${termsToSearch[i]}": ${url}`);
      urls.push(url);
    }
  }

  const featuredImage = urls[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200';
  if (urls.length === 0) {
    urls.push(featuredImage);
  }

  return { featuredImage, images: urls };
}

export async function parseTourPDF(formData: FormData): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!(await isEditor())) {
      return { success: false, error: 'Bạn không có quyền thực hiện hành động này.' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'Không tìm thấy tệp tải lên' };
    }

    // 1. Giới hạn dung lượng file tối đa (10MB) để phòng chống DoS (Denial of Service)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'Dung lượng file vượt quá giới hạn cho phép (tối đa 10MB).' };
    }

    // 2. Kiểm tra phần mở rộng tệp tin (Extension)
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return { success: false, error: 'Định dạng file không hợp lệ. Chỉ chấp nhận tệp tin .pdf.' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Kiểm tra Magic Bytes đầu tệp tin xem có đúng định dạng PDF không (%PDF ở dạng Hex: 25 50 44 46)
    if (buffer.length < 4 || buffer[0] !== 0x25 || buffer[1] !== 0x50 || buffer[2] !== 0x44 || buffer[3] !== 0x46) {
      return { success: false, error: 'Nội dung tệp tin tải lên không đúng cấu trúc hoặc đã bị giả mạo cấu trúc định dạng PDF.' };
    }

    // Polyfill DOMMatrix for pdfjs-dist in Node environment
    if (typeof globalThis.DOMMatrix === 'undefined') {
      // @ts-ignore
      globalThis.DOMMatrix = class DOMMatrix {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        static fromMatrix() { return new DOMMatrix(); }
        static fromFloat32Array() { return new DOMMatrix(); }
        static fromFloat64Array() { return new DOMMatrix(); }
        translate() { return this; }
        scale() { return this; }
        multiply() { return this; }
        inverse() { return this; }
        transformPoint(p: any) { return p; }
      };
    }

    // Extract PDF text
    let rawText = '';
    try {
      const pdfModule = require('pdf-parse');
      const pdfParseFn = typeof pdfModule === 'function' ? pdfModule : (pdfModule.PDFParse || pdfModule.default);
      if (typeof pdfParseFn !== 'function') {
        return { success: false, error: 'pdf-parse library export is not a function' };
      }
      
      try {
        // Cách dùng 1: Thư viện pdf-parse v2 (class-based)
        const parser = new pdfParseFn({ data: buffer });
        if (parser && typeof parser.getText === 'function') {
          const result = await parser.getText();
          rawText = result.text;
        } else {
          // Fallback nếu không khởi tạo đúng class
          const pdfData = await pdfParseFn(buffer);
          rawText = pdfData.text;
        }
      } catch (constructErr) {
        // Cách dùng 2: Thư viện pdf-parse v1 (legacy function)
        try {
          const pdfData = await pdfParseFn(buffer);
          rawText = pdfData.text;
        } catch (legacyErr) {
          // Fallback cuối cùng
          const pdfData = await new pdfParseFn(buffer);
          rawText = pdfData.text;
        }
      }

      if (!rawText) {
        return { success: false, error: 'Không thể trích xuất văn bản từ file PDF (nội dung trống).' };
      }
    } catch (err) {
      console.error('Error parsing PDF text:', err);
      return { success: false, error: 'Không thể đọc nội dung file PDF. Vui lòng kiểm tra định dạng file.' };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'GEMINI_API_KEY chưa được cấu hình trong file .env. Vui lòng thêm khóa này để dùng chức năng AI.' };
    }

    if (/[^\x00-\x7F]/.test(apiKey)) {
      console.error("LỖI CẤU HÌNH: GEMINI_API_KEY trên server chứa ký tự tiếng Việt (có thể do bật Unikey/EVKey khi paste). Vui lòng tắt bộ gõ tiếng Việt và dán lại API key vào file .env.");
      return { success: false, error: 'Cấu hình GEMINI_API_KEY trên máy chủ live chứa ký tự tiếng Việt không hợp lệ (ví dụ chữ "ử" do lỗi Telex paste). Vui lòng kiểm tra lại file .env.' };
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelsToTry = ['gemini-3.5-flash', 'gemini-2.5-flash'];
      let lastError: Error | null = null;
      let textResponse = '';

      const prompt = `
Bạn là một trợ lý thông minh giúp chuyển đổi lịch trình du lịch dạng văn bản thô (được trích xuất từ file PDF) thành một cấu trúc dữ liệu JSON chính xác để đưa vào cơ sở dữ liệu.
Hãy trích xuất tất cả các thông tin từ văn bản dưới đây và trả về dưới dạng JSON khớp hoàn toàn với cấu trúc sau:
{
  "title": "Tên chuyến du lịch hấp dẫn, ví dụ: Nhật Bản: Cung Đường Vàng Osaka - Kyoto - Tokyo (5N5Đ)",
  "category": "Tên khu vực/danh mục thích hợp nhất (ví dụ: Đông Á, Đông Nam Á, Châu Âu, Mỹ)",
  "destination": "Quốc gia hoặc thành phố điểm đến chính, ví dụ: Nhật Bản hoặc Hong Kong - Thâm Quyến - Quảng Châu",
  "region": "Khu vực du lịch phù hợp, ví dụ: Đông Á",
  "durationDays": số ngày (kiểu number),
  "durationNights": số đêm (kiểu number),
  "priceFrom": mức giá thấp nhất tìm thấy cho người lớn (kiểu number), ví dụ: 18990000,
  "departureDates": danh sách các ngày khởi hành định dạng DD/MM/YYYY tìm thấy trong bảng giá, ví dụ: ["22/05/2026", "12/06/2026"],
  "shortDescription": "Viết một đoạn mô tả ngắn 2-3 câu thu hút khách hàng về tour này",
  "overview": "Đoạn mô tả tổng quan chi tiết hơn về tour",
  "highlights": [
    "Danh sách 3-5 điểm nhấn nổi bật nhất của tour, ví dụ: Trải nghiệm tàu điện cổ núi Thái Bình"
  ],
  "itinerary": [
    {
      "day": số ngày (number),
      "title": "Tiêu đề của ngày đó",
      "activities": [
        "Danh sách các hoạt động chính trong ngày đó, ghi rõ ràng đầy đủ chi tiết từ văn bản lịch trình"
      ]
    }
  ],
  "included": [
    "Danh sách các dịch vụ bao gồm"
  ],
  "excluded": [
    "Danh sách các dịch vụ không bao gồm"
  ],
  "seoTitle": "Tiêu đề tối ưu SEO",
  "seoDescription": "Mô tả ngắn tối ưu SEO",
  "imageSearchTerms": [
    "Danh sách các từ khóa tiếng Anh cực kỳ chính xác đại diện cho tất cả các điểm đến và địa danh nổi bật của tour để dùng làm từ khóa tìm kiếm ảnh chất lượng cao. Ví dụ: ['Hong Kong Skyline', 'Shenzhen Skyline', 'Victoria Peak Hong Kong', 'Repulse Bay Hong Kong', 'Five Rams Statue Guangzhou', 'Splendid China Folk Village Shenzhen']"
  ]
}

Văn bản thô cần trích xuất:
---
${rawText}
---
      `;

      for (const modelName of modelsToTry) {
        try {
          console.log(`Attempting structured extraction with Gemini model: ${modelName}`);
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: 'application/json' },
          });
          const result = await model.generateContent(prompt);
          textResponse = result.response.text();
          if (textResponse) {
            console.log(`Successfully extracted content using Gemini model: ${modelName}`);
            break;
          }
        } catch (err) {
          console.warn(`Failed with Gemini model ${modelName}:`, err);
          lastError = err as Error;
        }
      }

      if (!textResponse) {
        return { success: false, error: lastError?.message || 'Không nhận được phản hồi từ AI' };
      }

      let cleanText = textResponse.trim();
      
      // Extract only the first valid JSON object by matching curly braces
      const startIdx = cleanText.indexOf('{');
      if (startIdx !== -1) {
        let braceCount = 0;
        let matchedEndIdx = -1;
        for (let i = startIdx; i < cleanText.length; i++) {
          if (cleanText[i] === '{') {
            braceCount++;
          } else if (cleanText[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              matchedEndIdx = i;
              break;
            }
          }
        }
        if (matchedEndIdx !== -1) {
          cleanText = cleanText.substring(startIdx, matchedEndIdx + 1);
        }
      }
      
      // Remove potential Markdown code block indicators
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```(?:json)?\s*/i, '');
        cleanText = cleanText.replace(/\s*```$/, '');
      }

      const parsedData = JSON.parse(cleanText.trim());

      // Automatically find matching images for all destinations, highlights, and itinerary days of the tour
      try {
        console.log(`Searching for beautiful images for all destinations: ${parsedData.destination}`);
        const imageResult = await searchMultipleLandmarkImages(
          parsedData.destination, 
          parsedData.highlights, 
          parsedData.itinerary, 
          parsedData.category,
          parsedData.imageSearchTerms
        );
        parsedData.featuredImage = imageResult.featuredImage;
        parsedData.images = imageResult.images;
        console.log(`Matched featured image URL: ${imageResult.featuredImage} and gallery count: ${imageResult.images.length}`);
      } catch (imgErr) {
        console.error('Failed to fetch images for tour destinations:', imgErr);
        parsedData.featuredImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200';
        parsedData.images = [parsedData.featuredImage];
      }

      return { success: true, data: parsedData };
    } catch (err) {
      console.error('Error generating structured content from Gemini:', err);
      return { success: false, error: 'Lỗi khi gọi API Gemini để phân tích dữ liệu: ' + (err as Error).message };
    }
  } catch (outerErr) {
    console.error('Outer error in parseTourPDF action:', outerErr);
    return { success: false, error: 'Lỗi hệ thống bất ngờ: ' + (outerErr as Error).message };
  }
}
