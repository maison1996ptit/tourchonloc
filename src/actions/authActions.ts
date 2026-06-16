'use server';

import { prisma } from '@/lib/prisma';
import { User, UserRole } from '@/types/user';
import { revalidatePath } from 'next/cache';
import { comparePassword, signToken, verifyToken } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

export async function loginAction(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (user && comparePassword(password, user.password)) {
      const token = signToken({ userId: user.id, role: user.role });
      
      const cookieStore = await cookies();
      cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          isActive: user.isActive,
          createdAt: user.createdAt.toISOString()
        } as User,
        token: token
      };
    }
    return { success: false, message: 'Invalid credentials' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Internal server error' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
  return { success: true };
}

export async function getCurrentUserAction(token?: string) {
  try {
    // Priority to cookie, then token argument (for compatibility)
    const cookieStore = await cookies();
    const activeToken = cookieStore.get('auth-token')?.value || token;
    
    if (!activeToken) return null;

    const payload = verifyToken(activeToken);
    if (!payload || !payload.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user || !user.isActive) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString()
    } as User;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    }
  });
  
  return users.map(user => ({
    ...user,
    role: user.role as UserRole,
    createdAt: user.createdAt.toISOString()
  })) as User[];
}
