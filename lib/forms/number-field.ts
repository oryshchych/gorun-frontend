/** RHF number fields: use "" while empty — `undefined` resets to defaultValues. */
export type NumberFieldValue = number | "";

export function formatNumberFieldValue(value: unknown): string {
  if (value === "" || value === null || value === undefined) {
    return "";
  }
  return String(value);
}

export function parseIntFieldInput(raw: string): NumberFieldValue {
  if (raw === "") return "";
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? "" : n;
}

export function parseFloatFieldInput(raw: string): NumberFieldValue {
  if (raw === "") return "";
  const n = parseFloat(raw);
  return Number.isNaN(n) ? "" : n;
}

/** Map "" to undefined before Zod number schemas run. */
export function emptyNumberToUndefined(val: unknown): unknown {
  if (val === "") return undefined;
  return val;
}
