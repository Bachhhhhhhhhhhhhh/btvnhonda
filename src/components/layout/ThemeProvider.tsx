"use client";

import { useEffect } from "react";
import { resolveTheme, useThemeStore } from "@/lib/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  const density = useThemeStore((s) => s.density);
  const reducedMotion = useThemeStore((s) => s.reducedMotion);
  const sidebarCollapsed = useThemeStore((s) => s.sidebarCollapsed);

  useEffect(() => {
    const apply = () => {
      const resolved = resolveTheme(mode);
      document.documentElement.setAttribute("data-theme", resolved);
      document.documentElement.setAttribute("data-density", density);
      document.documentElement.setAttribute(
        "data-sidebar",
        sidebarCollapsed ? "collapsed" : "expanded"
      );
      document.documentElement.classList.toggle("dark", resolved === "dark");
      document.documentElement.classList.toggle("reduce-motion", reducedMotion);
      document.body.style.colorScheme = resolved;
    };
    apply();
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode, density, reducedMotion, sidebarCollapsed]);

  return <>{children}</>;
}
