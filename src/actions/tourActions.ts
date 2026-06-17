'use server';

import { prisma } from '@/lib/prisma';
import { Tour, TourStatus } from '@/types/tour';
import { revalidatePath } from 'next/cache';
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
  console.log(">>> CHECK_VERSION: HIEN_TAI_LA_CODE_MOI_KHONG_AUTH <<<");
  try {
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
      
      // Sử dụng chế độ trích xuất văn bản thuần túy (bỏ qua render đồ họa để tránh lỗi Canvas trên Ubuntu)
      const options = {
        pagerender: function() { return ''; } // Vô hiệu hóa việc render trang đồ họa
      };

      const pdfData = await pdfParseFn(buffer, options);
      rawText = pdfData.text;

      if (!rawText || rawText.trim().length === 0) {
        // Fallback: Thử lại lần nữa không dùng options nếu lần đầu thất bại
        const fallbackData = await pdfParseFn(buffer);
        rawText = fallbackData.text;
      }

      if (!rawText || rawText.trim().length === 0) {
        return { success: false, error: 'Không thể trích xuất văn bản từ file PDF. Vui lòng kiểm tra xem file PDF có lớp văn bản (OCR) hay không.' };
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
      const modelsToTry = ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-pro'];
      let lastError: Error | null = null;
      let textResponse = '';

      const prompt = `
Bạn là một trợ lý thông minh chuyên nghiệp chuyên chuyển đổi lịch trình du lịch từ văn bản thô (trích xuất từ PDF) sang JSON.
Hãy phân tích kỹ văn bản dưới đây và trích xuất thông tin một cách chính xác nhất có thể.

Yêu cầu đặc biệt:
1. departureDates: Hãy tìm tất cả các ngày khởi hành trong bảng lịch khởi hành hoặc phần ghi chú. Trích xuất TẤT CẢ các ngày có thể tìm thấy. Chuyển đổi về định dạng DD/MM/YYYY. Ví dụ: ["22/05/2026", "12/06/2026"].
2. priceFrom: Tìm giá tiền thấp nhất cho người lớn. Trả về kiểu số (number), ví dụ: 18990000.
3. priceByGroupSize: Nếu có bảng giá theo nhóm khách hoặc loại khách (người lớn, trẻ em), hãy trích xuất vào mảng này. Ví dụ: [{"groupSize": "Người lớn", "pricePerPerson": 18990000}, {"groupSize": "Trẻ em (2-11 tuổi)", "pricePerPerson": 16990000}].
4. durationDays & durationNights: Đếm số ngày và đêm từ lịch trình.
5. itinerary: Trích xuất tiêu đề ngày và danh sách các hoạt động chi tiết cho mỗi ngày.
6. imageSearchTerms: Tạo danh sách 10-15 từ khóa tiếng Anh cực kỳ chính xác. Quan trọng: Phải bao quát TẤT CẢ các thành phố và địa danh lớn xuất hiện trong lịch trình (ví dụ: mỗi ngày chọn ra 1-2 địa điểm đặc sắc nhất). Mỗi từ khóa phải bao gồm tên thành phố để tìm kiếm chính xác, ví dụ: ["Victoria Peak Hong Kong", "Repulse Bay Hong Kong", "Shenzhen Window of the World", "Guangzhou Yuexiu Park"].

Cấu trúc JSON trả về:
{
  "title": "Tên tour đầy đủ",
  "category": "Danh mục khu vực (Đông Á, Châu Âu...)",
  "destination": "Các nước/thành phố đi qua (ví dụ: Hong Kong - Thâm Quyến - Quảng Châu)",
  "region": "Vùng miền du lịch",
  "durationDays": number,
  "durationNights": number,
  "priceFrom": number,
  "priceByGroupSize": [
    { "groupSize": "string", "pricePerPerson": number }
  ],
  "departureDates": ["DD/MM/YYYY", ...],
  "shortDescription": "Mô tả ngắn hấp dẫn",
  "overview": "Tổng quan tour",
  "highlights": ["Điểm nhấn 1", "Điểm nhấn 2", ...],
  "itinerary": [
    {
      "day": number,
      "title": "Tiêu đề ngày",
      "activities": ["Hoạt động 1", "Hoạt động 2", ...]
    }
  ],
  "included": ["Dịch vụ bao gồm 1", ...],
  "excluded": ["Dịch vụ không bao gồm 1", ...],
  "seoTitle": "Tiêu đề SEO",
  "seoDescription": "Mô tả SEO",
  "imageSearchTerms": ["English keyword 1", "English keyword 2", ...]
}

Văn bản thô:
---
${rawText}
---
      `;

      for (const modelName of modelsToTry) {
        try {
          console.log(`Attempting structured extraction with Gemini model: ${modelName}`);
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { 
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
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
