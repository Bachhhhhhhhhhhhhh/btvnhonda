"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTwinStore } from "@/lib/store";
import { fmt, fmtPct } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartTheme } from "@/components/charts/theme";
import { Pause, Play, SkipBack, SkipForward, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

export function MonthPlayback({ className }: { className?: string }) {
  const { result } = useTwinStore();
  const months = result.months;
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % months.length);
    }, 1400 / speed);
    return () => clearInterval(t);
  }, [playing, speed, months.length]);

  const m = months[idx];
  const maxOver = Math.max(...months.map((x) => x.baseOver), 1);

  const spark = useMemo(
    () =>
      months.map((x, i) => ({
        month: x.month,
        residual: Math.round(x.residualAfterImport),
        active: i === idx,
      })),
    [months, idx]
  );

  if (!m) return null;

  const classTone =
    m.classification === "red"
      ? "from-[#9f1239] via-[#be123c] to-[#7f1d1d]"
      : m.classification === "amber"
        ? "from-[#b45309] via-[#d97706] to-[#78350f]"
        : "from-[#0f766e] via-[#0d9488] to-[#115e59]";

  const statusLabel =
    m.classification === "red"
      ? "Tháng ĐỎ · Pre-book T-4"
      : m.classification === "amber"
        ? "Tháng VÀNG · Monitor"
        : "Tháng XANH · Ổn định";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow-sm)]",
        className
      )}
    >
      <div className={cn("relative bg-gradient-to-br px-5 py-4 text-white", classTone)}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Gauge className="h-4 w-4 opacity-95" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-90">
              Season playback · Twin live
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIdx((i) => (i - 1 + months.length) % months.length)}
              className="rounded-lg bg-white/15 p-1.5 transition hover:bg-white/25"
              aria-label="Previous month"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="rounded-lg bg-white/20 p-1.5 transition hover:bg-white/30"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setIdx((i) => (i + 1) % months.length)}
              className="rounded-lg bg-white/15 p-1.5 transition hover:bg-white/25"
              aria-label="Next month"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="ml-1 rounded-lg border-0 bg-white/15 px-2 py-1 text-[10px] font-bold outline-none backdrop-blur"
            >
              <option value={0.5}>0.5×</option>
              <option value={1}>1×</option>
              <option value={2}>2×</option>
              <option value={3}>3×</option>
            </select>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={m.month}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="relative mt-3 flex flex-wrap items-end justify-between gap-3"
          >
            <div>
              <div className="text-3xl font-bold tracking-tight">{m.month}</div>
              <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide opacity-90">
                {statusLabel}
              </div>
            </div>
            <div className="rounded-xl bg-black/15 px-3 py-2 text-right backdrop-blur-sm">
              <div className="text-[10px] uppercase opacity-80">Residual sau stack</div>
              <div className="text-2xl font-bold tabular-nums tracking-tight">
                {fmt(m.residualAfterImport)}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid gap-2 p-4 sm:grid-cols-4">
        {[
          { l: "Import", v: fmt(m.importVol) },
          { l: "Over gốc", v: fmt(m.baseOver) },
          { l: "Transfer y_t", v: fmt(m.transferVol) },
          { l: "Outsource z_t", v: fmt(m.outsourceVol) },
          { l: "Cont N→S", v: fmt(m.nsContainersBase, 1) },
          { l: "Case pool", v: fmt(m.casePool) },
          { l: "Chi phí", v: `${fmt(m.totalCost / 1e9, 2)} tỷ` },
          { l: "Áp lực over", v: fmtPct(m.baseOver / maxOver) },
        ].map((x) => (
          <div
            key={x.l}
            className="rounded-xl border border-[var(--line-soft)] bg-[var(--bg)] px-3 py-2.5"
          >
            <div className="text-[9px] font-bold uppercase tracking-wide text-[var(--muted)]">
              {x.l}
            </div>
            <div className="mt-0.5 text-sm font-bold tabular-nums text-[var(--ink)]">
              {x.v}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-2">
        <input
          type="range"
          min={0}
          max={months.length - 1}
          value={idx}
          onChange={(e) => {
            setIdx(Number(e.target.value));
            setPlaying(false);
          }}
          className="w-full"
        />
        <div className="mt-1.5 flex justify-between text-[9px] font-semibold text-[var(--muted)]">
          {months.map((x, i) => (
            <button
              key={x.month}
              type="button"
              onClick={() => {
                setIdx(i);
                setPlaying(false);
              }}
              className={cn(
                "rounded px-0.5 transition",
                i === idx
                  ? "scale-110 font-bold text-[var(--ink)]"
                  : "hover:text-[var(--ink)]"
              )}
            >
              {x.month}
            </button>
          ))}
        </div>
      </div>

      <div className="h-40 border-t border-[var(--line-soft)] px-2 pb-3 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={spark} barCategoryGap="18%">
            <CartesianGrid strokeDasharray="4 6" stroke={chartTheme.grid} vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: chartTheme.tick, fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip {...chartTheme.tooltip} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
            <Bar dataKey="residual" radius={[6, 6, 0, 0]} maxBarSize={28}>
              {spark.map((e, i) => (
                <Cell
                  key={i}
                  fill={e.active ? chartTheme.colors.gold : chartTheme.colors.sky}
                  fillOpacity={e.active ? 1 : 0.32}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
