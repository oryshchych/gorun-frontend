import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ShellPageHeader } from "@/components/layout/shell";

export async function ProfileEditPage() {
  const t = await getTranslations("profile");

  return (
    <>
      <ShellPageHeader title={t("formTitle")} description={t("formSubtitle")} className="mb-6" />
      <ProfileForm />
    </>
  );
}
