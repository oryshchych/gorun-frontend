import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import MockAdapter from "axios-mock-adapter";
import apiClient from "../client";
import {
  cancelUserRegistration,
  exportAdminUsersCsv,
  getAdminUserById,
  getAdminUsers,
  softDeleteAdminUser,
  updateAdminUser,
} from "../admin-users";

const ok = <T>(data: T, pagination?: unknown) => ({
  success: true,
  code: "OK",
  data,
  ...(pagination ? { pagination } : {}),
});

describe("Admin Users API", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    localStorage.clear();
  });

  afterEach(() => {
    mock.restore();
  });

  it("fetches a paginated list and forwards search + source params", async () => {
    mock.onGet("/admin/users").reply((config) => {
      expect(config.params).toMatchObject({
        page: 2,
        limit: 20,
        search: "olha",
        source: "registered",
      });
      return [
        200,
        ok(
          [
            {
              id: "u1",
              fullName: "Olha Koval",
              firstName: "Olha",
              lastName: "Koval",
              email: "olha@example.com",
              phone: null,
              city: null,
              registrationsCount: 2,
              createdAt: "2026-01-01T00:00:00.000Z",
            },
          ],
          { page: 2, limit: 20, total: 1, totalPages: 1 }
        ),
      ];
    });

    const result = await getAdminUsers({
      page: 2,
      search: "olha",
      source: "registered",
    });
    expect(result.items).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  it("omits source param when 'all'", async () => {
    mock.onGet("/admin/users").reply((config) => {
      expect(config.params.source).toBeUndefined();
      return [200, ok([], { page: 1, limit: 20, total: 0, totalPages: 0 })];
    });
    await getAdminUsers({ source: "all" });
  });

  it("fetches a single user detail", async () => {
    mock
      .onGet("/admin/users/u1")
      .reply(
        200,
        ok({ id: "u1", name: "Olha", registrations: [], payments: [] })
      );
    const user = await getAdminUserById("u1");
    expect(user.id).toBe("u1");
  });

  it("sends a PATCH for updates", async () => {
    mock.onPatch("/admin/users/u1").reply((config) => {
      expect(JSON.parse(config.data)).toMatchObject({ city: "Kyiv" });
      return [200, ok({ id: "u1", name: "Olha", city: "Kyiv" })];
    });
    const updated = await updateAdminUser("u1", { city: "Kyiv" });
    expect(updated.city).toBe("Kyiv");
  });

  it("sends a DELETE for soft-delete", async () => {
    mock
      .onDelete("/admin/users/u1")
      .reply(200, ok({ id: "u1", deletedAt: "2026-06-07T00:00:00.000Z" }));
    const res = await softDeleteAdminUser("u1");
    expect(res.id).toBe("u1");
  });

  it("posts to cancel a registration", async () => {
    mock
      .onPost("/admin/users/u1/registrations/r1/cancel")
      .reply(
        200,
        ok({ registration: { id: "r1", status: "cancelled" }, payments: [] })
      );
    const res = await cancelUserRegistration("u1", "r1");
    expect(res.registration.status).toBe("cancelled");
  });

  it("downloads a CSV export", async () => {
    const createObjectURL = vi.fn(() => "blob:users");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL,
      revokeObjectURL,
    });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    mock
      .onGet("/admin/users/export")
      .reply(200, "Full name,Phone,Email,City,Registrations,Created");

    await exportAdminUsersCsv({ search: "olha" });

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});
