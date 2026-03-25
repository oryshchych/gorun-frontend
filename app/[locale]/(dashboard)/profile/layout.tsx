"use client";

import { ProfileNavLinks } from "@/components/profile/ProfileNav";
import { cn } from "@/lib/utils";

export default function ProfileSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6 lg:hidden -mx-4 px-4">
        <div className="flex gap-1 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ProfileNavLinks
            className="flex min-w-max gap-1"
            linkClassName={(active) =>
              cn(
                "shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_minmax(200px,260px)] lg:gap-10">
        <div className="min-w-0 lg:order-1">{children}</div>
        <aside className="hidden lg:order-2 lg:block">
          <div className="sticky top-24 rounded-lg border bg-card p-3 shadow-sm">
            <ProfileNavLinks
              className="flex flex-col gap-1"
              linkClassName={(active) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
