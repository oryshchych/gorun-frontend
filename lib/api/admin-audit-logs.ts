import { ADMIN_AUDIT_LOGS_PATH } from "@/lib/constants/admin-api";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  AuditLog,
  AuditLogListParams,
  AuditLogListResult,
} from "@/types/audit-log";
import apiClient from "./client";

function buildListParams(params?: AuditLogListParams) {
  return {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
    ...(params?.entity ? { entity: params.entity } : {}),
    ...(params?.action ? { action: params.action } : {}),
    ...(params?.actorId ? { actorId: params.actorId } : {}),
    ...(params?.actorEmail ? { actorEmail: params.actorEmail } : {}),
    ...(params?.dateFrom ? { dateFrom: params.dateFrom } : {}),
    ...(params?.dateTo ? { dateTo: params.dateTo } : {}),
  };
}

export async function getAdminAuditLogs(
  params?: AuditLogListParams
): Promise<AuditLogListResult> {
  const query = buildListParams(params);

  const response = await apiClient.get<ApiSuccessResponse<AuditLog[]>>(
    ADMIN_AUDIT_LOGS_PATH,
    { params: query }
  );

  const body = response.data;
  const items = Array.isArray(body.data) ? body.data : [];

  return {
    items,
    pagination: body.pagination ?? {
      page: query.page,
      limit: query.limit,
      total: items.length,
      totalPages: 1,
    },
  };
}
