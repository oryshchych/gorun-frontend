import { z } from "zod";

type TranslationFunction = (key: string) => string;

export const createAdminPromoCodeSchema = (tv: TranslationFunction) =>
  z
    .object({
      code: z
        .string()
        .min(1, tv("codeRequired"))
        .max(50, tv("codeMax")),
      discountType: z.enum(["percentage", "fixed"]),
      discountValue: z.number(),
      eventId: z.string().min(1, tv("eventRequired")),
      isActive: z.boolean(),
      usageLimit: z.string(),
      expirationDate: z.string(),
      notes: z.string(),
    })
    .superRefine((data, ctx) => {
      if (!(data.discountValue > 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: tv("discountValuePositive"),
          path: ["discountValue"],
        });
      }
      if (data.discountType === "percentage" && data.discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: tv("percentageMax"),
          path: ["discountValue"],
        });
      }
      const limitRaw = data.usageLimit.trim();
      if (limitRaw !== "") {
        const n = parseInt(limitRaw, 10);
        if (!Number.isFinite(n) || n < 1 || String(n) !== limitRaw) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tv("usageLimitPositive"),
            path: ["usageLimit"],
          });
        }
      }
      if (data.expirationDate.trim() !== "") {
        const d = new Date(data.expirationDate);
        if (Number.isNaN(d.getTime())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tv("expirationInvalid"),
            path: ["expirationDate"],
          });
        }
      }
    });

export type AdminPromoCodeFormValues = z.infer<
  ReturnType<typeof createAdminPromoCodeSchema>
>;
