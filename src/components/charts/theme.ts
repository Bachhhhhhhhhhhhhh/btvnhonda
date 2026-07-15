/** Recharts — theme-aware (CSS variables where possible) */
function isDark() {
  if (typeof document === "undefined") return true;
  return document.documentElement.getAttribute("data-theme") === "dark";
}

export const chartTheme = {
  get grid() {
    return isDark() ? "#243247" : "#e8edf2";
  },
  get tick() {
    return isDark() ? "#94a3b8" : "#64748b";
  },
  get tooltip() {
    const dark = isDark();
    return {
      contentStyle: {
        background: dark ? "#121c2e" : "#ffffff",
        border: dark ? "1px solid #243247" : "1px solid #d8dee8",
        borderRadius: 8,
        fontSize: 12,
        color: dark ? "#e8eef5" : "#0a1628",
        boxShadow: "0 8px 24px -8px rgba(0,0,0,0.25)",
        padding: "10px 12px",
      },
      itemStyle: { color: dark ? "#cbd5e1" : "#334155" },
      labelStyle: {
        color: dark ? "#e8eef5" : "#0a1628",
        fontWeight: 700,
        marginBottom: 4,
      },
    };
  },
  colors: {
    rose: "#b91c1c",
    amber: "#b45309",
    sky: "#0c4a6e",
    emerald: "#0f766e",
    violet: "#5b21b6",
    cyan: "#0e7490",
    slate: "#64748b",
    navy: "#0a1628",
    teal: "#0f766e",
    gold: "#c4a35a",
  },
};
