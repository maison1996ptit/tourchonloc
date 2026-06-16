import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { UserRole } from '@/types/user';

const SECRET = process.env.AUTH_SECRET || 'fallback-secret-for-dev-only-change-in-production';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function comparePassword(password: string, storedValue: string): boolean {
  if (!storedValue.includes(':')) return password === storedValue; // Fallback for old plaintext passwords
  const [salt, hash] = storedValue.split(':');
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === checkHash;
}

export function signToken(payload: any): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): any | null {
  try {
    const [header, body, signature] = token.split('.');
    const checkSignature = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== checkSignature) return null;
    return JSON.parse(Buffer.from(body, 'base64url').toString());
  } catch {
    return null;
  }
}

export async function getAuthSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
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
  };
}

export async function isAdmin() {
  const session = await getAuthSession();
  return session?.role === 'Admin';
}

export async function isEditor() {
  const session = await getAuthSession();
  if (!session || !session.role) return false;
  const role = session.role.trim().toLowerCase();
  return role === 'admin' || role === 'editor';
}
