import { describe, it, expect, beforeEach, afterEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import apiClient from "../client";
import { validatePromoCode } from "../promo-codes";

describe("Promo Codes API Service", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it("should validate and normalize promo code", async () => {
    const mockResponse = {
      data: {
        code: "DISCOUNT10",
        discountType: "percentage",
        discountValue: 10,
        isValid: true,
      },
      success: true,
    };

    mock.onPost("/promo-codes/validate").reply((config) => {
      const payload = JSON.parse(config.data);
      expect(payload.code).toBe("DISCOUNT10");
      return [200, mockResponse];
    });

    const result = await validatePromoCode({
      code: " discount10 ",
      eventId: "507f1f77bcf86cd799439011",
    });

    expect(result).toEqual(mockResponse.data);
  });

  it("should reject invalid payload length", async () => {
    await expect(validatePromoCode({ code: "" })).rejects.toMatchObject({
      message: "Validation error",
      statusCode: 400,
    });
  });

  it("should reject invalid eventId format", async () => {
    await expect(
      validatePromoCode({ code: "SPRING", eventId: "not-valid" })
    ).rejects.toMatchObject({
      message: "Validation error",
      statusCode: 400,
    });
  });

  it("should surface server validation errors", async () => {
    mock.onPost("/promo-codes/validate").reply(422, {
      message: "Validation error",
      errors: { promoCode: ["Promo code usage limit reached"] },
    });

    await expect(validatePromoCode({ code: "LIMIT10" })).rejects.toMatchObject({
      message: "Validation error",
      statusCode: 422,
    });
  });

  it("should surface rate limit errors", async () => {
    mock.onPost("/promo-codes/validate").reply(429, {
      message: "Too many requests",
    });

    await expect(validatePromoCode({ code: "FAST10" })).rejects.toMatchObject({
      message: "Too many requests",
      statusCode: 429,
    });
  });
});
