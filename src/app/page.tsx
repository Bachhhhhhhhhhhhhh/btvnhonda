"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import { Kpi } from "@/components/ui/kpi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmt, fmtPct } from "@/lib/utils";
import { ASSUMPTIONS, SOURCES } from "@/lib/data/projectData";
import { chartTheme } from "@/components/charts/theme";
import Link from "next/link";
import { ArrowRight, Zap, Target, TrendingDown } from "lucide-react";

export default function DashboardPage() {
  const { result, params } = useTwinStore();
  const a = result.annual;
  const chartData = result.months.map((m) => ({
    month: m.month,
    "Vượt gốc": Math.round(m.baseOver),
    "Sau stack NK": Math.round(m.residualAfterImport),
    "Chuyển N→S": Math.round(m.transferVol),
    "Thuê ngoài": Math.round(m.outsourceVol),
    "Relief NK": Math.round(m.importRelief),
    "Container": Math.round(m.nsContainersBase),
  }));

  const scenarioData = [
    { name: "Hiện trạng peak", value: Math.round(result.scenarios.asIs) },
    { name: "Chỉ stack NK", value: Math.round(result.scenarios.importOnly) },
    { name: "Full stack lý thuyết", value: Math.round(result.scenarios.fullStackTheory) },
    { name: "Chính sách tối ưu", value: Math.round(result.scenarios.optimized) },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-sky-950/80 via-slate-900/60 to-emerald-950/50 p-6 sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold text-sky-300">
            <Zap className="h-3.5 w-3.5" />
            Decision Support System · Digital Twin
          </div>
          <h1 className="max-w-3xl text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Tối ưu{" "}
            <span className="grad-text">stacking & thuê ngoài</span>
            {" "}kho miền Bắc
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Mọi KPI tính từ Excel 103Ki 2QFC, Word stacking và PPT Yamagomori.
            Thay số xe, m², lead time hay cước vận chuyển — quan sát ngay tác động
            đến chi phí, utilization và tỷ lệ thuê ngoài.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/digital-twin"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:brightness-110"
            >
              Mở Digital Twin
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/report"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10"
            >
              Báo cáo tư vấn
            </Link>
          </div>
          <div className="mt-4 text-[11px] text-slate-500">
            Góc nhìn capacity:{" "}
            <span className="font-semibold text-slate-300">
              {params.useTtlCapacity ? "Excel TTL 28.495" : "Word Fact Cap 17.680"}
            </span>
          </div>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="m² tiết kiệm / năm"
          value={fmt(a.m2Saved)}
          sub={`Stack NK @ ${fmtPct(params.importStackRatio, 0)} · Δ ${(params.unpackM2 - params.stackM2).toFixed(2)} m²/xe`}
          tone="good"
          delta="Relief"
          source={`Công thức Word · ${SOURCES.word}`}
        />
        <Kpi
          label="Tăng năng lực kho"
          value={fmtPct(a.capacityIncreasePct)}
          sub={`${params.unpackM2} → ${params.stackM2} m²/xe`}
          tone="accent"
          source="Cap hiệu dụng = FactCap × unpack/stack"
        />
        <Kpi
          label="Giảm thuê ngoài"
          value={fmt(a.outsourceReduction)}
          sub={`${fmt(a.baseOutsourceVol)} → ${fmt(a.outsourceVol)} xe-eq`}
          tone="good"
          source="Over gốc − residual sau stack+transfer"
        />
        <Kpi
          label="Tiết kiệm logistics"
          value={`${fmt(a.totalSavings / 1e9, 2)} tỷ VND`}
          sub={`ROI ${fmtPct(a.roi)} · Hoàn vốn ${Number.isFinite(a.paybackMonths) ? fmt(a.paybackMonths, 1) : "∞"} tháng`}
          tone={a.totalSavings > 0 ? "good" : "bad"}
          delta={a.totalSavings > 0 ? "Net +" : "Net −"}
          source="Chi phí baseline − chi phí mạng lưới tối ưu"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Container N→S (base 42)"
          value={fmt(a.nsContainersBase)}
          sub={`Theo Excel @46.6: ${fmt(a.nsContainersExcel)} cont`}
          source="To South&Sum Mix 3.5 / 46.6"
        />
        <Kpi
          label="Case pool đỉnh"
          value={fmt(a.peakCasePool)}
          sub={`Chu kỳ ${params.leadTimeDays}+${params.freeTimeDays} ngày`}
          tone="warn"
          source="Word: kiện/30 × (LT+FT)"
        />
        <Kpi
          label="Utilization kho (peak)"
          value={fmtPct(a.warehouseUtilPeak)}
          sub={`so với ${params.useTtlCapacity ? "TTL" : "Fact"} Cap`}
          tone={a.warehouseUtilPeak > 1 ? "bad" : a.warehouseUtilPeak > 0.85 ? "warn" : "good"}
          source="Rental WH max stock on hand"
        />
        <Kpi
          label="NPV 3 năm"
          value={`${fmt(a.npv / 1e9, 2)} tỷ`}
          sub={`r=${fmtPct(params.cost.discountRate)} · Capex ${fmt(params.cost.stackCapex / 1e9, 2)} tỷ`}
          source="DCF đơn giản trên savings hàng năm"
        />
      </div>

      {/* Insight strip */}
      <div className="grid gap-3 md:grid-cols-3">
        {[
          {
            icon: Target,
            t: "Nhánh 1 — Nhập khẩu",
            d: "Stack baseline: benefit rõ, ít chi phí chuyển mạng lưới. PPT ước ~3 tỷ VND/năm.",
          },
          {
            icon: TrendingDown,
            t: "Nhánh 2 — Nội địa",
            d: "Chỉ chuyển N→S khi chi phí tránh được ở Bắc > tổng chi phí transfer + return case.",
          },
          {
            icon: Zap,
            t: "Digital Twin",
            d: "Không tối ưu “thuê ngoài = 0” bằng mọi giá — tối ưu tổng chi phí mạng lưới.",
          },
        ].map((x) => (
          <div
            key={x.t}
            className="glass glass-hover flex gap-3 rounded-2xl p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
              <x.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">{x.t}</div>
              <div className="mt-1 text-xs leading-relaxed text-slate-400">{x.d}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gap capacity & phản ứng chính sách theo tháng</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="Vượt gốc" stroke={chartTheme.colors.rose} fill="#fb718533" />
                <Area type="monotone" dataKey="Sau stack NK" stroke={chartTheme.colors.amber} fill="#fbbf2433" />
                <Area type="monotone" dataKey="Thuê ngoài" stroke={chartTheme.colors.sky} fill="#38bdf833" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kịch bản thuê ngoài tại peak (xe)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarioData} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis type="number" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                <Tooltip {...chartTheme.tooltip} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 8, 8, 0]} name="Xe" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Relief NK · Transfer · Container</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Relief NK" stroke={chartTheme.colors.emerald} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Chuyển N→S" stroke={chartTheme.colors.violet} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Container" stroke={chartTheme.colors.cyan} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giả định cố định quan trọng</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-2.5 text-sm">
              {[
                ["Fact Cap Bắc", `${fmt(ASSUMPTIONS.factCapNorth)} xe`],
                ["TTL Cap Bắc", `${fmt(ASSUMPTIONS.ttlCapNorth)} xe`],
                ["Import năm", `${fmt(a.importVol)} xe`],
                ["Xe/kiện mix", `${ASSUMPTIONS.mcPerCaseMix}`],
                ["Xe/cont Excel", `${ASSUMPTIONS.mcPerContainerExcel}`],
                ["Return kiện/cont", `${ASSUMPTIONS.casesPerContainerReturn}`],
                ["PPT tiết kiệm", `~${ASSUMPTIONS.pptStackingSaveBn} tỷ/năm`],
                ["Excel stacking line", `−${ASSUMPTIONS.excelStackingSaveBn} tỷ`],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5"
                >
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">{k}</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums text-slate-100">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] leading-relaxed text-amber-100/90">
              <strong>Lưu ý đối chiếu:</strong> Word tính over theo Fact Cap 17.680;
              Excel over theo TTL 28.495. m²: Word 1.7/1.0 vs Excel budget 1.6.
              Bật/tắt trong Digital Twin để so sánh hai chuẩn.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
