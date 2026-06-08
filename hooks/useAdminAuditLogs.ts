import { useQuery } from "@tanstack/react-query";
import { getAdminAuditLogs } from "@/lib/api/admin-audit-logs";
import type { AuditLogListParams, AuditLogListResult } from "@/types/audit-log";

export const auditLogKeys = {
  all: ["admin", "audit-logs"] as const,
  lists: () => [...auditLogKeys.all, "list"] as const,
  list: (params: AuditLogListParams) =>
    [...auditLogKeys.lists(), params] as const,
};

export const useAdminAuditLogs = (params: AuditLogListParams = {}) => {
  return useQuery<AuditLogListResult, Error>({
    queryKey: auditLogKeys.list(params),
    queryFn: () => getAdminAuditLogs(params),
    staleTime: 1000 * 60 * 5,
  });
};
