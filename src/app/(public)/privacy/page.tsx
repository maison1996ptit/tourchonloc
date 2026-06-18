import React from 'react';

export const metadata = {
  title: 'Chính sách bảo mật - Tour Chọn Lọc',
  description: 'Chính sách bảo mật của Tour Chọn Lọc',
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 20px', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Chính sách bảo mật</h1>
      <p style={{ color: '#475569', lineHeight: '1.8' }}>
        Chào mừng bạn đến với Tour Chọn Lọc. Nội dung chính sách bảo mật đang được chúng tôi cập nhật. Vui lòng quay lại sau.
      </p>
    </div>
  );
}
