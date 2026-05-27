import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/profile/ProfileForm";

export async function ProfileEditPage() {
  const t = await getTranslations("profile");

  return (
    <div
      style={{
        background: "var(--gr-bg)",
        color: "var(--gr-ink)",
        minHeight: "100vh",
        paddingBottom: 80,
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 18px 0" }}>
        <h1
          className="gr-display"
          style={{ fontSize: 26, fontWeight: 800, margin: 0, marginBottom: 20 }}
        >
          {t("formTitle")}
        </h1>
        <ProfileForm />
      </div>
    </div>
  );
}
