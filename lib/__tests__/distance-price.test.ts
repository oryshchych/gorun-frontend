import { describe, it, expect } from "vitest";
import { resolveDistancePrice } from "@/lib/distance-price";
import type { Distance } from "@/types/event";

const periods = [
  {
    from: new Date("2026-07-18T06:20:00.000Z"),
    to: new Date("2026-08-19T21:00:00.000Z"),
    price: 700,
  },
  {
    from: new Date("2026-08-21T06:00:00.000Z"),
    to: new Date("2026-09-02T06:00:00.000Z"),
    price: 900,
  },
];

function distance(overrides: Partial<Distance> = {}): Distance {
  return {
    id: "d1",
    label: "5K",
    name: "П'ятірка",
    km: 5,
    ...overrides,
  };
}

describe("resolveDistancePrice", () => {
  it("returns the price of the active period", () => {
    const now = new Date("2026-07-25T00:00:00.000Z");
    expect(resolveDistancePrice(distance({ pricePeriods: periods }), now)).toBe(
      700
    );
  });

  it("returns the next period's price once the range switches", () => {
    const now = new Date("2026-08-25T00:00:00.000Z");
    expect(resolveDistancePrice(distance({ pricePeriods: periods }), now)).toBe(
      900
    );
  });

  it("returns the earliest period's price before any period opens", () => {
    const now = new Date("2026-07-01T00:00:00.000Z");
    expect(resolveDistancePrice(distance({ pricePeriods: periods }), now)).toBe(
      700
    );
  });

  it("falls to the most recent started period between gaps", () => {
    const now = new Date("2026-08-20T12:00:00.000Z"); // gap between the two tiers
    expect(resolveDistancePrice(distance({ pricePeriods: periods }), now)).toBe(
      700
    );
  });

  it("returns the last period's price after all periods end", () => {
    const now = new Date("2026-10-01T00:00:00.000Z");
    expect(resolveDistancePrice(distance({ pricePeriods: periods }), now)).toBe(
      900
    );
  });

  it("prefers pricePeriods over a legacy flat fee", () => {
    const now = new Date("2026-07-25T00:00:00.000Z");
    expect(
      resolveDistancePrice(
        distance({ feeUah: 500, pricePeriods: periods }),
        now
      )
    ).toBe(700);
  });

  it("falls back to feeUah when there are no pricePeriods", () => {
    expect(resolveDistancePrice(distance({ feeUah: 400 }))).toBe(400);
  });

  it("falls back to the deprecated fee field", () => {
    expect(resolveDistancePrice(distance({ fee: 350 }))).toBe(350);
  });

  it("returns 0 when nothing is priced", () => {
    expect(resolveDistancePrice(distance())).toBe(0);
  });

  it("ignores empty pricePeriods and uses the flat fee", () => {
    expect(
      resolveDistancePrice(distance({ feeUah: 250, pricePeriods: [] }))
    ).toBe(250);
  });
});
