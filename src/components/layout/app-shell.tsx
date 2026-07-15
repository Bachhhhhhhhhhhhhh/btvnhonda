"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

const TITLES: Record<string, string> = {
  "/": "Tổng quan điều hành",
  "/digital-twin": "Digital Twin — Mô phỏng mạng lưới",
  "/map": "Bản đồ mạng lưới kho & vận tải",
  "/overview": "Giới thiệu dự án",
  "/warehouse": "Năng lực kho miền Bắc",
  "/vehicle": "Năng lực xe & mật độ",
  "/import": "Tối ưu nhập khẩu",
  "/domestic": "Tối ưu nội địa",
  "/container": "Tối ưu container",
  "/transport": "Vận tải Bắc–Nam",
  "/financial": "Phân tích tài chính",
  "/scenarios": "So sánh kịch bản",
  "/sensitivity": "Phân tích độ nhạy",
  "/monte-carlo": "Mô phỏng Monte Carlo",
  "/risk": "Quản trị rủi ro",
  "/recommendations": "Khuyến nghị",
  "/report": "Báo cáo tư vấn",
  "/data": "Dữ liệu & nguồn",
  "/admin": "Quản trị hệ thống",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const title =
    TITLES[path] ||
    Object.entries(TITLES).find(([k]) => k !== "/" && path.startsWith(k))?.[1] ||
    "Hệ thống hỗ trợ quyết định";

  return (
    <div className="flex min-h-screen bg-[#eef1f6]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-[#0a1628]">
              {title}
            </div>
            <div className="truncate text-[11px] text-slate-500">
              Honda Việt Nam · Logistics Decision Support · 103Ki 2QFC
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden rounded border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 md:block">
              Phiên bản chính thức
            </div>
            <div className="flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Online
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
