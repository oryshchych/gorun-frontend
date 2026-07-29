import type { Distance, KidsDistance, PricePeriod } from "@/types/event";

/**
 * Resolve the effective UAH price for a distance.
 *
 * Newer events price distances through timed `pricePeriods` (each a
 * `{ from, to, price }` tier) and omit the flat `feeUah` / `fee` fields, so a
 * naive `d.feeUah ?? d.fee ?? 0` read collapses to `0`. This helper picks the
 * period active at `now`, falling back to the legacy flat fee and then `0`.
 *
 * Selection rules when `pricePeriods` are present:
 * - a period whose `[from, to]` range contains `now` wins;
 * - before every period → the earliest (upcoming) period's price;
 * - after every period → the latest period's price;
 * - between gaps → the most recent period that has already started.
 */
export function resolveDistancePrice(
  distance: Pick<Distance, "feeUah" | "fee" | "pricePeriods"> | KidsDistance,
  now: Date = new Date()
): number {
  const periods =
    "pricePeriods" in distance ? distance.pricePeriods : undefined;

  if (periods && periods.length > 0) {
    const price = resolvePricePeriod(periods, now.getTime());
    if (price !== undefined) return price;
  }

  return distance.feeUah ?? distance.fee ?? 0;
}

function resolvePricePeriod(
  periods: PricePeriod[],
  nowMs: number
): number | undefined {
  const sorted = periods
    .map((p) => ({
      from: new Date(p.from).getTime(),
      to: new Date(p.to).getTime(),
      price: p.price,
    }))
    .filter((p) => Number.isFinite(p.from) && Number.isFinite(p.price))
    .sort((a, b) => a.from - b.from);

  if (sorted.length === 0) return undefined;

  const active = sorted.find((p) => nowMs >= p.from && nowMs <= p.to);
  if (active) return active.price;

  // Before the first tier opens → show the upcoming (earliest) price.
  if (nowMs < sorted[0].from) return sorted[0].price;

  // Otherwise fall to the most recent tier that has already started.
  const started = sorted.filter((p) => p.from <= nowMs);
  return started[started.length - 1].price;
}
