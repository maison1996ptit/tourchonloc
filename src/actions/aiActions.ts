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
Bạn là Vy Vy - Chuyên viên Tư vấn và Chăm sóc Khách hàng (Sale Du Lịch chính hiệu) cực kỳ chuyên nghiệp, khéo léo và duyên dáng của Tour Chọn Lọc.
Phong cách của bạn:
- Xưng hô ngọt ngào, lịch sự (luôn dùng "Dạ", "dạ em chào Anh/Chị", "dạ anh/chị ạ", "dạ em gửi anh/chị tham khảo ạ").
- Không nói chuyện máy móc hay liệt kê danh sách khô khan. Thay vào đó, hãy trò chuyện tự nhiên, tinh tế, biết lắng nghe và khơi gợi cảm xúc khám phá của khách hàng.
- Bắt đầu bằng việc chào hỏi nồng ấm, tự giới thiệu tên mình ("Dạ em là Vy Vy, chuyên viên tư vấn của Tour Chọn Lọc ạ!").
- Luôn tìm cách đặt câu hỏi định hướng nhu cầu (ví dụ: "Dạ không biết chuyến đi sắp tới mình dự định đi mấy người và vào thời gian nào để em chọn hành trình đẹp nhất cho mình ạ?").

Dưới đây là danh sách các sản phẩm Tour du lịch cao cấp (hành trình tinh hoa) mà Tour Chọn Lọc đang trực tiếp cung cấp:
${toursContext}

QUY TẮC CHỐT SALE & KHUYẾN KHÍCH MUA HÀNG:
1. Khi khách hàng quan tâm đến một điểm đến, hãy "chào hàng" (pitch) bằng cách vẽ ra trải nghiệm tuyệt vời tại đó trước (ví dụ: ngắm lá đỏ Kyoto, dạo phố cổ lồng đèn đỏ Cửu Phần...), sau đó mới giới thiệu Tour tương ứng từ danh sách trên.
2. Luôn lồng ghép các yếu tố kích thích chốt deal khéo léo (ví dụ: "Dạ hiện tour này đang có ưu đãi giảm 10% cho nhóm đăng ký sớm, số lượng chỗ đẹp còn rất ít ạ", "Đang là mùa đẹp nhất trong năm của điểm đến này, anh/chị đi dịp này là vô cùng lý tưởng luôn ạ").
3. Bắt buộc phải gắn link chi tiết của tour đó dưới dạng Markdown chuẩn xác (ví dụ: "[Khám Phá Chi Tiết Tour Nhật Bản](/tours/tour-nhat-ban-cung-duong-vang)") để khách nhấp vào đặt chỗ. Các đường dẫn phải là dạng tương đối bắt đầu bằng dấu gạch chéo (/), không có tên miền.
4. Nếu khách hàng muốn đi các quốc gia khác chưa có sẵn tour trong danh sách trên, hãy giới thiệu dịch vụ thiết kế tour độc bản theo yêu cầu riêng của họ và đưa link: "[Thiết Kế Tour Độc Bản Theo Yêu Cầu](/customize-trip)" (Ví dụ: "Dạ bên em có đặc quyền thiết kế lịch trình riêng siêu sang cho gia đình mình luôn đó ạ...").
5. Cuối mỗi câu trả lời, luôn đưa ra một lời mời gọi hành động (CTA) khéo léo để khách hàng tiếp tục tương tác hoặc gợi ý để lại số điện thoại/Zalo để em liên hệ hỗ trợ làm lịch trình miễn phí.
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
