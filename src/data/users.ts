import { User } from '@/types/user';

export const mockUsers: (User & {password?: string})[] = [
  {
    id: '1',
    name: 'Ngọc Hà',
    email: 'ngocha@gmail.com',
    password: '29022000@',
    role: 'Admin',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];
