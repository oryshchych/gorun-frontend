import { z } from 'zod';

export const eventSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  date: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === 'string' ? new Date(val) : val))
    .refine((date) => date > new Date(), {
      message: 'Event date must be in the future',
    }),
  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must not exceed 200 characters'),
  capacity: z
    .number()
    .int('Capacity must be a whole number')
    .positive('Capacity must be greater than 0')
    .max(10000, 'Capacity must not exceed 10,000'),
  imageUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
});

export const updateEventSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  date: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === 'string' ? new Date(val) : val))
    .refine((date) => date > new Date(), {
      message: 'Event date must be in the future',
    })
    .optional(),
  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must not exceed 200 characters')
    .optional(),
  capacity: z
    .number()
    .int('Capacity must be a whole number')
    .positive('Capacity must be greater than 0')
    .max(10000, 'Capacity must not exceed 10,000')
    .optional(),
  imageUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
});

export type EventFormData = z.infer<typeof eventSchema>;
export type UpdateEventFormData = z.infer<typeof updateEventSchema>;
