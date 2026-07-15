"use client";

import { motion } from "framer-motion";
import { useTwinStore } from "@/lib/store";
import { fmt } from "@/lib/utils";
import { ArrowDown, ArrowRight, Package, Ship, Warehouse } from "lucide-react";

export function NetworkFlow() {
  const { result, params } = useTwinStore();
  const a = result.annual;
  const peak = result.months.reduce((b, m) =>
    m.baseOver > b.baseOver ? m : b
  );

  const nodes = [
    {
      title: "Import NK",
      value: fmt(a.importVol),
      sub: "xe / năm",
      icon: Package,
      bg: "bg-[#0a1628]",
    },
    {
      title: "Stack @ Bắc",
      value: fmt(a.importRelief),
      sub: "xe-eq relief",
      icon: Warehouse,
      bg: "bg-[#0c4a6e]",
    },
    {
      title: "Transfer N→S",
      value: fmt(a.transferVol),
      sub: `${fmt(a.nsContainersBase)} cont`,
      icon: Ship,
      bg: "bg-[#0f766e]",
    },
    {
      title: "Thuê ngoài z_t",
      value: fmt(a.outsourceVol),
      sub: `peak ${fmt(peak.outsourceVol)}`,
      icon: Warehouse,
      bg: "bg-[#7c2d12]",
    },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Luồng giá trị
          </div>
          <h3 className="text-base font-bold text-[#0a1628]">
            Chuỗi tối ưu toàn mạng lưới
          </h3>
          <p className="text-xs text-slate-500">
            Stack {Math.round(params.importStackRatio * 100)}% · Transfer{" "}
            {Math.round(params.transferRatio * 100)}% residual
          </p>
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
        {nodes.map((n, i) => {
          const Icon = n.icon;
          return (
            <div key={n.title} className="flex flex-1 flex-col items-center lg:flex-row">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`w-full flex-1 rounded-md ${n.bg} p-4 text-white`}
              >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/70">
                  <Icon className="h-3.5 w-3.5" />
                  {n.title}
                </div>
                <div className="mt-1 text-xl font-bold tabular-nums">{n.value}</div>
                <div className="text-[11px] text-white/65">{n.sub}</div>
              </motion.div>
              {i < nodes.length - 1 && (
                <div className="flex shrink-0 items-center justify-center py-1 text-slate-300 lg:px-1.5 lg:py-0">
                  <ArrowRight className="hidden h-4 w-4 lg:block" />
                  <ArrowDown className="h-4 w-4 lg:hidden" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {[
          { l: "Chi phí baseline", v: `${fmt(a.baselineCost / 1e9, 2)} tỷ` },
          { l: "Chi phí tối ưu", v: `${fmt(a.totalCost / 1e9, 2)} tỷ` },
          {
            l: "Tiết kiệm ròng",
            v: `${fmt(a.totalSavings / 1e9, 2)} tỷ`,
            hot: true,
          },
        ].map((x) => (
          <div
            key={x.l}
            className={`rounded-md border px-3 py-2.5 ${
              x.hot
                ? "border-[#c4a35a]/40 bg-[#faf6eb]"
                : "border-slate-100 bg-slate-50"
            }`}
          >
            <div className="text-[10px] font-bold uppercase text-slate-400">
              {x.l}
            </div>
            <div
              className={`text-sm font-bold tabular-nums ${
                x.hot ? "text-[#7a6230]" : "text-[#0a1628]"
              }`}
            >
              {x.v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
