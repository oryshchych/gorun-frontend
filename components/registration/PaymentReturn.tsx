"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { syncPayment } from "@/lib/api/registrations";

type ReturnStatus =
  | "checking"
  | "success"
  | "pending"
  | "failed"
  | "error"
  | "missing";

const POLL_ATTEMPTS = 4;
const POLL_INTERVAL_MS = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function PaymentReturn() {
  const t = useTranslations("paymentReturn");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const registrationId = searchParams.get("registrationId");

  const [status, setStatus] = useState<ReturnStatus>(() =>
    registrationId ? "checking" : "missing"
  );
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    if (!registrationId) return;
    let cancelled = false;

    (async () => {
      for (let attempt = 0; attempt < POLL_ATTEMPTS && !cancelled; attempt++) {
        try {
          const result = await syncPayment(registrationId);
          if (cancelled) return;
          setEventId(result.registration.eventId ?? null);
          if (result.newStatus === "completed") {
            setStatus("success");
            return;
          }
          if (result.newStatus === "failed") {
            setStatus("failed");
            return;
          }
          // Still processing — wait and retry.
        } catch {
          if (cancelled) return;
          if (attempt === POLL_ATTEMPTS - 1) {
            setStatus("error");
            return;
          }
        }
        await sleep(POLL_INTERVAL_MS);
      }
      if (!cancelled) setStatus("pending");
    })();

    return () => {
      cancelled = true;
    };
  }, [registrationId]);

  const view = VIEWS[status];
  const retryHref = eventId
    ? `/${locale}/events/${eventId}/register`
    : `/${locale}/events`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--ink)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        textAlign: "center",
        maxWidth: 640,
        margin: "0 auto",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 88,
          height: 88,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          background: view.tint,
          marginBottom: 20,
        }}
      >
        <view.Icon
          size={44}
          color={view.color}
          className={status === "checking" ? "animate-spin" : undefined}
        />
      </div>

      <h1
        className="gr-display"
        style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}
        role="status"
        aria-live="polite"
      >
        {t(view.title)}
      </h1>
      <p
        style={{
          fontSize: 15,
          color: "var(--ink-3)",
          lineHeight: 1.5,
          maxWidth: 440,
        }}
      >
        {t(view.desc)}
      </p>

      {status !== "checking" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginTop: 28,
            width: "100%",
            maxWidth: 320,
          }}
        >
          {(status === "failed" || status === "error") && (
            <button onClick={() => router.push(retryHref)} style={primaryBtn}>
              {t("retry")}
            </button>
          )}
          {(status === "success" || status === "pending") && (
            <Link href={`/${locale}/my-registrations`} style={primaryBtn}>
              {t("myRegistrations")}
            </Link>
          )}
          <Link href={`/${locale}/events`} style={secondaryBtn}>
            {t("browseEvents")}
          </Link>
        </div>
      )}
    </div>
  );
}

const VIEWS: Record<
  ReturnStatus,
  {
    Icon: typeof CheckCircle2;
    color: string;
    tint: string;
    title: string;
    desc: string;
  }
> = {
  checking: {
    Icon: Loader2,
    color: "var(--ink-3)",
    tint: "var(--surface-2)",
    title: "checking",
    desc: "checking",
  },
  success: {
    Icon: CheckCircle2,
    color: "var(--brand-active)",
    tint: "var(--brand-tint)",
    title: "successTitle",
    desc: "successDesc",
  },
  pending: {
    Icon: Clock,
    color: "var(--warn)",
    tint: "var(--warn-bg)",
    title: "pendingTitle",
    desc: "pendingDesc",
  },
  failed: {
    Icon: XCircle,
    color: "var(--danger)",
    tint: "var(--danger-bg)",
    title: "failedTitle",
    desc: "failedDesc",
  },
  error: {
    Icon: AlertTriangle,
    color: "var(--warn)",
    tint: "var(--warn-bg)",
    title: "errorTitle",
    desc: "errorDesc",
  },
  missing: {
    Icon: AlertTriangle,
    color: "var(--ink-3)",
    tint: "var(--surface-2)",
    title: "errorTitle",
    desc: "missingId",
  },
};

const primaryBtn: React.CSSProperties = {
  height: 52,
  borderRadius: 999,
  background: "var(--brand)",
  color: "var(--on-brand)",
  fontWeight: 700,
  fontSize: 15,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: 0,
  cursor: "pointer",
  textDecoration: "none",
};

const secondaryBtn: React.CSSProperties = {
  height: 52,
  borderRadius: 999,
  background: "var(--surface)",
  color: "var(--ink)",
  fontWeight: 600,
  fontSize: 15,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--line)",
  cursor: "pointer",
  textDecoration: "none",
};
