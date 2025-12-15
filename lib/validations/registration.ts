import { z } from "zod";

export const registrationSchema = z.object({
  eventId: z.string().uuid("Invalid event ID format"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  surname: z
    .string()
    .min(2, "Surname must be at least 2 characters")
    .max(50, "Surname must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be at most 100 characters"),
  runningClub: z
    .string()
    .max(100, "Running club must be at most 100 characters")
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, "Invalid phone number format")
    .max(20, "Phone must be at most 20 characters")
    .optional(),
  promoCode: z
    .string()
    .max(50, "Promo code must be at most 50 characters")
    .optional(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
