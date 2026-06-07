"use client";

import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { FileText, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  adminEventFormResolverSchema,
  createEmptyDistance,
  createEmptyPricePeriod,
} from "@/lib/validations/admin-event";
import { Trash2, Plus } from "lucide-react";
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

interface DistancePricePeriodsProps {
  control: ReturnType<
    typeof useForm<AdminEventFormInput, unknown, AdminEventFormData>
  >["control"];
  distanceIndex: number;
  isLoading: boolean;
}

function DistancePricePeriods({
  control,
  distanceIndex,
  isLoading,
}: DistancePricePeriodsProps) {
  const t = useTranslations("admin.eventForm");
  const { fields, append, remove } = useFieldArray({
    control,
    name: `distances.${distanceIndex}.pricePeriods`,
  });

  const watchedPeriods = fields;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-ink">
          {t("sectionPricePeriods")}
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isLoading}
          onClick={() => append(createEmptyPricePeriod())}
          className="gap-1 text-xs"
        >
          <Plus className="size-3" />
          {t("addPricePeriod")}
        </Button>
      </div>

      {watchedPeriods.length === 0 && (
        <p className="text-xs text-ink-3">{t("noPricePeriods")}</p>
      )}

      {watchedPeriods.length > 0 && (
        <div className="space-y-2">
          {watchedPeriods.length > 0 && (
            <div className="rounded-md border border-line bg-surface-2 px-3 py-2 text-sm">
              <span className="text-ink-3">{t("basePriceLabel")}: </span>
              <span className="font-medium text-ink">
                {watchedPeriods[0] &&
                typeof watchedPeriods[0].price === "number" &&
                watchedPeriods[0].price > 0
                  ? `${watchedPeriods[0].price} UAH`
                  : "—"}
              </span>
              <span className="ml-2 text-xs text-ink-3">
                {t("basePriceHint")}
              </span>
            </div>
          )}
          {fields.map((field, pi) => (
            <div
              key={field.id}
              className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <FormField
                control={control}
                name={`distances.${distanceIndex}.pricePeriods.${pi}.from`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      {t("pricePeriodFrom")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        disabled={isLoading}
                        value={
                          f.value instanceof Date
                            ? formatDateForInput(f.value)
                            : f.value
                              ? formatDateForInput(new Date(f.value as string))
                              : ""
                        }
                        onChange={(e) =>
                          f.onChange(
                            e.target.value ? new Date(e.target.value) : ""
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`distances.${distanceIndex}.pricePeriods.${pi}.to`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      {t("pricePeriodTo")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        disabled={isLoading}
                        value={
                          f.value instanceof Date
                            ? formatDateForInput(f.value)
                            : f.value
                              ? formatDateForInput(new Date(f.value as string))
                              : ""
                        }
                        onChange={(e) =>
                          f.onChange(
                            e.target.value ? new Date(e.target.value) : ""
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`distances.${distanceIndex}.pricePeriods.${pi}.price`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      {t("pricePeriodPrice")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        disabled={isLoading}
                        value={f.value ?? ""}
                        onChange={(e) =>
                          f.onChange(
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isLoading}
                onClick={() => remove(pi)}
                className="mb-0.5 text-danger hover:text-danger"
                aria-label={t("removePricePeriod")}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

              {/* Organizer */}
              <ShellFormSection>
                <FormField
                  control={form.control}
                  name="organizerInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("organizerInfo")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="organizerContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("organizerContactName")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="organizerContactInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("organizerContactInfo")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            disabled={isLoading}
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

            {/* ── Tab 2: Distances ── */}
            <TabsContent value="distances" className="space-y-6">
              <div className="flex items-center justify-between">
                <span />
                <Button
                  type="button"
                  variant="soft"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => da.append(createEmptyDistance())}
                  className="gap-1"
                >
                  <Plus className="size-4" />
                  {t("addDistance")}
                </Button>
              </div>

              {da.fields.length === 0 && (
                <ShellFormSection>
                  <p className="text-sm text-ink-3">{t("noDistances")}</p>
                </ShellFormSection>
              )}

              {da.fields.map((field, i) => (
                <Card key={field.id} className="border-line">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-semibold">
                      {t("sectionDistances")} #{i + 1}
                    </CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => da.remove(i)}
                      className="text-danger hover:text-danger"
                      aria-label={t("removeDistance")}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Main info */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-ink">
                        {t("sectionDistanceMain")}
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`distances.${i}.name`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>{t("distanceName")}</FormLabel>
                              <FormControl>
                                <Input
                                  {...f}
                                  value={f.value ?? ""}
                                  disabled={isLoading}
                                  placeholder="5 км"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`distances.${i}.distanceMeters`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>{t("distanceMeters")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  max={999999}
                                  step={1}
                                  disabled={isLoading}
                                  value={f.value ?? ""}
                                  onChange={(e) =>
                                    f.onChange(
                                      e.target.value === ""
                                        ? ""
                                        : parseInt(e.target.value, 10)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`distances.${i}.startAt`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>{t("distanceStartAt")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="datetime-local"
                                  disabled={isLoading}
                                  value={
                                    f.value instanceof Date
                                      ? formatDateForInput(f.value)
                                      : f.value
                                        ? formatDateForInput(
                                            new Date(f.value as string)
                                          )
                                        : ""
                                  }
                                  onChange={(e) =>
                                    f.onChange(
                                      e.target.value
                                        ? new Date(e.target.value)
                                        : undefined
                                    )
                                  }
                                />
                              </FormControl>
                              <p className="text-xs text-ink-3">
                                {t("distanceStartAtHint")}
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`distances.${i}.participantLimit`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>{t("participantLimit")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  step={1}
                                  disabled={isLoading}
                                  value={f.value ?? ""}
                                  onChange={(e) =>
                                    f.onChange(
                                      e.target.value === ""
                                        ? ""
                                        : parseInt(e.target.value, 10)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`distances.${i}.bibFrom`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>{t("bibFrom")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  step={1}
                                  disabled={isLoading}
                                  value={f.value ?? ""}
                                  onChange={(e) =>
                                    f.onChange(
                                      e.target.value === ""
                                        ? ""
                                        : parseInt(e.target.value, 10)
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
                          name={`distances.${i}.bibTo`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>{t("bibTo")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  step={1}
                                  disabled={isLoading}
                                  value={f.value ?? ""}
                                  onChange={(e) =>
                                    f.onChange(
                                      e.target.value === ""
                                        ? ""
                                        : parseInt(e.target.value, 10)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`distances.${i}.isKids`}
                        render={({ field: f }) => (
                          <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-md border border-line p-3">
                            <FormControl>
                              <Checkbox
                                checked={!!f.value}
                                disabled={isLoading}
                                onChange={() => f.onChange(!f.value)}
                              />
                            </FormControl>
                            <FormLabel className="mt-0 cursor-pointer font-normal">
                              {t("isKids")}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Discounts */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-ink">
                        {t("sectionDiscounts")}
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <FormField
                          control={form.control}
                          name={`distances.${i}.discountPensioner`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>{t("discountPensioner")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step={1}
                                  disabled={isLoading}
                                  value={f.value ?? ""}
                                  onChange={(e) =>
                                    f.onChange(
                                      e.target.value === ""
                                        ? ""
                                        : parseInt(e.target.value, 10)
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
                          name={`distances.${i}.discountVeteran`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>{t("discountVeteran")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step={1}
                                  disabled={isLoading}
                                  value={f.value ?? ""}
                                  onChange={(e) =>
                                    f.onChange(
                                      e.target.value === ""
                                        ? ""
                                        : parseInt(e.target.value, 10)
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
                          name={`distances.${i}.discountDisability`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>{t("discountDisability")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step={1}
                                  disabled={isLoading}
                                  value={f.value ?? ""}
                                  onChange={(e) =>
                                    f.onChange(
                                      e.target.value === ""
                                        ? ""
                                        : parseInt(e.target.value, 10)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`distances.${i}.minAge`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>{t("minAge")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  step={1}
                                  disabled={isLoading}
                                  value={f.value ?? ""}
                                  onChange={(e) =>
                                    f.onChange(
                                      e.target.value === ""
                                        ? ""
                                        : parseInt(e.target.value, 10)
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
                          name={`distances.${i}.maxAge`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>{t("maxAge")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  step={1}
                                  disabled={isLoading}
                                  value={f.value ?? ""}
                                  onChange={(e) =>
                                    f.onChange(
                                      e.target.value === ""
                                        ? ""
                                        : parseInt(e.target.value, 10)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Price periods */}
                    <DistancePricePeriods
                      control={form.control}
                      distanceIndex={i}
                      isLoading={isLoading}
                    />
                  </CardContent>
                </Card>
              ))}
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
