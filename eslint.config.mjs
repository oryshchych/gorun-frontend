import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const config = [
  ...nextCoreWebVitals,
  eslintConfigPrettier,
  {
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // warn (not error) so lint stays green while existing violations are cleaned up.
      // New code must have zero `any` — see AGENTS.md §5.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default config;
