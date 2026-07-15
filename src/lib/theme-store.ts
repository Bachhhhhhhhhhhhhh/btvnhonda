"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";
export type Density = "comfortable" | "compact";

type ThemeStore = {
  mode: ThemeMode;
  density: Density;
  reducedMotion: boolean;
  sidebarCollapsed: boolean;
  onboardingDone: boolean;
  setMode: (m: ThemeMode) => void;
  setDensity: (d: Density) => void;
  toggleMode: () => void;
  setReducedMotion: (v: boolean) => void;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  setOnboardingDone: (v: boolean) => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: "dark",
      density: "comfortable",
      reducedMotion: false,
      sidebarCollapsed: false,
      onboardingDone: false,
      setMode: (mode) => set({ mode }),
      setDensity: (density) => set({ density }),
      toggleMode: () =>
        set({ mode: get().mode === "dark" ? "light" : "dark" }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () =>
        set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setOnboardingDone: (onboardingDone) => set({ onboardingDone }),
    }),
    { name: "log-twin-theme-v2" }
  )
);

export function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode === "system" ? "dark" : mode;
}
