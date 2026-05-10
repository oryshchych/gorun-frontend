import type { Event } from "@/types/event";

/** True when the event is over or registration must not be offered (incl. LIVE/CANCELLED). */
export function isRegistrationClosed(event: Event): boolean {
  if (event.status === "FINISHED" || event.status === "CANCELLED") return true;
  if (event.status === "LIVE") return true;
  if (event.lifecyclePhase === "FINISHED") return true;
  const t = new Date(event.date).getTime();
  if (!Number.isNaN(t) && t < Date.now()) return true;
  return false;
}

/**
 * Past-event UX (recap, no register): finished or date passed; not cancelled-only messaging.
 */
export function isPastEventExperience(event: Event): boolean {
  if (event.status === "CANCELLED") return false;
  if (event.status === "FINISHED" || event.lifecyclePhase === "FINISHED") return true;
  const t = new Date(event.date).getTime();
  if (!Number.isNaN(t) && t < Date.now()) return true;
  return false;
}
