"use client";

import { useMemo } from "react";
import { useTwinStore } from "@/lib/store";
import { scorecard } from "@/lib/engine/analytics";
import { fmt, fmtPct } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-counter";

/** Circular command-center health + orbiting KPIs */
export function MetricOrbit() {
  const { result, params } = useTwinStore();
  const a = result.annual;
  const sc = useMemo(() => scorecard(result, params), [result, params]);

  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (sc.overall / 100) * c;

  const satellites = [
    { l: "Save", v: `${fmt(a.totalSavings / 1e9, 1)}T` },
    { l: "ROI", v: fmtPct(a.roi, 0) },
    { l: "S%", v: fmtPct(params.importStackRatio, 0) },
    { l: "T%", v: fmtPct(params.transferRatio, 0) },
    { l: "z", v: fmt(a.outsourceVol) },
    { l: "Cont", v: fmt(a.nsContainersBase) },
  ];

  return (
    <div className="cc-panel relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)] p-6">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--line)]" />
        <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[var(--gold)]/30" />
      </div>

      <div className="relative h-40 w-40">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke="var(--line)"
            strokeWidth="8"
          />
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke="url(#orbitGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
          <defs>
            <linearGradient id="orbitGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#b8954a" />
              <stop offset="50%" stopColor="#0d6b63" />
              <stop offset="100%" stopColor="#0a4d6e" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Health
          </div>
          <div className="text-3xl font-black tabular-nums text-[var(--ink)]">
            <AnimatedNumber value={sc.overall} />
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-4 grid w-full grid-cols-3 gap-2">
        {satellites.map((s) => (
          <div
            key={s.l}
            className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2 py-2 text-center"
          >
            <div className="text-[9px] font-bold uppercase text-[var(--muted)]">
              {s.l}
            </div>
            <div className="text-xs font-black tabular-nums text-[var(--ink)]">
              {s.v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
