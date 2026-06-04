import { User } from "./auth";

export type SupportedLocale = "en" | "uk";

export type EventStatus = "UPCOMING" | "LIVE" | "FINISHED" | "CANCELLED";

/** Admin API lifecycle bucket; the admin UI derives this from `status` on save. */
export type EventLifecyclePhase = "PLANNED" | "FUTURE" | "CURRENT" | "FINISHED";

export interface TranslationField {
  en?: string;
  uk?: string;
}

export interface SpeakerTranslations {
  fullname?: TranslationField;
  shortDescription?: TranslationField;
  description?: TranslationField;
}

export interface Speaker {
  id?: string;
  translations?: SpeakerTranslations;
  fullname: string;
  shortDescription: string;
  description: string;
  image: string;
  instagramLink: string;
}

/** Payload for create/update when fields may be partial */
export interface EventSpeakerPayload {
  id?: string;
  translations?: SpeakerTranslations;
  fullname?: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  instagramLink?: string;
}

export interface EventTranslations {
  title: TranslationField;
  description: TranslationField;
  /** Post-race recap / “how it was” (localized) */
  pastDescription?: TranslationField;
  location: TranslationField;
  speakers?: SpeakerTranslations[];
  date: TranslationField;
  partners?: Array<{
    uk: string;
    en: string;
    imageUrl: string;
  }>;
}

export interface EventImageUrl {
  portrait: string;
  landscape: string;
}

/** Spots availability for a distance or the whole event */
export interface SpotsInfo {
  taken: number;
  total: number;
}

/** A runnable distance option within an event */
export interface Distance {
  id: string;
  label: string; // "21K"
  name: string; // "Half Marathon"
  km: number;
  feeUah?: number;
  /** @deprecated use feeUah */
  fee?: number;
  elevation?: string; // "+520m" — trail events
  laps?: string; // "7.5 laps" — track events
  spots: SpotsInfo;
}

/** A kids' race option within an event */
export interface KidsDistance {
  id: string;
  label: string; // "100m"
  name: string; // "Tiny Sprint"
  age: string; // "3–5"
  feeUah?: number;
  /** @deprecated use feeUah */
  fee?: number;
}

/** A single row in the race-day schedule / program */
export interface ScheduleItem {
  time: string; // "07:00"
  what: string;
}

export interface Event {
  id: string;
  slug?: string;
  /** Resolved localized fields returned by API when `lang` query param is provided */
  resolvedTitle?: string;
  resolvedDescription?: string;
  resolvedPastDescription?: string;
  resolvedLocation?: string;
  /** API may return either `name` or `title` */
  name?: string;
  status?: EventStatus;
  translations?: EventTranslations;
  // Fallback fields for backwards compatibility with pre-i18n data
  title?: string;
  description?: string;
  /** Plain fallback when translations are absent */
  pastDescription?: string;
  /** Short marketing blurb shown on event cards */
  shortDesc?: string;
  short?: string;
  location?: string;
  city?: string;
  venue?: string;
  latitude?: number;
  longitude?: number;
  date: Date;
  /** Display-ready date label e.g. "Sun, July 12 2026" */
  dateLabel?: string;
  /** Display-ready time label e.g. "7:00 AM" */
  timeLabel?: string;
  capacity: number;
  registeredCount: number;
  organizerId?: string;
  organizer?: User;
  imageUrl?: EventImageUrl;
  /** Direct cover image URL (from prototype data) */
  cover?: string;
  speakers?: Speaker[];
  gallery?: string[];
  basePrice?: number;
  /** Entry fee display string e.g. "from 400 UAH" */
  fee?: string;
  /** Structured distances with individual spots */
  distances?: Distance[];
  /** Kids' race options */
  kidsDistances?: KidsDistance[];
  /** Race-day schedule */
  program?: [string, string][]; // [time, what]
  schedule?: ScheduleItem[];
  /** Included items / perks */
  perks?: string[];
  /** AFU (Armed Forces of Ukraine) support message */
  afu?: string;
  /** Total spots at event level (sum of all distances) */
  spots?: SpotsInfo;
  /** When false, event should be hidden from public listings */
  isActive?: boolean;
  lifecyclePhase?: EventLifecyclePhase;
  registrationStart?: Date;
  registrationEnd?: Date;
  socials?: { instagram?: string; facebook?: string; telegram?: string };
  regulationUrl?: string;
  scheduleText?: string;
  organizerInfo?: string;
  organizerContactName?: string;
  organizerContactInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BaseEventPayload {
  translations: EventTranslations;
  // Optional fallbacks for legacy APIs
  title?: string;
  description?: string;
  pastDescription?: string;
  location?: string;
  slug?: string;
  shortDesc?: string;
  city?: string;
  venue?: string;
  latitude?: number;
  longitude?: number;
  date: Date;
  dateLabel?: string;
  timeLabel?: string;
  capacity: number;
  imageUrl?: EventImageUrl;
  cover?: string;
  basePrice?: number;
  fee?: string;
  spots?: SpotsInfo;
  distances?: Distance[];
  kidsDistances?: KidsDistance[];
  program?: [string, string][];
  schedule?: ScheduleItem[];
  perks?: string[];
  afu?: string;
  gallery?: string[];
  speakers?: EventSpeakerPayload[];
  status?: EventStatus;
  isActive?: boolean;
  lifecyclePhase?: EventLifecyclePhase;
  registrationStart?: Date;
  registrationEnd?: Date;
  socials?: { instagram?: string; facebook?: string; telegram?: string };
  regulationUrl?: string;
  scheduleText?: string;
  organizerInfo?: string;
  organizerContactName?: string;
  organizerContactInfo?: string;
}

export interface CreateEventRequest extends BaseEventPayload {}

export interface UpdateEventRequest extends Partial<
  Omit<BaseEventPayload, "imageUrl">
> {
  imageUrl?: Partial<EventImageUrl>;
}

/** Minimal past-event record shown on profile and hub */
export interface PastEvent {
  id: string;
  name: string;
  dateLabel: string;
  city?: string;
  cover?: string;
  distance?: string;
  result?: string;
  position?: string;
}
