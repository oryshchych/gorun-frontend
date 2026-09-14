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
import { cn } from "@/lib/utils";

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

const actionButton =
  "flex h-13 cursor-pointer items-center justify-center rounded-(--r-pill) text-[15px] no-underline transition-colors focus-visible:shadow-[0_0_0_4px_var(--brand-glow)] focus-visible:outline-none";

const primaryBtn = cn(
  actionButton,
  "border-0 bg-brand font-bold text-on-brand hover:bg-brand-hover active:bg-brand-active"
);

const secondaryBtn = cn(
  actionButton,
  "border border-line bg-surface font-semibold text-ink hover:bg-surface-2"
);

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
    <div className="mx-auto flex min-h-screen max-w-160 flex-col items-center justify-center bg-bg p-6 text-center text-ink">
      <div
        aria-hidden="true"
        className={cn(
          "mb-5 grid size-22 place-items-center rounded-(--r-pill)",
          view.tintClass
        )}
      >
        <view.Icon
          size={44}
          className={cn(
            view.iconClass,
            status === "checking" && "animate-spin"
          )}
        />
      </div>

      <h1
        className="gr-display mb-2 text-2xl font-extrabold"
        role="status"
        aria-live="polite"
      >
        {t(view.title)}
      </h1>
      <p className="max-w-110 text-[15px] leading-[1.5] text-ink-3">
        {t(view.desc)}
      </p>

      {status !== "checking" && (
        <div className="mt-7 flex w-full max-w-80 flex-col gap-2.5">
          {(status === "failed" || status === "error") && (
            <button
              type="button"
              onClick={() => router.push(retryHref)}
              className={primaryBtn}
            >
              {t("retry")}
            </button>
          )}
          {(status === "success" || status === "pending") && (
            <Link href={`/${locale}/my-registrations`} className={primaryBtn}>
              {t("myRegistrations")}
            </Link>
          )}
          <Link href={`/${locale}/events`} className={secondaryBtn}>
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
    iconClass: string;
    tintClass: string;
    title: string;
    desc: string;
  }
> = {
  checking: {
    Icon: Loader2,
    iconClass: "text-ink-3",
    tintClass: "bg-surface-2",
    title: "checking",
    desc: "checking",
  },
  success: {
    Icon: CheckCircle2,
    iconClass: "text-brand-active",
    tintClass: "bg-brand-tint",
    title: "successTitle",
    desc: "successDesc",
  },
  pending: {
    Icon: Clock,
    iconClass: "text-warn",
    tintClass: "bg-warn-bg",
    title: "pendingTitle",
    desc: "pendingDesc",
  },
  failed: {
    Icon: XCircle,
    iconClass: "text-danger",
    tintClass: "bg-danger-bg",
    title: "failedTitle",
    desc: "failedDesc",
  },
  error: {
    Icon: AlertTriangle,
    iconClass: "text-warn",
    tintClass: "bg-warn-bg",
    title: "errorTitle",
    desc: "errorDesc",
  },
  missing: {
    Icon: AlertTriangle,
    iconClass: "text-ink-3",
    tintClass: "bg-surface-2",
    title: "errorTitle",
    desc: "missingId",
  },
};
