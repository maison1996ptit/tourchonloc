import { MenuConfig } from '@/types/menu';

export const mockMenus: MenuConfig = {
  header: [
    { id: '1', label: 'Trang chủ', url: '/', order: 1, isActive: true },
    { id: '2', label: 'Tour du lịch', url: '/tours', order: 2, isActive: true },
    { id: '4', label: 'Về chúng tôi', url: '/about', order: 3, isActive: true },
    { id: '5', label: 'Liên hệ', url: '/contact', order: 4, isActive: true }
  ],
  footer: [
    { id: '6', label: 'Chính sách bảo mật', url: '/privacy', order: 1, isActive: true },
    { id: '7', label: 'Điều khoản dịch vụ', url: '/terms', order: 2, isActive: true }
  ]
};
