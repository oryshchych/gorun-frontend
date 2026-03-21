import type { User } from "@/types/auth";

/** Display name for header / UI from profile fields. */
export function getUserDisplayName(
  user:
    | Pick<User, "name" | "firstName" | "lastName" | "email">
    | null
    | undefined
): string {
  if (!user) return "";
  const fromParts = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return (user.name?.trim() || fromParts || user.email || "").trim();
}
