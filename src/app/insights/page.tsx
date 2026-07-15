"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Line,
  LineChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import {
  buildInsights,
  contributionCosts,
  multiYearCashflow,
  optimizePolicy,
  heatmapTransferStack,
  monthlyRiskMatrix,
  unitEconomics,
} from "@/lib/engine/analytics";
import { OpsAlerts } from "@/components/analytics/OpsAlerts";
import { PresetBar } from "@/components/analytics/PresetBar";
import { ScorecardRing } from "@/components/analytics/ScorecardRing";
import { OptimizePanel } from "@/components/analytics/OptimizePanel";
import { SectionHeader, MetricRow, InsightBox } from "@/components/ui/section-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Kpi } from "@/components/ui/kpi";
import { fmt, fmtPct } from "@/lib/utils";
import { chartTheme } from "@/components/charts/theme";
import {
  Brain,
  TrendingUp,
  Layers,
  Scale,
  ArrowRight,
  Camera,
  Trash2,
} from "lucide-react";

const CAT_COLOR: Record<string, string> = {
  capacity: "bg-sky-100 text-sky-900",
  cost: "bg-violet-100 text-violet-900",
  policy: "bg-amber-100 text-amber-900",
  risk: "bg-rose-100 text-rose-900",
  equipment: "bg-teal-100 text-teal-900",
  finance: "bg-emerald-100 text-emerald-900",
};

export default function InsightsPage() {
  const {
    result,
    params,
    snapshots,
    saveSnapshot,
    loadSnapshot,
    removeSnapshot,
    clearSnapshots,
  } = useTwinStore();
  const a = result.annual;

  const insights = useMemo(
    () => buildInsights(result, params),
    [result, params]
  );
  const costs = useMemo(() => contributionCosts(result), [result]);
  const cashflow = useMemo(
    () => multiYearCashflow(result, params, 5),
    [result, params]
  );
  const opt = useMemo(() => optimizePolicy(params), [params]);
  const heat = useMemo(() => heatmapTransferStack(params), [params]);
  const riskMx = useMemo(
    () => monthlyRiskMatrix(result.months),
    [result.months]
  );
  const ue = useMemo(() => unitEconomics(params), [params]);

  const costBars = costs.map((c) => ({
    name: c.name,
    bn: +(c.amount / 1e9).toFixed(3),
    pct: +(c.pct * 100).toFixed(1),
  }));

  const radar = [
    { m: "Savings", v: Math.min(100, (a.totalSavings / 1e9 / 12) * 100) },
    { m: "ROI", v: Math.min(100, a.roi * 35) },
    { m: "Stack", v: params.importStackRatio * 100 },
    { m: "TF margin", v: ue.justified ? 80 : 25 },
    { m: "Peak calm", v: Math.max(0, 100 - riskMx.filter((r) => r.class === "red").length * 20) },
    { m: "Equip OK", v: Math.min(100, 100 - a.peakCasePool / 200) },
  ];

  const compareSnap =
    snapshots.length >= 2
      ? {
          a: snapshots[snapshots.length - 2],
          b: snapshots[snapshots.length - 1],
        }
      : null;

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="Phân tích · Command intelligence"
        title="Insights & tối ưu nâng cao"
        subtitle="Cảnh báo live · insight tự sinh · grid search policy · cashflow · scorecard · so sánh snapshot A/B. Mọi số bám Digital Twin."
        actions={
          <Link href="/report" className="btn-bank-gold px-3 py-2 text-xs">
            Xuất báo cáo
          </Link>
        }
      />

      <PresetBar />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Tiết kiệm Twin"
          value={`${fmt(a.totalSavings / 1e9, 2)} tỷ`}
          tone={a.totalSavings > 0 ? "good" : "bad"}
          icon={TrendingUp}
        />
        <Kpi
          label="Policy tối ưu (grid)"
          value={`${fmtPct(opt.bestStackRatio, 0)} / ${fmtPct(opt.bestTransferRatio, 0)}`}
          sub={`Max ${fmt(opt.bestSavings / 1e9, 2)} tỷ`}
          tone="accent"
          icon={Brain}
        />
        <Kpi
          label="Biên unit TF"
          value={`${ue.margin >= 0 ? "+" : ""}${fmt(Math.round(ue.margin))}`}
          sub="VND/xe"
          tone={ue.justified ? "good" : "bad"}
          icon={Scale}
        />
        <Kpi
          label="Relief NK"
          value={fmt(a.importRelief)}
          sub={`${fmt(a.m2Saved)} m²`}
          icon={Layers}
        />
      </div>

      <MetricRow
        items={[
          { label: "Stack", value: fmtPct(params.importStackRatio, 0) },
          { label: "Transfer", value: fmtPct(params.transferRatio, 0) },
          { label: "Outsource năm", value: fmt(a.outsourceVol) },
          { label: "Cont N→S", value: fmt(a.nsContainersBase) },
        ]}
      />

      <OpsAlerts max={8} />

      <div className="grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3 space-y-4">
          <Card accent>
            <CardHeader>
              <div className="section-kicker">Auto insights</div>
              <CardTitle>Phát hiện từ mô hình</CardTitle>
              <CardDescription>
                Sinh động theo params Twin — không hardcode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((ins) => (
                <div
                  key={ins.id}
                  className="flex gap-3 rounded-[3px] border border-[#eef2f6] p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-[2px] px-1.5 py-0.5 text-[9px] font-bold uppercase ${CAT_COLOR[ins.category]}`}
                      >
                        {ins.category}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase ${
                          ins.impact === "high"
                            ? "text-rose-700"
                            : ins.impact === "medium"
                              ? "text-amber-700"
                              : "text-slate-400"
                        }`}
                      >
                        {ins.impact}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-bold text-[#071428]">
                      {ins.headline}
                    </div>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate-600">
                      {ins.body}
                    </p>
                  </div>
                  {ins.value && (
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-bold tabular-nums text-[#0a4d6e]">
                        {ins.value}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <OptimizePanel />
        </div>

        <div className="xl:col-span-2 space-y-4">
          <ScorecardRing />

          <Card>
            <CardHeader>
              <CardTitle>Radar sức khỏe policy</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar}>
                  <PolarGrid stroke={chartTheme.grid} />
                  <PolarAngleAxis
                    dataKey="m"
                    tick={{ fill: chartTheme.tick, fontSize: 10 }}
                  />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} />
                  <Radar
                    dataKey="v"
                    stroke="#0a4d6e"
                    fill="#0a4d6e"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-[#b8954a]" />
                Snapshot A/B
              </CardTitle>
              <CardDescription>
                Lưu tối đa 8 policy · so 2 snapshot gần nhất
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => saveSnapshot()}
                  className="btn-bank px-3 py-1.5 text-[11px]"
                >
                  Lưu hiện tại
                </button>
                {snapshots.length > 0 && (
                  <button
                    type="button"
                    onClick={() => clearSnapshots()}
                    className="btn-bank-outline inline-flex items-center gap-1 px-3 py-1.5 text-[11px]"
                  >
                    <Trash2 className="h-3 w-3" /> Xóa hết
                  </button>
                )}
              </div>
              {snapshots.length === 0 && (
                <p className="text-xs text-slate-500">
                  Chưa có snapshot. Lưu 2 policy khác nhau để so sánh.
                </p>
              )}
              <ul className="space-y-1.5">
                {snapshots.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-2 rounded-[3px] border border-[#eef2f6] px-2.5 py-2 text-[12px]"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-bold text-[#071428]">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Save {fmt(s.result.annual.totalSavings / 1e9, 2)} tỷ ·{" "}
                        {new Date(s.savedAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => loadSnapshot(s.id)}
                        className="rounded border border-[#dce3ec] px-2 py-1 text-[10px] font-bold hover:bg-slate-50"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSnapshot(s.id)}
                        className="rounded border border-rose-100 px-2 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-50"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {compareSnap && (
                <div className="mt-2 overflow-x-auto rounded-[3px] border border-[#dce3ec]">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#f7f9fc]">
                      <tr>
                        <th className="px-2 py-1.5">Chỉ số</th>
                        <th className="px-2 py-1.5">A</th>
                        <th className="px-2 py-1.5">B</th>
                        <th className="px-2 py-1.5">Δ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        [
                          "Tiết kiệm tỷ",
                          compareSnap.a.result.annual.totalSavings / 1e9,
                          compareSnap.b.result.annual.totalSavings / 1e9,
                        ],
                        [
                          "Outsource",
                          compareSnap.a.result.annual.outsourceVol,
                          compareSnap.b.result.annual.outsourceVol,
                        ],
                        [
                          "Transfer",
                          compareSnap.a.result.annual.transferVol,
                          compareSnap.b.result.annual.transferVol,
                        ],
                        [
                          "Cont",
                          compareSnap.a.result.annual.nsContainersBase,
                          compareSnap.b.result.annual.nsContainersBase,
                        ],
                      ].map(([lab, av, bv]) => (
                        <tr key={lab as string} className="border-t border-[#eef2f6]">
                          <td className="px-2 py-1 font-semibold">{lab}</td>
                          <td className="px-2 py-1 tabular-nums">
                            {fmt(av as number, 2)}
                          </td>
                          <td className="px-2 py-1 tabular-nums">
                            {fmt(bv as number, 2)}
                          </td>
                          <td className="px-2 py-1 tabular-nums font-bold">
                            {(bv as number) - (av as number) >= 0 ? "+" : ""}
                            {fmt((bv as number) - (av as number), 2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pareto chi phí (tỷ VND)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costBars} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={false} />
                <XAxis type="number" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fill: chartTheme.tick, fontSize: 10 }}
                />
                <Tooltip {...chartTheme.tooltip} />
                <Bar dataKey="bn" name="Tỷ VND" fill="#0a4d6e" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cashflow 5 năm (tỷ VND)</CardTitle>
            <CardDescription>
              Y0 capex · Y1–Y5 savings không đổi · discount {fmtPct(params.cost.discountRate)}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={cashflow.map((c) => ({
                  ...c,
                  cumBn: +(c.cumulative / 1e9).toFixed(2),
                  netBn: +(c.net / 1e9).toFixed(2),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Line type="monotone" dataKey="netBn" name="Net năm" stroke="#64748b" strokeWidth={2} />
                <Line
                  type="monotone"
                  dataKey="cumBn"
                  name="Lũy kế"
                  stroke="#0d6b63"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Heatmap stack × transfer (savings tỷ)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-center text-[12px]">
              <thead>
                <tr className="border-b border-[#eef2f6] bg-[#f7f9fc]">
                  <th className="px-2 py-2 text-left text-[10px] font-bold uppercase text-slate-400">
                    Stack \ TF
                  </th>
                  {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                    <th key={t} className="px-2 py-2 font-bold text-slate-600">
                      {Math.round(t * 100)}%
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[0.5, 0.75, 1].map((s) => (
                  <tr key={s} className="border-b border-[#eef2f6]">
                    <td className="px-2 py-2 text-left font-bold text-[#071428]">
                      {Math.round(s * 100)}%
                    </td>
                    {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                      const cell = heat.find(
                        (h) => h.stack === s && h.transfer === t
                      );
                      const v = cell?.savingsBn ?? 0;
                      const max = Math.max(...heat.map((h) => h.savingsBn), 1);
                      const intensity = Math.max(0.12, v / max);
                      const isBest =
                        Math.abs(s - opt.bestStackRatio) < 0.01 &&
                        Math.abs(t - opt.bestTransferRatio) < 0.01;
                      return (
                        <td
                          key={t}
                          className="px-2 py-2 tabular-nums font-semibold"
                          style={{
                            background: isBest
                              ? "rgba(184,149,74,0.35)"
                              : `rgba(10,77,110,${intensity * 0.45})`,
                            color: intensity > 0.55 ? "#fff" : "#071428",
                          }}
                        >
                          {fmt(v, 2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk matrix theo tháng</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskMx}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Bar dataKey="residual" name="Residual" radius={[2, 2, 0, 0]}>
                  {riskMx.map((e, i) => (
                    <Cell
                      key={i}
                      fill={
                        e.class === "red"
                          ? "#e11d48"
                          : e.class === "amber"
                            ? "#d97706"
                            : "#0d6b63"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <InsightBox title="Cách dùng module Insights" tone="info">
        1) Chọn preset hoặc chỉnh Twin · 2) Đọc alerts + auto insights · 3) Chạy optimizer và áp
        dụng nếu Δ savings dương · 4) Lưu snapshot so A/B · 5) Xuất{" "}
        <Link href="/report" className="font-bold underline">
          báo cáo tư vấn
        </Link>
        .
      </InsightBox>

      <div className="flex flex-wrap gap-2">
        <Link href="/digital-twin" className="btn-bank inline-flex items-center gap-1 px-4 py-2 text-xs">
          Digital Twin <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link href="/monte-carlo" className="btn-bank-outline px-4 py-2 text-xs">
          Monte Carlo
        </Link>
        <Link href="/sensitivity" className="btn-bank-outline px-4 py-2 text-xs">
          Độ nhạy
        </Link>
        <Link href="/financial" className="btn-bank-outline px-4 py-2 text-xs">
          Tài chính
        </Link>
      </div>
    </div>
  );
}
