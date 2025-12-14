import { describe, it, expect, beforeEach, afterEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import apiClient from "../client";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../events";

describe("Events API Service", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe("getEvents", () => {
    it("should fetch paginated events", async () => {
      const mockResponse = {
        data: [
          { id: "1", title: "Event 1", capacity: 100, registeredCount: 50 },
          { id: "2", title: "Event 2", capacity: 200, registeredCount: 100 },
        ],
        total: 2,
        page: 1,
        limit: 10,
      };

      mock.onGet("/events").reply(200, mockResponse);

      const result = await getEvents();

      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it("should fetch events with filters", async () => {
      const params = { page: 2, limit: 5, search: "tech" };
      mock.onGet("/events").reply((config) => {
        expect(config.params).toMatchObject(params);
        return [200, { data: [], total: 0, page: 2, limit: 5 }];
      });

      await getEvents(params);
    });
  });

  describe("getEventById", () => {
    it("should fetch single event by ID", async () => {
      const mockEvent = { id: "1", title: "Event 1", capacity: 100 };
      mock.onGet("/events/1").reply(200, { data: mockEvent });

      const result = await getEventById("1");

      expect(result).toEqual(mockEvent);
    });

    it("should handle event not found error", async () => {
      mock.onGet("/events/999").reply(404, { message: "Event not found" });

      await expect(getEventById("999")).rejects.toMatchObject({
        message: "Event not found",
        statusCode: 404,
      });
    });
  });

  describe("createEvent", () => {
    it("should create new event", async () => {
      const eventData = {
        title: "New Event",
        description: "Event description",
        date: new Date("2024-12-31"),
        location: "Kyiv",
        capacity: 100,
      };
      const mockResponse = {
        data: {
          id: "1",
          title: eventData.title,
          description: eventData.description,
          date: eventData.date.toISOString(),
          location: eventData.location,
          capacity: eventData.capacity,
        },
      };

      mock.onPost("/events").reply(201, mockResponse);

      const result = await createEvent(eventData);

      expect(result.id).toBe("1");
      expect(result.title).toBe(eventData.title);
    });

    it("should handle validation error", async () => {
      const invalidData = { title: "AB" } as any;
      mock.onPost("/events").reply(400, { message: "Validation failed" });

      await expect(createEvent(invalidData)).rejects.toMatchObject({
        message: "Validation failed",
        statusCode: 400,
      });
    });
  });

  describe("updateEvent", () => {
    it("should update existing event", async () => {
      const updateData = { title: "Updated Event" };
      const mockResponse = { data: { id: "1", ...updateData } };

      mock.onPut("/events/1").reply(200, mockResponse);

      const result = await updateEvent("1", updateData);

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("deleteEvent", () => {
    it("should delete event", async () => {
      mock.onDelete("/events/1").reply(204);

      await expect(deleteEvent("1")).resolves.toBeUndefined();
    });

    it("should handle delete error", async () => {
      mock.onDelete("/events/999").reply(404, { message: "Event not found" });

      await expect(deleteEvent("999")).rejects.toMatchObject({
        message: "Event not found",
        statusCode: 404,
      });
    });
  });
});
