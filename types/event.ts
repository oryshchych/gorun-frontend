import { User } from "./auth";

export type SupportedLocale = "en" | "uk";

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

export interface EventTranslations {
  title: TranslationField;
  description: TranslationField;
  location: TranslationField;
  speakers?: SpeakerTranslations[];
  date: TranslationField;
}

export interface Event {
  id: string;
  translations?: EventTranslations;
  // Fallback fields for backwards compatibility with pre-i18n data
  title?: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  date: Date;
  capacity: number;
  registeredCount: number;
  organizerId?: string;
  organizer?: User;
  imageUrl?: string;
  speakers?: Speaker[]; // Array of speaker objects
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
  latitude?: number;
  longitude?: number;
  date: Date;
  capacity: number;
  imageUrl?: string;
  basePrice?: number;
}

export interface CreateEventRequest extends BaseEventPayload {}

export interface UpdateEventRequest extends Partial<BaseEventPayload> {}
