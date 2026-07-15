"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import {
  defaultParams,
  simulate,
  type TwinParams,
} from "@/lib/engine/digitalTwin";
import {
  unitEconomics,
  POLICY_PRESETS,
  applyPreset,
  optimizePolicy,
} from "@/lib/engine/analytics";
import { SectionHeader, InsightBox, MetricRow } from "@/components/ui/section-header";
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
import { downloadCsv, downloadJson, exportTwinPack } from "@/lib/export";
import {
  FlaskConical,
  Copy,
  ArrowLeftRight,
  Download,
  Check,
  RotateCcw,
  Sparkles,
  GitCompare,
} from "lucide-react";
import { cn } from "@/lib/utils";

type WhatIfKey =
  | "importStackRatio"
  | "transferRatio"
  | "unpackM2"
  | "stackM2"
  | "mcPerCase"
  | "leadTimeDays"
  | "freeTimeDays"
  | "useTtlCapacity";

type CostKey = keyof TwinParams["cost"];

export default function WsbPage() {
  const { params: baseParams, result: baseResult, setParams, saveSnapshot } =
    useTwinStore();

  // Independent what-if sandbox (does not touch Twin until Apply)
  const [wi, setWi] = useState<TwinParams>(() => structuredClone(baseParams));
  const [label, setLabel] = useState("What-if A");
  const [applied, setApplied] = useState(false);

  const wiResult = useMemo(() => simulate(wi), [wi]);
  const baseAnn = baseResult.annual;
  const wiAnn = wiResult.annual;
  const baseUe = useMemo(() => unitEconomics(baseParams), [baseParams]);
  const wiUe = useMemo(() => unitEconomics(wi), [wi]);

  const delta = {
    savings: wiAnn.totalSavings - baseAnn.totalSavings,
    cost: wiAnn.totalCost - baseAnn.totalCost,
    outsource: wiAnn.outsourceVol - baseAnn.outsourceVol,
    transfer: wiAnn.transferVol - baseAnn.transferVol,
    cont: wiAnn.nsContainersBase - baseAnn.nsContainersBase,
    pool: wiAnn.peakCasePool - baseAnn.peakCasePool,
    m2: wiAnn.m2Saved - baseAnn.m2Saved,
    roi: wiAnn.roi - baseAnn.roi,
    npv: wiAnn.npv - baseAnn.npv,
  };

  const monthly = baseResult.months.map((m, i) => {
    const w = wiResult.months[i];
    return {
      month: m.month,
      "Base z_t": Math.round(m.outsourceVol),
      "What-if z_t": Math.round(w.outsourceVol),
      "Base y_t": Math.round(m.transferVol),
      "What-if y_t": Math.round(w.transferVol),
      "Base cost tỷ": +(m.totalCost / 1e9).toFixed(3),
      "What-if cost tỷ": +(w.totalCost / 1e9).toFixed(3),
    };
  });

  const bridge = [
    { name: "Baseline save", value: +(baseAnn.totalSavings / 1e9).toFixed(2) },
    { name: "What-if save", value: +(wiAnn.totalSavings / 1e9).toFixed(2) },
    { name: "Δ savings", value: +(delta.savings / 1e9).toFixed(2) },
  ];

  const setWiParam = <K extends keyof TwinParams>(key: K, value: TwinParams[K]) => {
    setWi((p) => ({ ...p, [key]: value }));
    setApplied(false);
  };

  const setWiCost = (key: CostKey, value: number) => {
    setWi((p) => ({ ...p, cost: { ...p.cost, [key]: value } }));
    setApplied(false);
  };

  const syncFromTwin = () => {
    setWi(structuredClone(baseParams));
    setApplied(false);
  };

  const applyToTwin = () => {
    setParams(structuredClone(wi));
    saveSnapshot(`WSB · ${label}`);
    setApplied(true);
  };

  const applyOpt = () => {
    const opt = optimizePolicy(wi);
    setWi((p) => ({
      ...p,
      importStackRatio: opt.bestStackRatio,
      transferRatio: opt.bestTransferRatio,
    }));
    setApplied(false);
  };

  const exportCompare = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadJson(`wsb-compare-${stamp}.json`, {
      label,
      base: { params: baseParams, annual: baseAnn },
      whatIf: { params: wi, annual: wiAnn },
      delta,
    });
    downloadCsv(
      `wsb-monthly-${stamp}.csv`,
      monthly.map((r) => ({
        month: r.month,
        base_outsource: r["Base z_t"],
        wi_outsource: r["What-if z_t"],
        base_transfer: r["Base y_t"],
        wi_transfer: r["What-if y_t"],
        base_cost_bn: r["Base cost tỷ"],
        wi_cost_bn: r["What-if cost tỷ"],
      }))
    );
  };

  const knobs: {
    key: WhatIfKey;
    label: string;
    min: number;
    max: number;
    step: number;
    fmt: (v: number) => string;
  }[] = [
    {
      key: "importStackRatio",
      label: "Tỷ lệ stack NK",
      min: 0,
      max: 1,
      step: 0.05,
      fmt: (v) => fmtPct(v, 0),
    },
    {
      key: "transferRatio",
      label: "Tỷ lệ transfer N→S",
      min: 0,
      max: 1,
      step: 0.05,
      fmt: (v) => fmtPct(v, 0),
    },
    {
      key: "unpackM2",
      label: "m²/xe unpack",
      min: 1.2,
      max: 2.2,
      step: 0.05,
      fmt: (v) => fmt(v, 2),
    },
    {
      key: "stackM2",
      label: "m²/xe stack",
      min: 0.7,
      max: 1.5,
      step: 0.05,
      fmt: (v) => fmt(v, 2),
    },
    {
      key: "mcPerCase",
      label: "Xe / kiện",
      min: 2,
      max: 4,
      step: 0.1,
      fmt: (v) => fmt(v, 1),
    },
    {
      key: "leadTimeDays",
      label: "Lead time (ngày)",
      min: 3,
      max: 14,
      step: 1,
      fmt: (v) => String(v),
    },
    {
      key: "freeTimeDays",
      label: "Free time (ngày)",
      min: 1,
      max: 7,
      step: 1,
      fmt: (v) => String(v),
    },
  ];

  const costKnobs: { key: CostKey; label: string; min: number; max: number; step: number }[] = [
    { key: "northOutsourcePerMcMonth", label: "Thuê Bắc /xe-tháng", min: 50000, max: 400000, step: 10000 },
    { key: "bonusPerOverMc", label: "Bonus /xe", min: 0, max: 200000, step: 5000 },
    { key: "nsFreightPerMc", label: "Cước N→S /xe", min: 100000, max: 800000, step: 10000 },
    { key: "packingPerMc", label: "Packing /xe", min: 10000, max: 150000, step: 5000 },
    { key: "returnPerCase", label: "Return /kiện", min: 5000, max: 80000, step: 1000 },
    { key: "southWhPerMcMonth", label: "Kho Nam /xe-tháng", min: 10000, max: 150000, step: 5000 },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="WSB · What-if Scenario Builder"
        title="What-if Scenario Builder"
        subtitle="Sandbox độc lập: chỉnh policy & rate card mà không đụng Twin cho đến khi bấm Áp dụng. So sánh Base (Twin live) vs What-if side-by-side, xuất CSV/JSON."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={syncFromTwin}
              className="btn-bank-outline inline-flex items-center gap-1.5 px-3 py-2 text-xs"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy từ Twin
            </button>
            <button
              type="button"
              onClick={exportCompare}
              className="btn-bank-outline inline-flex items-center gap-1.5 px-3 py-2 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Export so sánh
            </button>
            <button
              type="button"
              onClick={applyToTwin}
              className="btn-bank-gold inline-flex items-center gap-1.5 px-3 py-2 text-xs"
            >
              {applied ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Đã áp dụng + snapshot
                </>
              ) : (
                <>
                  <ArrowLeftRight className="h-3.5 w-3.5" /> Áp dụng → Twin
                </>
              )}
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2 rounded-[4px] border border-[#dce3ec] bg-white p-2.5">
        <FlaskConical className="h-4 w-4 text-[#b8954a]" />
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="rounded-[3px] border border-[#dce3ec] px-2.5 py-1.5 text-sm font-semibold text-[#071428] outline-none focus:border-[#b8954a]"
          placeholder="Tên kịch bản what-if"
        />
        <span className="text-[11px] text-slate-400">Preset nhanh:</span>
        {POLICY_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setWi(applyPreset(wi, p));
              setLabel(p.name);
              setApplied(false);
            }}
            className="rounded-[3px] border border-[#dce3ec] bg-[#f7f9fc] px-2 py-1 text-[10px] font-bold text-slate-700 hover:border-[#b8954a]/50"
          >
            {p.name}
          </button>
        ))}
        <button
          type="button"
          onClick={applyOpt}
          className="btn-bank ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px]"
        >
          <Sparkles className="h-3 w-3" />
          Auto-optimize what-if
        </button>
        <button
          type="button"
          onClick={() => {
            setWi(defaultParams());
            setLabel("Default");
            setApplied(false);
          }}
          className="inline-flex items-center gap-1 rounded-[3px] border border-[#dce3ec] px-2 py-1 text-[10px] font-semibold text-slate-600"
        >
          <RotateCcw className="h-3 w-3" />
          Reset default
        </button>
      </div>

      {/* Delta KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DeltaKpi
          label="Δ Tiết kiệm"
          value={`${delta.savings >= 0 ? "+" : ""}${fmt(delta.savings / 1e9, 2)} tỷ`}
          good={delta.savings >= 0}
        />
        <DeltaKpi
          label="Δ Outsource"
          value={`${delta.outsource >= 0 ? "+" : ""}${fmt(delta.outsource)}`}
          good={delta.outsource <= 0}
          sub="xe-eq"
        />
        <DeltaKpi
          label="Δ Cont N→S"
          value={`${delta.cont >= 0 ? "+" : ""}${fmt(delta.cont)}`}
          good={true}
          sub="container"
        />
        <DeltaKpi
          label="Δ NPV 3y"
          value={`${delta.npv >= 0 ? "+" : ""}${fmt(delta.npv / 1e9, 2)} tỷ`}
          good={delta.npv >= 0}
        />
      </div>

      <MetricRow
        items={[
          {
            label: "Base savings",
            value: `${fmt(baseAnn.totalSavings / 1e9, 2)} tỷ`,
          },
          {
            label: "What-if savings",
            value: `${fmt(wiAnn.totalSavings / 1e9, 2)} tỷ`,
          },
          {
            label: "Base TF unit",
            value: fmt(Math.round(baseUe.transfer)),
            hint: baseUe.justified ? "có biên" : "đắt",
          },
          {
            label: "What-if TF unit",
            value: fmt(Math.round(wiUe.transfer)),
            hint: wiUe.justified ? "có biên" : "đắt",
          },
        ]}
      />

      <InsightBox
        title={
          delta.savings >= 0
            ? "What-if tốt hơn Base về savings"
            : "What-if kém Base về savings"
        }
        tone={delta.savings >= 0 ? "good" : "warn"}
      >
        {label}: stack {fmtPct(wi.importStackRatio, 0)} · TF {fmtPct(wi.transferRatio, 0)} ·{" "}
        {wi.useTtlCapacity ? "TTL Cap" : "Fact Cap"}. Δ savings{" "}
        <strong>
          {delta.savings >= 0 ? "+" : ""}
          {fmt(delta.savings / 1e9, 2)} tỷ
        </strong>
        · outsource {fmt(wiAnn.outsourceVol)} (Δ {fmt(delta.outsource)}) · cont{" "}
        {fmt(wiAnn.nsContainersBase)} · pool {fmt(wiAnn.peakCasePool)}.
      </InsightBox>

      <div className="grid gap-4 xl:grid-cols-12">
        {/* Controls */}
        <div className="space-y-4 xl:col-span-4">
          <Card accent>
            <CardHeader>
              <div className="section-kicker">Sandbox controls</div>
              <CardTitle>Tham số what-if</CardTitle>
              <CardDescription>Không ghi Twin cho đến khi Apply</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-700">Dùng TTL Cap Excel</span>
                <input
                  type="checkbox"
                  checked={wi.useTtlCapacity}
                  onChange={(e) => setWiParam("useTtlCapacity", e.target.checked)}
                  className="h-4 w-4 accent-[#071428]"
                />
              </label>

              {knobs.map((k) => {
                const val = wi[k.key] as number;
                return (
                  <div key={k.key}>
                    <div className="mb-1 flex justify-between text-[12px]">
                      <span className="font-semibold text-slate-600">{k.label}</span>
                      <span className="font-bold tabular-nums text-[#071428]">
                        {k.fmt(val)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={k.min}
                      max={k.max}
                      step={k.step}
                      value={val}
                      onChange={(e) =>
                        setWiParam(k.key, Number(e.target.value) as never)
                      }
                      className="w-full"
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rate card what-if</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {costKnobs.map((k) => (
                <div key={k.key}>
                  <div className="mb-1 flex justify-between text-[12px]">
                    <span className="font-semibold text-slate-600">{k.label}</span>
                    <span className="font-bold tabular-nums text-[#071428]">
                      {fmt(wi.cost[k.key])}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={k.min}
                    max={k.max}
                    step={k.step}
                    value={wi.cost[k.key]}
                    onChange={(e) => setWiCost(k.key, Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Compare panels */}
        <div className="space-y-4 xl:col-span-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <CompareCard
              title="BASE · Twin live"
              tone="base"
              rows={[
                ["Tiết kiệm", `${fmt(baseAnn.totalSavings / 1e9, 2)} tỷ`],
                ["Chi phí", `${fmt(baseAnn.totalCost / 1e9, 2)} tỷ`],
                ["Outsource", fmt(baseAnn.outsourceVol)],
                ["Transfer", fmt(baseAnn.transferVol)],
                ["Cont N→S", fmt(baseAnn.nsContainersBase)],
                ["Case pool", fmt(baseAnn.peakCasePool)],
                ["m² save", fmt(baseAnn.m2Saved)],
                ["ROI", fmtPct(baseAnn.roi)],
                ["NPV 3y", `${fmt(baseAnn.npv / 1e9, 2)} tỷ`],
                [
                  "Policy",
                  `S ${fmtPct(baseParams.importStackRatio, 0)} · T ${fmtPct(baseParams.transferRatio, 0)}`,
                ],
              ]}
            />
            <CompareCard
              title={`WHAT-IF · ${label}`}
              tone="wi"
              rows={[
                ["Tiết kiệm", `${fmt(wiAnn.totalSavings / 1e9, 2)} tỷ`],
                ["Chi phí", `${fmt(wiAnn.totalCost / 1e9, 2)} tỷ`],
                ["Outsource", fmt(wiAnn.outsourceVol)],
                ["Transfer", fmt(wiAnn.transferVol)],
                ["Cont N→S", fmt(wiAnn.nsContainersBase)],
                ["Case pool", fmt(wiAnn.peakCasePool)],
                ["m² save", fmt(wiAnn.m2Saved)],
                ["ROI", fmtPct(wiAnn.roi)],
                ["NPV 3y", `${fmt(wiAnn.npv / 1e9, 2)} tỷ`],
                [
                  "Policy",
                  `S ${fmtPct(wi.importStackRatio, 0)} · T ${fmtPct(wi.transferRatio, 0)}`,
                ],
              ]}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-4 w-4 text-[#b8954a]" />
                z_t / y_t theo tháng — Base vs What-if
              </CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 10 }} axisLine={false} />
                  <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                  <Tooltip {...chartTheme.tooltip} />
                  <Legend />
                  <Bar dataKey="Base z_t" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="What-if z_t" fill="#0a4d6e" radius={[2, 2, 0, 0]} />
                  <Line type="monotone" dataKey="Base y_t" stroke="#a78bfa" strokeWidth={2} />
                  <Line type="monotone" dataKey="What-if y_t" stroke="#7c3aed" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Chi phí tháng (tỷ)</CardTitle>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 10 }} axisLine={false} />
                    <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                    <Tooltip {...chartTheme.tooltip} />
                    <Legend />
                    <Bar dataKey="Base cost tỷ" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="What-if cost tỷ" fill="#0d6b63" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Δ savings bridge</CardTitle>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bridge}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                    <Tooltip {...chartTheme.tooltip} />
                    <Bar dataKey="value" fill="#b8954a" radius={[3, 3, 0, 0]} name="Tỷ VND" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bảng delta đầy đủ</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="table-dark w-full text-left text-sm">
                <thead>
                  <tr>
                    <th>Chỉ số</th>
                    <th>Base</th>
                    <th>What-if</th>
                    <th>Δ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2f6]">
                  {[
                    ["Tiết kiệm (tỷ)", baseAnn.totalSavings / 1e9, wiAnn.totalSavings / 1e9, 2],
                    ["Chi phí (tỷ)", baseAnn.totalCost / 1e9, wiAnn.totalCost / 1e9, 2],
                    ["Outsource", baseAnn.outsourceVol, wiAnn.outsourceVol, 0],
                    ["Transfer", baseAnn.transferVol, wiAnn.transferVol, 0],
                    ["Cont base", baseAnn.nsContainersBase, wiAnn.nsContainersBase, 1],
                    ["Case pool", baseAnn.peakCasePool, wiAnn.peakCasePool, 0],
                    ["m² save", baseAnn.m2Saved, wiAnn.m2Saved, 0],
                    ["ROI", baseAnn.roi * 100, wiAnn.roi * 100, 1],
                    ["NPV (tỷ)", baseAnn.npv / 1e9, wiAnn.npv / 1e9, 2],
                  ].map(([lab, b, w, d]) => {
                    const deltaV = (w as number) - (b as number);
                    return (
                      <tr key={lab as string}>
                        <td className="font-semibold text-[#071428]">{lab}</td>
                        <td className="tabular-nums">{fmt(b as number, d as number)}</td>
                        <td className="tabular-nums font-semibold">
                          {fmt(w as number, d as number)}
                        </td>
                        <td
                          className={cn(
                            "tabular-nums font-bold",
                            deltaV > 0
                              ? "text-teal-700"
                              : deltaV < 0
                                ? "text-rose-700"
                                : "text-slate-500"
                          )}
                        >
                          {deltaV >= 0 ? "+" : ""}
                          {fmt(deltaV, d as number)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/digital-twin" className="btn-bank px-4 py-2 text-xs">
          Mở Digital Twin
        </Link>
        <Link href="/insights" className="btn-bank-outline px-4 py-2 text-xs">
          Insights
        </Link>
        <Link href="/scenarios" className="btn-bank-outline px-4 py-2 text-xs">
          Kịch bản batch
        </Link>
        <button
          type="button"
          onClick={() => exportTwinPack(wi, wiResult)}
          className="btn-bank-outline px-4 py-2 text-xs"
        >
          Export what-if pack (JSON+CSV)
        </button>
      </div>
    </div>
  );
}

function DeltaKpi({
  label,
  value,
  good,
  sub,
}: {
  label: string;
  value: string;
  good: boolean;
  sub?: string;
}) {
  return (
    <div className="rounded-[4px] border border-[#dce3ec] bg-white p-4 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums tracking-tight",
          good ? "text-teal-800" : "text-rose-800"
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[11px] text-slate-500">{sub}</div>}
    </div>
  );
}

function CompareCard({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: [string, string][];
  tone: "base" | "wi";
}) {
  return (
    <div
      className={cn(
        "rounded-[4px] border p-4",
        tone === "base"
          ? "border-[#dce3ec] bg-[#f7f9fc]"
          : "border-[#e8d5a3] bg-[#faf6eb]"
      )}
    >
      <div
        className={cn(
          "text-[11px] font-bold uppercase tracking-[0.12em]",
          tone === "base" ? "text-slate-500" : "text-[#7a6230]"
        )}
      >
        {title}
      </div>
      <dl className="mt-3 space-y-1.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 text-[13px]">
            <dt className="text-slate-500">{k}</dt>
            <dd className="font-bold tabular-nums text-[#071428]">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
