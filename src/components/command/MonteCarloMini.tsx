"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import { monteCarlo } from "@/lib/engine/digitalTwin";
import { chartTheme } from "@/components/charts/theme";
import { fmt } from "@/lib/utils";
import { Dices, RefreshCw } from "lucide-react";
import Link from "next/link";

export function MonteCarloMini() {
  const params = useTwinStore((s) => s.params);
  const [seed, setSeed] = useState(0);
  const n = 300;

  const mc = useMemo(() => {
    void seed;
    return monteCarlo(params, n);
  }, [params, seed, n]);

  const bins = 12;
  const min = mc.samples[0];
  const max = mc.samples[mc.samples.length - 1];
  const width = (max - min) / bins || 1;
  const hist = Array.from({ length: bins }, (_, i) => {
    const lo = min + i * width;
    const hi = lo + width;
    const count = mc.samples.filter((x) =>
      x >= lo && (i === bins - 1 ? x <= hi : x < hi)
    ).length;
    return { bin: fmt(lo / 1e9, 1), count };
  });

  const pNeg = mc.samples.filter((x) => x < 0).length / n;

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-[var(--gold)]">
            <Dices className="h-4 w-4" />
          </div>
          <div>
            <div className="panel-kicker">Monte Carlo mini</div>
            <div className="text-sm font-bold text-[var(--ink)]">
              Phân phối savings · N={n}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="icon-btn"
          aria-label="Rerun"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mb-3 grid grid-cols-4 gap-1.5 text-center">
        {[
          { l: "Mean", v: `${fmt(mc.mean / 1e9, 2)}` },
          { l: "P10", v: `${fmt(mc.p10 / 1e9, 2)}` },
          { l: "P90", v: `${fmt(mc.p90 / 1e9, 2)}` },
          { l: "P&lt;0", v: `${fmt(pNeg * 100, 0)}%` },
        ].map((x) => (
          <div
            key={x.l}
            className="rounded-xl border border-[var(--line-soft)] bg-[var(--bg)] px-1 py-2"
          >
            <div className="text-[8px] font-bold uppercase text-[var(--muted)]">
              {x.l === "P&lt;0" ? "P<0" : x.l}
            </div>
            <div className="text-[11px] font-bold tabular-nums text-[var(--ink)]">
              {x.v}
            </div>
          </div>
        ))}
      </div>

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hist} barCategoryGap="12%">
            <CartesianGrid strokeDasharray="4 6" stroke={chartTheme.grid} vertical={false} />
            <XAxis dataKey="bin" tick={{ fill: chartTheme.tick, fontSize: 8 }} interval={2} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip {...chartTheme.tooltip} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
            <Bar dataKey="count" fill={chartTheme.colors.sky} radius={[6, 6, 0, 0]} name="Tần suất" maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Link
        href="/monte-carlo"
        className="mt-2 block text-center text-[11px] font-bold text-[var(--link)]"
      >
        Full Monte Carlo →
      </Link>
    </div>
  );
}
