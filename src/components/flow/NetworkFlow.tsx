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
      bg: "from-[#0a1628] to-[#12253f]",
      glow: "shadow-[0_0_24px_rgba(10,22,40,0.35)]",
    },
    {
      title: "Stack @ Bắc",
      value: fmt(a.importRelief),
      sub: "xe-eq relief",
      icon: Warehouse,
      bg: "from-[#0c4a6e] to-[#0369a1]",
      glow: "shadow-[0_0_24px_rgba(12,74,110,0.35)]",
    },
    {
      title: "Transfer N→S",
      value: fmt(a.transferVol),
      sub: `${fmt(a.nsContainersBase)} cont`,
      icon: Ship,
      bg: "from-[#0f766e] to-[#0d9488]",
      glow: "shadow-[0_0_24px_rgba(13,148,136,0.3)]",
    },
    {
      title: "Thuê ngoài z_t",
      value: fmt(a.outsourceVol),
      sub: `peak ${fmt(peak.outsourceVol)}`,
      icon: Warehouse,
      bg: "from-[#7c2d12] to-[#9a3412]",
      glow: "shadow-[0_0_24px_rgba(154,52,18,0.3)]",
    },
  ];

  return (
    <div className="wow-card overflow-hidden rounded-[6px] border border-[#dce3ec] bg-white p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-[#eef2f6] pb-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b8954a]">
            Value stream · animated
          </div>
          <h3 className="text-base font-bold text-[#071428]">
            Chuỗi tối ưu toàn mạng lưới
          </h3>
          <p className="text-xs text-slate-500">
            Stack {Math.round(params.importStackRatio * 100)}% · Transfer{" "}
            {Math.round(params.transferRatio * 100)}% residual
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-teal-700">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-teal-500" />
          Flowing
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
        {nodes.map((n, i) => {
          const Icon = n.icon;
          return (
            <div key={n.title} className="flex flex-1 flex-col items-center lg:flex-row">
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 120 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`flow-node relative w-full flex-1 overflow-hidden rounded-[6px] bg-gradient-to-br ${n.bg} ${n.glow} p-4 text-white`}
              >
                <div className="flow-sheen absolute inset-0 opacity-40" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/70">
                    <Icon className="h-3.5 w-3.5" />
                    {n.title}
                  </div>
                  <div className="mt-1 text-xl font-black tabular-nums tracking-tight">
                    {n.value}
                  </div>
                  <div className="text-[11px] text-white/65">{n.sub}</div>
                </div>
              </motion.div>
              {i < nodes.length - 1 && (
                <div className="flow-arrow relative flex shrink-0 items-center justify-center py-1 text-[#b8954a] lg:px-2 lg:py-0">
                  <ArrowRight className="hidden h-5 w-5 lg:block" />
                  <ArrowDown className="h-5 w-5 lg:hidden" />
                  <span className="flow-dot absolute hidden h-1.5 w-1.5 rounded-full bg-[#fbbf24] lg:block" />
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
            className={`rounded-[4px] border px-3 py-2.5 ${
              x.hot
                ? "border-[#c4a35a]/50 bg-gradient-to-br from-[#faf6eb] to-white shadow-[0_0_20px_rgba(184,149,74,0.15)]"
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
