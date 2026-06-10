/**
 * i18n-aware Zod messages.
 *
 * Zod schemas run at module scope, far from any React `useTranslations()` hook,
 * so they cannot produce localized strings directly. Instead a schema emits a
 * stable translation *key* (plus optional interpolation values) encoded as a
 * JSON string via {@link zMsg}. The `FormMessage` primitive decodes it with
 * {@link decodeZodMessage} and translates it through next-intl at render time,
 * falling back to the raw string when the key is unknown — so schemas that
 * still emit plain English keep working unchanged.
 */

const MARKER = "__zI18n";

export type ZodMessageValues = Record<string, string | number>;

interface EncodedZodMessage {
  [MARKER]: true;
  key: string;
  values?: ZodMessageValues;
}

/** Encode a translation key (+ values) as a Zod `message` string. */
export function zMsg(key: string, values?: ZodMessageValues): string {
  const payload: EncodedZodMessage = {
    [MARKER]: true,
    key,
    ...(values ? { values } : {}),
  };
  return JSON.stringify(payload);
}

/** Decode a Zod `message` back into a key + values, or `null` if it is a plain string. */
export function decodeZodMessage(
  message: string
): { key: string; values?: ZodMessageValues } | null {
  if (!message || message[0] !== "{") return null;
  try {
    const parsed: unknown = JSON.parse(message);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      (parsed as Record<string, unknown>)[MARKER] === true &&
      typeof (parsed as Record<string, unknown>).key === "string"
    ) {
      const { key, values } = parsed as EncodedZodMessage;
      return { key, values };
    }
  } catch {
    return null;
  }
  return null;
}
