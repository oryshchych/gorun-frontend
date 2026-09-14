import { describe, it, expect, beforeEach, afterEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import apiClient from "../client";
import {
  getRegistrations,
  getMyRegistrations,
  createRegistration,
  cancelRegistration,
  checkRegistration,
} from "../registrations";

describe("Registrations API Service", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe("getRegistrations", () => {
    it("should fetch paginated registrations", async () => {
      const mockResponse = {
        data: [
          {
            id: "1",
            eventId: "event-1",
            userId: "user-1",
            status: "confirmed",
          },
          {
            id: "2",
            eventId: "event-2",
            userId: "user-1",
            status: "confirmed",
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
      };

      mock.onGet("/registrations").reply(200, mockResponse);

      const result = await getRegistrations();

      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });
  });

  describe("getMyRegistrations", () => {
    it("should fetch current user registrations", async () => {
      const mockResponse = {
        data: [{ id: "1", eventId: "event-1", status: "confirmed" }],
        total: 1,
        page: 1,
        limit: 10,
      };

      mock.onGet("/registrations/my").reply(200, mockResponse);

      const result = await getMyRegistrations();

      expect(result).toEqual(mockResponse);
    });
  });

  describe("createRegistration", () => {
    it("should create new registration", async () => {
      const registrationData = { eventId: "event-1" };
      const mockResponse = {
        data: {
          id: "1",
          eventId: "event-1",
          userId: "user-1",
          status: "confirmed",
        },
      };

      mock.onPost("/registrations").reply(201, mockResponse);

      const result = await createRegistration(registrationData);

      expect(result.registration).toEqual(mockResponse.data);
    });

    it("should handle event full error", async () => {
      const registrationData = { eventId: "event-1" };
      mock.onPost("/registrations").reply(409, { message: "Event is full" });

      await expect(createRegistration(registrationData)).rejects.toMatchObject({
        message: "Event is full",
        statusCode: 409,
      });
    });

    it("should handle duplicate registration error", async () => {
      const registrationData = { eventId: "event-1" };
      mock
        .onPost("/registrations")
        .reply(409, { message: "Already registered" });

      await expect(createRegistration(registrationData)).rejects.toMatchObject({
        message: "Already registered",
        statusCode: 409,
      });
    });
  });

  describe("cancelRegistration", () => {
    it("should cancel registration", async () => {
      mock.onDelete("/registrations/1").reply(204);

      await expect(cancelRegistration("1")).resolves.toBeUndefined();
    });

    it("should handle cancel error", async () => {
      mock
        .onDelete("/registrations/999")
        .reply(404, { message: "Registration not found" });

      await expect(cancelRegistration("999")).rejects.toMatchObject({
        message: "Registration not found",
        statusCode: 404,
      });
    });
  });

  describe("checkRegistration", () => {
    it("returns isRegistered + registered distanceIds when registered", async () => {
      mock
        .onGet("/events/event-1/check-registration")
        .reply(200, { data: { isRegistered: true, distanceIds: ["d1"] } });

      const result = await checkRegistration("event-1");

      expect(result).toEqual({ isRegistered: true, distanceIds: ["d1"] });
    });

    it("returns empty distanceIds when not registered", async () => {
      mock
        .onGet("/events/event-1/check-registration")
        .reply(200, { data: { isRegistered: false, distanceIds: [] } });

      const result = await checkRegistration("event-1");

      expect(result).toEqual({ isRegistered: false, distanceIds: [] });
    });

    it("tolerates a missing distanceIds field", async () => {
      mock
        .onGet("/events/event-1/check-registration")
        .reply(200, { data: { isRegistered: true } });

      const result = await checkRegistration("event-1");

      expect(result).toEqual({ isRegistered: true, distanceIds: [] });
    });

    it("returns a safe default on error", async () => {
      mock.onGet("/events/event-1/check-registration").reply(500);

      const result = await checkRegistration("event-1");

      expect(result).toEqual({ isRegistered: false, distanceIds: [] });
    });
  });
});
