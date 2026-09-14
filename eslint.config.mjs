import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import tsPlugin from "@typescript-eslint/eslint-plugin";

/**
 * Forbids *static* inline styles — `style={{ fontSize: 14 }}`, `style={{ color: "var(--ink)" }}`.
 * Genuinely dynamic values (ternaries, template literals, variables) still pass, because
 * those are the cases Tailwind utilities cannot express.
 * See AGENTS.md § Styling and .cursor/rules/70-styling-tailwind.mdc § Anti-patterns.
 */
const noStaticInlineStyles = {
  selector:
    "JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression > Property[value.type='Literal']",
  message:
    "No static inline styles — use Tailwind token utilities (bg-surface, text-ink, rounded-md) instead. Inline style is only for genuinely dynamic values.",
};

/**
 * Files that predate the rule and still carry ported prototype styles.
 * Shrink this list — never add to it. Tracked in AGENTS.md § Styling.
 */
const inlineStyleLegacyFiles = [
  "components/events/EventsHub.tsx",
  "components/events/ParticipantsList.tsx",
  "components/events/PastEventRecap.tsx",
  "components/layout/Footer.tsx",
  "components/registration/PaymentReturn.tsx",
  "components/registration/RegistrationWizard.tsx",
];

const config = [
  ...nextCoreWebVitals,
  eslintConfigPrettier,
  {
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-restricted-syntax": ["error", noStaticInlineStyles],
    },
  },
  {
    files: inlineStyleLegacyFiles,
    rules: {
      "no-restricted-syntax": "off",
    },
  },
];

export default config;
