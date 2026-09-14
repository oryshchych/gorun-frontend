import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Event } from "@/types/event";
import { cn, getLocalizedString } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/api$/, "");

/** Medal colours are fixed in both themes, so the fill carries dark ink. */
const MEDAL_CLASSES = ["bg-afu-yellow", "bg-medal-silver", "bg-medal-bronze"];

/** The results table needs this much width before columns start crushing. */
const TABLE_GRID = "grid grid-cols-[48px_2fr_1fr_100px_120px_120px]";

const COLUMN_LABEL =
  "text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-3";

interface ResultRow {
  id: string;
  position?: number;
  positionGender?: number;
  positionAge?: number;
  finishTime?: string;
  paceMinKm?: string;
  bib?: string;
  name?: string;
  city?: string;
  distance?: string;
}

async function fetchEvent(id: string, locale: string): Promise<Event | null> {
  try {
    const res = await fetch(`${API_BASE}/api/events/${id}?lang=${locale}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as Event;
  } catch {
    return null;
  }
}

async function fetchResults(id: string): Promise<ResultRow[]> {
  try {
    const res = await fetch(`${API_BASE}/api/events/${id}/results`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []) as ResultRow[];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const [event, t] = await Promise.all([
    fetchEvent(id, locale),
    getTranslations({ locale, namespace: "results" }),
  ]);
  const title = event
    ? getLocalizedString(
        event.translations?.title,
        locale,
        "en",
        event.title || ""
      )
    : "";
  return { title: title ? `${t("title")} — ${title}` : t("title") };
}

export default async function PublicResultsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const [event, t] = await Promise.all([
    fetchEvent(id, locale),
    getTranslations({ locale, namespace: "results" }),
  ]);

  if (!event) notFound();

  // Results only available for finished events
  if (event.status && event.status !== "FINISHED") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg p-8 text-center text-ink">
        <div className="gr-display mb-3 text-2xl font-bold">
          {t("notAvailable")}
        </div>
        <p className="max-w-80 text-sm text-ink-3">{t("notAvailableDesc")}</p>
        <Link
          href={`/${locale}/events/${id}`}
          className="mt-6 rounded-(--r-pill) bg-brand px-6 py-3 text-sm font-bold text-on-brand no-underline transition-colors hover:bg-brand-hover focus-visible:shadow-[0_0_0_4px_var(--brand-glow)] focus-visible:outline-none"
        >
          {t("backToEvent")}
        </Link>
      </div>
    );
  }

  const results = await fetchResults(id);

  const title = getLocalizedString(
    event.translations?.title,
    locale,
    "en",
    event.title || ""
  );

  const podium = results.slice(0, 3);
  const rest = results.slice(3);

  return (
    <div className="min-h-screen bg-bg pb-25 text-ink">
      <div className="mx-auto max-w-7xl px-4.5 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/${locale}/events/${id}`}
            className="mb-3 inline-flex items-center gap-1.5 rounded-sm text-[13px] font-semibold text-ink-3 no-underline transition-colors hover:text-ink"
          >
            <ArrowLeft size={15} />
            {t("backToEvent")}
          </Link>
          <h1 className="gr-display m-0 text-[32px] font-extrabold">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-ink-3">{title}</p>
        </div>

        {results.length === 0 ? (
          <div className="py-12 text-center text-sm text-ink-3">
            {t("comingSoon")}
          </div>
        ) : (
          <>
            {/* Podium */}
            {podium.length > 0 && (
              <div className="mb-7 grid gap-4 sm:grid-cols-3">
                {podium.map((r, i) => (
                  <div
                    key={r.id}
                    className="relative overflow-hidden rounded-lg border border-line bg-surface p-6"
                  >
                    <div
                      className={cn(
                        "absolute left-0 right-0 top-0 h-1",
                        MEDAL_CLASSES[i]
                      )}
                    />
                    <div className="flex items-center gap-3.5">
                      <div
                        className={cn(
                          "grid size-14 shrink-0 place-items-center rounded-full text-[22px] font-extrabold text-on-brand",
                          MEDAL_CLASSES[i]
                        )}
                      >
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-base font-bold">
                          {r.name || "—"}
                        </div>
                        {r.city && (
                          <div className="text-xs text-ink-3">{r.city}</div>
                        )}
                      </div>
                    </div>
                    {r.finishTime && (
                      <div className="mt-4 flex justify-between border-t border-line pt-3.5">
                        <div>
                          <div className={COLUMN_LABEL}>{t("finish")}</div>
                          <div className="gr-mono mt-0.5 text-xl font-extrabold">
                            {r.finishTime}
                          </div>
                        </div>
                        {r.paceMinKm && (
                          <div>
                            <div className={COLUMN_LABEL}>{t("pace")}</div>
                            <div className="gr-mono mt-1 text-sm font-bold">
                              {r.paceMinKm}/km
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Full table — scrolls sideways rather than crushing on small screens */}
            {rest.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-line bg-surface">
                <div className="overflow-x-auto">
                  <div className="min-w-160">
                    <div
                      className={cn(
                        TABLE_GRID,
                        "border-b border-line px-4.5 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-3"
                      )}
                    >
                      <div>{t("position")}</div>
                      <div>{t("name")}</div>
                      <div>{t("city")}</div>
                      <div>{t("distance")}</div>
                      <div>{t("time")}</div>
                      <div>{t("pace")}</div>
                    </div>
                    {rest.map((r, i) => (
                      <div
                        key={r.id}
                        className={cn(
                          TABLE_GRID,
                          "items-center px-4.5 py-3.5 text-sm",
                          i < rest.length - 1 && "border-b border-line"
                        )}
                      >
                        <div className="font-bold">{r.position ?? i + 4}</div>
                        <div className="font-semibold">{r.name || "—"}</div>
                        <div className="text-[13px] text-ink-3">
                          {r.city || "—"}
                        </div>
                        <div>
                          {r.distance && (
                            <span className="rounded-(--r-pill) bg-surface-2 px-2 py-0.75 text-[11px] font-semibold text-ink-2">
                              {r.distance}
                            </span>
                          )}
                        </div>
                        <div className="gr-mono font-bold">
                          {r.finishTime || "—"}
                        </div>
                        <div className="gr-mono text-[13px] text-ink-3">
                          {r.paceMinKm ? `${r.paceMinKm}/km` : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
