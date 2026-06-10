import { User } from '@/types/user';
import { loginAction, getCurrentUserAction, logoutAction } from '@/actions/authActions';

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User, token: string } | null> => {
    const result = await loginAction(email, password);
    if (result.success && result.user && result.token) {
      return { user: result.user, token: result.token };
    }
    return null;
  },

  getCurrentUser: async (): Promise<User | null> => {
    // Attempt to get token from localStorage for client state, 
    // but the action will also check cookies.
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : undefined;
    return await getCurrentUserAction(token || undefined);
  },

  logout: async (): Promise<void> => {
    await logoutAction();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
  }
};
