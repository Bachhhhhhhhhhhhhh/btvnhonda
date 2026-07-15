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
      color: "from-blue-600 to-blue-500",
      icon: Package,
    },
    {
      title: "Stack @ Bắc",
      value: fmt(a.importRelief),
      sub: "xe-eq relief",
      color: "from-teal-600 to-emerald-500",
      icon: Warehouse,
    },
    {
      title: "Transfer N→S",
      value: fmt(a.transferVol),
      sub: `${fmt(a.nsContainersBase)} cont`,
      color: "from-violet-600 to-purple-500",
      icon: Ship,
    },
    {
      title: "Thuê ngoài z_t",
      value: fmt(a.outsourceVol),
      sub: `peak ${fmt(peak.outsourceVol)}`,
      color: "from-rose-600 to-orange-500",
      icon: Warehouse,
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Value stream
          </div>
          <h3 className="text-lg font-black text-slate-900">
            Luồng tối ưu toàn mạng
          </h3>
          <p className="text-xs text-slate-500">
            Stack ratio {Math.round(params.importStackRatio * 100)}% · Transfer{" "}
            {Math.round(params.transferRatio * 100)}% residual
          </p>
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        {nodes.map((n, i) => {
          const Icon = n.icon;
          return (
            <div key={n.title} className="flex flex-1 flex-col items-center lg:flex-row">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`w-full min-w-0 flex-1 rounded-2xl bg-gradient-to-br ${n.color} p-4 text-white shadow-lg`}
              >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/80">
                  <Icon className="h-3.5 w-3.5" />
                  {n.title}
                </div>
                <div className="mt-1 text-2xl font-black tabular-nums tracking-tight">
                  {n.value}
                </div>
                <div className="text-[11px] text-white/75">{n.sub}</div>
              </motion.div>
              {i < nodes.length - 1 && (
                <div className="flex shrink-0 items-center justify-center py-1 text-slate-300 lg:px-2 lg:py-0">
                  <ArrowRight className="hidden h-5 w-5 lg:block" />
                  <ArrowDown className="h-5 w-5 lg:hidden" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {[
          { l: "Baseline cost", v: `${fmt(a.baselineCost / 1e9, 2)} tỷ` },
          { l: "Optimized cost", v: `${fmt(a.totalCost / 1e9, 2)} tỷ` },
          {
            l: "Net savings",
            v: `${fmt(a.totalSavings / 1e9, 2)} tỷ`,
            hot: true,
          },
        ].map((x) => (
          <div
            key={x.l}
            className={`rounded-xl border px-3 py-2.5 ${
              x.hot
                ? "border-emerald-200 bg-emerald-50"
                : "border-slate-100 bg-slate-50"
            }`}
          >
            <div className="text-[10px] font-bold uppercase text-slate-400">
              {x.l}
            </div>
            <div
              className={`text-sm font-black tabular-nums ${
                x.hot ? "text-emerald-700" : "text-slate-900"
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
