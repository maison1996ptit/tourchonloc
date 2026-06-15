import nodemailer from 'nodemailer';
import { Lead } from '@/types/lead';
import { Tour } from '@/types/tour';

// Create a transporter using environment variables or return null for local simulation
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for port 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
  }

  return null;
};

export async function sendLeadNotificationEmail(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { createdAt?: string }) {
  const adminEmail = process.env.ADMIN_EMAIL || 'ngocha@gmail.com'; // Fallback admin email
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@travelapp.com';

  const transporter = createTransporter();

  const formattedDate = lead.createdAt 
    ? new Date(lead.createdAt).toLocaleString('vi-VN') 
    : new Date().toLocaleString('vi-VN');

  const subject = `🔥 Yêu cầu đặt tour/liên hệ mới từ ${lead.fullName}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #1a56db; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 0;">🔥 Thông tin yêu cầu mới</h2>
      
      <div style="margin-bottom: 20px; background-color: #f8fafc; padding: 15px; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #475569; font-size: 14px;">KHÁCH HÀNG:</h3>
        <p style="margin: 5px 0;"><strong>Họ tên:</strong> ${lead.fullName}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${lead.email || 'Không cung cấp'}</p>
        <p style="margin: 5px 0;"><strong>Số điện thoại:</strong> ${lead.phone}</p>
        ${lead.nationality ? `<p style="margin: 5px 0;"><strong>Quốc tịch:</strong> ${lead.nationality}</p>` : ''}
      </div>

      <div style="margin-bottom: 20px; background-color: #f8fafc; padding: 15px; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #475569; font-size: 14px;">CHI TIẾT YÊU CẦU:</h3>
        <p style="margin: 5px 0;"><strong>Nguồn Form:</strong> ${lead.sourceForm}</p>
        ${lead.tourName ? `<p style="margin: 5px 0; color: #2563eb;"><strong>Tour quan tâm:</strong> ${lead.tourName}</p>` : ''}
        <p style="margin: 5px 0;"><strong>Thời gian gửi:</strong> ${formattedDate}</p>
        ${lead.travelDate ? `<p style="margin: 5px 0;"><strong>Ngày đi dự kiến:</strong> ${lead.travelDate}</p>` : ''}
        ${lead.numberOfTravelers !== undefined ? `<p style="margin: 5px 0;"><strong>Số lượng khách:</strong> ${lead.numberOfTravelers} người</p>` : ''}
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #475569; font-size: 14px; margin-bottom: 8px;">NỘI DUNG YÊU CẦU:</h3>
        <div style="background-color: #fff; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; font-size: 14px; white-space: pre-wrap; color: #334155; line-height: 1.5;">
          ${lead.message || 'Không có tin nhắn đi kèm.'}
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 15px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/leads" style="display: inline-block; padding: 10px 20px; background-color: #1a56db; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">Truy cập CRM Quản trị</a>
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"TravelApp Notification" <${fromEmail}>`,
        to: adminEmail,
        subject,
        html: htmlContent,
      });
      console.log(`[SMTP] Notification email sent successfully to ${adminEmail} for lead ${lead.fullName}`);
    } catch (error) {
      console.error('[SMTP ERROR] Failed to send email via SMTP transporter:', error);
    }
  } else {
    console.log('--------------------------------------------------');
    console.log('[EMAIL SIMULATION] SMTP is not configured. Logged Email Details:');
    console.log(`Subject: ${subject}`);
    console.log(`To: ${adminEmail}`);
    console.log('Content (HTML):', htmlContent);
    console.log('--------------------------------------------------');
  }
}

export async function sendMarketingEmail(
  toEmail: string,
  customerName: string,
  subject: string,
  bodyContent: string,
  attachedTours: Tour[]
) {
  const transporter = createTransporter();
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@travelapp.com';

  // Replace {{name}} with customerName
  const personalizedBody = bodyContent.replace(/\{\{name\}\}/g, customerName);

  // Generate HTML for attached tours
  let toursHtml = '';
  if (attachedTours && attachedTours.length > 0) {
    toursHtml = `
      <div style="margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <h3 style="color: #1a56db; font-size: 16px; margin-bottom: 15px;">🌟 Gợi ý hành trình dành riêng cho bạn:</h3>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    `;

    for (const tour of attachedTours) {
      toursHtml += `
        <tr style="margin-bottom: 15px; display: block;">
          <td style="width: 100px; padding-right: 15px; vertical-align: top;">
            <img src="${tour.featuredImage || '/logo.png'}" alt="${tour.title}" style="width: 100px; height: 70px; object-fit: cover; border-radius: 6px;" />
          </td>
          <td style="vertical-align: top;">
            <h4 style="margin: 0 0 5px 0; color: #1e293b; font-size: 14px;">${tour.title}</h4>
            <p style="margin: 0 0 5px 0; color: #64748b; font-size: 12px;">🕒 Thời gian: ${tour.durationDays} ngày ${tour.durationNights} đêm</p>
            <p style="margin: 0; color: #10b981; font-size: 13px; font-weight: bold;">Giá từ: ${tour.priceFrom ? tour.priceFrom.toLocaleString('vi-VN') : 'Liên hệ'} VND</p>
          </td>
        </tr>
      `;
    }

    toursHtml += `
        </table>
      </div>
    `;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #334155; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #1a56db; margin: 0;">TravelApp</h2>
      </div>
      <div style="white-space: pre-wrap; font-size: 14px; color: #334155;">
        ${personalizedBody}
      </div>
      ${toursHtml}
      <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 25px; text-align: center; font-size: 12px; color: #94a3b8;">
        Bạn nhận được email này vì đã quan tâm đến dịch vụ của TravelApp.
        <br />
        © 2026 TravelApp. All rights reserved.
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"TravelApp" <${fromEmail}>`,
        to: toEmail,
        subject,
        html,
      });
      console.log(`[SMTP] Marketing email sent to ${toEmail}`);
    } catch (err) {
      console.error(`[SMTP ERROR] Failed to send marketing email to ${toEmail}:`, err);
    }
  } else {
    console.log('--------------------------------------------------');
    console.log(`[EMAIL SIMULATION] Marketing Email to ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log('Content (HTML):', html);
    console.log('--------------------------------------------------');
  }
}
