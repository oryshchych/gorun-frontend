import { describe, it, expect } from "vitest";
import { buildAnalyticsParams, presetToRange } from "../period";

const NOW = new Date("2026-06-10T00:00:00.000Z");

describe("presetToRange", () => {
  it("produces a rolling 7-day window for the week preset", () => {
    expect(presetToRange("week", undefined, NOW)).toEqual({
      from: "2026-06-03",
      to: "2026-06-10",
    });
  });

  it("honors an explicit custom range", () => {
    expect(
      presetToRange("custom", { from: "2026-01-01", to: "2026-01-31" }, NOW)
    ).toEqual({ from: "2026-01-01", to: "2026-01-31" });
  });

  it("falls back to the month window when custom dates are missing", () => {
    const { from, to } = presetToRange("custom", {}, NOW);
    expect(to).toBe("2026-06-10");
    expect(from).toBe("2026-05-11"); // 30 days back
  });
});

describe("buildAnalyticsParams", () => {
  it("omits from/to for non-custom presets", () => {
    expect(buildAnalyticsParams("month", { from: "x", to: "y" })).toEqual({
      preset: "month",
    });
  });

  it("includes custom dates and eventId when provided", () => {
    expect(
      buildAnalyticsParams(
        "custom",
        { from: "2026-06-01", to: "2026-06-07" },
        "ev1"
      )
    ).toEqual({
      preset: "custom",
      from: "2026-06-01",
      to: "2026-06-07",
      eventId: "ev1",
    });
  });
});
