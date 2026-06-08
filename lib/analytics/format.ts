/** Shared formatters for the analytics dashboard. */

const numberFmt = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 });

export const formatNumber = (n: number): string => numberFmt.format(n);

export const formatCurrency = (n: number): string =>
  `${numberFmt.format(Math.round(n))} ₴`;

export const formatPercent = (ratio: number): string =>
  `${(ratio * 100).toFixed(ratio > 0 && ratio < 0.1 ? 1 : 0)}%`;

/**
 * Token-based color palette for charts. Values are CSS custom properties so
 * charts adapt to light/dark automatically (SVG `fill`/`stroke` accept var()).
 */
export const CHART_COLORS = [
  "var(--brand)",
  "var(--info)",
  "var(--warn)",
  "var(--afu-blue)",
  "var(--danger)",
  "var(--success)",
  "var(--ink-3)",
] as const;

export const CHART_AXIS_COLOR = "var(--ink-3)";
export const CHART_GRID_COLOR = "var(--line)";

/** Shared Recharts tooltip styling using design tokens. */
export const tooltipStyle = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "var(--r-md)",
  color: "var(--ink)",
  fontSize: "12px",
} as const;
