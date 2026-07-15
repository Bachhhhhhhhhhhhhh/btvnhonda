/** Recharts — refined, theme-aware palette */

function isDark() {
  if (typeof document === "undefined") return true;
  return document.documentElement.getAttribute("data-theme") === "dark";
}

export const chartTheme = {
  get grid() {
    return isDark() ? "rgba(148,163,184,0.1)" : "rgba(100,116,139,0.1)";
  },
  get tick() {
    return isDark() ? "#94a3b8" : "#64748b";
  },
  get tooltip() {
    const dark = isDark();
    return {
      contentStyle: {
        background: dark ? "rgba(17,27,44,0.97)" : "rgba(255,255,255,0.98)",
        border: dark ? "1px solid #1e2d42" : "1px solid #e2e8f0",
        borderRadius: 12,
        fontSize: 12,
        color: dark ? "#f1f5f9" : "#0f172a",
        boxShadow: dark
          ? "0 16px 40px -12px rgba(0,0,0,0.55)"
          : "0 16px 40px -12px rgba(15,23,42,0.14)",
        padding: "10px 14px",
      },
      itemStyle: { color: dark ? "#cbd5e1" : "#475569", fontSize: 12 },
      labelStyle: {
        color: dark ? "#f1f5f9" : "#0f172a",
        fontWeight: 700,
        marginBottom: 6,
        fontSize: 12,
      },
    };
  },
  /** Cohesive series colors */
  colors: {
    rose: isDark() ? "#fb7185" : "#e11d48",
    amber: isDark() ? "#fbbf24" : "#b45309",
    sky: isDark() ? "#38bdf8" : "#0e4d6b",
    emerald: isDark() ? "#2dd4bf" : "#0f766e",
    violet: isDark() ? "#a5b4fc" : "#4f46e5",
    cyan: isDark() ? "#22d3ee" : "#0891b2",
    slate: isDark() ? "#94a3b8" : "#64748b",
    navy: isDark() ? "#e2e8f0" : "#0b1220",
    teal: isDark() ? "#2dd4bf" : "#0f766e",
    gold: isDark() ? "#c9a95a" : "#a8893a",
  },
  series: [
    isDark() ? "#38bdf8" : "#0e4d6b",
    isDark() ? "#2dd4bf" : "#0f766e",
    isDark() ? "#c9a95a" : "#a8893a",
    isDark() ? "#a5b4fc" : "#4f46e5",
    isDark() ? "#94a3b8" : "#64748b",
    isDark() ? "#fb7185" : "#e11d48",
  ],
};
