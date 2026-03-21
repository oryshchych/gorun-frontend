"use client";

import { Button } from "@/components/ui/button";
import { buildGoogleOAuthStartUrl } from "@/lib/api/auth";

interface GoogleOAuthButtonProps {
  locale: string;
  /** Passed to API as `remember_me` for refresh token TTL (login flow). */
  rememberMe?: boolean;
  label: string;
  disabled?: boolean;
}

export function GoogleOAuthButton({
  locale,
  rememberMe = false,
  label,
  disabled,
}: GoogleOAuthButtonProps) {
  const handleClick = () => {
    try {
      window.location.href = buildGoogleOAuthStartUrl({
        locale,
        rememberMe,
      });
    } catch (e) {
      console.error("Google OAuth URL error:", e);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleClick}
      disabled={disabled}
    >
      {label}
    </Button>
  );
}
