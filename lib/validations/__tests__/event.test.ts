import { describe, it, expect, beforeEach, vi } from "vitest";
import { eventSchema, updateEventSchema } from "../event";

describe("Event Validation Schemas", () => {
  beforeEach(() => {
    // Mock current date to ensure consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
  });

  describe("eventSchema", () => {
    it("should validate correct event data", () => {
      const validData = {
        title: "Tech Conference",
        description: "A great tech conference for developers",
        date: new Date("2024-12-31T10:00:00Z"),
        location: "Kyiv, Ukraine",
        capacity: 100,
        imageUrl: "https://example.com/image.jpg",
      };

      const result = eventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate event data without optional imageUrl", () => {
      const validData = {
        title: "Tech Conference",
        description: "A great tech conference for developers",
        date: new Date("2024-12-31T10:00:00Z"),
        location: "Kyiv, Ukraine",
        capacity: 100,
      };

      const result = eventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate event data with empty string imageUrl", () => {
      const validData = {
        title: "Tech Conference",
        description: "A great tech conference for developers",
        date: new Date("2024-12-31T10:00:00Z"),
        location: "Kyiv, Ukraine",
        capacity: 100,
        imageUrl: "",
      };

      const result = eventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject title shorter than 3 characters", () => {
      const invalidData = {
        title: "AB",
        description: "A great tech conference for developers",
        date: new Date("2024-12-31T10:00:00Z"),
        location: "Kyiv, Ukraine",
        capacity: 100,
      };

      const result = eventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Title must be at least 3 characters"
        );
      }
    });

    it("should reject title longer than 100 characters", () => {
      const invalidData = {
        title: "a".repeat(101),
        description: "A great tech conference for developers",
        date: new Date("2024-12-31T10:00:00Z"),
        location: "Kyiv, Ukraine",
        capacity: 100,
      };

      const result = eventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Title must not exceed 100 characters"
        );
      }
    });

    it("should reject description shorter than 10 characters", () => {
      const invalidData = {
        title: "Tech Conference",
        description: "Short",
        date: new Date("2024-12-31T10:00:00Z"),
        location: "Kyiv, Ukraine",
        capacity: 100,
      };

      const result = eventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Description must be at least 10 characters"
        );
      }
    });

    it("should reject description longer than 2000 characters", () => {
      const invalidData = {
        title: "Tech Conference",
        description: "a".repeat(2001),
        date: new Date("2024-12-31T10:00:00Z"),
        location: "Kyiv, Ukraine",
        capacity: 100,
      };

      const result = eventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Description must not exceed 2000 characters"
        );
      }
    });

    it("should reject past date", () => {
      const invalidData = {
        title: "Tech Conference",
        description: "A great tech conference for developers",
        date: new Date("2023-01-01T10:00:00Z"),
        location: "Kyiv, Ukraine",
        capacity: 100,
      };

      const result = eventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Event date must be in the future"
        );
      }
    });

    it("should accept date as string and transform to Date", () => {
      const validData = {
        title: "Tech Conference",
        description: "A great tech conference for developers",
        date: "2024-12-31T10:00:00Z",
        location: "Kyiv, Ukraine",
        capacity: 100,
      };

      const result = eventSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.date).toBeInstanceOf(Date);
      }
    });

    it("should reject location shorter than 3 characters", () => {
      const invalidData = {
        title: "Tech Conference",
        description: "A great tech conference for developers",
        date: new Date("2024-12-31T10:00:00Z"),
        location: "AB",
        capacity: 100,
      };

      const result = eventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Location must be at least 3 characters"
        );
      }
    });

    it("should reject location longer than 200 characters", () => {
      const invalidData = {
        title: "Tech Conference",
        description: "A great tech conference for developers",
        date: new Date("2024-12-31T10:00:00Z"),
        location: "a".repeat(201),
        capacity: 100,
      };

      const result = eventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Location must not exceed 200 characters"
        );
      }
    });

    it("should reject non-integer capacity", () => {
      const invalidData = {
        title: "Tech Conference",
        description: "A great tech conference for developers",
        date: new Date("2024-12-31T10:00:00Z"),
        location: "Kyiv, Ukraine",
        capacity: 100.5,
      };

      const result = eventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Capacity must be a whole number"
        );
      }
    });

    it("should reject zero or negative capacity", () => {
      const invalidData = {
        title: "Tech Conference",
        description: "A great tech conference for developers",
        date: new Date("2024-12-31T10:00:00Z"),
        location: "Kyiv, Ukraine",
        capacity: 0,
      };

      const result = eventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Capacity must be greater than 0"
        );
      }
    });

    it("should reject capacity exceeding 10000", () => {
      const invalidData = {
        title: "Tech Conference",
        description: "A great tech conference for developers",
        date: new Date("2024-12-31T10:00:00Z"),
        location: "Kyiv, Ukraine",
        capacity: 10001,
      };

      const result = eventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Capacity must not exceed 10,000"
        );
      }
    });

    it("should reject invalid imageUrl format", () => {
      const invalidData = {
        title: "Tech Conference",
        description: "A great tech conference for developers",
        date: new Date("2024-12-31T10:00:00Z"),
        location: "Kyiv, Ukraine",
        capacity: 100,
        imageUrl: "not-a-url",
      };

      const result = eventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Must be a valid URL");
      }
    });
  });

  describe("updateEventSchema", () => {
    it("should validate partial update with only title", () => {
      const validData = {
        title: "Updated Conference",
      };

      const result = updateEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate partial update with multiple fields", () => {
      const validData = {
        title: "Updated Conference",
        capacity: 200,
      };

      const result = updateEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate empty update object", () => {
      const validData = {};

      const result = updateEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid title in partial update", () => {
      const invalidData = {
        title: "AB",
      };

      const result = updateEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Title must be at least 3 characters"
        );
      }
    });
  });
});
