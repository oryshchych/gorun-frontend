import { describe, it, expect, beforeEach, afterEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import apiClient from "../client";
import {
  getAnalyticsByEvent,
  getAnalyticsDemographics,
  getAnalyticsSummary,
  getAnalyticsTimeseries,
} from "../analytics";

describe("Analytics API service", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it("unwraps the summary envelope and forwards preset", async () => {
    const summary = { totalRegistrations: 5, conversionRate: 0.5 };
    mock
      .onGet("/admin/analytics/summary")
      .reply(200, { success: true, code: "OK", data: summary });

    const result = await getAnalyticsSummary({ preset: "month" });

    expect(result).toEqual(summary);
    expect(mock.history.get[0]?.params).toEqual({ preset: "month" });
  });

  it("passes custom from/to and eventId, omitting empty values", async () => {
    mock.onGet("/admin/analytics/timeseries").reply(200, {
      success: true,
      code: "OK",
      data: { registrationsByDay: [] },
    });

    await getAnalyticsTimeseries({
      preset: "custom",
      from: "2026-06-01",
      to: "2026-06-07",
      eventId: "abc123",
    });

    expect(mock.history.get[0]?.params).toEqual({
      preset: "custom",
      from: "2026-06-01",
      to: "2026-06-07",
      eventId: "abc123",
    });
  });

  it("hits the demographics and by-event endpoints", async () => {
    mock
      .onGet("/admin/analytics/demographics")
      .reply(200, { success: true, code: "OK", data: { gender: [] } });
    mock
      .onGet("/admin/analytics/by-event")
      .reply(200, { success: true, code: "OK", data: [] });

    const demo = await getAnalyticsDemographics({ preset: "week" });
    const byEvent = await getAnalyticsByEvent({ preset: "week" });

    expect(demo).toEqual({ gender: [] });
    expect(byEvent).toEqual([]);
  });

  it("propagates a normalized error on failure", async () => {
    mock.onGet("/admin/analytics/summary").reply(500, {
      success: false,
      code: "ERROR_INTERNAL_SERVER",
      message: "boom",
    });

    await expect(
      getAnalyticsSummary({ preset: "month" })
    ).rejects.toBeDefined();
  });
});
