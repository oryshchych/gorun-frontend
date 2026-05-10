"use client";

interface AuthSheetProps {
  reason?: "register" | "profile" | "general";
  onSignIn: () => void;
  onClose: () => void;
}

export function AuthSheet({ reason = "general", onSignIn, onClose }: AuthSheetProps) {
  const headline =
    reason === "register"
      ? "Sign in to register"
      : reason === "profile"
      ? "Sign in to see your profile"
      : "Welcome back";

  const sub =
    reason === "register"
      ? "We'll save your details so the next race is one tap."
      : "Track your registrations, kids, and results in one place.";

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50 }}
      aria-modal="true"
      role="dialog"
      aria-label={headline}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(11,16,13,0.6)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Sheet */}
      <div
        className="gr-screen-enter"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          background: "var(--gr-bg)",
          borderRadius: "24px 24px 0 0",
          padding: "14px 22px 36px",
          color: "var(--gr-ink)",
          boxShadow: "0 -10px 40px rgba(0,0,0,0.3)",
          maxWidth: 640,
          margin: "0 auto",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 40,
            height: 4,
            background: "var(--gr-line-strong)",
            borderRadius: 2,
            margin: "4px auto 18px",
          }}
        />

        {/* Logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div
            className="gr-display"
            style={{ fontSize: 18, fontWeight: 800 }}
          >
            GoRun
          </div>
        </div>

        <h2
          className="gr-display"
          style={{
            fontSize: 24,
            fontWeight: 800,
            lineHeight: 1.15,
            marginTop: 8,
            textWrap: "balance",
          }}
        >
          {headline}
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--gr-ink-3)",
            marginTop: 6,
            lineHeight: 1.5,
          }}
        >
          {sub}
        </p>

        <div
          style={{
            marginTop: 22,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <button
            onClick={onSignIn}
            style={{
              padding: 14,
              borderRadius: 999,
              background: "var(--gr-ink)",
              color: "var(--gr-bg)",
              fontWeight: 700,
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
              border: 0,
            }}
          >
            Continue with Google
          </button>
          <button
            onClick={onSignIn}
            style={{
              padding: 14,
              borderRadius: 999,
              background: "var(--gr-surface)",
              color: "var(--gr-ink)",
              border: "1.5px solid var(--gr-line-strong)",
              fontWeight: 700,
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            Continue with email
          </button>
          <button
            onClick={onSignIn}
            style={{
              marginTop: 4,
              color: "var(--gr-ink-3)",
              fontSize: 13,
              fontWeight: 600,
              background: "transparent",
              border: 0,
              cursor: "pointer",
            }}
          >
            Use phone · SMS code
          </button>
        </div>

        <p
          style={{
            fontSize: 11,
            color: "var(--gr-ink-4)",
            textAlign: "center",
            marginTop: 18,
            lineHeight: 1.5,
          }}
        >
          By continuing you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
