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
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Bảng điều hành", icon: LayoutDashboard, group: "Tổng quan" },
  { href: "/digital-twin", label: "Digital Twin", icon: Network, group: "Tổng quan", hot: true },
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
    <aside className="no-print flex h-screen w-[280px] shrink-0 flex-col border-r border-white/5 bg-[#050a14]/95 backdrop-blur-xl">
      <div className="border-b border-white/5 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-emerald-500 shadow-lg shadow-sky-500/30">
            <Boxes className="h-5 w-5 text-slate-950" />
            <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-amber-300" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white">
              LOG Twin
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-sky-400/90">
              Honda MC · Kho miền Bắc
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-200">
          <span className="live-dot mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          DSS sống · Mô phỏng realtime
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
                <div className="mb-1.5 mt-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 first:mt-0">
                  {item.group}
                </div>
              )}
              <Link
                href={item.href}
                className={cn(
                  "mb-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] transition-all",
                  active
                    ? "nav-active font-semibold"
                    : "border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" />
                <span className="flex-1">{item.label}</span>
                {item.hot && (
                  <span className="rounded-md bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-sky-300">
                    Twin
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/5 px-4 py-3 text-[10px] leading-relaxed text-slate-500">
        Nguồn: Excel 103Ki 2QFC · Word stacking · PPT Yamagomori
        <br />
        <span className="text-slate-600">Mọi KPI trích dẫn file / sheet gốc</span>
      </div>
    </aside>
  );
}
