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
      accent: "from-[#0b1220] to-[#152338]",
      ring: "ring-white/10",
    },
    {
      title: "Stack @ Bắc",
      value: fmt(a.importRelief),
      sub: "xe-eq relief",
      icon: Warehouse,
      accent: "from-[#0e4d6b] to-[#0a3a52]",
      ring: "ring-sky-400/20",
    },
    {
      title: "Transfer N→S",
      value: fmt(a.transferVol),
      sub: `${fmt(a.nsContainersBase)} cont`,
      icon: Ship,
      accent: "from-[#0f766e] to-[#0b5c56]",
      ring: "ring-teal-400/20",
    },
    {
      title: "Thuê ngoài z_t",
      value: fmt(a.outsourceVol),
      sub: `peak ${fmt(peak.outsourceVol)}`,
      icon: Warehouse,
      accent: "from-[#9a3412] to-[#7c2d12]",
      ring: "ring-orange-400/15",
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)]">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-[var(--line-soft)] pb-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--gold)]">
            Value stream
          </div>
          <h3 className="text-base font-bold text-[var(--ink)]">
            Chuỗi tối ưu toàn mạng lưới
          </h3>
          <p className="text-xs text-[var(--muted)]">
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
                className={`w-full flex-1 rounded-xl bg-gradient-to-br ${n.accent} p-4 text-white ring-1 ${n.ring} shadow-sm`}
              >
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/70">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {n.title}
                </div>
                <div className="mt-2 text-xl font-bold tabular-nums tracking-tight">
                  {n.value}
                </div>
                <div className="text-[11px] text-white/55">{n.sub}</div>
              </motion.div>
              {i < nodes.length - 1 && (
                <div className="flex shrink-0 items-center justify-center py-1 text-[var(--muted)] lg:px-2.5 lg:py-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--bg)]">
                    <ArrowRight className="hidden h-3.5 w-3.5 lg:block" />
                    <ArrowDown className="h-3.5 w-3.5 lg:hidden" />
                  </div>
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
            className="rounded-xl border border-[var(--line-soft)] bg-[var(--bg)] px-3.5 py-3"
          >
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
              {x.l}
            </div>
            <div
              className={`mt-1 text-base font-bold tabular-nums ${
                "hot" in x && x.hot ? "text-[var(--good)]" : "text-[var(--ink)]"
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
