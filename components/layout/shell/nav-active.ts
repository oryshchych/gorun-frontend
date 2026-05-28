function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

/** Returns whether a shell nav segment matches the current pathname. */
export function isShellNavActive(
  pathname: string,
  basePath: string,
  segment: string,
  exactOnly = false
): boolean {
  const path = normalizePath(pathname);
  const base = normalizePath(basePath);
  const href = segment ? `${base}/${segment}` : base;

  if (exactOnly || segment === "dashboard") {
    return path === href;
  }
  if (segment === "") {
    return path === base;
  }
  return path === href || path.startsWith(`${href}/`);
}
