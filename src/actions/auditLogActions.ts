'use server';

import { prisma } from '@/lib/prisma';
import { AuditLog } from '@/types/auditLog';

export async function getAuditLogs() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { time: 'desc' }
  });
  
  return logs.map(log => ({
    ...log,
    time: log.time.toISOString()
  })) as AuditLog[];
}

export async function createAuditLog(data: Omit<AuditLog, 'id' | 'time'>) {
  const log = await prisma.auditLog.create({
    data: {
      ...data,
      time: new Date()
    }
  });
  return log;
}
