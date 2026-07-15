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
  Network,
  Bike,
  MapPinned,
  ShieldCheck,
  Brain,
  FlaskConical,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard, group: "Điều hành" },
  { href: "/digital-twin", label: "Digital Twin", icon: Network, group: "Điều hành", hot: true },
  { href: "/wsb", label: "WSB What-if", icon: FlaskConical, group: "Điều hành", hot: true },
  { href: "/insights", label: "Insights & tối ưu", icon: Brain, group: "Điều hành", hot: true },
  { href: "/map", label: "Bản đồ mạng lưới", icon: MapPinned, group: "Điều hành" },
  { href: "/overview", label: "Giới thiệu dự án", icon: BookOpen, group: "Điều hành" },
  { href: "/warehouse", label: "Năng lực kho", icon: Warehouse, group: "Vận hành" },
  { href: "/vehicle", label: "Năng lực xe", icon: Bike, group: "Vận hành" },
  { href: "/import", label: "Tối ưu nhập khẩu", icon: Package, group: "Vận hành" },
  { href: "/domestic", label: "Tối ưu nội địa", icon: Ship, group: "Vận hành" },
  { href: "/container", label: "Container", icon: Container, group: "Vận hành" },
  { href: "/transport", label: "Vận tải Bắc–Nam", icon: Truck, group: "Vận hành" },
  { href: "/financial", label: "Tài chính", icon: Landmark, group: "Phân tích" },
  { href: "/scenarios", label: "Kịch bản", icon: GitCompare, group: "Phân tích" },
  { href: "/sensitivity", label: "Độ nhạy", icon: Activity, group: "Phân tích" },
  { href: "/monte-carlo", label: "Monte Carlo", icon: Dices, group: "Phân tích" },
  { href: "/risk", label: "Rủi ro", icon: ShieldAlert, group: "Phân tích" },
  { href: "/recommendations", label: "Khuyến nghị", icon: Lightbulb, group: "Báo cáo" },
  { href: "/report", label: "Báo cáo tư vấn", icon: FileText, group: "Báo cáo" },
  { href: "/data", label: "Dữ liệu nguồn", icon: Database, group: "Hệ thống" },
];

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const path = usePathname();
  let lastGroup = "";

  const body = (
    <>
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[3px] bg-gradient-to-b from-[#d4b76a] to-[#b8954a] text-[#071428] shadow-sm">
            <Boxes className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold tracking-tight text-white">
              LOG Twin
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#d4b76a]">
              Honda MC · DSS
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-[3px] border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-medium text-slate-400">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span>Phiên bảo mật · đã xác thực</span>
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
                <div className="mb-1.5 mt-4 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500 first:mt-0">
                  {item.group}
                </div>
              )}
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "mb-0.5 flex items-center gap-2.5 rounded-[3px] border border-transparent px-3 py-2 text-[12.5px] transition",
                  active
                    ? "nav-active"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
                )}
              >
                <Icon
                  className={cn(
                    "h-[15px] w-[15px] shrink-0",
                    active ? "opacity-100" : "opacity-50"
                  )}
                  strokeWidth={1.85}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {item.hot && !active && (
                  <span className="rounded-[2px] bg-[#b8954a]/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#d4b76a]">
                    New
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-3">
        <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Nguồn dữ liệu chính thức
        </div>
        <div className="mt-1 text-[10px] leading-relaxed text-slate-400">
          Excel 103Ki 2QFC · Word · PPT Yamagomori
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Hệ thống trực tuyến
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="no-print hidden h-screen w-[248px] shrink-0 flex-col bg-[#071428] text-slate-300 lg:flex">
        {body}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[150] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={onClose}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-[#071428] text-slate-300 shadow-2xl">
            {body}
          </aside>
        </div>
      )}
    </>
  );
}
