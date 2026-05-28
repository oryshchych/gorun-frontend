"use client";

import { ProfileAppShell } from "@/components/profile/ProfileShell";

export default function ProfileSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ProfileAppShell>{children}</ProfileAppShell>
    </div>
  );
}
