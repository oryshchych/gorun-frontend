import { describe, expect, it } from "vitest";
import { isAdminUser, canAccessPromoCodesAdmin, getAdminRole } from "../access";
import type { User } from "../../../types/auth";

describe("admin access helpers", () => {
  it("isAdminUser is true only when isAdmin is explicitly true", () => {
    expect(isAdminUser(null)).toBe(false);
    expect(isAdminUser(undefined)).toBe(false);
    expect(isAdminUser({ id: "1", email: "a@b.c" } as User)).toBe(false);
    expect(isAdminUser({ id: "1", email: "a@b.c", isAdmin: false } as User)).toBe(
      false
    );
    expect(
      isAdminUser({
        id: "1",
        email: "a@b.c",
        isAdmin: true,
        adminRole: "admin",
      } as User)
    ).toBe(true);
  });

  it("canAccessPromoCodesAdmin matches isAdminUser for now", () => {
    const u = { id: "1", email: "a@b.c", isAdmin: true } as User;
    expect(canAccessPromoCodesAdmin(u)).toBe(isAdminUser(u));
  });

  it("getAdminRole returns role for admins and null otherwise", () => {
    expect(getAdminRole(null)).toBeNull();
    expect(
      getAdminRole({
        id: "1",
        email: "a@b.c",
        isAdmin: true,
        adminRole: "super_admin",
      } as User)
    ).toBe("super_admin");
    expect(
      getAdminRole({
        id: "1",
        email: "a@b.c",
        isAdmin: true,
      } as User)
    ).toBe("admin");
  });
});
