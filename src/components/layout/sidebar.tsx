"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Warehouse,
  Package,
  Ship,
  Container,
  Truck,
  Landmark,
  GitCompare,
  Activity,
  Dices,
  ShieldAlert,
  Lightbulb,
  FileText,
  Boxes,
  Database,
  Settings,
  Network,
  Bike,
  MapPinned,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Bảng điều hành", icon: LayoutDashboard, group: "Tổng quan" },
  { href: "/digital-twin", label: "Digital Twin", icon: Network, group: "Tổng quan", hot: true },
  { href: "/map", label: "Bản đồ mạng lưới", icon: MapPinned, group: "Tổng quan", hot: true },
  { href: "/overview", label: "Tổng quan dự án", icon: BookOpen, group: "Tổng quan" },
  { href: "/warehouse", label: "Năng lực kho", icon: Warehouse, group: "Vận hành" },
  { href: "/vehicle", label: "Năng lực xe", icon: Bike, group: "Vận hành" },
  { href: "/import", label: "Tối ưu nhập khẩu", icon: Package, group: "Vận hành" },
  { href: "/domestic", label: "Tối ưu nội địa", icon: Ship, group: "Vận hành" },
  { href: "/container", label: "Tối ưu container", icon: Container, group: "Vận hành" },
  { href: "/transport", label: "Mô phỏng vận tải", icon: Truck, group: "Vận hành" },
  { href: "/financial", label: "Phân tích tài chính", icon: Landmark, group: "Ra quyết định" },
  { href: "/scenarios", label: "So sánh kịch bản", icon: GitCompare, group: "Ra quyết định" },
  { href: "/sensitivity", label: "Độ nhạy", icon: Activity, group: "Ra quyết định" },
  { href: "/monte-carlo", label: "Monte Carlo", icon: Dices, group: "Ra quyết định" },
  { href: "/risk", label: "Phân tích rủi ro", icon: ShieldAlert, group: "Ra quyết định" },
  { href: "/recommendations", label: "Khuyến nghị", icon: Lightbulb, group: "Báo cáo" },
  { href: "/report", label: "Báo cáo tư vấn", icon: FileText, group: "Báo cáo" },
  { href: "/data", label: "Dữ liệu & nguồn", icon: Database, group: "Hệ thống" },
  { href: "/admin", label: "Quản trị / Audit", icon: Settings, group: "Hệ thống" },
];

export function Sidebar() {
  const path = usePathname();
  let lastGroup = "";

  return (
    <aside className="no-print flex h-screen w-[272px] shrink-0 flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="border-b border-slate-100 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b1f3a] to-[#0d9488] text-white shadow-lg shadow-blue-900/20">
            <Boxes className="h-5 w-5" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
          </div>
          <div>
            <div className="text-[17px] font-extrabold tracking-tight text-slate-900">
              LOG Twin
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Honda MC · DSS
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-2.5 text-[11px] font-semibold text-emerald-800">
          <span className="live-dot mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500 align-middle" />
          Twin engine đang chạy realtime
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        {NAV.map((item) => {
          const showGroup = item.group !== lastGroup;
          lastGroup = item.group;
          const active =
            item.href === "/" ? path === "/" : path.startsWith(item.href);
          const Icon = item.icon;
          return (
            <div key={item.href}>
              {showGroup && (
                <div className="mb-1.5 mt-4 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 first:mt-1">
                  {item.group}
                </div>
              )}
              <Link
                href={item.href}
                className={cn(
                  "mb-0.5 flex items-center gap-2.5 rounded-xl border border-transparent px-3 py-2.5 text-[13px] transition-all",
                  active
                    ? "nav-active"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-blue-600" : "opacity-70")} />
                <span className="flex-1">{item.label}</span>
                {item.hot && (
                  <span className="rounded-md bg-gradient-to-r from-blue-600 to-teal-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
                    Twin
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 px-4 py-3">
        <div className="rounded-xl bg-slate-50 p-3 text-[10px] leading-relaxed text-slate-500">
          <div className="mb-1 font-bold uppercase tracking-wider text-slate-400">
            Knowledge base
          </div>
          Excel 103Ki 2QFC · Word stacking · PPT Yamagomori
        </div>
      </div>
    </aside>
  );
}
