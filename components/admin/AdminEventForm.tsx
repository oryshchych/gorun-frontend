"use client";

import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useMemo } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  formatNumberFieldValue,
  parseFloatFieldInput,
  parseIntFieldInput,
} from "@/lib/forms/number-field";

const EVENT_STATUS = ["UPCOMING", "LIVE", "FINISHED", "CANCELLED"] as const;

interface AdminEventFormProps {
  defaultValues: AdminEventFormInput;
  onSubmit: (data: AdminEventFormData) => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

function formatDateForInput(date: Date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

export function AdminEventForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel,
}: AdminEventFormProps) {
  const t = useTranslations("admin.eventForm");
  const tCommon = useTranslations("common");

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

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-10">
        <Tabs defaultValue="main" className="space-y-6">
          <TabsList>
            <TabsTrigger value="main">{t("tabMain")}</TabsTrigger>
            <TabsTrigger value="english">{t("tabEnglish")}</TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-10">
            <ShellFormSection>
              <h2 className="text-lg font-semibold">{t("sectionStatus")}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-md border p-3">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          disabled={isLoading}
                          onChange={() => field.onChange(!field.value)}
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="mt-0 cursor-pointer font-normal">
                          {t("isActiveLabel")}
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
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
                        onValueChange={field.onChange}
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

            <ShellFormSection>
              <h2 className="text-lg font-semibold">
                {t("sectionUkrainianContent")}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="translations.title.uk"
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
                <FormField
                  control={form.control}
                  name="translations.location.uk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("location")}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="translations.date.uk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("dateDisplayLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          placeholder={t("dateDisplayPlaceholder")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="translations.description.uk"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t("description")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={isLoading} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ShellFormSection>

            <ShellFormSection>
              <h2 className="text-lg font-semibold">{t("sectionCore")}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("slug")}</FormLabel>
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
                  name="shortDesc"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t("shortDesc")}</FormLabel>
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
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("venue")}</FormLabel>
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
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("city")}</FormLabel>
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
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("dateTime")}</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        disabled={isLoading}
                        value={
                          field.value instanceof Date
                            ? formatDateForInput(field.value)
                            : field.value
                              ? formatDateForInput(new Date(field.value))
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
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("capacity")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          disabled={isLoading}
                          value={formatNumberFieldValue(field.value)}
                          onChange={(e) =>
                            field.onChange(parseIntFieldInput(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("basePrice")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          disabled={isLoading}
                          value={formatNumberFieldValue(field.value)}
                          onChange={(e) =>
                            field.onChange(parseFloatFieldInput(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fee")}</FormLabel>
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

            <ShellFormSection>
              <h2 className="text-lg font-semibold">{t("sectionMedia")}</h2>
              <FormField
                control={form.control}
                name="imageUrl.portrait"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("imagePortrait")}</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
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
                name="imageUrl.landscape"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("imageLandscape")}</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
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
                name="cover"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("cover")}</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ShellFormSection>

            <ShellFormSection>
              <h2 className="text-lg font-semibold">{t("sectionSpots")}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="spots.taken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("spotsTaken")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          disabled={isLoading}
                          value={formatNumberFieldValue(field.value)}
                          onChange={(e) =>
                            field.onChange(parseIntFieldInput(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spots.total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("spotsTotal")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          disabled={isLoading}
                          value={formatNumberFieldValue(field.value)}
                          onChange={(e) =>
                            field.onChange(parseIntFieldInput(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ShellFormSection>

            <ShellFormSection>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{t("sectionGallery")}</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => ga.append({ url: "" })}
                  disabled={isLoading}
                >
                  <Plus className="mr-1 size-4" />
                  {t("addRow")}
                </Button>
              </div>
              <div className="space-y-2">
                {ga.fields.map((f, i) => (
                  <div key={f.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`gallery.${i}.url`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input type="url" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => ga.remove(i)}
                      disabled={isLoading}
                      aria-label={t("removeRow")}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ShellFormSection>

            <ShellFormSection>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{t("sectionPerks")}</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => pa.append({ line: "" })}
                  disabled={isLoading}
                >
                  <Plus className="mr-1 size-4" />
                  {t("addRow")}
                </Button>
              </div>
              {pa.fields.map((f, i) => (
                <div key={f.id} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`perks.${i}.line`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => pa.remove(i)}
                    disabled={isLoading}
                    aria-label={t("removeRow")}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </ShellFormSection>

            <ShellFormSection>
              <FormField
                control={form.control}
                name="afu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("afu")}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        disabled={isLoading}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ShellFormSection>

            <ShellFormSection>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">
                  {t("sectionSchedule")}
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => sa.append({ time: "", what: "" })}
                  disabled={isLoading}
                >
                  <Plus className="mr-1 size-4" />
                  {t("addRow")}
                </Button>
              </div>
              {sa.fields.map((f, i) => (
                <div
                  key={f.id}
                  className="grid gap-2 sm:grid-cols-[1fr_2fr_auto] sm:items-end"
                >
                  <FormField
                    control={form.control}
                    name={`schedule.${i}.time`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sm:sr-only">
                          {t("scheduleTime")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="07:00"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`schedule.${i}.what`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sm:sr-only">
                          {t("scheduleWhat")}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="justify-self-end"
                    onClick={() => sa.remove(i)}
                    disabled={isLoading}
                    aria-label={t("removeRow")}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </ShellFormSection>

            <ShellFormSection>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">
                  {t("sectionDistances")}
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    da.append({
                      id: crypto.randomUUID(),
                      label: "",
                      name: "",
                      km: undefined as unknown as number,
                      elevation: "",
                      laps: "",
                      spots: {
                        taken: undefined as unknown as number,
                        total: undefined as unknown as number,
                      },
                    })
                  }
                  disabled={isLoading}
                >
                  <Plus className="mr-1 size-4" />
                  {t("addDistance")}
                </Button>
              </div>
              {da.fields.map((f, i) => (
                <div key={f.id} className="space-y-3 rounded-md border p-3">
                  <input
                    type="hidden"
                    {...form.register(`distances.${i}.id`)}
                  />
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <FormField
                      control={form.control}
                      name={`distances.${i}.label`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("distanceLabel")}</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`distances.${i}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("distanceName")}</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`distances.${i}.km`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("distanceKm")}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step="0.1"
                              disabled={isLoading}
                              value={formatNumberFieldValue(field.value)}
                              onChange={(e) =>
                                field.onChange(
                                  parseFloatFieldInput(e.target.value)
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
                      name={`distances.${i}.feeUah`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("distanceFee")}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              disabled={isLoading}
                              value={formatNumberFieldValue(field.value)}
                              onChange={(e) =>
                                field.onChange(
                                  parseFloatFieldInput(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`distances.${i}.elevation`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("distanceElevation")}</FormLabel>
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
                      name={`distances.${i}.laps`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("distanceLaps")}</FormLabel>
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
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`distances.${i}.spots.taken`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("spotsTaken")}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              disabled={isLoading}
                              value={formatNumberFieldValue(field.value)}
                              onChange={(e) =>
                                field.onChange(
                                  parseIntFieldInput(e.target.value)
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
                      name={`distances.${i}.spots.total`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("spotsTotal")}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              disabled={isLoading}
                              value={formatNumberFieldValue(field.value)}
                              onChange={(e) =>
                                field.onChange(
                                  parseIntFieldInput(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => da.remove(i)}
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-1 size-4" />
                    {t("removeDistance")}
                  </Button>
                </div>
              ))}
            </ShellFormSection>

            <ShellFormSection>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{t("sectionKids")}</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    ka.append({
                      id: crypto.randomUUID(),
                      label: "",
                      name: "",
                      age: "",
                    })
                  }
                  disabled={isLoading}
                >
                  <Plus className="mr-1 size-4" />
                  {t("addKids")}
                </Button>
              </div>
              {ka.fields.map((f, i) => (
                <div key={f.id} className="space-y-3 rounded-md border p-3">
                  <input
                    type="hidden"
                    {...form.register(`kidsDistances.${i}.id`)}
                  />
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <FormField
                      control={form.control}
                      name={`kidsDistances.${i}.label`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("kidsLabel")}</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`kidsDistances.${i}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("kidsName")}</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`kidsDistances.${i}.age`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("kidsAge")}</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`kidsDistances.${i}.feeUah`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("kidsFee")}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              disabled={isLoading}
                              value={formatNumberFieldValue(field.value)}
                              onChange={(e) =>
                                field.onChange(
                                  parseFloatFieldInput(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => ka.remove(i)}
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-1 size-4" />
                    {t("removeKids")}
                  </Button>
                </div>
              ))}
            </ShellFormSection>

            <ShellFormSection>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">
                  {t("sectionSpeakers")}
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    spa.append({
                      fullnameEn: "",
                      fullnameUk: "",
                      shortDescriptionEn: "",
                      shortDescriptionUk: "",
                      descriptionEn: "",
                      descriptionUk: "",
                      image: "",
                      instagramLink: "",
                    })
                  }
                  disabled={isLoading}
                >
                  <Plus className="mr-1 size-4" />
                  {t("addSpeaker")}
                </Button>
              </div>
              {spa.fields.map((f, i) => (
                <div key={f.id} className="space-y-3 rounded-md border p-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`speakers.${i}.fullnameUk`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("speakerNameUk")}</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`speakers.${i}.shortDescriptionUk`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("speakerShortUk")}</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name={`speakers.${i}.descriptionUk`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("speakerDescUk")}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              disabled={isLoading}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`speakers.${i}.image`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("speakerImage")}</FormLabel>
                          <FormControl>
                            <Input type="url" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`speakers.${i}.instagramLink`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("speakerInstagram")}</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => spa.remove(i)}
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-1 size-4" />
                    {t("removeSpeaker")}
                  </Button>
                </div>
              ))}
            </ShellFormSection>
          </TabsContent>

          <TabsContent value="english" className="space-y-4">
            <ShellFormSection>
              <h2 className="text-lg font-semibold">
                {t("sectionEnglishTranslations")}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="translations.title.en"
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
                <FormField
                  control={form.control}
                  name="translations.location.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("location")}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="translations.date.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("dateDisplayLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          placeholder={t("dateDisplayPlaceholder")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="translations.description.en"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t("description")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={isLoading} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ShellFormSection>

            <ShellFormSection>
              <h2 className="text-lg font-semibold">
                {t("sectionEnglishSpeakers")}
              </h2>
              {spa.fields.map((f, i) => (
                <div key={f.id} className="space-y-3 rounded-md border p-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`speakers.${i}.fullnameEn`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("speakerNameEn")}</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`speakers.${i}.shortDescriptionEn`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("speakerShortEn")}</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`speakers.${i}.descriptionEn`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("speakerDescEn")}</FormLabel>
                        <FormControl>
                          <Textarea {...field} disabled={isLoading} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </ShellFormSection>
          </TabsContent>
        </Tabs>

        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading && (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          )}
          {submitLabel ?? tCommon("submit")}
        </Button>
      </form>
    </Form>
  );
}
