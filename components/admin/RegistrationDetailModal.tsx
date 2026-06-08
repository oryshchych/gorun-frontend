"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  useAdminRegistrationDetail,
  useCancelAdminRegistration,
} from "@/hooks/useAdminRegistrations";
import { showSuccessToast } from "@/lib/error-handler";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  AdminKidRegistration,
  AdminRegPayment,
  AdminPaymentStatus,
  AdminRegistrationStatus,
} from "@/types/registration";

interface RegistrationDetailModalProps {
  registrationId: string | null;
  onClose: () => void;
}

function statusVariant(
  status: AdminRegistrationStatus
): "secondary" | "outline" | "destructive" {
  if (status === "confirmed") return "secondary";
  if (status === "cancelled") return "destructive";
  return "outline";
}

function payVariant(
  status: AdminPaymentStatus
): "secondary" | "outline" | "destructive" {
  if (status === "completed") return "secondary";
  if (status === "failed" || status === "refunded") return "destructive";
  return "outline";
}

export function RegistrationDetailModal({
  registrationId,
  onClose,
}: RegistrationDetailModalProps) {
  const t = useTranslations("admin.registrations");
  const tCommon = useTranslations("common");

  const { data: reg, isLoading } = useAdminRegistrationDetail(registrationId);
  const cancelMutation = useCancelAdminRegistration();

  const [confirmCancel, setConfirmCancel] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmCancel(false);
      onClose();
    }
  };

  const handleCancel = () => {
    if (!registrationId) return;
    cancelMutation.mutate(registrationId, {
      onSuccess: () => {
        showSuccessToast(t("cancelSuccess"));
        setConfirmCancel(false);
        onClose();
      },
    });
  };

  return (
    <Dialog open={registrationId !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] w-full max-w-2xl overflow-y-auto">
        {isLoading || !reg ? (
          <div className="flex justify-center py-16">
            <Loader2
              className="size-8 animate-spin shell-ink-muted"
              aria-hidden
            />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {reg.fullName}
                <Badge variant={statusVariant(reg.status)}>
                  {t(`regStatus_${reg.status}`)}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {reg.eventName ?? t("unknown")}
                {reg.distanceLabel ? ` · ${reg.distanceLabel}` : ""}
              </DialogDescription>
            </DialogHeader>

            {/* Participant details */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold shell-ink-muted uppercase tracking-wide">
                {t("participantSection")}
              </h3>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                <DetailRow label={t("fieldName")} value={reg.name} />
                <DetailRow label={t("fieldSurname")} value={reg.surname} />
                <DetailRow label={t("fieldEmail")} value={reg.email} />
                <DetailRow label={t("fieldPhone")} value={reg.phone} />
                <DetailRow label={t("fieldCity")} value={reg.city} />
                <DetailRow
                  label={t("fieldRunningClub")}
                  value={reg.runningClub}
                />
                <DetailRow label={t("fieldShirtSize")} value={reg.shirtSize} />
                <DetailRow label={t("fieldPace")} value={reg.estimatedPace} />
                <DetailRow label={t("fieldPromoCode")} value={reg.promoCode} />
                <DetailRow
                  label={t("fieldAfuDonation")}
                  value={
                    reg.afuDonation != null ? `${reg.afuDonation} UAH` : null
                  }
                />
                <DetailRow label={t("fieldBib")} value={reg.bib} />
                <DetailRow
                  label={t("fieldDistance")}
                  value={reg.distanceLabel}
                />
                <DetailRow
                  label={t("fieldRegisteredAt")}
                  value={reg.registeredAt.slice(0, 10)}
                />
                {reg.userId && (
                  <DetailRow
                    label={t("fieldUserId")}
                    value={reg.userName ?? reg.userId}
                  />
                )}
              </dl>
            </section>

            {/* Kids registrations */}
            {reg.kidsRegistrations.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-sm font-semibold shell-ink-muted uppercase tracking-wide">
                  {t("kidsSection")}
                </h3>
                <ul className="divide-y divide-line">
                  {reg.kidsRegistrations.map((kid) => (
                    <KidRow key={kid.kidId} kid={kid} />
                  ))}
                </ul>
              </section>
            )}

            {/* Payments */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold shell-ink-muted uppercase tracking-wide">
                {t("paymentsSection")}
              </h3>
              {reg.payments.length === 0 ? (
                <p className="text-sm shell-ink-muted">{t("noPayments")}</p>
              ) : (
                <ul className="divide-y divide-line">
                  {reg.payments.map((payment) => (
                    <PaymentRow
                      key={payment.id}
                      payment={payment}
                      statusLabel={t(`payStatus_${payment.status}`)}
                      statusVariant={payVariant(payment.status)}
                    />
                  ))}
                </ul>
              )}
            </section>

            <DialogFooter className="mt-4 border-t border-line pt-4">
              {reg.status !== "cancelled" && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setConfirmCancel(true)}
                >
                  {t("cancelRegistration")}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>

      {/* Cancel confirmation */}
      <Dialog
        open={confirmCancel}
        onOpenChange={(open) => !open && setConfirmCancel(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("cancelRegistration")}</DialogTitle>
            <DialogDescription>{t("cancelRegistrationDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmCancel(false)}
              disabled={cancelMutation.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending && (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              )}
              {t("confirmCancelRegistration")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <dt className="text-xs shell-ink-muted">{label}</dt>
      <dd className="text-sm">{value?.trim() ? value : "—"}</dd>
    </div>
  );
}

function KidRow({ kid }: { kid: AdminKidRegistration }) {
  return (
    <li className="py-3">
      <p className="text-sm font-medium">{kid.name}</p>
      <p className="text-xs shell-ink-muted">
        {[kid.distanceLabel, kid.shirtSize].filter(Boolean).join(" · ")}
      </p>
    </li>
  );
}

function PaymentRow({
  payment,
  statusLabel,
  statusVariant: variant,
}: {
  payment: AdminRegPayment;
  statusLabel: string;
  statusVariant: "secondary" | "outline" | "destructive";
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div>
        <p className="text-sm font-medium">
          {payment.amount} {payment.currency}
        </p>
        <p className="text-xs shell-ink-muted">
          {payment.createdAt.slice(0, 10)}
        </p>
      </div>
      <Badge variant={variant} className="font-normal">
        {statusLabel}
      </Badge>
    </li>
  );
}
