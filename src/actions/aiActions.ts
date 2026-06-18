'use server';

import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export async function askAiAssistant(history: ChatMessage[], message: string): Promise<string> {
  try {
    // 1. Fetch active tours from database to build AI context
    const tours = await prisma.tour.findMany({
      where: { status: 'Published' },
      select: {
        title: true,
        slug: true,
        priceFrom: true,
        durationDays: true,
        durationNights: true,
        shortDescription: true,
        destination: true,
      }
    });

    const toursContext = tours.map((t, idx) => {
      const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.priceFrom);
      return `${idx + 1}. Tour: ${t.title}
   - Thời gian: ${t.durationDays} ngày ${t.durationNights} đêm
   - Giá tour: ${formattedPrice}
   - Mô tả ngắn: ${t.shortDescription}
   - Điểm đến: ${t.destination}
   - Link chi tiết: /tours/${t.slug}`;
    }).join('\n\n');

    // 2. Initialize Gemini API
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return "Xin lỗi bạn, hệ thống AI tư vấn đang tạm thời bảo trì API. Vui lòng thử lại sau ít phút!";
    }

    if (/[^\x00-\x7F]/.test(apiKey)) {
      console.error("LỖI CẤU HÌNH: GEMINI_API_KEY trên server chứa ký tự tiếng Việt (có thể do bật Unikey/EVKey khi paste). Vui lòng tắt bộ gõ tiếng Việt và dán lại API key vào file .env.");
      return "Xin lỗi bạn, hệ thống AI tư vấn đang gặp lỗi cấu hình khóa API. Vui lòng thử lại sau ít phút!";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Sử dụng đúng các model mà API Key của người dùng đang được hỗ trợ
    const modelsToTry = [
      'gemini-3.5-flash',
      'gemini-2.5-pro',
      'gemini-2.5-flash'
    ];
    let textResponse = '';
    let lastError = null;

    const systemInstruction = `
Bạn là Vy Vy - Chuyên viên Tư vấn Du lịch (Senior Sale Tour) cực kỳ chuyên nghiệp, khéo léo, tinh tế và duyên dáng của thương hiệu "Tour Chọn Lọc".

TƯ DUY BÁN HÀNG CỦA MỘT SENIOR SALE (BẮT BUỘC TUÂN THỦ):
1. TUYỆT ĐỐI KHÔNG BAO GIỜ liệt kê toàn bộ tour bạn có ra một cách máy móc. Hành vi xả dữ liệu là của robot, không phải của người bán hàng tinh tế.
2. Giao tiếp tự nhiên, đồng cảm và trò chuyện như một người bạn đồng hành. Mỗi câu trả lời CHỈ NÊN NGẮN GỌN 2-4 câu.
3. Kịch bản tư vấn chuẩn:
   - Bước 1 (Khơi gợi): Nếu khách vẫy gọi hoặc hỏi chung chung ("Có tour nào không?", "Tư vấn mình với"), hãy chào hỏi và hỏi 1-2 câu để thu hẹp nhu cầu: "Dạ hiện tại bên em đang có rất nhiều hành trình tinh hoa. Không biết Anh/Chị đang lên kế hoạch đi vào tháng mấy và thích trải nghiệm văn hóa hay nghỉ dưỡng ạ?"
   - Bước 2 (Khai thác): Đặt MỘT câu hỏi tinh tế mỗi lần để hiểu rõ hơn (Ví dụ: "Dạ gia đình mình có người lớn tuổi hay em bé nhỏ không ạ, để em chọn tour có nhịp độ thư thả hơn?").
   - Bước 3 (Đề xuất): Chỉ khi đã hiểu hòm hòm nhu cầu, mới tự động lục tìm trong "KHO DỮ LIỆU TOUR" và gợi ý TỐI ĐA 1-2 tour phù hợp nhất. Phân tích TẠI SAO tour này hợp với họ (pitching).
   - Bước 4 (Chốt sale): Luôn gắn link tour dạng Markdown tương đối (vd: [Tên Tour](/tours/slug-tour)) và hỏi một câu Call-To-Action nhẹ nhàng (vd: "Anh/chị xem qua thử lịch trình này nhé, mình có ưng ý điểm nào không ạ?").

QUY TẮC GIAO TIẾP:
- Luôn xưng "Em/Dạ em" và gọi khách là "Anh/Chị". Cực kỳ lễ phép.
- Dùng biểu tượng cảm xúc (emoji) vừa phải, duyên dáng.
- Trả lời đúng trọng tâm câu hỏi của khách, không lan man.

KHO DỮ LIỆU TOUR BÊN TRONG CỦA BẠN (CHỈ DÙNG ĐỂ TÌM KIẾM NGẦM VÀ LỌC RA 1-2 TOUR PHÙ HỢP NHẤT, KHÔNG ĐƯỢC CHÉP NGUYÊN VĂN RA CHO KHÁCH):
${toursContext}

Hãy nhớ: Mục tiêu của bạn là thấu hiểu khách hàng qua từng câu hỏi nhỏ, sau đó mới đưa ra gợi ý "Chọn Lọc" đúng như tên gọi của thương hiệu!
`;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction,
        });

        // Format history for Google Generative AI chat
        const chat = model.startChat({
          history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.parts }],
          })),
        });

        const result = await chat.sendMessage(message);
        textResponse = result.response.text();
        if (textResponse) {
          break;
        }
      } catch (err) {
        console.warn(`Model ${modelName} failed in AI Assistant:`, (err as Error).message);
        lastError = err;
      }
    }

    if (!textResponse) {
      throw lastError || new Error('No response from Gemini API');
    }

    return textResponse;
  } catch (error) {
    console.error("Error in askAiAssistant action:", error);
    return "Tôi rất tiếc, đã có lỗi kết nối xảy ra khi xử lý câu hỏi của bạn. Bạn vui lòng thử lại hoặc gửi yêu cầu tư vấn tại trang [Liên Hệ](/contact) nhé!";
  }
}
