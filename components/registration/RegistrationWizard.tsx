"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, X, Check, Baby } from "lucide-react";
import { Event, Distance } from "@/types/event";
import { resolveDistancePrice } from "@/lib/distance-price";
import { useAuth } from "@/hooks/useAuth";
import { useCreateRegistration } from "@/hooks/useRegistrations";

interface RegistrationWizardProps {
  event: Event;
  locale: string;
}

type PayMethod = "apple" | "google" | "mono" | "card";

interface KidPick {
  kidId: string;
  distId: string;
}

const STEP_KEYS = [
  "steps.distance",
  "steps.kids",
  "steps.details",
  "steps.pay",
] as const;
const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const AFU_OPTIONS = [0, 100, 250, 500, 1000];
const PAY_METHODS: { id: PayMethod; icon: string; labelKey: string }[] = [
  { id: "apple", icon: "🍎", labelKey: "payMethods.apple" },
  { id: "google", icon: "G", labelKey: "payMethods.google" },
  { id: "mono", icon: "m", labelKey: "payMethods.mono" },
  { id: "card", icon: "💳", labelKey: "payMethods.card" },
];

export function RegistrationWizard({ event, locale }: RegistrationWizardProps) {
  const router = useRouter();
  const t = useTranslations("registration");
  const { user } = useAuth();
  const createRegistration = useCreateRegistration();

  const [step, setStep] = useState(0);
  const [pickedDistId, setPickedDistId] = useState(
    event.distances?.[0]?.id ?? ""
  );
  const [pickedKids, setPickedKids] = useState<KidPick[]>([]);
  const [shirt, setShirt] = useState("M");
  const [pace, setPace] = useState("5:30");
  const [donate, setDonate] = useState(0);
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [done, setDone] = useState(false);
  const [regBib, setRegBib] = useState<string | null>(null);

  const selectedDist = event.distances?.find((d) => d.id === pickedDistId);
  const kidFee = pickedKids.reduce((sum, k) => {
    const d = event.kidsDistances?.find((x) => x.id === k.distId);
    return sum + (d ? resolveDistancePrice(d) : 0);
  }, 0);
  const total =
    (selectedDist ? resolveDistancePrice(selectedDist) : 0) + kidFee + donate;

  const handleNext = () => {
    // Before step 1 (distance → kids), require auth
    if (step === 0 && !user) {
      router.push(
        `/${locale}/login?redirect=/${locale}/events/${event.id}/register`
      );
      return;
    }
    if (step < STEP_KEYS.length - 1) {
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

  const handlePay = async () => {
    if (!selectedDist) return;
    try {
      const result = await createRegistration.mutateAsync({
        eventId: event.id,
        promoCode: undefined,
      });

      if (result.paymentLink) {
        window.location.href = result.paymentLink;
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
    <div
      style={{
        background: "var(--bg)",
        color: "var(--ink)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 640,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 18px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={handleBack}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: "var(--surface)",
              border: "1px solid var(--line)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
            aria-label={t("goBack")}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                color: "var(--ink-3)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {t("registering")} · {eventTitle}
            </div>
            <div
              className="gr-display"
              style={{ fontSize: 18, fontWeight: 800 }}
            >
              {t("step", { current: step + 1, total: STEP_KEYS.length })} ·{" "}
              {t(STEP_KEYS[step])}
            </div>
          </div>
          <button
            onClick={() => router.push(`/${locale}/events/${event.id}`)}
            style={{
              color: "var(--ink-3)",
              display: "grid",
              placeItems: "center",
            }}
            aria-label={t("close")}
          >
            <X size={22} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
          {STEP_KEYS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= step ? "var(--brand)" : "var(--line-strong)",
                transition: "background 300ms",
              }}
            />
          ))}
        </div>
      </div>

      {/* Step body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 18px 220px",
        }}
      >
        {/* Step 1: Distance */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                fontSize: 14,
                color: "var(--ink-3)",
                marginBottom: 4,
              }}
            >
              {t("pickDistance")}
            </div>
            {event.distances?.map((d) => {
              const sel = pickedDistId === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setPickedDistId(d.id)}
                  style={{
                    padding: 16,
                    borderRadius: "var(--r-lg)",
                    background: sel ? "var(--brand-tint)" : "var(--surface)",
                    border: `2px solid ${sel ? "var(--brand)" : "var(--line)"}`,
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    className="gr-display"
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: sel ? "var(--brand-active)" : "var(--ink)",
                      minWidth: 70,
                    }}
                  >
                    {d.label}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--ink)",
                      }}
                    >
                      {d.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--ink-3)",
                        marginTop: 2,
                      }}
                    >
                      {d.elevation || d.laps}
                      {d.spots
                        ? ` · ${t("spotsLeft", {
                            count: d.spots.total - d.spots.taken,
                          })}`
                        : ""}
                    </div>
                  </div>
                  <div
                    className="gr-display"
                    style={{ fontWeight: 800, fontSize: 16 }}
                  >
                    {t("price", { amount: resolveDistancePrice(d) })}
                  </div>
                </button>
              );
            })}
            {!event.distances?.length && (
              <p style={{ color: "var(--ink-3)", fontSize: 14 }}>
                {t("distancesEmpty")}
              </p>
            )}
          </div>
        )}

        {/* Step 2: Kids */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 14, color: "var(--ink-3)" }}>
                {t("bringKids")}
              </div>
              <div
                style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 4 }}
              >
                {t("kidsDesc")}
              </div>
            </div>

            {user?.kids?.map((kid) => {
              const reg = pickedKids.find((p) => p.kidId === kid.id);
              return (
                <div
                  key={kid.id}
                  style={{
                    background: "var(--surface)",
                    borderRadius: "var(--r-lg)",
                    border: "1px solid var(--line)",
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: reg ? 12 : 0,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 999,
                        background: "var(--brand-tint)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Baby size={20} color="var(--brand-active)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>
                        {kid.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                        {t("kidAge", { age: kid.age })}
                        {kid.shirt
                          ? ` · ${t("kidShirt", { size: kid.shirt })}`
                          : ""}
                      </div>
                    </div>
                    <button
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
                      style={{
                        padding: "8px 14px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        background: reg ? "var(--ink)" : "var(--brand-tint)",
                        color: reg ? "var(--bg)" : "var(--brand-active)",
                        cursor: "pointer",
                      }}
                    >
                      {reg ? t("removeKid") : `+ ${t("addKid")}`}
                    </button>
                  </div>
                  {reg && event.kidsDistances && (
                    <div style={{ display: "flex", gap: 6 }}>
                      {event.kidsDistances.map((d) => {
                        const sel = reg.distId === d.id;
                        const fee = resolveDistancePrice(d);
                        return (
                          <button
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
                            style={{
                              flex: 1,
                              padding: "10px 8px",
                              borderRadius: "var(--r-md)",
                              background: sel
                                ? "var(--brand)"
                                : "var(--surface-2)",
                              color: sel ? "var(--on-brand)" : "var(--ink-2)",
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: "pointer",
                            }}
                          >
                            <div>{d.label}</div>
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                marginTop: 2,
                              }}
                            >
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
              <div
                style={{
                  padding: 18,
                  borderRadius: "var(--r-md)",
                  border: "1.5px dashed var(--line-strong)",
                  color: "var(--ink-3)",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                {t("noKidsSaved")}
              </div>
            )}

            <button
              style={{
                padding: 14,
                border: "1.5px dashed var(--line-strong)",
                borderRadius: "var(--r-md)",
                color: "var(--ink-3)",
                fontWeight: 600,
                fontSize: 13,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                cursor: "pointer",
                background: "transparent",
              }}
              onClick={() => router.push(`/${locale}/profile`)}
            >
              + {t("addChildInProfile")}
            </button>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {user && (
              <div
                style={{
                  background: "var(--surface)",
                  borderRadius: "var(--r-lg)",
                  border: "1px solid var(--line)",
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 999,
                      background:
                        "linear-gradient(135deg, var(--brand), var(--brand-active))",
                      color: "var(--surface)",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {user.name
                      ?.split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}
              >
                {t("shirtSize")}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {SHIRT_SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setShirt(s)}
                    style={{
                      flex: 1,
                      padding: "12px 0",
                      borderRadius: "var(--r-md)",
                      fontWeight: 700,
                      fontSize: 13,
                      background: shirt === s ? "var(--ink)" : "var(--surface)",
                      color: shirt === s ? "var(--bg)" : "var(--ink-2)",
                      border: "1px solid var(--line)",
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--ink-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 8,
                  }}
                >
                  {t("pace")}
                </div>
                <input
                  value={pace}
                  onChange={(e) => setPace(e.target.value)}
                  placeholder="5:30"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "var(--r-md)",
                    background: "var(--surface)",
                    border: "1.5px solid var(--line-strong)",
                    fontSize: 16,
                    color: "var(--ink)",
                    fontFamily: "inherit",
                  }}
                />
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--ink-4)",
                    marginTop: 6,
                  }}
                >
                  {t("paceHint")}
                </div>
              </label>
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}
              >
                {t("donation")}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {AFU_OPTIONS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setDonate(v)}
                    style={{
                      flex: 1,
                      padding: "12px 0",
                      borderRadius: "var(--r-md)",
                      fontWeight: 700,
                      fontSize: 12,
                      background:
                        donate === v ? "var(--ink)" : "var(--surface)",
                      color:
                        donate === v ? "var(--afu-yellow)" : "var(--ink-2)",
                      border: "1px solid var(--line)",
                      cursor: "pointer",
                    }}
                  >
                    {v === 0
                      ? t("noDonation")
                      : t("donationOption", { amount: v })}
                  </button>
                ))}
              </div>
              <div
                style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 6 }}
              >
                {t("donationHint")}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Pay */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Summary */}
            <div
              style={{
                background: "var(--surface)",
                borderRadius: "var(--r-lg)",
                border: "1px solid var(--line)",
                padding: 16,
              }}
            >
              <div
                className="gr-display"
                style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}
              >
                {t("summary")}
              </div>
              {selectedDist && (
                <SummaryRow
                  label={`${selectedDist.label} — ${selectedDist.name}`}
                  value={t("price", {
                    amount: resolveDistancePrice(selectedDist),
                  })}
                />
              )}
              {pickedKids.map((k) => {
                const d = event.kidsDistances?.find((x) => x.id === k.distId);
                if (!d) return null;
                const fee = resolveDistancePrice(d);
                return (
                  <SummaryRow
                    key={k.kidId}
                    label={t("kidDist", { dist: d.label })}
                    value={fee === 0 ? t("free") : t("price", { amount: fee })}
                  />
                );
              })}
              {donate > 0 && (
                <SummaryRow
                  label={t("donationLine")}
                  value={t("price", { amount: donate })}
                />
              )}
              <div
                style={{
                  height: 1,
                  background: "var(--line)",
                  margin: "12px 0",
                }}
              />
              <SummaryRow
                label={<strong>{t("total")}</strong>}
                value={
                  <strong className="gr-display" style={{ fontSize: 20 }}>
                    {t("price", { amount: total })}
                  </strong>
                }
              />
            </div>

            {/* Payment methods */}
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}
              >
                {t("payWith")}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PAY_METHODS.map(({ id, icon, labelKey }) => (
                  <button
                    key={id}
                    onClick={() => setPayMethod(id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 14,
                      borderRadius: "var(--r-md)",
                      background: "var(--surface)",
                      border: `2px solid ${payMethod === id ? "var(--brand)" : "var(--line)"}`,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--ink)",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        background: "var(--surface-2)",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {icon}
                    </div>
                    <div style={{ flex: 1 }}>{t(labelKey)}</div>
                    {payMethod === id && (
                      <Check size={18} color="var(--brand-active)" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* AFU note */}
            {donate > 0 && (
              <div
                style={{
                  background: "var(--ink)",
                  color: "var(--bg)",
                  borderRadius: "var(--r-lg)",
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                  {t.rich("afuNote", {
                    amount: donate,
                    highlight: (chunks) => (
                      <strong style={{ color: "var(--afu-yellow)" }}>
                        {chunks}
                      </strong>
                    ),
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "14px 18px 32px",
          background: "linear-gradient(180deg, transparent, var(--bg) 25%)",
          zIndex: 20,
          maxWidth: 640,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>
            {t("total")}
          </div>
          <div className="gr-display" style={{ fontSize: 22, fontWeight: 800 }}>
            {t("price", { amount: total })}
          </div>
        </div>

        {step < STEP_KEYS.length - 1 ? (
          <button
            onClick={handleNext}
            style={{
              width: "100%",
              height: 56,
              borderRadius: 999,
              background: "var(--brand)",
              color: "var(--on-brand)",
              fontWeight: 700,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
              border: 0,
            }}
          >
            {t("continue")} <ArrowRight size={18} />
          </button>
        ) : (
          <button
            onClick={handlePay}
            disabled={createRegistration.isPending}
            style={{
              width: "100%",
              height: 56,
              borderRadius: 999,
              background: "var(--brand)",
              color: "var(--on-brand)",
              fontWeight: 700,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
              border: 0,
              boxShadow: "0 8px 28px var(--brand-glow)",
              opacity: createRegistration.isPending ? 0.7 : 1,
            }}
          >
            {createRegistration.isPending
              ? t("processing")
              : t("pay", { amount: total })}
            <Check size={18} />
          </button>
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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        fontSize: 13,
        color: "var(--ink-2)",
      }}
    >
      <div>{label}</div>
      <div>{value}</div>
    </div>
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
    <div
      className="gr-screen-enter"
      style={{
        background: "var(--bg)",
        color: "var(--ink)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: 24,
        maxWidth: 640,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          className="gr-pulse"
          style={{
            width: 96,
            height: 96,
            borderRadius: 999,
            background: "var(--brand)",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 12px 48px var(--brand-glow)",
          }}
        >
          <Check size={48} color="var(--on-brand)" strokeWidth={3} />
        </div>

        <h1
          className="gr-display"
          style={{
            fontSize: 30,
            fontWeight: 800,
            marginTop: 24,
            textWrap: "balance",
          }}
        >
          {t("success.title")}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--ink-3)",
            marginTop: 8,
            lineHeight: 1.5,
            maxWidth: 280,
          }}
        >
          {bib && (
            <>
              {t.rich("success.bib", {
                bib,
                value: (chunks) => (
                  <strong className="gr-mono" style={{ color: "var(--ink)" }}>
                    {chunks}
                  </strong>
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
        <div
          style={{
            width: "100%",
            marginTop: 28,
            padding: 18,
            background: "var(--ink)",
            color: "var(--bg)",
            borderRadius: "var(--r-xl)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--brand)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {t("success.racePass")}
              </div>
              <div
                className="gr-display"
                style={{ fontSize: 18, fontWeight: 800 }}
              >
                {eventTitle}
              </div>
            </div>
            <div
              style={{
                width: 60,
                height: 60,
                background: "var(--surface)",
                borderRadius: 8,
                display: "grid",
                placeItems: "center",
                fontSize: 10,
                color: "var(--ink)",
                fontWeight: 700,
              }}
            >
              {t("success.qrCode")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            {[
              [t("success.passBib"), bib ? `#${bib}` : "—"],
              [t("success.passDistance"), selectedDist?.label ?? "—"],
              [t("success.passStart"), event.timeLabel ?? "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <div
                  style={{
                    fontSize: 10,
                    opacity: 0.6,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {k}
                </div>
                <div
                  className="gr-mono"
                  style={{ fontSize: 18, fontWeight: 700 }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push(`/${locale}`)}
        style={{
          width: "100%",
          height: 56,
          borderRadius: 999,
          background: "var(--brand)",
          color: "var(--on-brand)",
          fontWeight: 700,
          fontSize: 16,
          cursor: "pointer",
          border: 0,
        }}
      >
        {t("success.backToEvents")}
      </button>
    </div>
  );
}
