import { User } from "./auth";

export type SupportedLocale = "en" | "uk";

export interface TranslationField {
  en?: string;
  uk?: string;
}

export interface EventTranslations {
  title: TranslationField;
  description: TranslationField;
  location: TranslationField;
  speakers?: TranslationField[];
}

export interface Event {
  id: string;
  translations?: EventTranslations;
  // Fallback fields for backwards compatibility with pre-i18n data
  title?: string;
  description?: string;
  location?: string;
  date: Date;
  capacity: number;
  registeredCount: number;
  organizerId?: string;
  organizer?: User;
  imageUrl?: string;
  speakers?: string[]; // For future expansion
  gallery?: string[]; // For future expansion
  basePrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BaseEventPayload {
  translations: EventTranslations;
  // Optional fallbacks for legacy APIs
  title?: string;
  description?: string;
  location?: string;
  date: Date;
  capacity: number;
  imageUrl?: string;
  basePrice?: number;
}

export interface CreateEventRequest extends BaseEventPayload {}

export interface UpdateEventRequest extends Partial<BaseEventPayload> {}
