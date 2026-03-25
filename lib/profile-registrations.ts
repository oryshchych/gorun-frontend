import type { Registration } from "@/types/registration";

/** Local midnight for comparing event calendar dates with the API `event.date`. */
export function startOfTodayLocal(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function registrationEventDate(
  registration: Registration
): Date | null {
  if (!registration.event?.date) return null;
  return new Date(registration.event.date);
}

export function isUpcomingRegistration(
  registration: Registration,
  todayStart: Date
): boolean {
  const d = registrationEventDate(registration);
  if (!d) return false;
  return d.getTime() >= todayStart.getTime();
}

export function isPastRegistration(
  registration: Registration,
  todayStart: Date
): boolean {
  const d = registrationEventDate(registration);
  if (!d) return false;
  return d.getTime() < todayStart.getTime();
}
