"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Network,
  Brain,
  FlaskConical,
  MapPinned,
  FileText,
  Landmark,
  Warehouse,
  Package,
  Ship,
  Container,
  Truck,
  GitCompare,
  Activity,
  Dices,
  ShieldAlert,
  Lightbulb,
  Database,
  BookOpen,
  Bike,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { exportTwinPack } from "@/lib/export";
import { useTwinStore } from "@/lib/store";
import { useThemeStore } from "@/lib/theme-store";

const ROUTES = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard, kw: "dashboard home" },
  { href: "/digital-twin", label: "Digital Twin", icon: Network, kw: "twin control" },
  { href: "/wsb", label: "WSB What-if Builder", icon: FlaskConical, kw: "whatif scenario builder wsb" },
  { href: "/insights", label: "Insights & tối ưu", icon: Brain, kw: "insights optimize" },
  { href: "/planner", label: "S&OP Planner", icon: LayoutDashboard, kw: "planner checklist goals sop" },
  { href: "/map", label: "Bản đồ", icon: MapPinned, kw: "map gis" },
  { href: "/overview", label: "Giới thiệu dự án", icon: BookOpen, kw: "overview" },
  { href: "/warehouse", label: "Năng lực kho", icon: Warehouse, kw: "warehouse capacity" },
  { href: "/vehicle", label: "Năng lực xe", icon: Bike, kw: "vehicle density" },
  { href: "/import", label: "Nhập khẩu", icon: Package, kw: "import stack" },
  { href: "/domestic", label: "Nội địa", icon: Ship, kw: "domestic transfer" },
  { href: "/container", label: "Container", icon: Container, kw: "container case" },
  { href: "/transport", label: "Vận tải", icon: Truck, kw: "transport freight" },
  { href: "/financial", label: "Tài chính", icon: Landmark, kw: "finance roi npv" },
  { href: "/scenarios", label: "Kịch bản", icon: GitCompare, kw: "scenarios" },
  { href: "/sensitivity", label: "Độ nhạy", icon: Activity, kw: "sensitivity tornado" },
  { href: "/monte-carlo", label: "Monte Carlo", icon: Dices, kw: "monte carlo risk" },
  { href: "/risk", label: "Rủi ro", icon: ShieldAlert, kw: "risk raci" },
  { href: "/recommendations", label: "Khuyến nghị", icon: Lightbulb, kw: "recommendations" },
  { href: "/report", label: "Báo cáo tư vấn", icon: FileText, kw: "report board pack" },
  { href: "/data", label: "Dữ liệu nguồn", icon: Database, kw: "data source" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const { params, result, saveSnapshot } = useTwinStore();
  const toggleMode = useThemeStore((s) => s.toggleMode);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQ("");
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const items = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const routes = ROUTES.filter(
      (r) =>
        !qq ||
        r.label.toLowerCase().includes(qq) ||
        r.kw.includes(qq) ||
        r.href.includes(qq)
    );
    const actions = [
      {
        id: "export",
        label: "Export Twin pack (JSON + CSV)",
        run: () => exportTwinPack(params, result),
        show: !qq || "export csv json".includes(qq),
      },
      {
        id: "snap",
        label: "Lưu snapshot policy hiện tại",
        run: () => saveSnapshot(`Cmd · ${new Date().toLocaleTimeString("vi-VN")}`),
        show: !qq || "snapshot lưu".includes(qq),
      },
      {
        id: "wsb",
        label: "Mở WSB What-if Builder",
        run: () => router.push("/wsb"),
        show: !qq || "wsb whatif".includes(qq),
      },
      {
        id: "theme",
        label: "Toggle Dark / Light mode",
        run: () => toggleMode(),
        show: !qq || "theme dark light".includes(qq),
      },
      {
        id: "chat",
        label: "Hỏi Twin Chat (dashboard)",
        run: () => router.push("/"),
        show: !qq || "chat hỏi twin".includes(qq),
      },
    ].filter((a) => a.show);
    return { routes, actions };
  }, [q, params, result, router, saveSnapshot, toggleMode]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-[2px]">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={() => setOpen(false)}
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[6px] border border-[#dce3ec] bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-[#eef2f6] px-3 py-2.5">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm trang, WSB, export… (Ctrl+K)"
            className="w-full bg-transparent text-sm font-medium text-[#071428] outline-none placeholder:text-slate-400"
          />
          <kbd className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
            ESC
          </kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {items.actions.length > 0 && (
            <div className="mb-2">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Hành động
              </div>
              {items.actions.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    a.run();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-[3px] px-2 py-2 text-left text-sm font-semibold text-[#071428] hover:bg-[#f7f9fc]"
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Điều hướng
          </div>
          {items.routes.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-slate-400">
              Không có kết quả
            </div>
          )}
          {items.routes.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.href}
                type="button"
                onClick={() => {
                  router.push(r.href);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-[3px] px-2 py-2 text-left text-sm hover:bg-[#f7f9fc]"
                )}
              >
                <Icon className="h-4 w-4 text-slate-400" />
                <span className="font-semibold text-[#071428]">{r.label}</span>
                <span className="ml-auto text-[11px] text-slate-400">{r.href}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
