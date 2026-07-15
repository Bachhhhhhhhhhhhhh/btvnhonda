"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import { chartTheme } from "@/components/charts/theme";
import { fmt } from "@/lib/utils";

/** Bridge waterfall: baseline → cost buckets → savings */
export function CostWaterfall() {
  const { result } = useTwinStore();
  const a = result.annual;

  const data = useMemo(() => {
    const north = result.months.reduce(
      (s, m) => s + m.northRentalCost + m.bonusCost,
      0
    );
    const lane = result.months.reduce(
      (s, m) => s + m.freightCost + m.packingCost + m.returnCost,
      0
    );
    const south =
      result.months.reduce(
        (s, m) => s + m.southWhCost + m.riskCost + m.importStackCost,
        0
      );
    // Waterfall-style cumulative bars
    const base = a.baselineCost / 1e9;
    const opt = a.totalCost / 1e9;
    const save = a.totalSavings / 1e9;
    return [
      { name: "Baseline", value: +base.toFixed(2), fill: chartTheme.colors.slate },
      { name: "Thuê+bonus", value: +(north / 1e9).toFixed(2), fill: chartTheme.colors.sky },
      { name: "Lane N→S", value: +(lane / 1e9).toFixed(2), fill: chartTheme.colors.violet },
      { name: "Nam+risk+stack", value: +(south / 1e9).toFixed(2), fill: chartTheme.colors.amber },
      { name: "Tối ưu Σ", value: +opt.toFixed(2), fill: chartTheme.colors.teal },
      {
        name: "Tiết kiệm",
        value: +save.toFixed(2),
        fill: save >= 0 ? chartTheme.colors.emerald : chartTheme.colors.rose,
      },
    ];
  }, [result, a]);

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)]">
      <div className="panel-kicker">Cost bridge</div>
      <div className="panel-title">Waterfall chi phí (tỷ VND)</div>
      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="16%">
            <CartesianGrid strokeDasharray="4 6" stroke={chartTheme.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: chartTheme.tick, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
            <Tooltip {...chartTheme.tooltip} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
            <ReferenceLine y={0} stroke={chartTheme.grid} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} name="Tỷ VND" maxBarSize={40}>
              {data.map((e, i) => (
                <Cell key={i} fill={e.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 text-center text-[11px] text-[var(--muted)]">
        Baseline {fmt(a.baselineCost / 1e9, 2)} → tối ưu {fmt(a.totalCost / 1e9, 2)} · save{" "}
        {fmt(a.totalSavings / 1e9, 2)} tỷ
      </div>
    </div>
  );
}
