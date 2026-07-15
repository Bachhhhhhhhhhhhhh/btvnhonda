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
} from "lucide-react";
import { useTwinStore } from "@/lib/store";
import { exportTwinPack } from "@/lib/export";
import { ToastHost, useToast } from "@/components/wow/ToastHost";

const TITLES: Record<string, { title: string; crumb: string }> = {
  "/": { title: "Tổng quan điều hành", crumb: "Dashboard" },
  "/digital-twin": { title: "Digital Twin — Mô phỏng mạng lưới", crumb: "Digital Twin" },
  "/wsb": { title: "WSB — What-if Scenario Builder", crumb: "WSB" },
  "/insights": { title: "Insights & tối ưu nâng cao", crumb: "Insights" },
  "/map": { title: "Bản đồ mạng lưới kho & vận tải", crumb: "Bản đồ" },
  "/overview": { title: "Giới thiệu dự án", crumb: "Giới thiệu" },
  "/warehouse": { title: "Năng lực kho miền Bắc", crumb: "Kho" },
  "/vehicle": { title: "Năng lực xe & mật độ", crumb: "Xe" },
  "/import": { title: "Tối ưu nhập khẩu", crumb: "Nhập khẩu" },
  "/domestic": { title: "Tối ưu nội địa", crumb: "Nội địa" },
  "/container": { title: "Tối ưu container", crumb: "Container" },
  "/transport": { title: "Vận tải Bắc–Nam", crumb: "Vận tải" },
  "/financial": { title: "Phân tích tài chính", crumb: "Tài chính" },
  "/scenarios": { title: "So sánh kịch bản", crumb: "Kịch bản" },
  "/sensitivity": { title: "Phân tích độ nhạy", crumb: "Độ nhạy" },
  "/monte-carlo": { title: "Mô phỏng Monte Carlo", crumb: "Monte Carlo" },
  "/risk": { title: "Quản trị rủi ro", crumb: "Rủi ro" },
  "/recommendations": { title: "Khuyến nghị", crumb: "Khuyến nghị" },
  "/report": { title: "Báo cáo tư vấn", crumb: "Báo cáo" },
  "/data": { title: "Dữ liệu & nguồn", crumb: "Dữ liệu" },
  "/admin": { title: "Quản trị hệ thống", crumb: "Quản trị" },
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
  const { params, result } = useTwinStore();
  const pushToast = useToast((s) => s.push);
  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-[#eef1f5]">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CommandPalette />
      <ToastHost />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="bank-util-bar no-print">
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <Clock3 className="h-3 w-3 text-[#d4b76a]" />
              {today}
            </span>
            <span className="hidden text-slate-600 md:inline">|</span>
            <span className="hidden md:inline">
              Honda Việt Nam · Logistics Decision Support
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <Phone className="h-3 w-3 text-[#d4b76a]" />
              Hỗ trợ nội bộ DSS
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400/90">
              <Lock className="h-3 w-3" />
              SSL · Secure
            </span>
          </div>
        </div>

        <header className="no-print sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#dce3ec] bg-white/95 px-3 backdrop-blur-sm sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-[3px] border border-[#dce3ec] p-2 text-[#071428] lg:hidden"
              aria-label="Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                <span>LOG Twin</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-[#b8954a]">{meta.crumb}</span>
              </div>
              <div className="truncate text-[14px] font-bold text-[#071428] sm:text-[15px]">
                {meta.title}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
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
              className="hidden items-center gap-1.5 rounded-[3px] border border-[#dce3ec] bg-[#f7f9fc] px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 sm:inline-flex"
              title="Ctrl+K"
            >
              <Search className="h-3.5 w-3.5" />
              Tìm…
              <kbd className="rounded border border-slate-200 bg-white px-1 text-[9px]">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => {
                exportTwinPack(params, result);
                pushToast({
                  title: "Đã export Twin pack",
                  detail: "JSON params + CSV monthly/annual",
                  tone: "good",
                });
              }}
              className="inline-flex items-center gap-1 rounded-[3px] border border-[#dce3ec] px-2 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
              title="Export JSON + CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <div className="hidden rounded-[3px] border border-[#dce3ec] bg-[#f7f9fc] px-3 py-1.5 text-[11px] font-semibold text-slate-600 lg:block">
              103Ki 2QFC
            </div>
            <div className="flex items-center gap-1.5 rounded-[3px] border border-emerald-200/80 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Online
            </div>
          </div>
        </header>

        <main className="bank-content flex-1 overflow-y-auto p-3 sm:p-6 lg:p-7">
          {children}

          <footer className="no-print mt-8 border-t border-[#dce3ec] pt-5 pb-2">
            <div className="bank-trust">
              <div>
                <strong>LOG Twin DSS</strong> · Honda MC Logistics
              </div>
              <div className="hidden sm:block">
                Dữ liệu mô hình · không thay thế phê duyệt chính thức
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-slate-500">
                <Lock className="h-3 w-3" />
                Nội bộ · Ctrl+K tìm nhanh
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
