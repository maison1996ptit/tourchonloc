import React from 'react';

export const metadata = {
  title: 'Điều khoản dịch vụ - Tour Chọn Lọc',
  description: 'Điều khoản dịch vụ của Tour Chọn Lọc',
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 20px', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Điều khoản dịch vụ</h1>
      <p style={{ color: '#475569', lineHeight: '1.8' }}>
        Chào mừng bạn đến với Tour Chọn Lọc. Nội dung điều khoản dịch vụ đang được chúng tôi cập nhật. Vui lòng quay lại sau.
      </p>
    </div>
  );
}
