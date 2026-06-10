import { addDays, format } from "date-fns";
import { z } from "zod";
import { emptyNumberToUndefined } from "@/lib/forms/number-field";
import { zMsg } from "@/lib/validations/i18n-error";
import type {
  CreateEventRequest,
  UpdateEventRequest,
  EventStatus,
  EventLifecyclePhase,
  EventSpeakerPayload,
  ScheduleItem,
  Distance,
  KidsDistance,
  PricePeriod,
} from "@/types/event";

const optionalUrl = z
  .string()
  .refine((s) => s === "" || /^https?:\/\/.+/i.test(s), {
    message: zMsg("validation.urlInvalid"),
  });

const pair = (min: number, max: number) => {
  const localized = z
    .string()
    .min(min, zMsg("validation.minChars", { min }))
    .max(max, zMsg("validation.maxChars", { max }));
  return z.object({ en: localized, uk: localized });
};

const spotsSchema = z.object({
  taken: z.number().int().min(0),
  total: z.number().int().min(1),
});

const optionalSpotsPairSchema = z
  .object({
    taken: z.preprocess(
      emptyNumberToUndefined,
      z
        .number()
        .int(zMsg("validation.integer"))
        .min(0, zMsg("validation.nonnegative"))
        .optional()
    ),
    total: z.preprocess(
      emptyNumberToUndefined,
      z
        .number()
        .int(zMsg("validation.integer"))
        .min(1, zMsg("validation.min", { min: 1 }))
        .optional()
    ),
  })
  .refine(
    (s) =>
      (s.taken === undefined && s.total === undefined) ||
      (s.taken !== undefined && s.total !== undefined),
    { message: zMsg("validation.spotsBoth") }
  )
  .transform((s): z.infer<typeof spotsSchema> | undefined => {
    if (s.taken === undefined || s.total === undefined) return undefined;
    return { taken: s.taken, total: s.total };
  });

const pricePeriodSchema = z.object({
  from: z
    .union([z.string(), z.date()])
    .transform((val) => (val ? new Date(val) : undefined))
    .refine((d): d is Date => d !== undefined && !Number.isNaN(d.getTime()), {
      message: zMsg("validation.invalidDate"),
    }),
  to: z
    .union([z.string(), z.date()])
    .transform((val) => (val ? new Date(val) : undefined))
    .refine((d): d is Date => d !== undefined && !Number.isNaN(d.getTime()), {
      message: zMsg("validation.invalidDate"),
    }),
  price: z.preprocess(
    emptyNumberToUndefined,
    z.number().positive(zMsg("validation.pricePositive"))
  ),
});

const distanceSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().optional(),
    name: z
      .string()
      .min(1, zMsg("validation.required"))
      .max(100, zMsg("validation.maxChars", { max: 100 })),
    km: z.preprocess(
      emptyNumberToUndefined,
      z.number().nonnegative(zMsg("validation.nonnegative")).optional()
    ),
    feeUah: z.preprocess(
      emptyNumberToUndefined,
      z.number().nonnegative(zMsg("validation.nonnegative")).optional()
    ),
    elevation: z.string().optional(),
    laps: z.string().optional(),
    spots: optionalSpotsPairSchema,
    distanceMeters: z.preprocess(
      emptyNumberToUndefined,
      z
        .number()
        .int(zMsg("validation.integer"))
        .min(1, zMsg("validation.min", { min: 1 }))
        .max(999999, zMsg("validation.max", { max: 999999 }))
        .optional()
    ),
    startAt: z
      .union([z.string(), z.date()])
      .transform((val) => (val ? new Date(val) : undefined))
      .refine((d) => d === undefined || !Number.isNaN(d.getTime()), {
        message: zMsg("validation.invalidDate"),
      })
      .optional(),
    participantLimit: z.preprocess(
      emptyNumberToUndefined,
      z
        .number()
        .int(zMsg("validation.integer"))
        .min(1, zMsg("validation.min", { min: 1 }))
        .optional()
    ),
    bibFrom: z.preprocess(
      emptyNumberToUndefined,
      z
        .number()
        .int(zMsg("validation.integer"))
        .min(0, zMsg("validation.nonnegative"))
        .optional()
    ),
    bibTo: z.preprocess(
      emptyNumberToUndefined,
      z
        .number()
        .int(zMsg("validation.integer"))
        .min(0, zMsg("validation.nonnegative"))
        .optional()
    ),
    isKids: z.boolean().optional(),
    discountPensioner: z.preprocess(
      emptyNumberToUndefined,
      z
        .number()
        .int(zMsg("validation.integer"))
        .min(0, zMsg("validation.nonnegative"))
        .max(100, zMsg("validation.max", { max: 100 }))
        .optional()
    ),
    discountVeteran: z.preprocess(
      emptyNumberToUndefined,
      z
        .number()
        .int(zMsg("validation.integer"))
        .min(0, zMsg("validation.nonnegative"))
        .max(100, zMsg("validation.max", { max: 100 }))
        .optional()
    ),
    discountDisability: z.preprocess(
      emptyNumberToUndefined,
      z
        .number()
        .int(zMsg("validation.integer"))
        .min(0, zMsg("validation.nonnegative"))
        .max(100, zMsg("validation.max", { max: 100 }))
        .optional()
    ),
    minAge: z.preprocess(
      emptyNumberToUndefined,
      z
        .number()
        .int(zMsg("validation.integer"))
        .min(0, zMsg("validation.nonnegative"))
        .optional()
    ),
    maxAge: z.preprocess(
      emptyNumberToUndefined,
      z
        .number()
        .int(zMsg("validation.integer"))
        .min(0, zMsg("validation.nonnegative"))
        .optional()
    ),
    pricePeriods: z.array(pricePeriodSchema).optional(),
  })
  .refine(
    (d) =>
      d.bibTo === undefined || d.bibFrom === undefined || d.bibTo >= d.bibFrom,
    { path: ["bibTo"], message: zMsg("validation.bibRange") }
  )
  .refine(
    (d) =>
      d.maxAge === undefined || d.minAge === undefined || d.maxAge > d.minAge,
    { path: ["maxAge"], message: zMsg("validation.ageRange") }
  );

const kidsDistanceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  name: z.string().min(1),
  age: z.string().min(1),
  feeUah: z.preprocess(
    emptyNumberToUndefined,
    z.number().nonnegative().optional()
  ),
});

const scheduleRowSchema = z.object({
  time: z.string(),
  what: z.string(),
});

const speakerRowSchema = z.object({
  id: z.string().optional(),
  fullnameEn: z.string(),
  fullnameUk: z.string(),
  shortDescriptionEn: z.string(),
  shortDescriptionUk: z.string(),
  descriptionEn: z.string(),
  descriptionUk: z.string(),
  image: optionalUrl,
  instagramLink: z.string(),
});

const statusValues = [
  "UPCOMING",
  "LIVE",
  "FINISHED",
  "CANCELLED",
] as const satisfies readonly EventStatus[];

/**
 * Admin edits `status` only; API still expects `lifecyclePhase` — derive it here.
 * CANCELLED maps to FUTURE so cancelled events stay in “upcoming-ish” filters unless filtered by status.
 */
export function lifecyclePhaseFromStatus(
  status: EventStatus | undefined
): EventLifecyclePhase {
  switch (status) {
    case "LIVE":
      return "CURRENT";
    case "FINISHED":
      return "FINISHED";
    case "CANCELLED":
      return "FUTURE";
    case "UPCOMING":
    default:
      return "FUTURE";
  }
}

/** Backfill `status` for older API rows that only had `lifecyclePhase`. */
export function statusFromLifecyclePhase(
  phase: EventLifecyclePhase | undefined
): EventStatus | undefined {
  switch (phase) {
    case "CURRENT":
      return "LIVE";
    case "FINISHED":
      return "FINISHED";
    case "PLANNED":
    case "FUTURE":
      return "UPCOMING";
    default:
      return undefined;
  }
}

export const adminEventFormSchema = z.object({
  translations: z.object({
    title: pair(3, 100),
    description: pair(10, 2000),
    location: pair(3, 200),
    date: z.object({
      en: z.string().min(1, zMsg("validation.required")),
      uk: z.string().min(1, zMsg("validation.required")),
    }),
  }),
  slug: z
    .string()
    .max(120, zMsg("validation.maxChars", { max: 120 }))
    .optional(),
  shortDesc: z
    .string()
    .max(500, zMsg("validation.maxChars", { max: 500 }))
    .optional(),
  venue: z
    .string()
    .max(200, zMsg("validation.maxChars", { max: 200 }))
    .optional(),
  city: z
    .string()
    .max(120, zMsg("validation.maxChars", { max: 120 }))
    .optional(),
  date: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === "string" ? new Date(val) : val))
    .refine((d) => !Number.isNaN(d.getTime()), {
      message: zMsg("validation.invalidDate"),
    }),
  capacity: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z
      .union([
        z.undefined(),
        z
          .number({ message: zMsg("validation.capacityRequired") })
          .int(zMsg("validation.integer"))
          .positive(zMsg("validation.capacityPositive"))
          .max(10000, zMsg("validation.max", { max: 10000 })),
      ])
      .refine((v): v is number => v !== undefined, {
        message: zMsg("validation.capacityRequired"),
      })
  ),
  basePrice: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z
      .number()
      .nonnegative(zMsg("validation.nonnegative"))
      .max(1_000_000, zMsg("validation.max", { max: 1000000 }))
      .optional()
  ),
  fee: z
    .string()
    .max(120, zMsg("validation.maxChars", { max: 120 }))
    .optional(),
  imageUrl: z
    .object({
      portrait: optionalUrl,
      landscape: optionalUrl,
    })
    .optional(),
  cover: optionalUrl.optional(),
  spots: optionalSpotsPairSchema.optional(),
  gallery: z.array(z.object({ url: optionalUrl })).optional(),
  perks: z.array(z.object({ line: z.string() })).optional(),
  afu: z
    .string()
    .max(2000, zMsg("validation.maxChars", { max: 2000 }))
    .optional(),
  schedule: z.array(scheduleRowSchema).optional(),
  distances: z.array(distanceSchema).optional(),
  kidsDistances: z.array(kidsDistanceSchema).optional(),
  speakers: z.array(speakerRowSchema).optional(),
  status: z.enum(statusValues),
  isActive: z.boolean(),
  registrationStart: z
    .union([z.string(), z.date()])
    .transform((val) => (val ? new Date(val) : undefined))
    .refine((d) => d === undefined || !Number.isNaN(d.getTime()), {
      message: zMsg("validation.invalidDate"),
    })
    .optional(),
  registrationEnd: z
    .union([z.string(), z.date()])
    .transform((val) => (val ? new Date(val) : undefined))
    .refine((d) => d === undefined || !Number.isNaN(d.getTime()), {
      message: zMsg("validation.invalidDate"),
    })
    .optional(),
  socials: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      telegram: z.string().optional(),
    })
    .optional(),
  regulationUrl: optionalUrl.optional(),
  scheduleText: z
    .string()
    .max(5000, zMsg("validation.maxChars", { max: 5000 }))
    .optional(),
  organizerInfo: z
    .string()
    .max(300, zMsg("validation.maxChars", { max: 300 }))
    .optional(),
  organizerContactName: z
    .string()
    .max(200, zMsg("validation.maxChars", { max: 200 }))
    .optional(),
  organizerContactInfo: z
    .string()
    .max(500, zMsg("validation.maxChars", { max: 500 }))
    .optional(),
  changeFee: z.preprocess(
    emptyNumberToUndefined,
    z.number().nonnegative(zMsg("validation.nonnegative")).optional()
  ),
  transferFee: z.preprocess(
    emptyNumberToUndefined,
    z.number().nonnegative(zMsg("validation.nonnegative")).optional()
  ),
});

export type AdminEventFormData = z.output<typeof adminEventFormSchema>;

/** RHF default values / submit values before Zod parse (allows empty number fields). */
export type AdminEventFormInput = {
  translations: {
    title: { en: string; uk: string };
    description: { en: string; uk: string };
    location: { en: string; uk: string };
    date: { en: string; uk: string };
  };
  slug?: string;
  shortDesc?: string;
  venue?: string;
  city?: string;
  date: Date | string;
  capacity?: number | "";
  basePrice?: number | "";
  fee?: string;
  imageUrl?: { portrait?: string; landscape?: string };
  cover?: string;
  spots?: { taken?: number | ""; total?: number | "" };
  gallery?: { url: string }[];
  perks?: { line: string }[];
  afu?: string;
  schedule?: { time: string; what: string }[];
  distances?: Array<{
    id: string;
    label?: string;
    name: string;
    km?: number | "";
    feeUah?: number | "";
    elevation?: string;
    laps?: string;
    spots?: { taken?: number | ""; total?: number | "" };
    distanceMeters?: number | "";
    startAt?: Date | string;
    participantLimit?: number | "";
    bibFrom?: number | "";
    bibTo?: number | "";
    isKids?: boolean;
    discountPensioner?: number | "";
    discountVeteran?: number | "";
    discountDisability?: number | "";
    minAge?: number | "";
    maxAge?: number | "";
    pricePeriods?: Array<{
      from: Date | string;
      to: Date | string;
      price: number | "";
    }>;
  }>;
  kidsDistances?: Array<{
    id: string;
    label: string;
    name: string;
    age: string;
    feeUah?: number | "";
  }>;
  speakers?: Array<{
    id?: string;
    fullnameEn: string;
    fullnameUk: string;
    shortDescriptionEn: string;
    shortDescriptionUk: string;
    descriptionEn: string;
    descriptionUk: string;
    image: string;
    instagramLink: string;
  }>;
  status: EventStatus;
  isActive: boolean;
  registrationStart?: Date | string;
  registrationEnd?: Date | string;
  socials?: { instagram?: string; facebook?: string; telegram?: string };
  regulationUrl?: string;
  scheduleText?: string;
  organizerInfo?: string;
  organizerContactName?: string;
  organizerContactInfo?: string;
  changeFee?: number | "";
  transferFee?: number | "";
};

/**
 * Removes incomplete array rows so Zod validation matches normalized API payloads.
 */
export function sanitizeAdminFormBeforeParse(
  data: AdminEventFormInput
): AdminEventFormInput {
  return {
    ...data,
    distances: data.distances?.filter((d) => d.name?.trim()),
    kidsDistances: data.kidsDistances?.filter(
      (k) => k.label?.trim() && k.name?.trim() && k.age?.trim()
    ),
    speakers: data.speakers?.filter((s) => {
      const has =
        s.fullnameEn?.trim() ||
        s.fullnameUk?.trim() ||
        s.shortDescriptionEn?.trim() ||
        s.shortDescriptionUk?.trim() ||
        s.descriptionEn?.trim() ||
        s.descriptionUk?.trim() ||
        s.image?.trim() ||
        s.instagramLink?.trim();
      return has;
    }),
  };
}

/** Use with react-hook-form `zodResolver` so incomplete array rows validate. */
export const adminEventFormResolverSchema = z.preprocess(
  (raw) => sanitizeAdminFormBeforeParse(raw as AdminEventFormInput),
  adminEventFormSchema
);

function normalizeImageUrl(
  imageUrl: AdminEventFormData["imageUrl"]
): CreateEventRequest["imageUrl"] {
  if (!imageUrl) return undefined;
  const portrait = imageUrl.portrait?.trim() || "";
  const landscape = imageUrl.landscape?.trim() || "";
  if (!portrait && !landscape) return undefined;
  return { portrait, landscape };
}

function normalizeCover(cover: string | undefined): string | undefined {
  const c = cover?.trim();
  return c || undefined;
}

function normalizeGallery(
  gallery: AdminEventFormData["gallery"]
): string[] | undefined {
  if (!gallery?.length) return undefined;
  const urls = gallery.map((g) => g.url.trim()).filter(Boolean);
  return urls.length ? urls : undefined;
}

function normalizePerks(
  perks: AdminEventFormData["perks"]
): string[] | undefined {
  if (!perks?.length) return undefined;
  const rows = perks.map((p) => p.line.trim()).filter(Boolean);
  return rows.length ? rows : undefined;
}

function normalizeSchedule(
  schedule: AdminEventFormData["schedule"]
): ScheduleItem[] | undefined {
  if (!schedule?.length) return undefined;
  const rows = schedule
    .map((r) => ({ time: r.time.trim(), what: r.what.trim() }))
    .filter((r) => r.time || r.what);
  return rows.length ? rows : undefined;
}

function scheduleToProgram(
  schedule: ScheduleItem[] | undefined
): [string, string][] | undefined {
  if (!schedule?.length) return undefined;
  return schedule.map((r) => [r.time, r.what]);
}

function normalizePricePeriods(
  periods: Array<{ from: Date; to: Date; price: number }> | undefined
): PricePeriod[] | undefined {
  if (!periods?.length) return undefined;
  const rows = periods.filter((p) => p.price > 0);
  return rows.length ? rows : undefined;
}

function normalizeDistances(
  distances: AdminEventFormData["distances"]
): Distance[] | undefined {
  if (!distances?.length) return undefined;
  const rows = distances
    .filter((d) => d.name.trim())
    .map((d) => ({
      ...d,
      pricePeriods: normalizePricePeriods(d.pricePeriods),
    }));
  return rows.length ? (rows as Distance[]) : undefined;
}

/** Create a blank distance row for "Add distance" buttons. */
export function createEmptyDistance(): NonNullable<
  AdminEventFormInput["distances"]
>[number] {
  return {
    id: crypto.randomUUID(),
    name: "",
    label: "",
    km: "",
    feeUah: "",
    elevation: "",
    laps: "",
    spots: { taken: "", total: "" },
    distanceMeters: "",
    startAt: undefined,
    participantLimit: "",
    bibFrom: "",
    bibTo: "",
    isKids: false,
    discountPensioner: "",
    discountVeteran: "",
    discountDisability: "",
    minAge: "",
    maxAge: "",
    pricePeriods: [],
  };
}

/** Create a blank price period row for "Add period" buttons. */
export function createEmptyPricePeriod(): NonNullable<
  NonNullable<AdminEventFormInput["distances"]>[number]["pricePeriods"]
>[number] {
  return { from: "", to: "", price: "" };
}

function normalizeKids(
  kids: AdminEventFormData["kidsDistances"]
): KidsDistance[] | undefined {
  if (!kids?.length) return undefined;
  return kids.filter((k) => k.label.trim() && k.name.trim() && k.age.trim());
}

function speakersToPayload(
  speakers: AdminEventFormData["speakers"]
): EventSpeakerPayload[] | undefined {
  if (!speakers?.length) return undefined;
  const out: EventSpeakerPayload[] = [];
  for (const s of speakers) {
    const hasAny =
      s.fullnameEn.trim() ||
      s.fullnameUk.trim() ||
      s.shortDescriptionEn.trim() ||
      s.shortDescriptionUk.trim() ||
      s.descriptionEn.trim() ||
      s.descriptionUk.trim() ||
      s.image.trim() ||
      s.instagramLink.trim();
    if (!hasAny) continue;
    const translations: EventSpeakerPayload["translations"] = {
      fullname:
        s.fullnameEn.trim() || s.fullnameUk.trim()
          ? { en: s.fullnameEn.trim(), uk: s.fullnameUk.trim() }
          : undefined,
      shortDescription:
        s.shortDescriptionEn.trim() || s.shortDescriptionUk.trim()
          ? {
              en: s.shortDescriptionEn.trim(),
              uk: s.shortDescriptionUk.trim(),
            }
          : undefined,
      description:
        s.descriptionEn.trim() || s.descriptionUk.trim()
          ? { en: s.descriptionEn.trim(), uk: s.descriptionUk.trim() }
          : undefined,
    };
    out.push({
      id: s.id?.trim() || undefined,
      translations,
      fullname: s.fullnameEn.trim() || s.fullnameUk.trim() || "",
      shortDescription:
        s.shortDescriptionEn.trim() || s.shortDescriptionUk.trim() || "",
      description: s.descriptionEn.trim() || s.descriptionUk.trim() || "",
      image: s.image.trim() || "",
      instagramLink: s.instagramLink.trim() || "",
    });
  }
  return out.length ? out : undefined;
}

export function adminFormToCreatePayload(
  data: AdminEventFormData
): CreateEventRequest {
  const schedule = normalizeSchedule(data.schedule);
  return {
    translations: data.translations,
    slug: data.slug?.trim() || undefined,
    shortDesc: data.shortDesc?.trim() || undefined,
    venue: data.venue?.trim() || undefined,
    city: data.city?.trim() || undefined,
    date: data.date,
    capacity: data.capacity,
    basePrice: data.basePrice,
    fee: data.fee?.trim() || undefined,
    imageUrl: normalizeImageUrl(data.imageUrl),
    cover: normalizeCover(data.cover),
    spots: data.spots,
    gallery: normalizeGallery(data.gallery),
    perks: normalizePerks(data.perks),
    afu: data.afu?.trim() || undefined,
    schedule,
    program: scheduleToProgram(schedule),
    distances: normalizeDistances(data.distances),
    kidsDistances: normalizeKids(data.kidsDistances),
    speakers: speakersToPayload(data.speakers),
    status: data.status,
    isActive: data.isActive,
    lifecyclePhase: lifecyclePhaseFromStatus(data.status),
    registrationStart: data.registrationStart,
    registrationEnd: data.registrationEnd,
    socials: data.socials,
    regulationUrl: data.regulationUrl?.trim() || undefined,
    scheduleText: data.scheduleText?.trim() || undefined,
    organizerInfo: data.organizerInfo?.trim() || undefined,
    organizerContactName: data.organizerContactName?.trim() || undefined,
    organizerContactInfo: data.organizerContactInfo?.trim() || undefined,
    changeFee: data.changeFee,
    transferFee: data.transferFee,
  };
}

export function adminFormToUpdatePayload(
  data: AdminEventFormData
): UpdateEventRequest {
  return adminFormToCreatePayload(data);
}

export function eventToAdminFormDefaults(event: {
  translations?: {
    title?: { en?: string; uk?: string };
    description?: { en?: string; uk?: string };
    location?: { en?: string; uk?: string };
    date?: { en?: string; uk?: string };
  };
  title?: string;
  description?: string;
  location?: string;
  slug?: string;
  shortDesc?: string;
  short?: string;
  venue?: string;
  city?: string;
  date: Date | string;
  capacity: number;
  basePrice?: number;
  fee?: string;
  imageUrl?: { portrait?: string; landscape?: string };
  cover?: string;
  spots?: { taken: number; total: number };
  gallery?: string[];
  perks?: string[];
  afu?: string;
  schedule?: ScheduleItem[];
  program?: [string, string][];
  distances?: Distance[];
  kidsDistances?: KidsDistance[];
  speakers?: Array<{
    id?: string;
    translations?: {
      fullname?: { en?: string; uk?: string };
      shortDescription?: { en?: string; uk?: string };
      description?: { en?: string; uk?: string };
    };
    fullname?: string;
    shortDescription?: string;
    description?: string;
    image?: string;
    instagramLink?: string;
  }>;
  status?: EventStatus;
  isActive?: boolean;
  lifecyclePhase?: EventLifecyclePhase;
  registrationStart?: Date | string;
  registrationEnd?: Date | string;
  socials?: { instagram?: string; facebook?: string; telegram?: string };
  regulationUrl?: string;
  scheduleText?: string;
  organizerInfo?: string;
  organizerContactName?: string;
  organizerContactInfo?: string;
  changeFee?: number;
  transferFee?: number;
}): AdminEventFormInput {
  const d = new Date(event.date);
  const tr = event.translations;
  const scheduleFromProgram =
    event.program?.map(([time, what]) => ({ time, what })) ?? [];
  const schedule = event.schedule?.length
    ? event.schedule
    : scheduleFromProgram;

  const speakers =
    event.speakers?.map((s) => ({
      id: s.id,
      fullnameEn: s.translations?.fullname?.en ?? s.fullname ?? "",
      fullnameUk: s.translations?.fullname?.uk ?? s.fullname ?? "",
      shortDescriptionEn:
        s.translations?.shortDescription?.en ?? s.shortDescription ?? "",
      shortDescriptionUk:
        s.translations?.shortDescription?.uk ?? s.shortDescription ?? "",
      descriptionEn: s.translations?.description?.en ?? s.description ?? "",
      descriptionUk: s.translations?.description?.uk ?? s.description ?? "",
      image: s.image ?? "",
      instagramLink: s.instagramLink ?? "",
    })) ?? [];

  const resolvedStatus =
    event.status ??
    statusFromLifecyclePhase(event.lifecyclePhase) ??
    "UPCOMING";

  return {
    translations: {
      title: {
        en: tr?.title?.en ?? event.title ?? "",
        uk: tr?.title?.uk ?? "",
      },
      description: {
        en: tr?.description?.en ?? event.description ?? "",
        uk: tr?.description?.uk ?? "",
      },
      location: {
        en: tr?.location?.en ?? event.location ?? "",
        uk: tr?.location?.uk ?? "",
      },
      date: {
        en: tr?.date?.en ?? "",
        uk: tr?.date?.uk ?? "",
      },
    },
    slug: event.slug ?? "",
    shortDesc: event.shortDesc ?? event.short ?? "",
    venue: event.venue ?? "",
    city: event.city ?? "",
    date: d,
    capacity: event.capacity,
    basePrice: event.basePrice,
    fee: event.fee ?? "",
    imageUrl: {
      portrait: event.imageUrl?.portrait ?? "",
      landscape: event.imageUrl?.landscape ?? "",
    },
    cover: event.cover ?? "",
    spots: event.spots,
    gallery: event.gallery?.length
      ? event.gallery.map((url) => ({
          url: typeof url === "string" ? url : "",
        }))
      : [],
    perks: event.perks?.length
      ? event.perks.map((line) => ({
          line: typeof line === "string" ? line : "",
        }))
      : [],
    afu: event.afu ?? "",
    schedule: schedule.length ? schedule : [],
    distances: event.distances?.length
      ? event.distances.map((x) => ({
          ...x,
          distanceMeters: x.distanceMeters ?? "",
          participantLimit: x.participantLimit ?? "",
          bibFrom: x.bibFrom ?? "",
          bibTo: x.bibTo ?? "",
          discountPensioner: x.discountPensioner ?? "",
          discountVeteran: x.discountVeteran ?? "",
          discountDisability: x.discountDisability ?? "",
          minAge: x.minAge ?? "",
          maxAge: x.maxAge ?? "",
          isKids: x.isKids ?? false,
          startAt: x.startAt ? new Date(x.startAt) : undefined,
          pricePeriods:
            x.pricePeriods?.map((p) => ({
              from: new Date(p.from),
              to: new Date(p.to),
              price: p.price,
            })) ?? [],
        }))
      : [],
    kidsDistances: event.kidsDistances?.length
      ? event.kidsDistances.map((x) => ({ ...x }))
      : [],
    speakers,
    status: resolvedStatus,
    isActive: event.isActive ?? true,
    registrationStart: event.registrationStart
      ? new Date(event.registrationStart)
      : undefined,
    registrationEnd: event.registrationEnd
      ? new Date(event.registrationEnd)
      : undefined,
    socials: event.socials ?? { instagram: "", facebook: "", telegram: "" },
    regulationUrl: event.regulationUrl ?? "",
    scheduleText: event.scheduleText ?? "",
    organizerInfo: event.organizerInfo ?? "",
    organizerContactName: event.organizerContactName ?? "",
    organizerContactInfo: event.organizerContactInfo ?? "",
    changeFee: event.changeFee ?? "",
    transferFee: event.transferFee ?? "",
  };
}

/** Valid defaults for a new event draft (admin create form). */
export function createEmptyAdminEventForm(): AdminEventFormInput {
  const date = addDays(new Date(), 1);
  const dateLabel = format(date, "PPP 'at' p");
  return {
    translations: {
      title: { en: "", uk: "" },
      description: { en: "", uk: "" },
      location: { en: "", uk: "" },
      date: { en: dateLabel, uk: dateLabel },
    },
    slug: "",
    shortDesc: "",
    venue: "",
    city: "",
    date,
    capacity: undefined,
    basePrice: undefined,
    fee: "",
    imageUrl: { portrait: "", landscape: "" },
    cover: "",
    spots: undefined,
    gallery: [],
    perks: [],
    afu: "",
    schedule: [],
    distances: [],
    kidsDistances: [],
    speakers: [],
    status: "UPCOMING",
    isActive: true,
    registrationStart: undefined,
    registrationEnd: undefined,
    socials: { instagram: "", facebook: "", telegram: "" },
    regulationUrl: "",
    scheduleText: "",
    organizerInfo: "",
    organizerContactName: "",
    organizerContactInfo: "",
    changeFee: "",
    transferFee: "",
  };
}
