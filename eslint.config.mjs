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
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];

export default config;
