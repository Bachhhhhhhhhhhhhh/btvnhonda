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
      ? "from-rose-600 to-rose-900"
      : m.classification === "amber"
        ? "from-amber-500 to-amber-800"
        : "from-teal-600 to-teal-900";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[6px] border border-[#0a1628]/20 bg-white shadow-lg",
        className
      )}
    >
      <div className={cn("bg-gradient-to-r px-4 py-3 text-white", classTone)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 opacity-90" />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-90">
              Season playback · Twin live
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIdx((i) => (i - 1 + months.length) % months.length)}
              className="rounded bg-white/15 p-1.5 hover:bg-white/25"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="rounded bg-white/20 p-1.5 hover:bg-white/30"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setIdx((i) => (i + 1) % months.length)}
              className="rounded bg-white/15 p-1.5 hover:bg-white/25"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="ml-1 rounded bg-white/15 px-2 py-1 text-[10px] font-bold outline-none"
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
            className="mt-2 flex flex-wrap items-end justify-between gap-3"
          >
            <div>
              <div className="text-3xl font-black tracking-tight">{m.month}</div>
              <div className="text-xs font-semibold uppercase tracking-wide opacity-90">
                {m.classification === "red"
                  ? "Tháng ĐỎ · Pre-book T-4"
                  : m.classification === "amber"
                    ? "Tháng VÀNG · Monitor"
                    : "Tháng XANH · Ổn định"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase opacity-80">Residual sau stack</div>
              <div className="text-2xl font-black tabular-nums">
                {fmt(m.residualAfterImport)}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-4">
        {[
          { l: "Import", v: fmt(m.importVol) },
          { l: "Over gốc", v: fmt(m.baseOver) },
          { l: "Transfer y_t", v: fmt(m.transferVol) },
          { l: "Outsource z_t", v: fmt(m.outsourceVol) },
          { l: "Cont N→S", v: fmt(m.nsContainersBase, 1) },
          { l: "Case pool", v: fmt(m.casePool) },
          { l: "Chi phí", v: `${fmt(m.totalCost / 1e9, 2)} tỷ` },
          {
            l: "Áp lực over",
            v: fmtPct(m.baseOver / maxOver),
          },
        ].map((x) => (
          <div
            key={x.l}
            className="rounded-[4px] border border-[#eef2f6] bg-[#fafbfc] px-3 py-2"
          >
            <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              {x.l}
            </div>
            <div className="text-sm font-bold tabular-nums text-[#071428]">{x.v}</div>
          </div>
        ))}
      </div>

      {/* Timeline scrubber */}
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
        <div className="mt-1 flex justify-between text-[9px] font-bold text-slate-400">
          {months.map((x, i) => (
            <button
              key={x.month}
              type="button"
              onClick={() => {
                setIdx(i);
                setPlaying(false);
              }}
              className={cn(
                "transition",
                i === idx ? "text-[#071428] scale-110" : "hover:text-slate-600"
              )}
            >
              {x.month}
            </button>
          ))}
        </div>
      </div>

      <div className="h-40 border-t border-[#eef2f6] px-2 pb-3 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={spark}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
            <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 9 }} axisLine={false} />
            <YAxis hide />
            <Tooltip {...chartTheme.tooltip} />
            <Bar dataKey="residual" radius={[3, 3, 0, 0]}>
              {spark.map((e, i) => (
                <Cell
                  key={i}
                  fill={e.active ? "#b8954a" : "#0a4d6e"}
                  fillOpacity={e.active ? 1 : 0.35}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
