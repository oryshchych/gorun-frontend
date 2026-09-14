"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Share2,
  Calendar,
  Users,
  Ticket,
  MapPin,
  Baby,
  Check,
  Trophy,
} from "lucide-react";
import { Event } from "@/types/event";
import { resolveDistancePrice } from "@/lib/distance-price";
import { Participant } from "@/types/registration";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Tag } from "@/components/ui/tag";
import { ParticipantsList } from "@/components/events/ParticipantsList";
import { PastEventRecap } from "@/components/events/PastEventRecap";
import { cn, getLocalizedString } from "@/lib/utils";
import {
  isPastEventExperience,
  isRegistrationClosed,
} from "@/lib/event-registration";
import { format } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { uk } from "date-fns/locale/uk";

interface EventDetailClientProps {
  event: Event;
  participants: Participant[];
  locale: string;
}

type TabId = "overview" | "schedule" | "distances" | "runners";

/** Shared chrome for the round overlay controls in the hero nav row. */
const heroControlClasses =
  "grid size-10 cursor-pointer place-items-center rounded-[var(--r-pill)] border border-line bg-surface text-ink transition-colors hover:bg-surface-2";

/** Shared chrome for the primary pill CTA (sidebar + mobile sticky bar). */
const ctaClasses =
  "flex w-full items-center justify-center gap-2 rounded-[var(--r-pill)] bg-brand px-5.5 py-4 text-base font-bold text-on-brand no-underline shadow-[0_8px_28px_var(--brand-glow)] transition-colors hover:bg-brand-hover active:bg-brand-active focus-visible:shadow-[0_0_0_4px_var(--brand-glow)] focus-visible:outline-none";

/** Shared chrome for the fixed mobile CTA bar. */
const mobileCtaBarClasses =
  "fixed bottom-0 left-0 right-0 z-20 bg-[linear-gradient(180deg,transparent,var(--bg)_30%)] px-4.5 pb-6 pt-3 lg:hidden";

/** Shared chrome for the quick-fact tiles under the hero. */
const quickFactClasses = "rounded-md border border-line bg-surface p-2.5";

/** Shared chrome for the sidebar / distance panels. */
const panelClasses = "rounded-lg border border-line bg-surface";

export function EventDetailClient({
  event,
  participants,
  locale: _localeProp,
}: EventDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const locale = useLocale();
  const t = useTranslations("eventDetail");
  const dateLocale = locale === "uk" ? uk : enUS;

  const title =
    event.resolvedTitle ||
    getLocalizedString(
      event.translations?.title,
      locale,
      "en",
      event.title || ""
    );
  const description =
    event.resolvedDescription ||
    getLocalizedString(
      event.translations?.description,
      locale,
      "en",
      event.description || ""
    );
  const location =
    event.resolvedLocation ||
    getLocalizedString(
      event.translations?.location,
      locale,
      "en",
      event.location || ""
    );

  const coverImage =
    event.cover || event.imageUrl?.landscape || event.imageUrl?.portrait || "";

  const spotsTotal = event.spots?.total ?? event.capacity;
  const spotsTaken = event.spots?.taken ?? event.registeredCount;

  const dateLabel =
    event.dateLabel ||
    format(new Date(event.date), "EEE, MMM d yyyy", { locale: dateLocale });

  // Fee comes from the API `event.fee` field — no client-side formatting
  const feeLabel = event.fee || "";

  const registrationClosed = isRegistrationClosed(event);
  const pastExperience = isPastEventExperience(event);
  const showMobileSticky = !registrationClosed || pastExperience;

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: t("tabs.overview") },
    { id: "schedule", label: t("tabs.schedule") },
    { id: "distances", label: t("tabs.distances") },
    { id: "runners", label: t("tabs.runners") },
  ];
  console.log(event);

  return (
    <div
      className={cn(
        "min-h-screen bg-bg text-ink",
        showMobileSticky ? "pb-30" : "pb-10"
      )}
    >
      {/* ── Hero (image only) ── */}
      <div
        className="relative min-h-115 bg-surface-2 bg-contain bg-center bg-no-repeat"
        style={
          coverImage ? { backgroundImage: `url(${coverImage})` } : undefined
        }
      >
        {/* ── Nav row (overlay) ── */}
        <div className="absolute left-0 right-0 top-0 mx-auto flex max-w-7xl justify-between px-4.5 py-3.5">
          <Link
            href={`/${locale}`}
            className={cn(heroControlClasses, "no-underline")}
            aria-label={t("backToEvents")}
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              className={heroControlClasses}
              aria-label={t("saveEvent")}
            >
              <Heart size={18} />
            </button>
            <button
              type="button"
              className={heroControlClasses}
              aria-label={t("shareEvent")}
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Event info ── */}
      <div className="mx-auto max-w-7xl px-4.5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <Tag className="normal-case">{dateLabel}</Tag>
          {pastExperience && (
            <Tag tone="dark" className="normal-case">
              {t("past.badge")}
            </Tag>
          )}
        </div>
        <h1 className="gr-display mt-2.5 text-[28px] font-extrabold leading-[1.05] text-ink text-balance sm:text-4xl md:text-5xl lg:text-6xl xl:text-[64px]">
          {title}
        </h1>
        <div className="mt-2 flex items-center gap-1 text-[13px] text-ink-3">
          <MapPin size={14} />
          {event.venue || location}
        </div>
      </div>

      {/* ── Quick facts ── */}
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-2 px-4.5 py-3.5">
        {pastExperience
          ? [
              <div key="d" className={quickFactClasses}>
                <Calendar size={16} color="var(--brand-active)" />
                <div className="gr-display mt-1 text-base font-extrabold text-ink">
                  {dateLabel.split(",")[1]?.trim() ?? dateLabel}
                </div>
                <div className="text-[11px] text-ink-3">
                  {event.timeLabel ?? ""}
                </div>
              </div>,
              <div key="r" className={quickFactClasses}>
                <Users size={16} color="var(--brand-active)" />
                <div className="gr-display mt-1 text-base font-extrabold text-ink">
                  {String(spotsTaken)}
                </div>
                <div className="text-[11px] text-ink-3">
                  {t("past.runnersOnRecord")}
                </div>
              </div>,
              <Link
                key="res"
                href={`/${locale}/events/${event.id}/results`}
                className={cn(
                  quickFactClasses,
                  "block text-inherit no-underline transition-colors hover:border-line-strong hover:bg-surface-2"
                )}
              >
                <Trophy size={16} color="var(--brand-active)" />
                <div className="gr-display mt-1 text-base font-extrabold text-ink">
                  {t("past.viewResults")}
                </div>
                <div className="text-[11px] font-semibold text-brand-active">
                  →
                </div>
              </Link>,
            ]
          : [
              {
                Icon: Calendar,
                top: dateLabel.split(",")[1]?.trim() ?? dateLabel,
                bot: event.timeLabel ?? "",
              },
              {
                Icon: Users,
                top: String(spotsTaken),
                bot: `/ ${spotsTotal}`,
              },
              {
                Icon: Ticket,
                top: feeLabel || "—",
                bot: t("entryFrom"),
              },
            ].map(({ Icon, top, bot }, i) => (
              <div key={i} className={quickFactClasses}>
                <Icon size={16} color="var(--brand-active)" />
                <div className="gr-display mt-1 text-base font-extrabold text-ink">
                  {top}
                </div>
                <div className="text-[11px] text-ink-3">{bot}</div>
              </div>
            ))}
      </div>

      {/* ── Tab bar ── */}
      <div className="sticky top-0 z-10 border-b border-line bg-bg">
        <div className="mx-auto flex max-w-7xl px-3">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "-mb-px cursor-pointer border-b-2 bg-transparent px-3 py-3.5 text-sm font-bold transition-colors",
                  active
                    ? "border-brand text-ink"
                    : "border-transparent text-ink-3 hover:text-ink"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab body ── */}
      <div className="mx-auto max-w-7xl px-4.5 py-5">
        <div
          className={cn(
            "block",
            activeTab === "overview" &&
              "lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-10"
          )}
        >
          {/* Main content column */}
          <div>
            {activeTab === "overview" && (
              <div className="flex flex-col gap-5">
                <p className="m-0 text-[15px] leading-[1.6] text-ink-2">
                  {description}
                </p>

                {pastExperience && <PastEventRecap event={event} />}

                {/* AFU card — body comes from API `event.afu` field */}
                {event.afu && (
                  <div className="rounded-lg bg-ink p-4.5 text-bg">
                    <div className="mb-2 flex items-center gap-2.5">
                      <div className="size-2 shrink-0 rounded-[var(--r-pill)] bg-afu-yellow" />
                      <div className="text-[11px] font-bold tracking-[0.08em] text-afu-yellow">
                        {t("afuSupport")}
                      </div>
                    </div>
                    <div className="text-sm leading-normal">{event.afu}</div>
                  </div>
                )}

                {/* Perks — come from API `event.perks[]` */}
                {event.perks && event.perks.length > 0 && (
                  <div>
                    <div className="gr-display mb-2.5 text-base font-bold">
                      {t("included")}
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
                      {event.perks.map((perk) => (
                        <div
                          key={perk}
                          className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2.5 text-[13px]"
                        >
                          <Check size={15} color="var(--brand-active)" />
                          {perk}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {event.regulationUrl && (
                  <div>
                    <a
                      href={event.regulationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-sm text-sm text-brand-active underline underline-offset-3 transition-colors hover:text-brand"
                    >
                      {t("regulation")}
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === "schedule" && (
              <div className="flex flex-col gap-2">
                {/* `event.scheduleText` is free-form, multi-line text */}
                {event.scheduleText ? (
                  <p className="m-0 whitespace-pre-wrap text-[15px] leading-[1.6] text-ink-2">
                    {event.scheduleText}
                  </p>
                ) : (
                  <p className="text-sm text-ink-3">{t("scheduleEmpty")}</p>
                )}
              </div>
            )}

            {activeTab === "distances" && (
              <div className="flex flex-col gap-3">
                {/* Adult distances from API `event.distances[]` */}
                {event.distances?.map((d) => (
                  <div key={d.id} className={cn(panelClasses, "p-4")}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="gr-display text-[28px] font-extrabold leading-none text-ink">
                          {d.label}
                        </div>
                        <div className="mt-0.5 text-[13px] text-ink-3">
                          {d.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="gr-display text-lg font-extrabold text-brand-active">
                          {resolveDistancePrice(d)} ₴
                        </div>
                        {(d.elevation || d.laps) && (
                          <div className="text-[11px] text-ink-3">
                            {d.elevation || d.laps}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <ProgressBar
                        taken={d.spots?.taken ?? 0}
                        total={d.spots?.total ?? d.participantLimit ?? 0}
                      />
                    </div>
                  </div>
                ))}

                {/* Kids distances from API `event.kidsDistances[]` */}
                {event.kidsDistances && event.kidsDistances.length > 0 && (
                  <div className="mt-2">
                    <div className="gr-display mb-2.5 flex items-center gap-2 text-base font-bold">
                      <Baby size={18} /> {t("kidsRaces")}
                    </div>
                    <div className="flex flex-wrap gap-2 rounded-lg bg-brand-tint p-4">
                      {event.kidsDistances.map((d) => (
                        <div
                          key={d.id}
                          className="flex-[1_1_100px] rounded-md bg-surface/60 px-3.5 py-3"
                        >
                          <div className="text-lg font-extrabold text-brand-active">
                            {d.label}
                          </div>
                          <div className="text-[11px] font-semibold text-ink-3">
                            {t("age", { range: d.age })}
                          </div>
                          <div className="mt-0.5 text-[11px] text-ink-3">
                            {resolveDistancePrice(d) === 0
                              ? t("free")
                              : `${resolveDistancePrice(d)} ₴`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!event.distances?.length && !event.kidsDistances?.length && (
                  <p className="text-sm text-ink-3">{t("distancesEmpty")}</p>
                )}
              </div>
            )}

            {activeTab === "runners" && (
              <ParticipantsList participants={participants} isLoading={false} />
            )}
          </div>

          {/* Desktop sticky sidebar */}
          {activeTab === "overview" && (
            <div className="sticky top-22.5 hidden flex-col gap-3.5 lg:flex">
              {registrationClosed ? (
                pastExperience ? (
                  <div className={cn(panelClasses, "p-6")}>
                    <div className="gr-display text-[22px] font-extrabold leading-[1.2] text-ink">
                      {t("past.sidebarTitle")}
                    </div>
                    <p className="mt-2.5 text-sm leading-normal text-ink-2">
                      {t("past.sidebarSub")}
                    </p>
                    <div className="mt-4">
                      <ProgressBar taken={spotsTaken} total={spotsTotal} />
                    </div>
                    <Link
                      href={`/${locale}/events/${event.id}/results`}
                      className={cn(ctaClasses, "mt-4.5")}
                    >
                      {t("past.viewResults")}
                    </Link>
                    <Link
                      href={`/${locale}/events/${event.id}/runners`}
                      className="mt-2.5 flex w-full items-center justify-center rounded-[var(--r-pill)] border border-line-strong bg-bg px-5 py-3.5 text-[15px] font-semibold text-ink no-underline transition-colors hover:bg-surface-2"
                    >
                      {t("past.viewRunners")}
                    </Link>
                  </div>
                ) : (
                  <div className={cn(panelClasses, "p-6")}>
                    <p className="m-0 text-[15px] leading-[1.55] text-ink-2">
                      {event.status === "CANCELLED"
                        ? t("past.cancelled")
                        : t("past.registrationClosed")}
                    </p>
                    <Link
                      href={`/${locale}`}
                      className="mt-4 inline-flex rounded-sm text-sm font-bold text-brand-active no-underline transition-colors hover:text-brand"
                    >
                      {t("backToEvents")}
                    </Link>
                  </div>
                )
              ) : (
                <div className={cn(panelClasses, "p-6")}>
                  <div className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-3">
                    {t("entryFrom")}
                  </div>
                  <div className="gr-display mt-1 text-4xl font-extrabold">
                    {feeLabel || "—"}
                  </div>
                  <div className="mt-4">
                    <ProgressBar taken={spotsTaken} total={spotsTotal} />
                  </div>
                  <Link
                    href={`/${locale}/events/${event.id}/register`}
                    className={cn(ctaClasses, "mt-4.5")}
                  >
                    {t("register")}
                  </Link>
                </div>
              )}

              {event.afu && (
                <div className="rounded-lg bg-ink p-5.5 text-bg">
                  <div className="mb-2.5 flex items-center gap-2.5">
                    <div className="size-2 shrink-0 rounded-[var(--r-pill)] bg-afu-yellow" />
                    <div className="text-[11px] font-bold tracking-[0.08em] text-afu-yellow">
                      {t("afuSupport")}
                    </div>
                  </div>
                  <div className="text-[13px] leading-[1.55]">{event.afu}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky CTA (mobile) ── */}
      {!registrationClosed && (
        <div className={mobileCtaBarClasses}>
          <Link
            href={`/${locale}/events/${event.id}/register`}
            className={ctaClasses}
          >
            {feeLabel ? `${t("register")} · ${feeLabel}` : t("register")}
          </Link>
        </div>
      )}
      {registrationClosed && pastExperience && (
        <div className={mobileCtaBarClasses}>
          <Link
            href={`/${locale}/events/${event.id}/results`}
            className={ctaClasses}
          >
            {t("past.viewResults")}
          </Link>
        </div>
      )}
    </div>
  );
}
