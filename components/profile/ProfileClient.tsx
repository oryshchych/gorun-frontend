"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Settings, Baby, Plus, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMyRegistrations } from "@/hooks/useRegistrations";
import { Registration } from "@/types/registration";
import { cn } from "@/lib/utils";

type ProfileTab = "current" | "past" | "kids";

/** Inline "Edit" affordance, used in both the desktop strip and the mobile row. */
const editLinkClasses =
  "text-[13px] font-bold text-brand-active no-underline transition-colors hover:text-brand";

/** Dashed placeholder chrome shared by the browse-events CTA and add-child button. */
const dashedClasses = "border-[1.5px] border-dashed border-line-strong";

/** Round icon tile used beside list rows. */
const iconTileClasses =
  "grid size-11 shrink-0 place-items-center bg-brand-tint";

export function ProfileClient() {
  const { user } = useAuth();
  const locale = useLocale();
  const t = useTranslations("profileHub");
  const [tab, setTab] = useState<ProfileTab>("current");
  const { data: registrationsData } = useMyRegistrations();

  const registrations: Registration[] = registrationsData?.data || [];
  const upcoming = registrations.filter(
    (r) =>
      r.status !== "cancelled" && r.event && new Date(r.event.date) > new Date()
  );
  const past = registrations.filter(
    (r) => r.event && new Date(r.event.date) <= new Date()
  );

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: "current", label: t("tabs.current") },
    { id: "past", label: t("tabs.past") },
    { id: "kids", label: t("tabs.kids") },
  ];

  if (!user) {
    return <ProfilePrompt locale={locale} />;
  }

  return (
    <div className="min-h-screen bg-bg pb-30 text-ink">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4.5 pb-2 pt-3.5">
          <h1 className="gr-display m-0 text-[22px] font-extrabold">
            {t("title")}
          </h1>
          <Link
            href={`/${locale}/profile/settings`}
            className="grid size-10 place-items-center rounded-(--r-pill) border border-line bg-surface text-ink no-underline transition-colors hover:bg-surface-2"
            aria-label={t("settings")}
          >
            <Settings size={18} />
          </Link>
        </div>

        {/* Identity card */}
        <div className="px-4.5">
          <div className="rounded-lg border border-line bg-surface p-4.5">
            {/* Mobile: avatar + name row, stats below. Desktop: single horizontal strip */}
            <div className="flex flex-col md:flex-row md:items-center md:gap-6">
              {/* Avatar + name (always flex row) */}
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="grid size-16 shrink-0 place-items-center rounded-(--r-pill) bg-[linear-gradient(135deg,var(--brand),var(--brand-active))] text-[22px] font-extrabold text-on-brand">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="gr-display text-xl font-extrabold">
                    {user.name}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-3">
                    {user.runningClub ? `${user.runningClub} · ` : ""}
                    {user.city || user.email}
                  </div>
                </div>
              </div>

              {/* Stats — below on mobile, inline on desktop */}
              <div className="mt-4 grid grid-cols-3 border-t border-dashed border-(--line-strong) pt-4 md:mt-0 md:flex md:gap-8 md:border-0 md:pt-0">
                {[
                  [String(user.totalKm ?? "—"), t("stats.km")],
                  [String(registrations.length), t("stats.races")],
                  [`${user.totalDonated ?? 0}₴`, t("stats.afu")],
                ].map(([n, l]) => (
                  <div key={l}>
                    <div className="gr-display text-xl font-extrabold text-ink">
                      {n}
                    </div>
                    <div className="text-[11px] font-semibold text-ink-3">
                      {l}
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit — end of strip */}
              <Link
                href={`/${locale}/profile/settings`}
                className={cn(editLinkClasses, "hidden shrink-0 md:block")}
              >
                {t("edit")}
              </Link>
            </div>

            {/* Edit link — mobile only (below stats) */}
            <div className="mt-3 flex justify-end md:hidden">
              <Link
                href={`/${locale}/profile/settings`}
                className={editLinkClasses}
              >
                {t("edit")}
              </Link>
            </div>
          </div>
        </div>

        {/* Tab pills */}
        <div className="flex gap-1 px-4.5 pt-5">
          {tabs.map(({ id, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "min-h-11 cursor-pointer rounded-(--r-pill) px-4 py-2.5 text-[13px] font-bold transition-colors",
                  active
                    ? "bg-ink text-bg"
                    : "border border-line text-ink-3 hover:text-ink"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="px-4.5 pt-3.5">
          {tab === "current" && (
            <div className="flex flex-col gap-3">
              {upcoming.length === 0 ? (
                <div className="py-6 text-center text-sm text-ink-3">
                  {t("noUpcoming")}
                </div>
              ) : (
                upcoming.map((reg) => <RacePassCard key={reg.id} reg={reg} />)
              )}

              {/* CTA to browse events */}
              <Link
                href={`/${locale}`}
                className={cn(
                  dashedClasses,
                  "flex items-center gap-3 rounded-lg bg-surface p-4 text-left text-ink no-underline transition-colors hover:bg-surface-2"
                )}
              >
                <div className={cn(iconTileClasses, "rounded-md")}>
                  <Plus size={22} color="var(--brand-active)" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{t("browseEvents")}</div>
                  <div className="text-xs text-ink-3">
                    {t("browseEventsSub")}
                  </div>
                </div>
                <ArrowRight size={18} color="var(--ink-3)" />
              </Link>
            </div>
          )}

          {tab === "past" && (
            <div className="flex flex-col gap-2.5">
              {past.length === 0 ? (
                <div className="py-6 text-center text-sm text-ink-3">
                  {t("noPast")}
                </div>
              ) : (
                past.map((reg) => <PastRaceCard key={reg.id} reg={reg} />)
              )}
            </div>
          )}

          {tab === "kids" && (
            <div className="flex flex-col gap-3">
              {user.kids?.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4"
                >
                  <div className={cn(iconTileClasses, "rounded-(--r-pill)")}>
                    <Baby size={22} color="var(--brand-active)" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-bold">{k.name}</div>
                    <div className="text-xs text-ink-3">
                      {t("kidAge", { age: k.age })}
                      {k.shirt ? ` · ${t("kidShirt", { size: k.shirt })}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={cn(
                      editLinkClasses,
                      "cursor-pointer border-0 bg-transparent"
                    )}
                  >
                    {t("edit")}
                  </button>
                </div>
              ))}

              <button
                type="button"
                className={cn(
                  dashedClasses,
                  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-transparent p-3.5 text-[13px] font-semibold text-ink-3 transition-colors hover:text-ink"
                )}
              >
                <Plus size={16} /> {t("addChild")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RacePassCard({ reg }: { reg: Registration }) {
  const t = useTranslations("profileHub");
  const eventTitle =
    reg.event?.title ||
    reg.event?.translations?.title?.uk ||
    reg.event?.translations?.title?.en ||
    t("eventFallback");

  return (
    <div className="overflow-hidden rounded-xl bg-ink text-bg">
      <div className="flex items-start justify-between px-4.5 pb-3.5 pt-4">
        <div>
          <div className="text-[11px] font-bold tracking-[0.08em] text-brand">
            {t("racePass.upcoming")}
          </div>
          <div className="gr-display mt-1 text-xl font-extrabold">
            {eventTitle}
          </div>
        </div>
        <div className="grid size-14 place-items-center rounded-sm bg-surface text-[10px] font-bold text-ink">
          {t("racePass.qr")}
        </div>
      </div>
      <div className="grid grid-cols-4 border-t border-dashed border-bg/20">
        {[
          [t("racePass.bib"), reg.bib ? String(reg.bib).padStart(4, "0") : "—"],
          [t("racePass.dist"), reg.distance || "—"],
          [
            t("racePass.status"),
            reg.status === "confirmed" ? "CONF" : reg.status.toUpperCase(),
          ],
          [
            t("racePass.pay"),
            reg.paymentStatus === "completed"
              ? "PAID"
              : (reg.paymentStatus?.toUpperCase() ?? "—"),
          ],
        ].map(([k, v]) => (
          <div key={k} className="border-r border-dashed border-bg/20 p-3">
            <div className="text-[9px] font-bold tracking-[0.08em] opacity-60">
              {k}
            </div>
            <div className="gr-mono text-sm font-extrabold">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PastRaceCard({ reg }: { reg: Registration }) {
  const locale = useLocale();
  const t = useTranslations("profileHub");
  const cover =
    reg.event?.cover ||
    reg.event?.imageUrl?.landscape ||
    reg.event?.imageUrl?.portrait;
  const eventTitle =
    reg.event?.title ||
    reg.event?.translations?.title?.uk ||
    reg.event?.translations?.title?.en ||
    t("eventFallback");

  return (
    <div className="flex items-stretch overflow-hidden rounded-lg border border-line bg-surface">
      {cover && (
        <div
          className="w-20 shrink-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${cover})` }}
        />
      )}
      <div className="flex-1 p-3.5">
        <div className="text-[11px] font-semibold text-ink-3">
          {reg.event?.date
            ? new Date(reg.event.date).toLocaleDateString(locale, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : ""}
        </div>
        <div className="mt-0.5 text-[15px] font-bold">{eventTitle}</div>
        <div className="mt-2 flex items-center gap-3">
          {reg.distance && (
            <span className="rounded-(--r-pill) bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-ink-2">
              {reg.distance}
            </span>
          )}
          <span
            className={cn(
              "text-xs font-semibold",
              reg.status === "confirmed" ? "text-brand-active" : "text-ink-3"
            )}
          >
            {reg.status === "confirmed" ? t("completed") : reg.status}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProfilePrompt({ locale }: { locale: string }) {
  const t = useTranslations("profileHub.prompt");

  const features = [
    t("features.racePass"),
    t("features.kids"),
    t("features.results"),
    t("features.afu"),
  ];

  return (
    <div className="gr-screen-enter min-h-screen bg-bg px-5.5 pb-32.5 pt-6 text-ink">
      <div className="mt-7.5">
        <div className="grid size-16 place-items-center rounded-(--r-pill) bg-brand-tint text-brand-active">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h1 className="gr-display mt-4.5 text-[28px] font-extrabold leading-[1.1] text-balance">
          {t("headline")}
        </h1>
        <p className="mt-2.5 text-sm leading-[1.55] text-ink-3">{t("sub")}</p>
      </div>

      <div className="mt-7 flex flex-col gap-2.5">
        {features.map((text) => (
          <div
            key={text}
            className="flex items-center gap-3 rounded-md border border-line bg-surface px-3.5 py-3"
          >
            <div className="grid size-9 shrink-0 place-items-center rounded-(--r-pill) bg-brand-tint text-brand-active">
              ✓
            </div>
            <div className="text-[13px] text-ink-2">{text}</div>
          </div>
        ))}
      </div>

      <div className="mt-5.5">
        <Link
          href={`/${locale}/login`}
          className="flex h-14 w-full items-center justify-center rounded-(--r-pill) bg-brand text-base font-bold text-on-brand no-underline transition-colors hover:bg-brand-hover focus-visible:shadow-[0_0_0_4px_var(--brand-glow)] focus-visible:outline-none"
        >
          {t("cta")}
        </Link>
        <p className="mt-2.5 text-center text-xs text-ink-4">{t("note")}</p>
      </div>
    </div>
  );
}
