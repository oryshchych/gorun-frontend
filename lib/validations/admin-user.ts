import { z } from "zod";

type TranslationFunction = (key: string) => string;

const e164Regex = /^\+[1-9]\d{6,14}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const GENDER_OPTIONS = [
  "female",
  "male",
  "other",
  "prefer_not_to_say",
] as const;

/**
 * Profile/contact edit form. All fields are strings (empty = "clear"); the
 * form maps empty optional fields to null when building the request payload.
 */
export const createAdminUserSchema = (tv: TranslationFunction) =>
  z.object({
    firstName: z.string().max(100, tv("maxLength")),
    lastName: z.string().max(100, tv("maxLength")),
    email: z.string().min(1, tv("emailRequired")).email(tv("emailInvalid")),
    phone: z
      .string()
      .refine((v) => v.trim() === "" || e164Regex.test(v.trim()), {
        message: tv("phoneInvalid"),
      }),
    city: z.string().max(100, tv("maxLength")),
    runningClub: z.string().max(200, tv("maxLength")),
    dateOfBirth: z
      .string()
      .refine((v) => v.trim() === "" || dateRegex.test(v.trim()), {
        message: tv("dateInvalid"),
      }),
    gender: z.enum(["", ...GENDER_OPTIONS]),
    emergencyContactName: z.string().max(200, tv("maxLength")),
    emergencyContactPhone: z
      .string()
      .refine((v) => v.trim() === "" || e164Regex.test(v.trim()), {
        message: tv("phoneInvalid"),
      }),
    deliveryAddress: z.string().max(2000, tv("maxLength")),
  });

export type AdminUserFormValues = z.infer<
  ReturnType<typeof createAdminUserSchema>
>;
