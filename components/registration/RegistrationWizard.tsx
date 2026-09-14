"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, X, Check, Baby } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Event, Distance } from "@/types/event";
import { User } from "@/types/auth";
import { CreateKidRegistration } from "@/types/registration";
import { PromoCodeValidationResponse } from "@/types/promo-code";
import { resolveDistancePrice } from "@/lib/distance-price";
import { updateProfile } from "@/lib/api/auth";
import { validatePromoCode } from "@/lib/api/promo-codes";
import { handleApiError } from "@/lib/error-handler";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  useCreateRegistration,
  useCheckRegistration,
} from "@/hooks/useRegistrations";

interface RegistrationWizardProps {
  event: Event;
  locale: string;
}

/** Discount amount a validated promo code applies to the race (distance) price. */
const computePromoDiscount = (
  distancePrice: number,
  promo: PromoCodeValidationResponse | null
): number => {
  if (!promo) return 0;
  const raw =
    promo.discountType === "percentage"
      ? (distancePrice * promo.discountValue) / 100
      : promo.discountValue;
  return Math.min(Math.max(0, raw), distancePrice);
};

interface KidPick {
  kidId: string;
  distId: string;
}

const STEP_KEYS = [
  "steps.distance",
  "steps.kids",
  "steps.personal",
  "steps.details",
  "steps.pay",
] as const;

type StepKey = (typeof STEP_KEYS)[number];

/**
 * Steps temporarily removed from the flow. The "Details" step (shirt / pace /
 * donation) is hidden for now — its JSX is kept below so it can be restored by
 * dropping the key from this set.
 */
const HIDDEN_STEPS: ReadonlySet<StepKey> = new Set(["steps.details"]);

/** Personal info collected on the confirmation step; all fields required. */
interface PersonalInfo {
  lastName: string;
  firstName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  city: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

const EMPTY_PERSONAL: PersonalInfo = {
  lastName: "",
  firstName: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  city: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
};

const GENDER_OPTIONS = [
  { value: "female", labelKey: "genderFemale" },
  { value: "male", labelKey: "genderMale" },
] as const;

const isPersonalComplete = (p: PersonalInfo): boolean =>
  (Object.keys(EMPTY_PERSONAL) as (keyof PersonalInfo)[]).every(
    (k) => (p[k] ?? "").trim() !== ""
  );

/** Derive the confirmation-step defaults from the signed-in user's profile. */
const personalFromUser = (user: User | null | undefined): PersonalInfo => ({
  lastName: user?.lastName ?? "",
  firstName: user?.firstName ?? "",
  dateOfBirth: (user?.dateOfBirth ?? "").slice(0, 10),
  gender: typeof user?.gender === "string" ? user.gender : "",
  phone: user?.phone ?? "",
  city: user?.city ?? "",
  emergencyContactName: user?.emergencyContactName ?? "",
  emergencyContactPhone: user?.emergencyContactPhone ?? "",
});
const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const AFU_OPTIONS = [0, 100, 250, 500, 1000];

// --- Shared class chrome ----------------------------------------------------

/** Uppercase caption above every form control. */
const fieldLabel =
  "mb-2 text-xs font-semibold uppercase tracking-[0.06em] text-ink-3";

/** Inline validation message below a control. */
const fieldErrorClasses = "mt-1.5 text-xs text-danger";

/** Text input / select chrome; reddens its border when the field is invalid. */
const fieldControl = (hasError: boolean): string =>
  cn(
    "w-full rounded-md border-[1.5px] bg-surface px-4 py-3.5 text-base text-ink focus:border-brand focus:shadow-[0_0_0_4px_var(--brand-glow)] focus:outline-none",
    hasError ? "border-danger" : "border-line-strong"
  );

/** Apply / remove button beside the promo-code input. */
const promoButton =
  "cursor-pointer whitespace-nowrap rounded-md border-[1.5px] border-line-strong bg-surface-2 px-4.5 text-sm font-bold text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60";

/** Full-width pill CTA in the sticky footer and on the success screen. */
const primaryCta =
  "flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-(--r-pill) border-0 bg-brand text-base font-bold text-on-brand transition-colors hover:bg-brand-hover active:bg-brand-active focus-visible:shadow-[0_0_0_4px_var(--brand-glow)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60";

/** Dashed placeholder box used for the empty-kids state and the add-child CTA. */
const dashedBox =
  "rounded-md border-[1.5px] border-dashed border-line-strong text-[13px] text-ink-3";

// --- Resume-from-payment helpers -------------------------------------------
// The wizard stashes its state in the URL before redirecting to the payment
// page, so browser-back can restore it. These parse it back.

const parseResumeKids = (raw: string | null): KidPick[] => {
  if (!raw) return [];
  return raw
    .split(",")
    .map((pair) => {
      const [kidId, distId] = pair.split("~");
      return { kidId: kidId ?? "", distId: distId ?? "" };
    })
    .filter((k) => k.kidId && k.distId);
};

const parseResumeDonate = (raw: string | null): number => {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const parseResumePromo = (
  code: string | null,
  type: string | null,
  value: string | null,
  eventId: string
): PromoCodeValidationResponse | null => {
  if (!code || (type !== "percentage" && type !== "fixed")) return null;
  const val = Number.parseFloat(value ?? "");
  if (!Number.isFinite(val)) return null;
  return {
    id: "",
    code,
    discountType: type,
    discountValue: val,
    eventId,
    isActive: true,
  };
};

export function RegistrationWizard({ event, locale }: RegistrationWizardProps) {
  const router = useRouter();
  const t = useTranslations("registration");
  const tApiCodes = useTranslations("apiCodes");
  const { user, refreshUser } = useAuth();
  const createRegistration = useCreateRegistration();
  // Distances the user is already registered for (matched by account/e-mail);
  // only queried once signed in, since the endpoint requires auth.
  const { data: registrationCheck } = useCheckRegistration(
    user ? event.id : ""
  );
  const registeredDistanceIds = registrationCheck?.distanceIds ?? [];

  // When returning from the external payment page (browser back), the wizard
  // remounts fresh. We stash the wizard state in the URL before redirecting,
  // so we can resume it instead of restarting from step 1.
  const searchParams = useSearchParams();
  const resumeDist = searchParams.get("dist");
  const validResumeDist =
    resumeDist && event.distances?.some((d) => d.id === resumeDist)
      ? resumeDist
      : null;
  const resumePromo = validResumeDist
    ? parseResumePromo(
        searchParams.get("promo"),
        searchParams.get("promoType"),
        searchParams.get("promoValue"),
        event.id
      )
    : null;

  const [step, setStep] = useState(() => {
    if (!validResumeDist) return 0;
    const parsed = Number.parseInt(searchParams.get("step") ?? "", 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  });
  const [pickedDistId, setPickedDistId] = useState(
    validResumeDist ?? event.distances?.[0]?.id ?? ""
  );
  const [pickedKids, setPickedKids] = useState<KidPick[]>(() =>
    validResumeDist ? parseResumeKids(searchParams.get("kids")) : []
  );
  const [shirt, setShirt] = useState("M");
  const [pace, setPace] = useState("5:30");
  const [donate, setDonate] = useState(() =>
    validResumeDist ? parseResumeDonate(searchParams.get("donate")) : 0
  );
  const [done, setDone] = useState(false);
  const [regBib, setRegBib] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(
    !!validResumeDist && searchParams.get("agreed") === "1"
  );
  const [promoInput, setPromoInput] = useState(resumePromo?.code ?? "");
  const [appliedPromo, setAppliedPromo] =
    useState<PromoCodeValidationResponse | null>(resumePromo);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoChecking, setPromoChecking] = useState(false);
  const [personal, setPersonal] = useState<PersonalInfo>(() =>
    personalFromUser(user)
  );
  const [prefilledFor, setPrefilledFor] = useState<string | null>(
    user?.id ?? null
  );
  const [showPersonalErrors, setShowPersonalErrors] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);

  // Prefill the confirmation step once the profile arrives (or a different user
  // signs in). Adjusting state during render — rather than in an effect — is
  // React's sanctioned pattern for "reset state when a prop changes".
  if (user && prefilledFor !== user.id) {
    setPrefilledFor(user.id);
    setPersonal(personalFromUser(user));
  }

  // If the pre-selected distance is one the user is already registered for,
  // move the selection to the first still-available distance (render-phase
  // adjust, once the registration check resolves).
  if (pickedDistId && registeredDistanceIds.includes(pickedDistId)) {
    const firstAvailable = event.distances?.find(
      (d) => !registeredDistanceIds.includes(d.id)
    );
    if (firstAvailable && firstAvailable.id !== pickedDistId) {
      setPickedDistId(firstAvailable.id);
    }
  }

  const selectedDist = event.distances?.find((d) => d.id === pickedDistId);
  const selectedDistRegistered =
    !!selectedDist && registeredDistanceIds.includes(selectedDist.id);
  // The "Kids" step is only part of the flow when the distance chosen on
  // step 1 is a kids' race; otherwise it is skipped entirely.
  const showKidsStep = !!selectedDist?.isKids;
  const steps = STEP_KEYS.filter((k) => {
    if (HIDDEN_STEPS.has(k)) return false;
    if (k === "steps.kids") return showKidsStep;
    return true;
  });
  const currentKey = steps[step] ?? "steps.pay";
  const personalComplete = isPersonalComplete(personal);

  const kidFee = showKidsStep
    ? pickedKids.reduce((sum, k) => {
        const d = event.kidsDistances?.find((x) => x.id === k.distId);
        return sum + (d ? resolveDistancePrice(d) : 0);
      }, 0)
    : 0;
  const distancePrice = selectedDist ? resolveDistancePrice(selectedDist) : 0;
  // A promo code discounts the race (distance) price only; kids fees and any
  // donation are added on top at full value (mirrors the backend pricing).
  const promoDiscount = computePromoDiscount(distancePrice, appliedPromo);
  const total = Math.max(0, distancePrice - promoDiscount) + kidFee + donate;

  const applyPromo = async () => {
    const code = promoInput.trim();
    if (!code) return;
    setPromoChecking(true);
    setPromoError(null);
    try {
      const result = await validatePromoCode({ code, eventId: event.id });
      setAppliedPromo(result);
    } catch {
      setAppliedPromo(null);
      setPromoError(t("promoInvalid"));
    } finally {
      setPromoChecking(false);
    }
  };

  const clearPromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError(null);
  };

  // Persist the confirmed personal details back to the user's profile.
  const savePersonal = async (): Promise<boolean> => {
    setSavingPersonal(true);
    try {
      await updateProfile({
        firstName: personal.firstName.trim(),
        lastName: personal.lastName.trim(),
        phone: personal.phone.trim(),
        dateOfBirth: personal.dateOfBirth.trim() || null,
        gender: personal.gender.trim() || null,
        city: personal.city.trim() || null,
        emergencyContactName: personal.emergencyContactName.trim() || null,
        emergencyContactPhone: personal.emergencyContactPhone.trim() || null,
      });
      await refreshUser();
      return true;
    } catch (error) {
      handleApiError(error, t("personal.saveFailed"), tApiCodes);
      return false;
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleNext = async () => {
    // Before leaving the distance step, require auth — but carry the current
    // selection in the redirect so login/sign-up returns to the same step
    // (the wizard's URL-resume initializers pick these back up on remount).
    if (currentKey === "steps.distance" && !user) {
      const resumeParams = new URLSearchParams();
      if (pickedDistId) resumeParams.set("dist", pickedDistId);
      resumeParams.set("step", String(Math.min(step + 1, steps.length - 1)));
      const target = `/${locale}/events/${event.id}/register?${resumeParams.toString()}`;
      router.push(`/${locale}/login?redirect=${encodeURIComponent(target)}`);
      return;
    }
    // Can't continue with a distance the user is already registered for.
    if (currentKey === "steps.distance" && selectedDistRegistered) {
      return;
    }
    // The personal-details step must be complete and saved before continuing.
    if (currentKey === "steps.personal") {
      if (!personalComplete) {
        setShowPersonalErrors(true);
        return;
      }
      if (savingPersonal) return;
      const saved = await savePersonal();
      if (!saved) return;
    }
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      router.push(`/${locale}/events/${event.id}`);
    } else {
      setStep((s) => s - 1);
    }
  };

  const kidsRegistrations: CreateKidRegistration[] = showKidsStep
    ? pickedKids.map((k) => {
        const kid = user?.kids?.find((x) => x.id === k.kidId);
        const kd = event.kidsDistances?.find((x) => x.id === k.distId);
        return {
          kidId: k.kidId,
          name: kid?.name ?? "",
          age: kid?.age ?? 0,
          distanceId: k.distId,
          distanceLabel: kd?.label ?? "",
          ...(kid?.shirt ? { shirtSize: kid.shirt } : {}),
        };
      })
    : [];

  const handlePay = async () => {
    if (!user || !selectedDist || !personalComplete || !agreed) return;

    // Personal details were already saved to the profile when leaving the
    // "Your details" step, so here we only create the registration.
    try {
      const result = await createRegistration.mutateAsync({
        eventId: event.id,
        distanceId: selectedDist.id,
        distanceLabel: selectedDist.label,
        name: personal.firstName.trim(),
        surname: personal.lastName.trim(),
        phone: personal.phone.trim(),
        city: personal.city.trim(),
        // Snapshot demographics onto the registration (for the participants list).
        ...(personal.gender.trim() ? { gender: personal.gender.trim() } : {}),
        ...(personal.dateOfBirth.trim()
          ? { dateOfBirth: personal.dateOfBirth.trim() }
          : {}),
        // e-mail is required by the backend and taken from the signed-in
        // account (the wizard is auth-gated, so it is always present).
        email: user.email,
        // Carry the UI locale so the payment return page matches it.
        locale,
        ...(donate > 0 ? { afuDonation: donate } : {}),
        ...(kidsRegistrations.length > 0 ? { kidsRegistrations } : {}),
        ...(appliedPromo ? { promoCode: appliedPromo.code } : {}),
      });

      if (result.paymentLink) {
        // Stash the full wizard state so browser-back from the payment page
        // resumes the order step exactly as it was.
        const resumeParams = new URLSearchParams(window.location.search);
        resumeParams.set("step", String(step));
        resumeParams.set("dist", selectedDist.id);
        if (agreed) resumeParams.set("agreed", "1");
        else resumeParams.delete("agreed");
        if (donate > 0) resumeParams.set("donate", String(donate));
        else resumeParams.delete("donate");
        if (pickedKids.length > 0) {
          resumeParams.set(
            "kids",
            pickedKids.map((k) => `${k.kidId}~${k.distId}`).join(",")
          );
        } else {
          resumeParams.delete("kids");
        }
        if (appliedPromo) {
          resumeParams.set("promo", appliedPromo.code);
          resumeParams.set("promoType", appliedPromo.discountType);
          resumeParams.set("promoValue", String(appliedPromo.discountValue));
        } else {
          resumeParams.delete("promo");
          resumeParams.delete("promoType");
          resumeParams.delete("promoValue");
        }
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}?${resumeParams.toString()}`
        );
        window.location.assign(result.paymentLink);
        return;
      }

      setRegBib(
        result.registration.bib != null ? String(result.registration.bib) : "—"
      );
      setDone(true);
    } catch {
      // Error toast handled by mutation
    }
  };

  if (done) {
    return (
      <RegSuccess
        event={event}
        bib={regBib}
        selectedDist={selectedDist}
        locale={locale}
      />
    );
  }

  const eventTitle =
    event.title ||
    event.name ||
    event.translations?.title?.uk ||
    event.translations?.title?.en ||
    "";

  return (
    <div className="mx-auto flex min-h-screen max-w-160 flex-col bg-bg text-ink">
      {/* Header */}
      <div className="px-4.5 pb-2 pt-3.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="grid size-10 cursor-pointer place-items-center rounded-(--r-pill) border border-line bg-surface transition-colors hover:bg-surface-2"
            aria-label={t("goBack")}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">
              {t("registering")} · {eventTitle}
            </div>
            <div className="gr-display text-lg font-extrabold">
              {t("step", { current: step + 1, total: steps.length })} ·{" "}
              {t(currentKey)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/events/${event.id}`)}
            className="grid cursor-pointer place-items-center text-ink-3 transition-colors hover:text-ink"
            aria-label={t("close")}
          >
            <X size={22} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-brand" : "bg-line-strong"
              )}
            />
          ))}
        </div>
      </div>

      {/* Step body */}
      <div className="flex-1 overflow-y-auto px-4.5 pb-55 pt-3">
        {/* Step: Distance */}
        {currentKey === "steps.distance" && (
          <div className="flex flex-col gap-2.5">
            <div className="mb-1 text-sm text-ink-3">{t("pickDistance")}</div>
            {event.distances?.map((d) => {
              const sel = pickedDistId === d.id;
              const isRegistered = registeredDistanceIds.includes(d.id);
              return (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => !isRegistered && setPickedDistId(d.id)}
                  disabled={isRegistered}
                  aria-disabled={isRegistered}
                  className={cn(
                    "flex items-center gap-3.5 rounded-lg border-2 p-4 text-left",
                    sel
                      ? "border-brand bg-brand-tint"
                      : "border-line bg-surface",
                    isRegistered
                      ? "cursor-not-allowed opacity-55"
                      : "cursor-pointer"
                  )}
                >
                  <div
                    className={cn(
                      "gr-display min-w-17.5 text-[28px] font-extrabold",
                      sel ? "text-brand-active" : "text-ink"
                    )}
                  >
                    {d.label}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-ink">{d.name}</div>
                    <div className="mt-0.5 text-xs text-ink-3">
                      {isRegistered
                        ? t("alreadyRegistered")
                        : [
                            d.elevation || d.laps,
                            d.spots
                              ? t("spotsLeft", {
                                  count: d.spots.total - d.spots.taken,
                                })
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                    </div>
                  </div>
                  <div className="gr-display text-base font-extrabold">
                    {t("price", { amount: resolveDistancePrice(d) })}
                  </div>
                </button>
              );
            })}
            {!event.distances?.length && (
              <p className="text-sm text-ink-3">{t("distancesEmpty")}</p>
            )}
          </div>
        )}

        {/* Step: Kids (only when a kids' distance is selected) */}
        {currentKey === "steps.kids" && (
          <div className="flex flex-col gap-3.5">
            <div>
              <div className="text-sm text-ink-3">{t("bringKids")}</div>
              <div className="mt-1 text-xs text-ink-4">{t("kidsDesc")}</div>
            </div>

            {user?.kids?.map((kid) => {
              const reg = pickedKids.find((p) => p.kidId === kid.id);
              return (
                <div
                  key={kid.id}
                  className="rounded-lg border border-line bg-surface p-4"
                >
                  <div
                    className={cn(
                      "flex items-center gap-2.5",
                      reg ? "mb-3" : "mb-0"
                    )}
                  >
                    <div className="grid size-10 place-items-center rounded-(--r-pill) bg-brand-tint">
                      <Baby size={20} color="var(--brand-active)" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[15px] font-bold">{kid.name}</div>
                      <div className="text-xs text-ink-3">
                        {t("kidAge", { age: kid.age })}
                        {kid.shirt
                          ? ` · ${t("kidShirt", { size: kid.shirt })}`
                          : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (reg) {
                          setPickedKids(
                            pickedKids.filter((p) => p.kidId !== kid.id)
                          );
                        } else {
                          setPickedKids([
                            ...pickedKids,
                            {
                              kidId: kid.id,
                              distId: event.kidsDistances?.[0]?.id ?? "",
                            },
                          ]);
                        }
                      }}
                      className={cn(
                        "cursor-pointer rounded-(--r-pill) px-3.5 py-2 text-xs font-bold",
                        reg
                          ? "bg-ink text-bg"
                          : "bg-brand-tint text-brand-active"
                      )}
                    >
                      {reg ? t("removeKid") : `+ ${t("addKid")}`}
                    </button>
                  </div>
                  {reg && event.kidsDistances && (
                    <div className="flex gap-1.5">
                      {event.kidsDistances.map((d) => {
                        const sel = reg.distId === d.id;
                        const fee = resolveDistancePrice(d);
                        return (
                          <button
                            type="button"
                            key={d.id}
                            onClick={() =>
                              setPickedKids(
                                pickedKids.map((p) =>
                                  p.kidId === kid.id
                                    ? { ...p, distId: d.id }
                                    : p
                                )
                              )
                            }
                            className={cn(
                              "flex-1 cursor-pointer rounded-md px-2 py-2.5 text-[13px] font-bold",
                              sel
                                ? "bg-brand text-on-brand"
                                : "bg-surface-2 text-ink-2"
                            )}
                          >
                            <div>{d.label}</div>
                            <div className="mt-0.5 text-[10px] font-semibold">
                              {fee === 0
                                ? t("free")
                                : t("price", { amount: fee })}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {!user?.kids?.length && (
              <div className={cn(dashedBox, "p-4.5 text-center")}>
                {t("noKidsSaved")}
              </div>
            )}

            <button
              type="button"
              className={cn(
                dashedBox,
                "inline-flex cursor-pointer items-center justify-center gap-1.5 bg-transparent p-3.5 font-semibold transition-colors hover:text-ink"
              )}
              onClick={() => router.push(`/${locale}/profile`)}
            >
              + {t("addChildInProfile")}
            </button>
          </div>
        )}

        {/* Step: Personal info confirmation */}
        {currentKey === "steps.personal" && (
          <PersonalStep
            value={personal}
            onChange={setPersonal}
            showErrors={showPersonalErrors}
          />
        )}

        {/* Step: Details (temporarily hidden — see HIDDEN_STEPS) */}
        {currentKey === "steps.details" && (
          <div className="flex flex-col gap-3.5">
            {user && (
              <div className="rounded-lg border border-line bg-surface p-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-(--r-pill) bg-[linear-gradient(135deg,var(--brand),var(--brand-active))] text-sm font-bold text-on-brand">
                    {user.name
                      ?.split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-bold">{user.name}</div>
                    <div className="text-xs text-ink-3">{user.email}</div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className={fieldLabel}>{t("shirtSize")}</div>
              <div className="flex gap-1.5">
                {SHIRT_SIZES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setShirt(s)}
                    className={cn(
                      "flex-1 cursor-pointer rounded-md border border-line py-3 text-[13px] font-bold",
                      shirt === s ? "bg-ink text-bg" : "bg-surface text-ink-2"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label>
                <div className={fieldLabel}>{t("pace")}</div>
                <input
                  value={pace}
                  onChange={(e) => setPace(e.target.value)}
                  placeholder="5:30"
                  className={fieldControl(false)}
                />
                <div className="mt-1.5 text-xs text-ink-4">{t("paceHint")}</div>
              </label>
            </div>

            <div>
              <div className={fieldLabel}>{t("donation")}</div>
              <div className="flex gap-1.5">
                {AFU_OPTIONS.map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setDonate(v)}
                    className={cn(
                      "flex-1 cursor-pointer rounded-md border border-line py-3 text-xs font-bold",
                      donate === v
                        ? "bg-ink text-afu-yellow"
                        : "bg-surface text-ink-2"
                    )}
                  >
                    {v === 0
                      ? t("noDonation")
                      : t("donationOption", { amount: v })}
                  </button>
                ))}
              </div>
              <div className="mt-1.5 text-xs text-ink-4">
                {t("donationHint")}
              </div>
            </div>
          </div>
        )}

        {/* Step: Pay */}
        {currentKey === "steps.pay" && (
          <div className="flex flex-col gap-3.5">
            {/* Order summary */}
            <div className="rounded-lg border border-line bg-surface p-4">
              <div className="gr-display mb-2.5 text-sm font-bold">
                {t("summary")}
              </div>
              <div className="mb-2 text-xs text-ink-3">
                {t("orderItemLabel", { event: eventTitle })}
              </div>
              {selectedDist && (
                <SummaryRow
                  label={`${selectedDist.label} — ${selectedDist.name}`}
                  value={t("price", { amount: distancePrice })}
                />
              )}
              {showKidsStep &&
                pickedKids.map((k) => {
                  const d = event.kidsDistances?.find((x) => x.id === k.distId);
                  if (!d) return null;
                  const fee = resolveDistancePrice(d);
                  return (
                    <SummaryRow
                      key={k.kidId}
                      label={t("kidDist", { dist: d.label })}
                      value={
                        fee === 0 ? t("free") : t("price", { amount: fee })
                      }
                    />
                  );
                })}
              {donate > 0 && (
                <SummaryRow
                  label={t("donationLine")}
                  value={t("price", { amount: donate })}
                />
              )}
              {promoDiscount > 0 && (
                <SummaryRow
                  label={`${t("discountLine")}${
                    appliedPromo ? ` · ${appliedPromo.code}` : ""
                  }`}
                  value={`− ${t("price", { amount: promoDiscount })}`}
                />
              )}
              <div className="my-3 h-px bg-line" />
              <SummaryRow
                label={<strong>{t("total")}</strong>}
                value={
                  <strong className="gr-display text-xl">
                    {t("price", { amount: total })}
                  </strong>
                }
              />
            </div>

            {/* Agreement */}
            <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-[1.5] text-ink-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="size-5.5 shrink-0 cursor-pointer accent-brand"
              />
              <span>
                {t.rich("agree", {
                  consent: (chunks) => (
                    <DocLink url={event.consentLetterUrl}>{chunks}</DocLink>
                  ),
                  regulation: (chunks) => (
                    <DocLink url={event.regulationUrl}>{chunks}</DocLink>
                  ),
                })}
              </span>
            </label>

            {/* Promo code */}
            <div>
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder={t("promoPlaceholder")}
                  disabled={!!appliedPromo || promoChecking}
                  className={cn(fieldControl(false), "flex-1")}
                />
                {appliedPromo ? (
                  <button
                    type="button"
                    onClick={clearPromo}
                    className={promoButton}
                  >
                    {t("removePromo")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={promoChecking || !promoInput.trim()}
                    className={promoButton}
                  >
                    {t("applyPromo")}
                  </button>
                )}
              </div>
              <div
                role="status"
                aria-live="polite"
                className={cn(
                  "mt-1.5 text-xs",
                  appliedPromo
                    ? "text-success"
                    : promoError
                      ? "text-danger"
                      : "text-ink-4"
                )}
              >
                {appliedPromo
                  ? t("promoApplied")
                  : (promoError ?? t("promoNotApplied"))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 mx-auto max-w-160 bg-[linear-gradient(180deg,transparent,var(--bg)_25%)] px-4.5 pb-8 pt-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="text-xs font-semibold text-ink-3">{t("total")}</div>
          <div className="gr-display text-[22px] font-extrabold">
            {t("price", { amount: total })}
          </div>
        </div>

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={savingPersonal || selectedDistRegistered}
            className={primaryCta}
          >
            {savingPersonal ? (
              t("processing")
            ) : (
              <>
                {t("continue")} <ArrowRight size={18} />
              </>
            )}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handlePay}
              disabled={createRegistration.isPending || !agreed}
              className={cn(
                primaryCta,
                "shadow-[0_8px_28px_var(--brand-glow)]"
              )}
            >
              {createRegistration.isPending
                ? t("processing")
                : t("pay", { amount: total })}
              <Check size={18} />
            </button>
            {!agreed && (
              <div className="mt-2 text-center text-xs text-ink-3">
                {t("agreeRequired")}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between py-1.5 text-[13px] text-ink-2">
      <div>{label}</div>
      <div>{value}</div>
    </div>
  );
}

function PersonalStep({
  value,
  onChange,
  showErrors,
}: {
  value: PersonalInfo;
  onChange: (next: PersonalInfo) => void;
  showErrors: boolean;
}) {
  const t = useTranslations("registration.personal");
  const tAuth = useTranslations("auth");
  const set = (key: keyof PersonalInfo) => (v: string) =>
    onChange({ ...value, [key]: v });
  const errorFor = (key: keyof PersonalInfo) =>
    showErrors && !(value[key] ?? "").trim() ? t("required") : undefined;

  return (
    <div className="flex flex-col gap-3.5">
      <div>
        <div className="text-sm text-ink-3">{t("heading")}</div>
        <div className="mt-1 text-xs text-ink-4">{t("desc")}</div>
      </div>

      <PersonalField
        label={t("lastName")}
        value={value.lastName}
        onChange={set("lastName")}
        error={errorFor("lastName")}
        autoComplete="family-name"
      />
      <PersonalField
        label={t("firstName")}
        value={value.firstName}
        onChange={set("firstName")}
        error={errorFor("firstName")}
        autoComplete="given-name"
      />
      <PersonalField
        label={t("dateOfBirth")}
        type="date"
        value={value.dateOfBirth}
        onChange={set("dateOfBirth")}
        error={errorFor("dateOfBirth")}
        autoComplete="bday"
      />

      <label className="block">
        <div className={fieldLabel}>{t("gender")}</div>
        <select
          value={value.gender ?? ""}
          onChange={(e) => set("gender")(e.target.value)}
          aria-invalid={errorFor("gender") ? true : undefined}
          className={fieldControl(!!errorFor("gender"))}
        >
          <option value="" disabled>
            {t("genderPlaceholder")}
          </option>
          {GENDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.labelKey)}
            </option>
          ))}
        </select>
        {errorFor("gender") && (
          <div role="alert" className={fieldErrorClasses}>
            {errorFor("gender")}
          </div>
        )}
      </label>

      <PersonalPhoneField
        label={t("phone")}
        value={value.phone}
        onChange={set("phone")}
        error={errorFor("phone")}
        placeholder={tAuth("phonePlaceholder")}
      />
      <PersonalField
        label={t("city")}
        value={value.city}
        onChange={set("city")}
        error={errorFor("city")}
        autoComplete="address-level2"
      />
      <PersonalField
        label={t("emergencyContactName")}
        value={value.emergencyContactName}
        onChange={set("emergencyContactName")}
        error={errorFor("emergencyContactName")}
      />
      <PersonalPhoneField
        label={t("emergencyContactPhone")}
        value={value.emergencyContactPhone}
        onChange={set("emergencyContactPhone")}
        error={errorFor("emergencyContactPhone")}
        placeholder={tAuth("phonePlaceholder")}
      />

      {showErrors && !isPersonalComplete(value) && (
        <div role="alert" className="text-xs text-danger">
          {t("fixErrors")}
        </div>
      )}
    </div>
  );
}

/**
 * A checkbox-agreement document link. Renders an anchor when the event provides
 * the document URL, otherwise plain emphasized text (nothing to open yet).
 */
function DocLink({
  url,
  children,
}: {
  url?: string;
  children: React.ReactNode;
}) {
  if (!url) return <strong>{children}</strong>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-brand-active underline transition-colors hover:text-brand"
    >
      {children}
    </a>
  );
}

function PersonalField({
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <div className={fieldLabel}>{label}</div>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        className={fieldControl(!!error)}
      />
      {error && (
        <div role="alert" className={fieldErrorClasses}>
          {error}
        </div>
      )}
    </label>
  );
}

function PersonalPhoneField({
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className={fieldLabel}>{label}</div>
      <PhoneInput
        international
        defaultCountry="UA"
        placeholder={placeholder}
        value={value || undefined}
        onChange={(v) => onChange(v ?? "")}
        className={error ? "phone-error" : ""}
        aria-invalid={error ? true : undefined}
      />
      {error && (
        <div role="alert" className={fieldErrorClasses}>
          {error}
        </div>
      )}
    </label>
  );
}

function RegSuccess({
  event,
  bib,
  selectedDist,
  locale,
}: {
  event: Event;
  bib: string | null;
  selectedDist?: Distance;
  locale: string;
}) {
  const router = useRouter();
  const t = useTranslations("registration");
  const eventTitle =
    event.title ||
    event.name ||
    event.translations?.title?.uk ||
    event.translations?.title?.en ||
    "";

  return (
    <div className="gr-screen-enter mx-auto flex min-h-screen max-w-160 flex-col bg-bg p-6 text-ink">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="gr-pulse grid size-24 place-items-center rounded-(--r-pill) bg-brand shadow-[0_12px_48px_var(--brand-glow)]">
          <Check size={48} color="var(--on-brand)" strokeWidth={3} />
        </div>

        <h1 className="gr-display mt-6 text-3xl font-extrabold text-balance">
          {t("success.title")}
        </h1>
        <p className="mt-2 max-w-70 text-sm leading-[1.5] text-ink-3">
          {bib && (
            <>
              {t.rich("success.bib", {
                bib,
                value: (chunks) => (
                  <strong className="gr-mono text-ink">{chunks}</strong>
                ),
              })}
              {" · "}
            </>
          )}
          {eventTitle}
          <br />
          {t("success.confirmEmail")}
        </p>

        {/* Race pass card */}
        <div className="mt-7 w-full rounded-xl bg-ink p-4.5 text-bg">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand">
                {t("success.racePass")}
              </div>
              <div className="gr-display text-lg font-extrabold">
                {eventTitle}
              </div>
            </div>
            <div className="grid size-15 place-items-center rounded-sm bg-surface text-[10px] font-bold text-ink">
              {t("success.qrCode")}
            </div>
          </div>
          <div className="flex gap-4.5">
            {[
              [t("success.passBib"), bib ? `#${bib}` : "—"],
              [t("success.passDistance"), selectedDist?.label ?? "—"],
              [t("success.passStart"), event.timeLabel ?? "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] opacity-60">
                  {k}
                </div>
                <div className="gr-mono text-lg font-bold">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push(`/${locale}`)}
        className={primaryCta}
      >
        {t("success.backToEvents")}
      </button>
    </div>
  );
}
