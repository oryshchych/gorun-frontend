import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import type { UserGender } from "@/types/auth";

type TranslationFunction = (key: string) => string;

const GENDERS: UserGender[] = ["female", "male", "other", "prefer_not_to_say"];

export const createProfileSchema = (t: TranslationFunction) =>
  z.object({
    firstName: z
      .string()
      .min(1, t("nameRequired"))
      .min(2, t("nameMin"))
      .max(50, t("nameMax")),
    lastName: z
      .string()
      .min(1, t("surnameRequired"))
      .min(2, t("surnameMin"))
      .max(50, t("surnameMax")),
    phone: z
      .string()
      .min(1, t("phoneRequired"))
      .refine((val) => isValidPhoneNumber(val), {
        message: t("phoneInvalid"),
      }),
    dateOfBirth: z.string().refine(
      (val) => {
        if (val === "") return true;
        const d = new Date(val);
        if (Number.isNaN(d.getTime())) return false;
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        return d <= endOfToday;
      },
      { message: t("dateOfBirthFuture") }
    ),
    gender: z
      .string()
      .refine((val) => val === "" || GENDERS.includes(val as UserGender), {
        message: t("genderInvalid"),
      }),
    emergencyContactName: z.string().max(100, t("emergencyNameMax")),
    emergencyContactPhone: z
      .string()
      .refine((val) => val === "" || isValidPhoneNumber(val), {
        message: t("phoneInvalid"),
      }),
    runningClub: z.string().max(100, t("runningClubMax")),
    city: z.string().max(100, t("cityMax")),
    deliveryAddress: z.string().max(2000, t("deliveryAddressMax")),
  });

export type ProfileFormData = z.infer<ReturnType<typeof createProfileSchema>>;
