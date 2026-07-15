"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

const TITLES: Record<string, string> = {
  "/": "Bảng điều hành cấp cao",
  "/digital-twin": "Digital Twin — Mô phỏng mạng lưới kho & vận tải",
  "/overview": "Tổng quan dự án tối ưu stacking",
  "/warehouse": "Năng lực kho miền Bắc",
  "/vehicle": "Năng lực xe & mật độ lưu kho",
  "/import": "Tối ưu xe nhập khẩu",
  "/domestic": "Tối ưu xe nội địa & chuyển Bắc–Nam",
  "/container": "Tối ưu container & case pool",
  "/transport": "Mô phỏng vận tải N↔S",
  "/financial": "Phân tích tài chính mạng lưới",
  "/scenarios": "So sánh kịch bản",
  "/sensitivity": "Phân tích độ nhạy",
  "/monte-carlo": "Mô phỏng Monte Carlo",
  "/risk": "Ma trận rủi ro",
  "/recommendations": "Khuyến nghị điều hành",
  "/report": "Báo cáo tư vấn chuyên sâu",
  "/data": "Dữ liệu & đối chiếu nguồn",
  "/admin": "Quản trị hệ thống",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const title =
    TITLES[path] ||
    Object.entries(TITLES).find(([k]) => k !== "/" && path.startsWith(k))?.[1] ||
    "Hệ thống hỗ trợ quyết định";

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900 sm:text-[15px]">
              {title}
            </div>
            <div className="truncate text-[11px] text-slate-500">
              Hệ thống hỗ trợ quyết định logistics · Honda Việt Nam · Mùa cao điểm miền Bắc
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 md:block">
              103Ki 2QFC · Jun
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
