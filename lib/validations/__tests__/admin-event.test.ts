import { describe, it, expect } from "vitest";
import {
  adminEventFormSchema,
  adminFormToCreatePayload,
  eventToAdminFormDefaults,
} from "../admin-event";

const minimalTranslations = {
  title: { en: "Test Event", uk: "Тестова подія" },
  description: {
    en: "A long enough English description for validation rules.",
    uk: "Достатньо довгий український опис для правил валідації.",
  },
  location: { en: "Kyiv", uk: "Київ" },
  date: { en: "July 1, 2024", uk: "1 липня 2024" },
};

const buildForm = (overrides: Record<string, unknown> = {}) =>
  ({
    translations: minimalTranslations,
    slug: "",
    shortDesc: "",
    venue: "",
    city: "",
    latitude: null,
    longitude: null,
    date: new Date("2020-01-15T10:00:00Z"),
    dateLabel: "",
    timeLabel: "",
    capacity: 100,
    basePrice: 0,
    fee: "",
    imageUrl: { portrait: "", landscape: "" },
    cover: "",
    spots: { taken: 0, total: 100 },
    gallery: [] as { url: string }[],
    perks: [] as { line: string }[],
    afu: "",
    schedule: [],
    distances: [],
    kidsDistances: [],
    speakers: [],
    status: "",
    isActive: true,
    lifecyclePhase: "FINISHED",
    ...overrides,
  }) as const;

describe("adminEventFormSchema", () => {
  it("accepts a past event date (finished / historical)", () => {
    const result = adminEventFormSchema.safeParse(buildForm());
    expect(result.success).toBe(true);
  });

  it("rejects invalid capacity", () => {
    const result = adminEventFormSchema.safeParse(
      buildForm({ capacity: 0 })
    );
    expect(result.success).toBe(false);
  });

  it("accepts optional image URLs as empty strings", () => {
    const result = adminEventFormSchema.safeParse(
      buildForm({
        imageUrl: { portrait: "", landscape: "" },
      })
    );
    expect(result.success).toBe(true);
  });

  it("rejects malformed image URL", () => {
    const result = adminEventFormSchema.safeParse(
      buildForm({
        imageUrl: { portrait: "not-a-url", landscape: "" },
      })
    );
    expect(result.success).toBe(false);
  });
});

describe("adminFormToCreatePayload", () => {
  it("strips empty schedule rows and builds program", () => {
    const parsed = adminEventFormSchema.parse(
      buildForm({
        schedule: [
          { time: "07:00", what: "Start" },
          { time: "  ", what: "   " },
        ],
      })
    );
    const payload = adminFormToCreatePayload(parsed);
    expect(payload.schedule).toEqual([{ time: "07:00", what: "Start" }]);
    expect(payload.program).toEqual([["07:00", "Start"]]);
  });

  it("omits imageUrl when both sides empty", () => {
    const parsed = adminEventFormSchema.parse(buildForm());
    const payload = adminFormToCreatePayload(parsed);
    expect(payload.imageUrl).toBeUndefined();
  });
});

describe("eventToAdminFormDefaults", () => {
  it("maps program to schedule when schedule missing", () => {
    const defaults = eventToAdminFormDefaults({
      date: new Date("2025-06-01"),
      capacity: 50,
      program: [["08:00", "Warm-up"]],
    });
    expect(defaults.schedule).toEqual([{ time: "08:00", what: "Warm-up" }]);
  });

  it("defaults isActive and lifecyclePhase", () => {
    const defaults = eventToAdminFormDefaults({
      date: new Date(),
      capacity: 10,
    });
    expect(defaults.isActive).toBe(true);
    expect(defaults.lifecyclePhase).toBe("FUTURE");
  });
});
