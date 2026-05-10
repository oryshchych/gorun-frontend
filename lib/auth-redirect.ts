/** Same-origin path only; falls back to home for the locale. */
export function safePostAuthRedirectPath(
  raw: string | null | undefined,
  locale: string
): string {
  const home = `/${locale}`;
  if (raw == null || raw === "") return home;
  const s = String(raw).trim();
  if (!s.startsWith("/") || s.startsWith("//")) return home;
  if (s.includes("://")) return home;
  return s;
}
