"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  useAdminUserDetail,
  useCancelUserRegistration,
  useSoftDeleteAdminUser,
  useUpdateAdminUser,
} from "@/hooks/useAdminUsers";
import {
  createAdminUserSchema,
  GENDER_OPTIONS,
  type AdminUserFormValues,
} from "@/lib/validations/admin-user";
import { showSuccessToast } from "@/lib/error-handler";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  AdminUserDetail,
  AdminUserPayment,
  AdminUserRegistration,
} from "@/types/user";

interface UserDetailModalProps {
  userId: string | null;
  onClose: () => void;
}

function toFormValues(user: AdminUserDetail): AdminUserFormValues {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email,
    phone: user.phone ?? "",
    city: user.city ?? "",
    runningClub: user.runningClub ?? "",
    dateOfBirth: user.dateOfBirth ?? "",
    gender: user.gender ?? "",
    emergencyContactName: user.emergencyContactName ?? "",
    emergencyContactPhone: user.emergencyContactPhone ?? "",
    deliveryAddress: user.deliveryAddress ?? "",
  };
}

const blankToNull = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

export function UserDetailModal({ userId, onClose }: UserDetailModalProps) {
  const t = useTranslations("admin.users");
  const tCommon = useTranslations("common");

  const { data: user, isLoading } = useAdminUserDetail(userId);
  const updateMutation = useUpdateAdminUser(userId ?? "");
  const deleteMutation = useSoftDeleteAdminUser();
  const cancelMutation = useCancelUserRegistration(userId ?? "");

  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  const form = useForm<AdminUserFormValues>({
    resolver: zodResolver(createAdminUserSchema(t)),
    values: user ? toFormValues(user) : undefined,
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset transient UI state so the next user opens cleanly.
      setIsEditing(false);
      setConfirmDeactivate(false);
      setCancelTargetId(null);
      onClose();
    }
  };

  const onSubmit = (values: AdminUserFormValues) => {
    if (!userId) return;
    updateMutation.mutate(
      {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: blankToNull(values.phone),
        city: blankToNull(values.city),
        runningClub: blankToNull(values.runningClub),
        dateOfBirth: blankToNull(values.dateOfBirth),
        gender: values.gender === "" ? null : values.gender,
        emergencyContactName: blankToNull(values.emergencyContactName),
        emergencyContactPhone: blankToNull(values.emergencyContactPhone),
        deliveryAddress: blankToNull(values.deliveryAddress),
      },
      {
        onSuccess: () => {
          showSuccessToast(t("updateSuccess"));
          setIsEditing(false);
        },
      }
    );
  };

  const handleDeactivate = () => {
    if (!userId) return;
    deleteMutation.mutate(userId, {
      onSuccess: () => {
        showSuccessToast(t("deactivateSuccess"));
        setConfirmDeactivate(false);
        onClose();
      },
    });
  };

  const handleCancelRegistration = () => {
    if (!cancelTargetId) return;
    cancelMutation.mutate(cancelTargetId, {
      onSuccess: () => {
        showSuccessToast(t("cancelRegistrationSuccess"));
        setCancelTargetId(null);
      },
    });
  };

  return (
    <Dialog open={userId !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] w-full max-w-2xl overflow-y-auto">
        {isLoading || !user ? (
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
                {user.name}
                {user.isAdmin && (
                  <Badge variant="secondary" className="font-normal">
                    {user.adminRole === "super_admin"
                      ? t("roleSuperAdmin")
                      : t("roleAdmin")}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>{user.email}</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="profile" className="mt-2">
              <TabsList>
                <TabsTrigger value="profile">{t("tabProfile")}</TabsTrigger>
                <TabsTrigger value="registrations">
                  {t("tabRegistrations")} ({user.registrations.length})
                </TabsTrigger>
                <TabsTrigger value="payments">
                  {t("tabPayments")} ({user.payments.length})
                </TabsTrigger>
              </TabsList>

              {/* Profile */}
              <TabsContent value="profile">
                {isEditing ? (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("fieldFirstName")}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("fieldLastName")}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("fieldEmail")}</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("fieldPhone")}</FormLabel>
                              <FormControl>
                                <Input placeholder="+380..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("fieldCity")}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="runningClub"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("fieldRunningClub")}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("fieldDateOfBirth")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("fieldGender")}</FormLabel>
                              <Select
                                value={field.value || "unset"}
                                onValueChange={(v) =>
                                  field.onChange(v === "unset" ? "" : v)
                                }
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="unset">
                                    {t("genderUnset")}
                                  </SelectItem>
                                  {GENDER_OPTIONS.map((g) => (
                                    <SelectItem key={g} value={g}>
                                      {t(`gender_${g}`)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="emergencyContactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("fieldEmergencyName")}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="emergencyContactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("fieldEmergencyPhone")}</FormLabel>
                              <FormControl>
                                <Input placeholder="+380..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="deliveryAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("fieldDeliveryAddress")}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            form.reset(toFormValues(user));
                            setIsEditing(false);
                          }}
                          disabled={updateMutation.isPending}
                        >
                          {tCommon("cancel")}
                        </Button>
                        <Button
                          type="submit"
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending && (
                            <Loader2
                              className="size-4 animate-spin"
                              aria-hidden
                            />
                          )}
                          {tCommon("save")}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-4">
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                      <ProfileRow
                        label={t("fieldFirstName")}
                        value={user.firstName}
                      />
                      <ProfileRow
                        label={t("fieldLastName")}
                        value={user.lastName}
                      />
                      <ProfileRow label={t("fieldEmail")} value={user.email} />
                      <ProfileRow label={t("fieldPhone")} value={user.phone} />
                      <ProfileRow label={t("fieldCity")} value={user.city} />
                      <ProfileRow
                        label={t("fieldRunningClub")}
                        value={user.runningClub}
                      />
                      <ProfileRow
                        label={t("fieldDateOfBirth")}
                        value={user.dateOfBirth}
                      />
                      <ProfileRow
                        label={t("fieldGender")}
                        value={user.gender ? t(`gender_${user.gender}`) : null}
                      />
                      <ProfileRow
                        label={t("fieldEmergencyName")}
                        value={user.emergencyContactName}
                      />
                      <ProfileRow
                        label={t("fieldEmergencyPhone")}
                        value={user.emergencyContactPhone}
                      />
                    </dl>
                    <ProfileRow
                      label={t("fieldDeliveryAddress")}
                      value={user.deliveryAddress}
                    />
                    <div className="flex justify-end">
                      <Button type="button" onClick={() => setIsEditing(true)}>
                        {t("editProfile")}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Registrations */}
              <TabsContent value="registrations">
                {user.registrations.length === 0 ? (
                  <p className="py-8 text-center shell-ink-muted">
                    {t("noRegistrations")}
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {user.registrations.map((reg) => (
                      <RegistrationRow
                        key={reg.id}
                        reg={reg}
                        statusLabel={t(`regStatus_${reg.status}`)}
                        paymentLabel={t(`payStatus_${reg.paymentStatus}`)}
                        cancelLabel={t("cancelRegistration")}
                        onCancel={() => setCancelTargetId(reg.id)}
                      />
                    ))}
                  </ul>
                )}
              </TabsContent>

              {/* Payments */}
              <TabsContent value="payments">
                {user.payments.length === 0 ? (
                  <p className="py-8 text-center shell-ink-muted">
                    {t("noPayments")}
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {user.payments.map((payment) => (
                      <PaymentRow
                        key={payment.id}
                        payment={payment}
                        statusLabel={t(`payStatus_${payment.status}`)}
                      />
                    ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4 border-t border-line pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setConfirmDeactivate(true)}
              >
                {t("deactivateUser")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>

      {/* Deactivate confirmation */}
      <Dialog
        open={confirmDeactivate}
        onOpenChange={(open) => !open && setConfirmDeactivate(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deactivateUser")}</DialogTitle>
            <DialogDescription>{t("deactivateConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDeactivate(false)}
              disabled={deleteMutation.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              )}
              {t("confirmDeactivate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel-registration confirmation */}
      <Dialog
        open={cancelTargetId !== null}
        onOpenChange={(open) => !open && setCancelTargetId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("cancelRegistration")}</DialogTitle>
            <DialogDescription>
              {t("cancelRegistrationConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelTargetId(null)}
              disabled={cancelMutation.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelRegistration}
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

function ProfileRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs shell-ink-muted">{label}</dt>
      <dd className="text-sm">{value?.trim() ? value : "—"}</dd>
    </div>
  );
}

function RegistrationRow({
  reg,
  statusLabel,
  paymentLabel,
  cancelLabel,
  onCancel,
}: {
  reg: AdminUserRegistration;
  statusLabel: string;
  paymentLabel: string;
  cancelLabel: string;
  onCancel: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{reg.eventName ?? "—"}</p>
        <p className="text-xs shell-ink-muted">
          {reg.distanceLabel ? `${reg.distanceLabel} · ` : ""}
          {statusLabel} · {paymentLabel}
          {reg.finalPrice != null ? ` · ${reg.finalPrice}` : ""}
        </p>
      </div>
      {reg.status !== "cancelled" && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-danger"
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
      )}
    </li>
  );
}

function PaymentRow({
  payment,
  statusLabel,
}: {
  payment: AdminUserPayment;
  statusLabel: string;
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
      <Badge variant="secondary" className="font-normal">
        {statusLabel}
      </Badge>
    </li>
  );
}
