"use client";

import { useMemo, useState } from "react";
import { useTwinStore } from "@/lib/store";
import { optimizePolicy } from "@/lib/engine/analytics";
import { fmt, fmtPct } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Scatter,
  ScatterChart,
  ZAxis,
  Cell,
} from "recharts";
import { chartTheme } from "@/components/charts/theme";
import { Sparkles, Check } from "lucide-react";

export function OptimizePanel() {
  const { params, setParam, result } = useTwinStore();
  const [applied, setApplied] = useState(false);

  const opt = useMemo(() => optimizePolicy(params), [params]);

  const heat = opt.grid.map((g) => ({
    x: Math.round(g.transfer * 100),
    y: Math.round(g.stack * 100),
    z: Math.max(0, g.savings / 1e9),
    savingsBn: +(g.savings / 1e9).toFixed(2),
  }));

  const top5 = [...opt.grid]
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 8)
    .map((g) => ({
      name: `S${Math.round(g.stack * 100)}/T${Math.round(g.transfer * 100)}`,
      save: +(g.savings / 1e9).toFixed(2),
      cont: Math.round(g.cont),
    }));

  const delta =
    opt.bestSavings - result.annual.totalSavings;

  const applyBest = () => {
    setParam("importStackRatio", opt.bestStackRatio);
    setParam("transferRatio", opt.bestTransferRatio);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  return (
    <Card accent>
      <CardHeader>
        <div className="section-kicker">Optimizer · Grid search</div>
        <CardTitle className="flex flex-wrap items-center gap-2">
          Tối ưu policy stack × transfer
          <span className="rounded-[2px] bg-[#faf6eb] px-2 py-0.5 text-[10px] font-bold text-[#7a6230]">
            Max savings
          </span>
        </CardTitle>
        <CardDescription>
          Quét lưới stack × transfer (giữ rate card). Điểm tối ưu ≠ zero outsource.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[3px] border border-[#e8d5a3] bg-[#faf6eb] p-3">
            <div className="text-[10px] font-bold uppercase text-[#7a6230]">
              Stack tối ưu
            </div>
            <div className="mt-1 text-2xl font-bold text-[#071428]">
              {fmtPct(opt.bestStackRatio, 0)}
            </div>
          </div>
          <div className="rounded-[3px] border border-[#e8d5a3] bg-[#faf6eb] p-3">
            <div className="text-[10px] font-bold uppercase text-[#7a6230]">
              Transfer tối ưu
            </div>
            <div className="mt-1 text-2xl font-bold text-[#071428]">
              {fmtPct(opt.bestTransferRatio, 0)}
            </div>
          </div>
          <div className="rounded-[3px] border border-teal-200 bg-teal-50 p-3">
            <div className="text-[10px] font-bold uppercase text-teal-800">
              Tiết kiệm max
            </div>
            <div className="mt-1 text-2xl font-bold text-teal-900">
              {fmt(opt.bestSavings / 1e9, 2)} tỷ
            </div>
            <div className="text-[11px] text-teal-700">
              Δ vs Twin: {delta >= 0 ? "+" : ""}
              {fmt(delta / 1e9, 2)} tỷ
            </div>
          </div>
        </div>

        <p className="text-[13px] leading-relaxed text-slate-600">
          {opt.recommendation}
        </p>

        <button
          type="button"
          onClick={applyBest}
          className="btn-bank-gold inline-flex items-center gap-2 px-4 py-2.5 text-sm"
        >
          {applied ? (
            <>
              <Check className="h-4 w-4" /> Đã áp dụng vào Twin
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Áp dụng policy tối ưu
            </>
          )}
        </button>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-56">
            <div className="mb-1 text-[10px] font-bold uppercase text-slate-400">
              Top policy theo savings
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={top5} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={false} />
                <XAxis type="number" tick={{ fill: chartTheme.tick, fontSize: 10 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={70}
                  tick={{ fill: chartTheme.tick, fontSize: 10 }}
                />
                <Tooltip {...chartTheme.tooltip} />
                <Bar dataKey="save" name="Tỷ VND" fill="#0d6b63" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-56">
            <div className="mb-1 text-[10px] font-bold uppercase text-slate-400">
              Heat grid (bubble = savings tỷ)
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <CartesianGrid stroke={chartTheme.grid} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="TF%"
                  unit="%"
                  domain={[0, 100]}
                  tick={{ fill: chartTheme.tick, fontSize: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Stack%"
                  unit="%"
                  domain={[40, 100]}
                  tick={{ fill: chartTheme.tick, fontSize: 10 }}
                />
                <ZAxis type="number" dataKey="z" range={[40, 280]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  {...chartTheme.tooltip}
                />
                <Scatter data={heat} fill="#0a4d6e">
                  {heat.map((e, i) => (
                    <Cell
                      key={i}
                      fill={
                        e.x === Math.round(opt.bestTransferRatio * 100) &&
                        e.y === Math.round(opt.bestStackRatio * 100)
                          ? "#b8954a"
                          : "#0a4d6e"
                      }
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
