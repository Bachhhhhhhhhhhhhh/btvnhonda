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
  { href: "/", label: "Tổng quan", icon: LayoutDashboard, group: "Chính" },
  { href: "/digital-twin", label: "Digital Twin", icon: Network, group: "Chính", hot: true },
  { href: "/map", label: "Bản đồ mạng lưới", icon: MapPinned, group: "Chính", hot: true },
  { href: "/overview", label: "Giới thiệu dự án", icon: BookOpen, group: "Chính" },
  { href: "/warehouse", label: "Năng lực kho", icon: Warehouse, group: "Vận hành" },
  { href: "/vehicle", label: "Năng lực xe", icon: Bike, group: "Vận hành" },
  { href: "/import", label: "Tối ưu nhập khẩu", icon: Package, group: "Vận hành" },
  { href: "/domestic", label: "Tối ưu nội địa", icon: Ship, group: "Vận hành" },
  { href: "/container", label: "Container", icon: Container, group: "Vận hành" },
  { href: "/transport", label: "Vận tải", icon: Truck, group: "Vận hành" },
  { href: "/financial", label: "Tài chính", icon: Landmark, group: "Phân tích" },
  { href: "/scenarios", label: "Kịch bản", icon: GitCompare, group: "Phân tích" },
  { href: "/sensitivity", label: "Độ nhạy", icon: Activity, group: "Phân tích" },
  { href: "/monte-carlo", label: "Monte Carlo", icon: Dices, group: "Phân tích" },
  { href: "/risk", label: "Rủi ro", icon: ShieldAlert, group: "Phân tích" },
  { href: "/recommendations", label: "Khuyến nghị", icon: Lightbulb, group: "Báo cáo" },
  { href: "/report", label: "Báo cáo tư vấn", icon: FileText, group: "Báo cáo" },
  { href: "/data", label: "Dữ liệu nguồn", icon: Database, group: "Hệ thống" },
  { href: "/admin", label: "Quản trị", icon: Settings, group: "Hệ thống" },
];

export function Sidebar() {
  const path = usePathname();
  let lastGroup = "";

  return (
    <aside className="no-print flex h-screen w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Bank brand header */}
      <div className="border-b border-slate-200 bg-[#0a1628] px-4 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-[#c4a35a] to-[#a6853f] text-[#0a1628]">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-tight">LOG Twin</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c4a35a]">
              Honda MC · DSS
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] font-semibold text-slate-300">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Hệ thống đang hoạt động
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {NAV.map((item) => {
          const showGroup = item.group !== lastGroup;
          lastGroup = item.group;
          const active =
            item.href === "/" ? path === "/" : path.startsWith(item.href);
          const Icon = item.icon;
          return (
            <div key={item.href}>
              {showGroup && (
                <div className="mb-1 mt-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 first:mt-0">
                  {item.group}
                </div>
              )}
              <Link
                href={item.href}
                className={cn(
                  "mb-0.5 flex items-center gap-2.5 rounded-md border border-transparent px-3 py-2 text-[13px] transition",
                  active
                    ? "nav-active"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-[#0a1628]" : "opacity-60"
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.hot && (
                  <span className="rounded bg-[#c4a35a]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#8a6d2f]">
                    New
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-4 py-3 text-[10px] leading-relaxed text-slate-500">
        <div className="font-bold uppercase tracking-wider text-slate-400">
          Nguồn dữ liệu
        </div>
        Excel 103Ki 2QFC · Word · PPT Yamagomori
      </div>
    </aside>
  );
}
