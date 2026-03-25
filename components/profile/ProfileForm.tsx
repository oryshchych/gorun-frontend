"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile } from "@/lib/api/auth";
import {
  createProfileSchema,
  type ProfileFormData,
} from "@/lib/validations/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedFormField } from "@/components/shared/AnimatedFormField";
import { handleApiError, showSuccessToast } from "@/lib/error-handler";

const GENDER_VALUES = ["female", "male", "other", "prefer_not_to_say"] as const;

function userToFormDefaults(user: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  runningClub?: string | null;
  city?: string | null;
  deliveryAddress?: string | null;
}): ProfileFormData {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    phone: user.phone ?? "",
    dateOfBirth: user.dateOfBirth ?? "",
    gender:
      user.gender &&
      GENDER_VALUES.includes(user.gender as (typeof GENDER_VALUES)[number])
        ? user.gender
        : "",
    emergencyContactName: user.emergencyContactName ?? "",
    emergencyContactPhone: user.emergencyContactPhone ?? "",
    runningClub: user.runningClub ?? "",
    city: user.city ?? "",
    deliveryAddress: user.deliveryAddress ?? "",
  };
}

export function ProfileForm() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth");
  const tValidation = useTranslations("validation");
  const tApiCodes = useTranslations("apiCodes");

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(createProfileSchema(tValidation)),
    defaultValues: user
      ? userToFormDefaults(user)
      : {
          firstName: "",
          lastName: "",
          phone: "",
          dateOfBirth: "",
          gender: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
          runningClub: "",
          city: "",
          deliveryAddress: "",
        },
  });

  useEffect(() => {
    if (!user) return;
    form.reset(userToFormDefaults(user));
  }, [user, form]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await updateProfile({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone,
        dateOfBirth: data.dateOfBirth.trim() || null,
        gender: data.gender.trim() || null,
        emergencyContactName: data.emergencyContactName.trim() || null,
        emergencyContactPhone: data.emergencyContactPhone.trim() || null,
        runningClub: data.runningClub.trim() || null,
        city: data.city.trim() || null,
        deliveryAddress: data.deliveryAddress.trim() || null,
      });
      await refreshUser();
      showSuccessToast(
        "SUCCESS_AUTH_PROFILE_UPDATED",
        t("profileUpdatedTitle"),
        tApiCodes
      );
    } catch (error: unknown) {
      handleApiError(error, t("profileUpdateFailed"), tApiCodes);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">{t("formTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("formSubtitle")}
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-6 md:gap-y-4 max-w-4xl xl:max-w-5xl"
          aria-label={t("formAriaLabel")}
        >
          <FormItem>
            <Label htmlFor="profile-email">{tAuth("email")}</Label>
            <Input
              id="profile-email"
              type="email"
              value={user.email}
              disabled
              readOnly
              autoComplete="email"
              aria-readonly="true"
              className="break-all"
            />
            <p className="text-xs text-muted-foreground">
              {t("emailCannotChange")}
            </p>
          </FormItem>

          <FormField
            control={form.control}
            name="lastName"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="profile-last-name">
                    {tAuth("lastName")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="profile-last-name"
                      type="text"
                      disabled={isLoading}
                      autoComplete="family-name"
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </AnimatedFormField>
            )}
          />

          <FormField
            control={form.control}
            name="firstName"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="profile-first-name">
                    {tAuth("firstName")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="profile-first-name"
                      type="text"
                      disabled={isLoading}
                      autoComplete="given-name"
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </AnimatedFormField>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="profile-dob">
                    {t("dateOfBirth")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="profile-dob"
                      type="date"
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </AnimatedFormField>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel>{t("gender")}</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={(v) =>
                      field.onChange(v === "unspecified" ? "" : v)
                    }
                    value={
                      field.value &&
                      GENDER_VALUES.includes(
                        field.value as (typeof GENDER_VALUES)[number]
                      )
                        ? field.value
                        : "unspecified"
                    }
                  >
                    <FormControl>
                      <SelectTrigger
                        id="profile-gender"
                        aria-invalid={!!fieldState.error}
                      >
                        <SelectValue placeholder={t("genderPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unspecified">
                        {t("genderPlaceholder")}
                      </SelectItem>
                      <SelectItem value="female">
                        {t("genderFemale")}
                      </SelectItem>
                      <SelectItem value="male">{t("genderMale")}</SelectItem>
                      <SelectItem value="other">{t("genderOther")}</SelectItem>
                      <SelectItem value="prefer_not_to_say">
                        {t("genderPreferNot")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              </AnimatedFormField>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="profile-phone">
                    {tAuth("phone")}
                  </FormLabel>
                  <FormControl>
                    <PhoneInput
                      id="profile-phone"
                      international
                      defaultCountry="UA"
                      placeholder={tAuth("phonePlaceholder")}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                      className={fieldState.error ? "phone-error" : ""}
                      aria-invalid={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </AnimatedFormField>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyContactName"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="profile-emergency-name">
                    {t("emergencyContactName")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="profile-emergency-name"
                      type="text"
                      disabled={isLoading}
                      autoComplete="name"
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </AnimatedFormField>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyContactPhone"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="profile-emergency-phone">
                    {t("emergencyContactPhone")}
                  </FormLabel>
                  <FormControl>
                    <PhoneInput
                      id="profile-emergency-phone"
                      international
                      defaultCountry="UA"
                      placeholder={tAuth("phonePlaceholder")}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                      className={fieldState.error ? "phone-error" : ""}
                      aria-invalid={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </AnimatedFormField>
            )}
          />

          <FormField
            control={form.control}
            name="runningClub"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="profile-club">
                    {t("runningClub")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="profile-club"
                      type="text"
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </AnimatedFormField>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field, fieldState }) => (
              <AnimatedFormField error={fieldState.error?.message}>
                <FormItem>
                  <FormLabel htmlFor="profile-city">{t("city")}</FormLabel>
                  <FormControl>
                    <Input
                      id="profile-city"
                      type="text"
                      disabled={isLoading}
                      autoComplete="address-level2"
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </AnimatedFormField>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="deliveryAddress"
              render={({ field, fieldState }) => (
                <AnimatedFormField error={fieldState.error?.message}>
                  <FormItem>
                    <FormLabel htmlFor="profile-address">
                      {t("deliveryAddress")}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id="profile-address"
                        disabled={isLoading}
                        rows={4}
                        autoComplete="street-address"
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </AnimatedFormField>
              )}
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <Button
              type="submit"
              variant="outline"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? t("saving") : t("saveProfile")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
