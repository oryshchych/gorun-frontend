"use client";

import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { FileText, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShellFormSection } from "@/components/layout/shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type {
  AdminEventFormData,
  AdminEventFormInput,
} from "@/lib/validations/admin-event";
import { adminEventFormResolverSchema } from "@/lib/validations/admin-event";
import apiClient from "@/lib/api/client";
import { EventPromoCodesTab } from "@/components/admin/EventPromoCodesTab";

const EVENT_STATUS = ["UPCOMING", "LIVE", "FINISHED", "CANCELLED"] as const;

interface CloudinarySignatureResponse {
  timestamp: number;
  signature: string;
  cloudName: string;
  apiKey: string;
}

interface AdminEventFormProps {
  defaultValues: AdminEventFormInput;
  onSubmit: (data: AdminEventFormData) => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  eventId?: string;
}

type ConfirmDialogState =
  | { type: "status"; pendingValue: string }
  | { type: "isActive"; pendingValue: boolean }
  | null;

function formatDateForInput(date: Date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

async function uploadToCloudinary(
  file: File,
  resourceType: "image" | "raw"
): Promise<string> {
  const { data } = await apiClient.get<CloudinarySignatureResponse>(
    "/cloudinary/signature"
  );
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", data.apiKey);
  formData.append("timestamp", String(data.timestamp));
  formData.append("signature", data.signature);
  formData.append("folder", "events");

  const uploadUrl = `https://api.cloudinary.com/v1_1/${data.cloudName}/${resourceType}/upload`;
  const response = await axios.post<{ secure_url: string }>(
    uploadUrl,
    formData
  );
  return response.data.secure_url;
}

export function AdminEventForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel,
  eventId,
}: AdminEventFormProps) {
  const t = useTranslations("admin.eventForm");
  const tCommon = useTranslations("common");

  const [activeTab, setActiveTab] = useState("description");
  const [contentLang, setContentLang] = useState<"uk" | "en">("uk");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [regulationUploading, setRegulationUploading] = useState(false);

  const mergedDefaults = useMemo(
    () => ({
      ...defaultValues,
      spots: defaultValues.spots ?? {
        taken: undefined as number | undefined,
        total: undefined as number | undefined,
      },
    }),
    [defaultValues]
  );

  const form = useForm<AdminEventFormInput, unknown, AdminEventFormData>({
    resolver: zodResolver(
      adminEventFormResolverSchema as Parameters<typeof zodResolver>[0]
    ) as unknown as Resolver<AdminEventFormInput, unknown, AdminEventFormData>,
    defaultValues: mergedDefaults,
  });

  const ga = useFieldArray({ control: form.control, name: "gallery" });
  const pa = useFieldArray({ control: form.control, name: "perks" });
  const sa = useFieldArray({ control: form.control, name: "schedule" });
  const da = useFieldArray({ control: form.control, name: "distances" });
  const ka = useFieldArray({ control: form.control, name: "kidsDistances" });
  const spa = useFieldArray({ control: form.control, name: "speakers" });

  const handleSubmit = form.handleSubmit(async (data) => {
    const d = data.date instanceof Date ? data.date : new Date(data.date);
    const fallbackLabel = format(d, "PPP 'at' p");
    await onSubmit({
      ...data,
      translations: {
        ...data.translations,
        date: {
          en: data.translations.date.en?.trim() || fallbackLabel,
          uk: data.translations.date.uk?.trim() || fallbackLabel,
        },
      },
    });
  });

  function handleStatusChange(value: string) {
    setConfirmDialog({ type: "status", pendingValue: value });
  }

  function handleIsActiveChange(checked: boolean) {
    setConfirmDialog({ type: "isActive", pendingValue: checked });
  }

  function handleConfirm() {
    if (!confirmDialog) return;
    if (confirmDialog.type === "status") {
      form.setValue(
        "status",
        confirmDialog.pendingValue as AdminEventFormInput["status"]
      );
    } else {
      form.setValue("isActive", confirmDialog.pendingValue);
    }
    setConfirmDialog(null);
  }

  async function handleBannerUpload(file: File) {
    setBannerUploading(true);
    try {
      const url = await uploadToCloudinary(file, "image");
      form.setValue("cover", url);
    } finally {
      setBannerUploading(false);
    }
  }

  async function handleRegulationUpload(file: File) {
    setRegulationUploading(true);
    try {
      const url = await uploadToCloudinary(file, "raw");
      form.setValue("regulationUrl", url);
    } finally {
      setRegulationUploading(false);
    }
  }

  const coverValue = form.watch("cover");
  const regulationUrlValue = form.watch("regulationUrl");

  const titleFieldName =
    contentLang === "uk" ? "translations.title.uk" : "translations.title.en";
  const locationFieldName =
    contentLang === "uk"
      ? "translations.location.uk"
      : "translations.location.en";
  const descriptionFieldName =
    contentLang === "uk"
      ? "translations.description.uk"
      : "translations.description.en";

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-10">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <TabsList>
                <TabsTrigger value="description">
                  {t("tabDescription")}
                </TabsTrigger>
                <TabsTrigger value="organizer">{t("tabOrganizer")}</TabsTrigger>
                <TabsTrigger value="distances">{t("tabDistances")}</TabsTrigger>
                <TabsTrigger value="payments">{t("tabPayments")}</TabsTrigger>
                <TabsTrigger value="promoCodes">
                  {t("tabPromoCodes")}
                </TabsTrigger>
              </TabsList>

              {activeTab === "description" && (
                <div className="flex gap-1 rounded-md border border-line p-1">
                  <button
                    type="button"
                    onClick={() => setContentLang("uk")}
                    className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                      contentLang === "uk"
                        ? "bg-brand text-on-brand"
                        : "text-ink-2 hover:text-ink"
                    }`}
                  >
                    {t("btnUkrainian")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentLang("en")}
                    className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                      contentLang === "en"
                        ? "bg-brand text-on-brand"
                        : "text-ink-2 hover:text-ink"
                    }`}
                  >
                    {t("btnEnglish")}
                  </button>
                </div>
              )}
            </div>

            {/* ── Tab 1: Event description ── */}
            <TabsContent value="description" className="space-y-10">
              {/* Status & visibility */}
              <ShellFormSection>
                <h2 className="text-lg font-semibold">{t("sectionStatus")}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-md border border-line p-3">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            disabled={isLoading}
                            onChange={() => handleIsActiveChange(!field.value)}
                          />
                        </FormControl>
                        <div>
                          <FormLabel className="mt-0 cursor-pointer font-normal">
                            {t("isActiveLabel")}
                          </FormLabel>
                          <p className="text-xs text-ink-3">
                            {t("isActiveHint")}
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("statusLabel")}</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={handleStatusChange}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("statusLabel")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EVENT_STATUS.map((v) => (
                              <SelectItem key={v} value={v}>
                                {t(`status.${v}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </ShellFormSection>

              {/* Event name — full width */}
              <ShellFormSection>
                <FormField
                  control={form.control}
                  name={titleFieldName}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("title")}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date + Location side by side */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("startDate")}</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            disabled={isLoading}
                            value={
                              field.value instanceof Date
                                ? formatDateForInput(field.value)
                                : field.value
                                  ? formatDateForInput(
                                      new Date(field.value as string)
                                    )
                                  : ""
                            }
                            onChange={(e) =>
                              field.onChange(new Date(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={locationFieldName}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("startLocation")}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description — full width */}
                <FormField
                  control={form.control}
                  name={descriptionFieldName}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("description")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={isLoading} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </ShellFormSection>

              {/* Banner upload */}
              <ShellFormSection>
                <FormField
                  control={form.control}
                  name="cover"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("eventBanner")}</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {coverValue ? (
                            <div className="flex items-center gap-3 rounded-md border border-line bg-surface-2 p-3">
                              <ImageIcon className="size-5 shrink-0 text-ink-3" />
                              <span className="flex-1 truncate text-sm text-ink-2">
                                {coverValue}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => field.onChange("")}
                                disabled={isLoading}
                              >
                                {t("removeFile")}
                              </Button>
                            </div>
                          ) : (
                            <label
                              className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-line bg-surface-2 p-6 transition-colors hover:bg-surface ${
                                bannerUploading
                                  ? "pointer-events-none opacity-60"
                                  : ""
                              }`}
                            >
                              {bannerUploading ? (
                                <Loader2 className="size-6 animate-spin text-ink-3" />
                              ) : (
                                <Upload className="size-6 text-ink-3" />
                              )}
                              <span className="text-sm text-ink-2">
                                {bannerUploading
                                  ? t("uploadingFile")
                                  : t("uploadBanner")}
                              </span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png"
                                className="sr-only"
                                disabled={bannerUploading || isLoading}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    void handleBannerUpload(file);
                                  }
                                }}
                              />
                            </label>
                          )}
                          <p className="text-xs text-ink-3">
                            {t("bannerHint")}
                          </p>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </ShellFormSection>

              {/* Schedule textarea */}
              <ShellFormSection>
                <FormField
                  control={form.control}
                  name="scheduleText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("scheduleText")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          disabled={isLoading}
                          rows={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </ShellFormSection>

              {/* Regulation PDF upload */}
              <ShellFormSection>
                <FormField
                  control={form.control}
                  name="regulationUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("regulation")}</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {regulationUrlValue ? (
                            <div className="flex items-center gap-3 rounded-md border border-line bg-surface-2 p-3">
                              <FileText className="size-5 shrink-0 text-ink-3" />
                              <span className="flex-1 truncate text-sm text-ink-2">
                                {regulationUrlValue}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => field.onChange("")}
                                disabled={isLoading}
                              >
                                {t("removeFile")}
                              </Button>
                            </div>
                          ) : (
                            <label
                              className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-line bg-surface-2 p-6 transition-colors hover:bg-surface ${
                                regulationUploading
                                  ? "pointer-events-none opacity-60"
                                  : ""
                              }`}
                            >
                              {regulationUploading ? (
                                <Loader2 className="size-6 animate-spin text-ink-3" />
                              ) : (
                                <Upload className="size-6 text-ink-3" />
                              )}
                              <span className="text-sm text-ink-2">
                                {regulationUploading
                                  ? t("uploadingFile")
                                  : t("uploadRegulation")}
                              </span>
                              <input
                                type="file"
                                accept="application/pdf"
                                className="sr-only"
                                disabled={regulationUploading || isLoading}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    void handleRegulationUpload(file);
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </ShellFormSection>

              {/* Registration dates */}
              <ShellFormSection>
                <h2 className="text-lg font-semibold">
                  {t("sectionRegistrationDates")}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="registrationStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("registrationStart")}</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            disabled={isLoading}
                            value={
                              field.value instanceof Date
                                ? formatDateForInput(field.value)
                                : field.value
                                  ? formatDateForInput(
                                      new Date(field.value as string)
                                    )
                                  : ""
                            }
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? new Date(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="registrationEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("registrationEnd")}</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            disabled={isLoading}
                            value={
                              field.value instanceof Date
                                ? formatDateForInput(field.value)
                                : field.value
                                  ? formatDateForInput(
                                      new Date(field.value as string)
                                    )
                                  : ""
                            }
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? new Date(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </ShellFormSection>

              {/* Social links */}
              <ShellFormSection>
                <h2 className="text-lg font-semibold">{t("sectionSocials")}</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="socials.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("instagram")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            disabled={isLoading}
                            placeholder="https://instagram.com/…"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socials.facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("facebook")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            disabled={isLoading}
                            placeholder="https://facebook.com/…"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socials.telegram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("telegram")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            disabled={isLoading}
                            placeholder="https://t.me/…"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </ShellFormSection>
            </TabsContent>

            {/* ── Tabs 2–5: empty placeholders ── */}
            <TabsContent value="organizer" className="space-y-4">
              <ShellFormSection>
                <p className="text-sm text-ink-3">{t("tabOrganizer")}</p>
              </ShellFormSection>
            </TabsContent>
            <TabsContent value="distances" className="space-y-4">
              <ShellFormSection>
                <p className="text-sm text-ink-3">{t("tabDistances")}</p>
              </ShellFormSection>
            </TabsContent>
            <TabsContent value="payments" className="space-y-4">
              <ShellFormSection>
                <p className="text-sm text-ink-3">{t("tabPayments")}</p>
              </ShellFormSection>
            </TabsContent>
            <TabsContent value="promoCodes" className="space-y-4">
              {eventId ? (
                <EventPromoCodesTab eventId={eventId} />
              ) : (
                <ShellFormSection>
                  <p className="text-sm text-ink-3">{t("promoCodesUnsaved")}</p>
                </ShellFormSection>
              )}
            </TabsContent>
          </Tabs>

          {/* Hidden field arrays kept in form state for future tabs */}
          <div className="hidden">
            {ga.fields.map((f, i) => (
              <input
                key={f.id}
                type="hidden"
                {...form.register(`gallery.${i}.url`)}
              />
            ))}
            {pa.fields.map((f, i) => (
              <input
                key={f.id}
                type="hidden"
                {...form.register(`perks.${i}.line`)}
              />
            ))}
            {sa.fields.map((f, i) => (
              <input
                key={f.id}
                type="hidden"
                {...form.register(`schedule.${i}.time`)}
              />
            ))}
            {da.fields.map((f, i) => (
              <input
                key={f.id}
                type="hidden"
                {...form.register(`distances.${i}.id`)}
              />
            ))}
            {ka.fields.map((f, i) => (
              <input
                key={f.id}
                type="hidden"
                {...form.register(`kidsDistances.${i}.id`)}
              />
            ))}
            {spa.fields.map((f, i) => (
              <input
                key={f.id}
                type="hidden"
                {...form.register(`speakers.${i}.fullnameUk`)}
              />
            ))}
          </div>

          <Button
            type="submit"
            variant="brand"
            disabled={isLoading || bannerUploading || regulationUploading}
            className="w-full sm:w-auto"
          >
            {isLoading && (
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            )}
            {submitLabel ?? tCommon("submit")}
          </Button>
        </form>
      </Form>

      {/* Confirmation dialog for status / isActive changes */}
      <Dialog
        open={confirmDialog !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog?.type === "status"
                ? t("confirmStatusTitle")
                : t("confirmIsActiveTitle")}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog?.type === "status"
                ? t("confirmStatusDesc")
                : t("confirmIsActiveDesc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmDialog(null)}
            >
              {t("confirmCancel")}
            </Button>
            <Button type="button" variant="brand" onClick={handleConfirm}>
              {t("confirmProceed")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
