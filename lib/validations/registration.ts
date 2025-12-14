import { z } from "zod";

export const registrationSchema = z.object({
  eventId: z.string().uuid("Invalid event ID format"),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
