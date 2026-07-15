"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { CommandPalette } from "./CommandPalette";
import {
  Lock,
  Clock3,
  Phone,
  ChevronRight,
  Menu,
  Search,
  Download,
  Moon,
  Sun,
  Rows3,
  Maximize2,
} from "lucide-react";
import { useTwinStore } from "@/lib/store";
import { exportTwinPack } from "@/lib/export";
import { ToastHost, useToast } from "@/components/wow/ToastHost";
import { useThemeStore } from "@/lib/theme-store";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "@/components/command/NotificationCenter";
import { QuickFab } from "@/components/command/QuickFab";
import { OnboardingTour } from "@/components/command/OnboardingTour";
import { ShortcutsModal } from "@/components/command/ShortcutsModal";
import { StickyTwinBar } from "@/components/command/StickyTwinBar";

const TITLES: Record<string, { title: string; crumb: string }> = {
  "/": { title: "Command Center · Tổng quan", crumb: "Command" },
  "/digital-twin": { title: "Digital Twin — Mô phỏng mạng lưới", crumb: "Twin" },
  "/wsb": { title: "WSB — What-if Scenario Builder", crumb: "WSB" },
  "/insights": { title: "Insights & tối ưu nâng cao", crumb: "Insights" },
  "/planner": { title: "S&OP Planner — mục tiêu & checklist", crumb: "Planner" },
  "/map": { title: "Bản đồ mạng lưới kho & vận tải", crumb: "Map" },
  "/overview": { title: "Giới thiệu dự án", crumb: "Overview" },
  "/warehouse": { title: "Năng lực kho miền Bắc", crumb: "Kho" },
  "/vehicle": { title: "Năng lực xe & mật độ", crumb: "Xe" },
  "/import": { title: "Tối ưu nhập khẩu", crumb: "NK" },
  "/domestic": { title: "Tối ưu nội địa", crumb: "Nội địa" },
  "/container": { title: "Tối ưu container", crumb: "Cont" },
  "/transport": { title: "Vận tải Bắc–Nam", crumb: "Vận tải" },
  "/financial": { title: "Phân tích tài chính", crumb: "Finance" },
  "/scenarios": { title: "So sánh kịch bản", crumb: "Scenarios" },
  "/sensitivity": { title: "Phân tích độ nhạy", crumb: "Sensitivity" },
  "/monte-carlo": { title: "Mô phỏng Monte Carlo", crumb: "MC" },
  "/risk": { title: "Quản trị rủi ro", crumb: "Risk" },
  "/recommendations": { title: "Khuyến nghị", crumb: "Recs" },
  "/report": { title: "Báo cáo tư vấn", crumb: "Report" },
  "/data": { title: "Dữ liệu & nguồn", crumb: "Data" },
  "/admin": { title: "Quản trị hệ thống", crumb: "Admin" },
};

function resolveMeta(path: string) {
  if (TITLES[path]) return TITLES[path];
  const hit = Object.entries(TITLES).find(
    ([k]) => k !== "/" && path.startsWith(k)
  );
  return hit?.[1] ?? { title: "Hệ thống hỗ trợ quyết định", crumb: "DSS" };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const meta = resolveMeta(path);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { params, result } = useTwinStore();
  const pushToast = useToast((s) => s.push);
  const { mode, density, toggleMode, setDensity } = useThemeStore();
  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="cc-shell flex min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CommandPalette />
      <ToastHost />
      <OnboardingTour />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <QuickFab onShortcuts={() => setShortcutsOpen(true)} />
      <StickyTwinBar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="bank-util-bar no-print">
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <Clock3 className="h-3 w-3 text-[#d4b76a]" />
              {today}
            </span>
            <span className="hidden text-slate-600 md:inline">|</span>
            <span className="hidden md:inline">
              Honda Việt Nam · Command Center DSS v5
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <Phone className="h-3 w-3 text-[#d4b76a]" />
              Hỗ trợ nội bộ
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400/90">
              <Lock className="h-3 w-3" />
              Secure session
            </span>
          </div>
        </div>

        <header className="cc-header no-print sticky top-0 z-20 flex h-14 items-center justify-between border-b px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-[var(--line)] p-2 text-[var(--ink)] lg:hidden"
              aria-label="Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                <span>LOG Twin</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-[var(--gold)]">{meta.crumb}</span>
              </div>
              <div className="truncate text-[14px] font-extrabold text-[var(--ink)] sm:text-[15px]">
                {meta.title}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => {
                const ev = new KeyboardEvent("keydown", {
                  key: "k",
                  ctrlKey: true,
                  bubbles: true,
                });
                window.dispatchEvent(ev);
              }}
              className="hidden items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--muted)] sm:inline-flex"
            >
              <Search className="h-3.5 w-3.5" />
              Search
              <kbd className="rounded border border-[var(--line)] bg-[var(--card)] px-1 text-[9px]">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() =>
                setDensity(density === "compact" ? "comfortable" : "compact")
              }
              className={cn(
                "rounded-lg border border-[var(--line)] p-2 text-[var(--muted)] hover:text-[var(--ink)]",
                density === "compact" && "bg-[var(--bg)] text-[var(--ink)]"
              )}
              title="Density"
            >
              <Rows3 className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                toggleMode();
                pushToast({
                  title: mode === "dark" ? "Light mode" : "Dark mode",
                  detail: "Giao diện Command Center",
                  tone: "info",
                });
              }}
              className="rounded-lg border border-[var(--line)] p-2 text-[var(--muted)] hover:text-[var(--ink)]"
              title="Theme"
            >
              {mode === "dark" ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </button>

            <NotificationCenter />

            <button
              type="button"
              onClick={() => {
                exportTwinPack(params, result);
                pushToast({
                  title: "Export Twin pack",
                  detail: "JSON + CSV đã tải",
                  tone: "good",
                });
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-2 py-1.5 text-[11px] font-bold text-[var(--ink)] hover:bg-[var(--bg)]"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <div className="hidden items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 md:flex">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
              LIVE
            </div>
          </div>
        </header>

        <main
          className={cn(
            "bank-content flex-1 overflow-y-auto pb-16",
            density === "compact" ? "p-2 sm:p-3" : "p-3 sm:p-5 lg:p-6"
          )}
        >
          {children}

          <footer className="no-print mt-8 border-t border-[var(--line)] pt-5 pb-2">
            <div className="bank-trust">
              <div>
                <strong>LOG Twin Command Center v5</strong>
              </div>
              <div className="hidden sm:block">
                Digital Twin DSS · không thay thế phê duyệt chính thức
              </div>
              <div className="ml-auto flex items-center gap-3 text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Maximize2 className="h-3 w-3" />
                  Undo sticky · Ctrl+K · Share
                </span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
