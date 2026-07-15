"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

const TITLES: Record<string, string> = {
  "/": "Bảng điều hành cấp cao",
  "/digital-twin": "Digital Twin — Mô phỏng mạng lưới kho & vận tải",
  "/map": "Bản đồ mạng lưới kho & vận tải Việt Nam",
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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-slate-200/70 bg-white/80 px-5 backdrop-blur-xl sm:px-8">
          <div className="min-w-0">
            <div className="truncate text-[15px] font-bold text-slate-900">
              {title}
            </div>
            <div className="truncate text-[11px] text-slate-500">
              Logistics Decision Support · Honda Việt Nam · Peak season North WH
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              103Ki 2QFC · Jun
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 shadow-sm">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
              LIVE
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
