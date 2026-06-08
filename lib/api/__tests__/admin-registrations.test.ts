import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import MockAdapter from "axios-mock-adapter";
import apiClient from "../client";
import {
  cancelAdminRegistration,
  exportAdminRegistrationsCsv,
  getAdminRegistrationById,
  getAdminRegistrations,
} from "../admin-registrations";

const ok = <T>(data: T, pagination?: unknown) => ({
  success: true,
  code: "OK",
  data,
  ...(pagination ? { pagination } : {}),
});

describe("Admin Registrations API", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    localStorage.clear();
  });

  afterEach(() => {
    mock.restore();
  });

  it("fetches a paginated list and forwards search + status + paymentStatus params", async () => {
    mock.onGet("/admin/registrations").reply((config) => {
      expect(config.params).toMatchObject({
        page: 2,
        limit: 20,
        search: "olha",
        status: "confirmed",
        paymentStatus: "completed",
      });
      return [
        200,
        ok(
          [
            {
              id: "r1",
              fullName: "Olha Koval",
              email: "olha@example.com",
              status: "confirmed",
              paymentStatus: "completed",
              finalPrice: 500,
            },
          ],
          { page: 2, limit: 20, total: 1, totalPages: 1 }
        ),
      ];
    });

    const result = await getAdminRegistrations({
      page: 2,
      search: "olha",
      status: "confirmed",
      paymentStatus: "completed",
    });
    expect(result.items).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  it("omits optional params when not provided", async () => {
    mock.onGet("/admin/registrations").reply((config) => {
      expect(config.params.search).toBeUndefined();
      expect(config.params.status).toBeUndefined();
      expect(config.params.paymentStatus).toBeUndefined();
      return [200, ok([], { page: 1, limit: 20, total: 0, totalPages: 0 })];
    });
    await getAdminRegistrations({});
  });

  it("fetches a single registration detail", async () => {
    mock.onGet("/admin/registrations/r1").reply(
      200,
      ok({
        id: "r1",
        fullName: "Olha Koval",
        payments: [],
        kidsRegistrations: [],
      })
    );
    const reg = await getAdminRegistrationById("r1");
    expect(reg.id).toBe("r1");
  });

  it("posts to cancel a registration", async () => {
    mock.onPost("/admin/registrations/r1/cancel").reply(200, ok({}));
    await expect(cancelAdminRegistration("r1")).resolves.not.toThrow();
  });

  it("downloads a CSV export", async () => {
    const createObjectURL = vi.fn(() => "blob:registrations");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    mock
      .onGet("/admin/registrations/export")
      .reply(
        200,
        "Full name,Email,Phone,Event,Distance,Bib,Amount (UAH),Payment status,Status,Registered at"
      );

    await exportAdminRegistrationsCsv({ search: "olha", status: "confirmed" });

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});
