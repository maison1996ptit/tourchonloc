export type UserRole = 'Admin' | 'Editor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: User | null;
  token: string | null;
}
