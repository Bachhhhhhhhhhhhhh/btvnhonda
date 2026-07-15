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
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/theme-store";

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
  const collapsed = useThemeStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useThemeStore((s) => s.toggleSidebar);
  let lastGroup = "";

  const NavBody = ({ isMobile = false }: { isMobile?: boolean }) => {
    const showLabels = isMobile || !collapsed;
    return (
      <>
        <div className={cn("border-b border-white/10", showLabels ? "px-4 py-4" : "px-2 py-3")}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-[#d4b76a] to-[#b8954a] text-[#071428] shadow-sm">
              <Boxes className="h-5 w-5" strokeWidth={2.25} />
            </div>
            {showLabels && (
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold tracking-tight text-white">
                  LOG Twin
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#d4b76a]">
                  Honda MC · DSS
                </div>
              </div>
            )}
            {onClose && isMobile && (
              <button
                type="button"
                onClick={onClose}
                className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {showLabels && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-medium text-slate-400">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>Phiên bảo mật</span>
            </div>
          )}
        </div>

        <nav className={cn("flex-1 overflow-y-auto py-3", showLabels ? "px-2" : "px-1.5")}>
          {NAV.map((item) => {
            const showGroup = showLabels && item.group !== lastGroup;
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
                  title={item.label}
                  className={cn(
                    "mb-0.5 flex items-center rounded-lg border border-transparent transition",
                    showLabels ? "gap-2.5 px-3 py-2 text-[12.5px]" : "justify-center px-2 py-2.5",
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
                  {showLabels && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.hot && !active && (
                        <span className="rounded bg-[#b8954a]/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#d4b76a]">
                          New
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className={cn("border-t border-white/10", showLabels ? "px-4 py-3" : "px-2 py-3")}>
          {!isMobile && (
            <button
              type="button"
              onClick={toggleSidebar}
              className={cn(
                "mb-2 flex w-full items-center rounded-lg border border-white/10 py-2 text-slate-400 hover:bg-white/5 hover:text-white",
                showLabels ? "gap-2 px-3 text-[11px] font-semibold" : "justify-center"
              )}
              title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4" />
                  <span>Thu gọn</span>
                </>
              )}
            </button>
          )}
          {showLabels && (
            <>
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Nguồn dữ liệu
              </div>
              <div className="mt-1 text-[10px] leading-relaxed text-slate-400">
                Excel 103Ki 2QFC · Word · PPT
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Online
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <aside
        className={cn(
          "cc-sidebar no-print hidden h-screen shrink-0 flex-col bg-[var(--sidebar)] text-slate-300 transition-[width] duration-200 lg:flex",
          collapsed ? "w-[68px]" : "w-[248px]"
        )}
      >
        <NavBody />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[150] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={onClose}
          />
          <aside className="cc-sidebar absolute left-0 top-0 flex h-full w-[280px] flex-col bg-[var(--sidebar)] text-slate-300 shadow-2xl">
            <NavBody isMobile />
          </aside>
        </div>
      )}
    </>
  );
}
