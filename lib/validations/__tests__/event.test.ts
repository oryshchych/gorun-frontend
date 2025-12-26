import { describe, it, expect, beforeEach, vi } from "vitest";
import { eventSchema, updateEventSchema } from "../event";

const baseTranslations = {
  title: { en: "Tech Conference", uk: "Tech Conference" },
  description: {
    en: "A great tech conference for developers",
    uk: "A great tech conference for developers",
  },
  location: { en: "Kyiv, Ukraine", uk: "Kyiv, Ukraine" },
  date: { en: "December 31, 2024 at 10:00 AM", uk: "31 грудня 2024 10:00" },
};

const buildEventData = (overrides: Record<string, any> = {}) => ({
  translations: JSON.parse(JSON.stringify(baseTranslations)),
  date: new Date("2024-12-31T10:00:00Z"),
  capacity: 100,
  imageUrl: {
    portrait: "https://example.com/image-portrait.jpg",
    landscape: "https://example.com/image-landscape.jpg",
  },
  ...overrides,
});

describe("Event Validation Schemas", () => {
  beforeEach(() => {
    // Mock current date to ensure consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
  });

  describe("eventSchema", () => {
    it("should validate correct event data", () => {
      const result = eventSchema.safeParse(buildEventData());
      expect(result.success).toBe(true);
    });

    it("should validate event data without optional imageUrl", () => {
      const result = eventSchema.safeParse(
        buildEventData({ imageUrl: undefined })
      );
      expect(result.success).toBe(true);
    });

    it("should validate event data with empty imageUrl fields", () => {
      const result = eventSchema.safeParse(
        buildEventData({ imageUrl: { portrait: "", landscape: "" } })
      );
      expect(result.success).toBe(true);
    });

    it("should reject title shorter than 3 characters", () => {
      const invalidData = buildEventData();
      invalidData.translations.title.en = "AB";

      const result = eventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Title must be at least 3 characters"
        );
      }
    });

    it("should reject past date", () => {
      const result = eventSchema.safeParse(
        buildEventData({ date: new Date("2023-01-01T10:00:00Z") })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Event date must be in the future"
        );
      }
    });

    it("should accept date as string and transform to Date", () => {
      const result = eventSchema.safeParse(
        buildEventData({ date: "2024-12-31T10:00:00Z" })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.date).toBeInstanceOf(Date);
      }
    });

    it("should reject non-integer capacity", () => {
      const result = eventSchema.safeParse(buildEventData({ capacity: 100.5 }));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Capacity must be a whole number"
        );
      }
    });

    it("should reject zero or negative capacity", () => {
      const result = eventSchema.safeParse(buildEventData({ capacity: 0 }));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Capacity must be greater than 0"
        );
      }
    });

    it("should reject invalid imageUrl format", () => {
      const result = eventSchema.safeParse(
        buildEventData({
          imageUrl: { portrait: "not-a-url", landscape: "" },
        })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Must be a valid URL");
      }
    });
  });

  describe("updateEventSchema", () => {
    it("should validate partial update with only title", () => {
      const validData = {
        translations: {
          title: { en: "Updated Conference" },
        },
      };

      const result = updateEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate partial update with image fields", () => {
      const validData = {
        imageUrl: { portrait: "https://example.com/new.jpg" },
        capacity: 200,
      };

      const result = updateEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate empty update object", () => {
      const result = updateEventSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should reject invalid image URL in update", () => {
      const result = updateEventSchema.safeParse({
        imageUrl: { landscape: "bad-url" },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Must be a valid URL");
      }
    });
  });
});
