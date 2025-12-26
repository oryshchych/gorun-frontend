import { z } from "zod";

const translatedString = (min: number, max: number, field: string) =>
  z
    .string()
    .min(min, `${field} must be at least ${min} characters`)
    .max(max, `${field} must not exceed ${max} characters`);

const translationFieldSchema = {
  title: z.object({
    en: translatedString(3, 100, "Title"),
    uk: translatedString(3, 100, "Title"),
  }),
  description: z.object({
    en: translatedString(10, 2000, "Description"),
    uk: translatedString(10, 2000, "Description"),
  }),
  location: z.object({
    en: translatedString(3, 200, "Location"),
    uk: translatedString(3, 200, "Location"),
  }),
  date: z.object({
    en: z.string().min(1, "Date (EN) is required"),
    uk: z.string().min(1, "Date (UK) is required"),
  }),
};

const imageUrlSchema = z
  .object({
    portrait: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
    landscape: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
  })
  .optional();

export const eventSchema = z.object({
  translations: z.object(translationFieldSchema),
  date: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === "string" ? new Date(val) : val))
    .refine((date) => date > new Date(), {
      message: "Event date must be in the future",
    }),
  capacity: z
    .number()
    .int("Capacity must be a whole number")
    .positive("Capacity must be greater than 0")
    .max(10000, "Capacity must not exceed 10,000"),
  imageUrl: imageUrlSchema,
  basePrice: z
    .number()
    .nonnegative("Base price must be 0 or greater")
    .max(1_000_000, "Base price is too high")
    .optional(),
});

export const updateEventSchema = z.object({
  translations: z
    .object({
      title: translationFieldSchema.title.partial(),
      description: translationFieldSchema.description.partial(),
      location: translationFieldSchema.location.partial(),
      date: translationFieldSchema.date.partial(),
    })
    .partial(),
  date: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === "string" ? new Date(val) : val))
    .refine((date) => date > new Date(), {
      message: "Event date must be in the future",
    })
    .optional(),
  capacity: z
    .number()
    .int("Capacity must be a whole number")
    .positive("Capacity must be greater than 0")
    .max(10000, "Capacity must not exceed 10,000")
    .optional(),
  imageUrl: imageUrlSchema,
  basePrice: z
    .number()
    .nonnegative("Base price must be 0 or greater")
    .max(1_000_000, "Base price is too high")
    .optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;
export type UpdateEventFormData = z.infer<typeof updateEventSchema>;
