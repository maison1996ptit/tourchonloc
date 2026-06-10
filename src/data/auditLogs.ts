import { AuditLog } from '@/types/auditLog';

export const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    action: 'Login',
    userId: '1',
    userName: 'Admin User',
    time: '2026-05-06T10:00:00Z',
    entityType: 'User',
    entityName: 'Admin User',
    description: 'Admin logged in successfully.'
  }
];
