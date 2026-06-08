import { describe, it, expect } from "vitest";
import { analyticsKeys } from "../useAnalytics";

describe("analyticsKeys", () => {
  it("namespaces every key under admin/analytics", () => {
    expect(analyticsKeys.all).toEqual(["admin", "analytics"]);
    expect(analyticsKeys.summary({ preset: "month" })).toEqual([
      "admin",
      "analytics",
      "summary",
      { preset: "month" },
    ]);
  });

  it("produces distinct keys per params (cache isolation by eventId)", () => {
    const general = analyticsKeys.timeseries({ preset: "week" });
    const scoped = analyticsKeys.timeseries({ preset: "week", eventId: "ev1" });
    expect(general).not.toEqual(scoped);
  });
});
