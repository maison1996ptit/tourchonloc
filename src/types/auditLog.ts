export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  time: string;
  entityType: string;
  entityName: string;
  description: string;
}
