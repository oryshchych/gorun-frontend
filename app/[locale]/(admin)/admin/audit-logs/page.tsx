"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, Loader2, Search } from "lucide-react";
import { useAdminAuditLogs } from "@/hooks/useAdminAuditLogs";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { isSuperAdminUser } from "@/lib/admin/access";
import { handleApiError } from "@/lib/error-handler";
import {
  ShellPageHeader,
  ShellTable,
  ShellTableBodyRow,
  ShellTableHeadRow,
  ShellTableScroll,
} from "@/components/layout/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TranslationValues } from "next-intl";
import type {
  AuditAction,
  AuditChange,
  AuditEntity,
  AuditLog,
} from "@/types/audit-log";

const AUDIT_LOGS_LIMIT = 20;

type EntityFilter = "all" | AuditEntity;
type ActionFilter = "all" | AuditAction;

function actionVariant(
  action: AuditAction
): "default" | "secondary" | "destructive" | "outline" {
  if (action === "CREATE") return "default";
  if (action === "UPDATE") return "secondary";
  if (action === "DELETE" || action === "CANCEL") return "destructive";
  return "outline";
}

function roleVariant(
  role: AuditLog["actorRole"]
): "default" | "secondary" | "outline" {
  if (role === "super_admin") return "default";
  if (role === "admin") return "secondary";
  return "outline";
}

function changesLabel(
  changes: AuditChange[],
  t: (key: string, opts?: TranslationValues) => string
): string {
  if (changes.length === 0) return t("noChanges");
  if (changes.length === 1) {
    const c = changes[0];
    const before = c.before != null ? String(c.before) : "—";
    const after = c.after != null ? String(c.after) : "—";
    return `${c.field}: ${before} → ${after}`;
  }
  return t("changesCount", { count: changes.length });
}

function DiffTable({
  changes,
  t,
}: {
  changes: AuditChange[];
  t: (key: string, opts?: TranslationValues) => string;
}) {
  if (changes.length === 0) {
    return <p className="py-2 text-sm shell-ink-muted">{t("noChanges")}</p>;
  }
  return (
    <table className="mt-2 w-full text-xs">
      <thead>
        <tr className="text-left">
          <th className="px-2 py-1 font-medium shell-ink-muted">
            {t("fieldName")}
          </th>
          <th className="px-2 py-1 font-medium shell-ink-muted">
            {t("fieldBefore")}
          </th>
          <th className="px-2 py-1 font-medium shell-ink-muted">
            {t("fieldAfter")}
          </th>
        </tr>
      </thead>
      <tbody>
        {changes.map((c) => (
          <tr key={c.field} className="border-t border-line">
            <td className="px-2 py-1 font-mono">{c.field}</td>
            <td className="max-w-[200px] truncate px-2 py-1 shell-ink-muted">
              {c.before != null ? JSON.stringify(c.before) : "—"}
            </td>
            <td className="max-w-[200px] truncate px-2 py-1">
              {c.after != null ? JSON.stringify(c.after) : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AdminAuditLogsPage() {
  const t = useTranslations("admin.auditLogs");
  const tApi = useTranslations("apiCodes");
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [emailQuery, setEmailQuery] = useState("");
  const [entity, setEntity] = useState<EntityFilter>("all");
  const [action, setAction] = useState<ActionFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const debouncedEmail = useDebounce(emailQuery, 300);

  const isSuperAdmin = isSuperAdminUser(user);

  const { data, isLoading, isError, error } = useAdminAuditLogs(
    isSuperAdmin
      ? {
          page,
          limit: AUDIT_LOGS_LIMIT,
          actorEmail: debouncedEmail || undefined,
          entity: entity !== "all" ? entity : undefined,
          action: action !== "all" ? action : undefined,
        }
      : {}
  );

  useEffect(() => {
    if (isError && error) {
      handleApiError(error, t("loadError"), tApi);
    }
  }, [isError, error, t, tApi]);

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  if (!isSuperAdmin) {
    return (
      <div className="py-16 text-center">
        <p className="shell-ink-muted">{t("accessDenied")}</p>
      </div>
    );
  }

  return (
    <>
      <ShellPageHeader title={t("title")} description={t("description")} />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 shell-ink-muted"
            aria-hidden
          />
          <Input
            type="search"
            value={emailQuery}
            onChange={(e) => {
              setEmailQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t("searchEmailPlaceholder")}
            className="pl-9"
            aria-label={t("searchEmailPlaceholder")}
          />
        </div>
        <Select
          value={entity}
          onValueChange={(v: EntityFilter) => {
            setEntity(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[min(100%,180px)]">
            <SelectValue placeholder={t("filterEntity")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterEntity")}</SelectItem>
            <SelectItem value="Event">{t("entity_Event")}</SelectItem>
            <SelectItem value="Registration">
              {t("entity_Registration")}
            </SelectItem>
            <SelectItem value="User">{t("entity_User")}</SelectItem>
            <SelectItem value="PromoCode">{t("entity_PromoCode")}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={action}
          onValueChange={(v: ActionFilter) => {
            setAction(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[min(100%,180px)]">
            <SelectValue placeholder={t("filterAction")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterAction")}</SelectItem>
            <SelectItem value="CREATE">{t("action_CREATE")}</SelectItem>
            <SelectItem value="UPDATE">{t("action_UPDATE")}</SelectItem>
            <SelectItem value="DELETE">{t("action_DELETE")}</SelectItem>
            <SelectItem value="STATUS_CHANGE">
              {t("action_STATUS_CHANGE")}
            </SelectItem>
            <SelectItem value="CANCEL">{t("action_CANCEL")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ShellTable className="mt-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2
              className="size-8 animate-spin shell-ink-muted"
              aria-hidden
            />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center shell-ink-muted">
            {emailQuery || entity !== "all" || action !== "all"
              ? t("noFilterResults")
              : t("listEmpty")}
          </p>
        ) : (
          <ShellTableScroll>
            <table className="shell-table w-full text-sm">
              <thead>
                <ShellTableHeadRow>
                  <th className="w-4 px-2 py-3" />
                  <th className="px-4 py-3 font-medium">{t("colTime")}</th>
                  <th className="px-4 py-3 font-medium">{t("colActor")}</th>
                  <th className="px-4 py-3 font-medium">{t("colRole")}</th>
                  <th className="px-4 py-3 font-medium">{t("colAction")}</th>
                  <th className="px-4 py-3 font-medium">{t("colEntity")}</th>
                  <th className="px-4 py-3 font-medium">{t("colWhat")}</th>
                  <th className="px-4 py-3 font-medium">{t("colChanges")}</th>
                </ShellTableHeadRow>
              </thead>
              <tbody>
                {items.map((row) => {
                  const isExpanded = expandedId === row.id;
                  return (
                    <>
                      <ShellTableBodyRow
                        key={row.id}
                        role="button"
                        tabIndex={0}
                        className="cursor-pointer"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : row.id)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setExpandedId(isExpanded ? null : row.id);
                          }
                        }}
                        aria-expanded={isExpanded}
                      >
                        <td className="px-2 py-3 shell-ink-muted">
                          {isExpanded ? (
                            <ChevronDown className="size-4" aria-hidden />
                          ) : (
                            <ChevronRight className="size-4" aria-hidden />
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs shell-ink-muted whitespace-nowrap">
                          {new Date(row.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{row.actorName}</div>
                          <div className="text-xs shell-ink-muted">
                            {row.actorEmail}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={roleVariant(row.actorRole)}>
                            {t(`role_${row.actorRole}`)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={actionVariant(row.action)}>
                            {t(`action_${row.action}`)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 shell-ink-muted">
                          {t(`entity_${row.entity}`)}
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-3 shell-ink-muted">
                          {row.entityLabel}
                        </td>
                        <td className="px-4 py-3 shell-ink-muted text-xs">
                          {changesLabel(row.changes, t)}
                        </td>
                      </ShellTableBodyRow>
                      {isExpanded && (
                        <tr key={`${row.id}-diff`} className="bg-surface">
                          <td colSpan={8} className="px-6 pb-4">
                            <DiffTable changes={row.changes} t={t} />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </ShellTableScroll>
        )}
      </ShellTable>

      {pagination && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm shell-ink-muted">
            {t("page", { current: pagination.page, total: totalPages })}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t("prev")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
