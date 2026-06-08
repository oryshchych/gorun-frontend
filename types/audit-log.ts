export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "STATUS_CHANGE"
  | "CANCEL";

export type AuditEntity = "Event" | "Registration" | "User" | "PromoCode";

export type AuditActorRole = "user" | "admin" | "super_admin";

export interface AuditChange {
  field: string;
  before: unknown;
  after: unknown;
}

export interface AuditLog {
  id: string;
  actorId: string | undefined;
  actorName: string;
  actorEmail: string;
  actorRole: AuditActorRole;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  entityLabel: string;
  changes: AuditChange[];
  ip: string | undefined;
  userAgent: string | undefined;
  createdAt: string;
}

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  entity?: AuditEntity;
  action?: AuditAction;
  actorId?: string;
  actorEmail?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditLogListResult {
  items: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
