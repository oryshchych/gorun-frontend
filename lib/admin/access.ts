import type { AdminRole, User } from "@/types/auth";

export function isAdminUser(user: User | null | undefined): boolean {
  return user?.isAdmin === true;
}

/**
 * Reserved for future permission checks. Today `admin` and `super_admin`
 * behave the same for all admin features.
 */
export function isSuperAdminUser(user: User | null | undefined): boolean {
  return user?.adminRole === "super_admin";
}

export function canAccessPromoCodesAdmin(
  _user: User | null | undefined
): boolean {
  return isAdminUser(_user);
}

export function getAdminRole(user: User | null | undefined): AdminRole | null {
  if (!isAdminUser(user)) return null;
  return user?.adminRole ?? "admin";
}
