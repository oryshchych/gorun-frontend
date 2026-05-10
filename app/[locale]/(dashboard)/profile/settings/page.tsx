import { ProfileForm } from "@/components/profile/ProfileForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProfileSettingsPage({
  params,
}: {
  params: { locale: string };
}) {
  return (
    <div
      style={{
        background: "var(--gr-bg)",
        color: "var(--gr-ink)",
        minHeight: "100vh",
        paddingBottom: 80,
      }}
    >
      <div
        style={{ maxWidth: 640, margin: "0 auto", padding: "20px 18px 0" }}
      >
        <Link
          href={`/${params.locale}/profile`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--gr-ink-3)",
            fontWeight: 600,
            textDecoration: "none",
            marginBottom: 14,
          }}
        >
          <ArrowLeft size={15} />
          Back to profile
        </Link>
        <h1
          className="gr-display"
          style={{ fontSize: 26, fontWeight: 800, margin: 0, marginBottom: 20 }}
        >
          Edit profile
        </h1>
        <ProfileForm />
      </div>
    </div>
  );
}
