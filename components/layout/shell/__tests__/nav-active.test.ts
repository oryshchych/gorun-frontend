import { describe, expect, it } from "vitest";
import { isShellNavActive } from "../nav-active";

describe("isShellNavActive", () => {
  const base = "/uk/admin";

  it("matches dashboard exactly", () => {
    expect(
      isShellNavActive("/uk/admin/dashboard", base, "dashboard", true)
    ).toBe(true);
    expect(
      isShellNavActive("/uk/admin/dashboard/", base, "dashboard", true)
    ).toBe(true);
    expect(isShellNavActive("/uk/admin/events", base, "dashboard", true)).toBe(
      false
    );
  });

  it("matches nested routes for segment", () => {
    expect(isShellNavActive("/uk/admin/events/new", base, "events")).toBe(true);
    expect(
      isShellNavActive("/uk/admin/promo-codes/1/edit", base, "promo-codes")
    ).toBe(true);
  });

  it("matches profile root only when exact", () => {
    const profileBase = "/uk/profile";
    expect(isShellNavActive("/uk/profile", profileBase, "", true)).toBe(true);
    expect(
      isShellNavActive("/uk/profile/my-events", profileBase, "", true)
    ).toBe(false);
    expect(
      isShellNavActive("/uk/profile/my-events", profileBase, "my-events")
    ).toBe(true);
  });
});
