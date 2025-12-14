import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  formatDistance,
  formatRelative,
  isToday,
  isTomorrow,
  isYesterday,
  isThisWeek,
  isThisMonth,
} from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { uk } from "date-fns/locale/uk";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the date-fns locale object based on the locale string
 */
export function getDateLocale(locale: string) {
  return locale === "uk" ? uk : enUS;
}

/**
 * Format a date with locale support
 * @param date - The date to format
 * @param formatStr - The format string (e.g., 'PPP', 'PPPp', 'dd/MM/yyyy')
 * @param locale - The locale string ('en' or 'uk')
 */
export function formatDate(
  date: Date | string | number,
  formatStr: string = "PPP",
  locale: string = "en"
): string {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  const dateLocale = getDateLocale(locale);
  return format(dateObj, formatStr, { locale: dateLocale });
}

/**
 * Format a date and time with locale support
 * @param date - The date to format
 * @param locale - The locale string ('en' or 'uk')
 */
export function formatDateTime(
  date: Date | string | number,
  locale: string = "en"
): string {
  return formatDate(date, "PPPp", locale);
}

/**
 * Format a date in short format with locale support
 * @param date - The date to format
 * @param locale - The locale string ('en' or 'uk')
 */
export function formatDateShort(
  date: Date | string | number,
  locale: string = "en"
): string {
  return formatDate(date, "PP", locale);
}

/**
 * Format a time with locale support
 * @param date - The date to format
 * @param locale - The locale string ('en' or 'uk')
 */
export function formatTime(
  date: Date | string | number,
  locale: string = "en"
): string {
  return formatDate(date, "p", locale);
}

/**
 * Format a date relative to now (e.g., "2 hours ago", "in 3 days")
 * @param date - The date to format
 * @param locale - The locale string ('en' or 'uk')
 */
export function formatRelativeDate(
  date: Date | string | number,
  locale: string = "en"
): string {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  const dateLocale = getDateLocale(locale);
  return formatDistance(dateObj, new Date(), {
    addSuffix: true,
    locale: dateLocale,
  });
}

/**
 * Format a date relative to now with context (e.g., "today at 5:00 PM", "yesterday at 3:00 PM")
 * @param date - The date to format
 * @param locale - The locale string ('en' or 'uk')
 */
export function formatRelativeDateTime(
  date: Date | string | number,
  locale: string = "en"
): string {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  const dateLocale = getDateLocale(locale);
  return formatRelative(dateObj, new Date(), { locale: dateLocale });
}

/**
 * Get a human-readable date label (e.g., "Today", "Tomorrow", "Yesterday")
 * @param date - The date to check
 * @param locale - The locale string ('en' or 'uk')
 */
export function getDateLabel(
  date: Date | string | number,
  locale: string = "en"
): string | null {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  if (isToday(dateObj)) {
    return locale === "uk" ? "Сьогодні" : "Today";
  }
  if (isTomorrow(dateObj)) {
    return locale === "uk" ? "Завтра" : "Tomorrow";
  }
  if (isYesterday(dateObj)) {
    return locale === "uk" ? "Вчора" : "Yesterday";
  }

  return null;
}

/**
 * Check if a date is in a specific time period
 */
export function isDateInPeriod(
  date: Date | string | number,
  period: "today" | "tomorrow" | "yesterday" | "thisWeek" | "thisMonth"
): boolean {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  switch (period) {
    case "today":
      return isToday(dateObj);
    case "tomorrow":
      return isTomorrow(dateObj);
    case "yesterday":
      return isYesterday(dateObj);
    case "thisWeek":
      return isThisWeek(dateObj);
    case "thisMonth":
      return isThisMonth(dateObj);
    default:
      return false;
  }
}

/**
 * Format a date for display in event cards with smart formatting
 * Shows "Today", "Tomorrow", or formatted date based on proximity
 * @param date - The date to format
 * @param locale - The locale string ('en' or 'uk')
 */
export function formatEventDate(
  date: Date | string | number,
  locale: string = "en"
): string {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  const label = getDateLabel(dateObj, locale);

  if (label) {
    return `${label}, ${formatTime(dateObj, locale)}`;
  }

  return formatDateTime(dateObj, locale);
}

/**
 * Format a date range with locale support
 * @param startDate - The start date
 * @param endDate - The end date
 * @param locale - The locale string ('en' or 'uk')
 */
export function formatDateRange(
  startDate: Date | string | number,
  endDate: Date | string | number,
  locale: string = "en"
): string {
  const start = formatDate(startDate, "PPP", locale);
  const end = formatDate(endDate, "PPP", locale);
  const separator = locale === "uk" ? " - " : " - ";
  return `${start}${separator}${end}`;
}
