import { z } from "zod";

type TranslationFunction = (key: string) => string;

export const createRegistrationSchema = (t: TranslationFunction) =>
  z.object({
    eventId: z.string().min(1, t("eventIdInvalid")),
    name: z
      .string()
      .min(1, t("nameRequired"))
      .min(2, t("nameMin"))
      .max(50, t("nameMax")),
    surname: z
      .string()
      .min(1, t("surnameRequired"))
      .min(2, t("surnameMin"))
      .max(50, t("surnameMax")),
    email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
    city: z
      .string()
      .min(1, t("cityRequired"))
      .min(2, t("cityMin"))
      .max(100, t("cityMax")),
    runningClub: z
      .string()
      .max(100, t("runningClubMax"))
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    phone: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val === "") return true;
        return /^\+?[\d\s-()]+$/.test(val);
      }, t("phoneInvalid"))
      .refine((val) => {
        if (!val || val === "") return true;
        return val.length <= 20;
      }, t("phoneMax"))
      .transform((val) => (val === "" ? undefined : val)),
    promoCode: z
      .string()
      .max(50, t("promoCodeMax"))
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
  });

// Default schema for backward compatibility (uses English messages)
export const registrationSchema = z.object({
  eventId: z.string().min(1, "Invalid event ID"),
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  surname: z
    .string()
    .min(1, "Surname is required")
    .min(2, "Surname must be at least 2 characters")
    .max(50, "Surname must be at most 50 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  city: z
    .string()
    .min(1, "City is required")
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be at most 100 characters"),
  runningClub: z
    .string()
    .max(100, "Running club must be at most 100 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, "Invalid phone number format")
    .max(20, "Phone must be at most 20 characters")
    .optional()
    .or(z.literal("")),
  promoCode: z
    .string()
    .max(50, "Promo code must be at most 50 characters")
    .optional()
    .or(z.literal("")),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
