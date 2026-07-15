"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Container,
  FlaskConical,
  Gauge,
  Landmark,
  Layers,
  MapPinned,
  Ship,
  Sparkles,
  Target,
  TrendingDown,
  Warehouse,
} from "lucide-react";
import { useTwinStore } from "@/lib/store";
import { fmt, fmtPct } from "@/lib/utils";
import { SOURCES } from "@/lib/data/projectData";
import { chartTheme } from "@/components/charts/theme";
import { Kpi } from "@/components/ui/kpi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VietnamNetworkMap } from "@/components/map/VietnamNetworkMap";
import { REGION_CAPS } from "@/lib/data/warehouseNetwork";
import { NetworkFlow } from "@/components/flow/NetworkFlow";
import { OpsAlerts } from "@/components/analytics/OpsAlerts";
import { PresetBar } from "@/components/analytics/PresetBar";
import { buildInsights, optimizePolicy } from "@/lib/engine/analytics";
import { LiveTicker } from "@/components/wow/LiveTicker";
import { MonthPlayback } from "@/components/wow/MonthPlayback";
import { PresentationMode } from "@/components/wow/PresentationMode";
import { AnimatedNumber } from "@/components/ui/animated-counter";
import { ExecutiveBrief } from "@/components/command/ExecutiveBrief";
import { ActivityFeed } from "@/components/command/ActivityFeed";
import { MetricOrbit } from "@/components/command/MetricOrbit";
import { HeatCalendar } from "@/components/command/HeatCalendar";
import { BreakEvenGauge } from "@/components/command/BreakEvenGauge";
import { SparkKpi } from "@/components/command/SparkKpi";
import { ShareBar } from "@/components/command/ShareBar";
import { PolicyMatrix } from "@/components/command/PolicyMatrix";
import { GoalTracker } from "@/components/command/GoalTracker";
import { ActionChecklist } from "@/components/command/ActionChecklist";
import { MemoGenerator } from "@/components/command/MemoGenerator";
import { BenchmarkPanel } from "@/components/command/BenchmarkPanel";
import { HistoryPanel } from "@/components/command/HistoryPanel";
import { TwinChat } from "@/components/command/TwinChat";
import { CostWaterfall } from "@/components/command/CostWaterfall";
import { MonteCarloMini } from "@/components/command/MonteCarloMini";

const PIE_COLORS = ["#0e4d6b", "#0f766e", "#a8893a", "#4f46e5", "#64748b"];

export default function DashboardPage() {
  const { result, params } = useTwinStore();
  const a = result.annual;
  const opt = useMemo(() => optimizePolicy(params), [params]);
  const topInsights = useMemo(
    () => buildInsights(result, params).slice(0, 3),
    [result, params]
  );

  const reductionPct =
    a.baseOutsourceVol > 0 ? a.outsourceReduction / a.baseOutsourceVol : 0;

  const chartData = result.months.map((m) => ({
    month: m.month,
    Over: Math.round(m.baseOver),
    Residual: Math.round(m.residualAfterImport),
    Transfer: Math.round(m.transferVol),
    Outsource: Math.round(m.outsourceVol),
    CostBn: +(m.totalCost / 1e9).toFixed(3),
  }));

  const costPie = [
    {
      name: "Thuê+bonus",
      value:
        Math.round(
          (result.months.reduce(
            (s, m) => s + m.northRentalCost + m.bonusCost,
            0
          ) /
            1e9) *
            100
        ) / 100,
    },
    {
      name: "Lane N→S",
      value:
        Math.round(
          (result.months.reduce(
            (s, m) => s + m.freightCost + m.packingCost + m.returnCost,
            0
          ) /
            1e9) *
            100
        ) / 100,
    },
    {
      name: "Nam+risk+stack",
      value:
        Math.round(
          (result.months.reduce(
            (s, m) => s + m.southWhCost + m.riskCost + m.importStackCost,
            0
          ) /
            1e9) *
            100
        ) / 100,
    },
  ];

  return (
    <div className="space-y-4">
      <LiveTicker />

      {/* Command hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="hero-wow relative overflow-hidden rounded-2xl text-white shadow-[var(--shadow-lg)]"
      >
        <div className="orb left-[-48px] top-[-48px] h-56 w-56 bg-[#c9a95a]" />
        <div
          className="orb bottom-[-56px] right-[6%] h-64 w-64 bg-[#0e4d6b]"
          style={{ animationDelay: "1.2s" }}
        />
        <div className="relative z-10 grid gap-8 p-6 sm:p-8 xl:grid-cols-12 xl:items-end">
          <div className="xl:col-span-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold text-[#e0c47a]">
              <Sparkles className="h-3.5 w-3.5 opacity-90" />
              Honda MC · Logistics Command Center
            </div>
            <h1 className="max-w-2xl text-[1.9rem] font-bold leading-[1.12] tracking-tight sm:text-[2.4rem]">
              Digital Twin
              <span className="mt-2 block text-[1.1rem] font-medium text-slate-300/95 sm:text-[1.3rem]">
                Capacity · Network · Capital
              </span>
            </h1>
            <p className="mt-3.5 max-w-xl text-[13.5px] leading-relaxed text-slate-400">
              Điều hành stacking, transfer N→S và thuê ngoài trên một màn hình —
              playback, brief, optimizer, GIS và board pack.
            </p>
            <p className="mt-2.5 text-[12px] text-slate-500">
              Tạo bởi{" "}
              <span className="font-semibold text-[#d4b76a]">Bach Truong</span>
              {" · "}
              Intern · phòng BMLG · Honda Việt Nam
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/digital-twin"
                className="btn-bank-gold inline-flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                Control Twin
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/wsb"
                className="inline-flex items-center gap-2 rounded-xl border border-white/18 bg-white/[0.08] px-4 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/[0.12]"
              >
                <FlaskConical className="h-4 w-4" />
                WSB
              </Link>
              <Link
                href="/insights"
                className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/[0.06]"
              >
                <Brain className="h-4 w-4" />
                Insights
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/[0.06]"
              >
                <MapPinned className="h-4 w-4" />
                Map
              </Link>
              <PresentationMode />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 xl:col-span-5">
            {[
              {
                l: "Tiết kiệm",
                num: a.totalSavings / 1e9,
                d: 2,
                s: "tỷ VND/năm",
              },
              {
                l: "Giảm outsource",
                num: reductionPct * 100,
                d: 1,
                s: "%",
              },
              { l: "m² free", num: a.m2Saved, d: 0, s: "m²" },
              { l: "ROI", num: a.roi * 100, d: 1, s: "%" },
            ].map((x, i) => (
              <motion.div
                key={x.l}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="stat-glass rounded-xl px-3.5 py-3.5"
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d4b76a]">
                  {x.l}
                </div>
                <div className="mt-1.5 text-[1.45rem] font-bold tabular-nums tracking-tight text-white">
                  <AnimatedNumber value={x.num} digits={x.d} />
                  <span className="ml-1 text-sm font-medium text-slate-400">
                    {x.s}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <PresetBar />
      <ShareBar />
      <OpsAlerts max={3} />

      {/* Spark strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SparkKpi
          label="Residual trend"
          value={fmt(result.months[result.months.length - 1]?.residualAfterImport ?? 0)}
          sub="tháng cuối"
          data={result.months.map((m) => ({ v: m.residualAfterImport }))}
          tone="amber"
        />
        <SparkKpi
          label="Transfer trend"
          value={fmt(a.transferVol)}
          sub="xe / năm"
          data={result.months.map((m) => ({ v: m.transferVol }))}
          tone="sky"
        />
        <SparkKpi
          label="Outsource trend"
          value={fmt(a.outsourceVol)}
          sub="xe-eq / năm"
          data={result.months.map((m) => ({ v: m.outsourceVol }))}
          tone="rose"
        />
        <SparkKpi
          label="Cost trend"
          value={`${fmt(a.totalCost / 1e9, 2)} tỷ`}
          sub="tổng năm"
          data={result.months.map((m) => ({ v: m.totalCost / 1e9 }))}
          tone="teal"
        />
      </div>

      {/* Brief + orbit + activity */}
      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <ExecutiveBrief />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
          <MetricOrbit />
          <BreakEvenGauge />
          <div className="min-h-[240px] sm:col-span-2 xl:col-span-1">
            <ActivityFeed />
          </div>
        </div>
      </div>

      <HeatCalendar />

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <PolicyMatrix />
        </div>
        <div className="space-y-4 xl:col-span-5">
          <GoalTracker />
          <ActionChecklist compact />
        </div>
      </div>

      {/* Playback + optimizer banner */}
      <div className="grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <MonthPlayback />
        </div>
        <div className="space-y-3 xl:col-span-2">
          <div className="rounded-2xl border border-[color-mix(in_srgb,var(--gold)_35%,var(--line))] bg-gradient-to-br from-[var(--gold-soft)]/50 to-[var(--card)] p-4 shadow-[var(--shadow-sm)]">
            <div className="panel-kicker">Optimizer suggestion</div>
            <div className="mt-2 text-lg font-bold tracking-tight text-[var(--ink)]">
              Stack {fmtPct(opt.bestStackRatio, 0)} · TF{" "}
              {fmtPct(opt.bestTransferRatio, 0)}
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Max savings {fmt(opt.bestSavings / 1e9, 2)} tỷ · Δ{" "}
              {fmt((opt.bestSavings - a.totalSavings) / 1e9, 2)} tỷ vs Twin
            </p>
            <Link
              href="/insights"
              className="btn-bank mt-3 inline-flex items-center gap-1 px-3 py-2 text-xs"
            >
              Mở optimizer <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {topInsights.map((ins) => (
            <div
              key={ins.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-3.5 shadow-[var(--shadow-sm)]"
            >
              <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--gold)]">
                {ins.category}
              </div>
              <div className="mt-1 text-sm font-bold text-[var(--ink)]">
                {ins.headline}
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-[var(--muted)]">
                {ins.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="m² tiết kiệm / năm"
          value={fmt(a.m2Saved)}
          numericValue={a.m2Saved}
          sub={`Stack @ ${fmtPct(params.importStackRatio, 0)}`}
          tone="good"
          delta="Relief"
          icon={Layers}
          source={`Word · ${SOURCES.word}`}
        />
        <Kpi
          label="Tăng năng lực"
          value={fmtPct(a.capacityIncreasePct)}
          numericValue={a.capacityIncreasePct * 100}
          digits={1}
          sub={`${params.unpackM2} → ${params.stackM2} m²/xe`}
          tone="accent"
          icon={Gauge}
        />
        <Kpi
          label="Giảm thuê ngoài"
          value={fmt(a.outsourceReduction)}
          numericValue={a.outsourceReduction}
          sub={`${fmt(a.baseOutsourceVol)} → ${fmt(a.outsourceVol)}`}
          tone="good"
          icon={TrendingDown}
        />
        <Kpi
          label="Tiết kiệm logistics"
          value={`${fmt(a.totalSavings / 1e9, 2)} tỷ`}
          numericValue={a.totalSavings / 1e9}
          digits={2}
          sub={`ROI ${fmtPct(a.roi)}`}
          tone={a.totalSavings > 0 ? "good" : "bad"}
          icon={Landmark}
        />
        <Kpi
          label="Cont N→S"
          value={fmt(a.nsContainersBase)}
          numericValue={a.nsContainersBase}
          sub={`Excel: ${fmt(a.nsContainersExcel)}`}
          icon={Container}
        />
        <Kpi
          label="Case pool peak"
          value={fmt(a.peakCasePool)}
          numericValue={a.peakCasePool}
          sub={`${params.leadTimeDays}+${params.freeTimeDays}n`}
          tone="warn"
          icon={Ship}
        />
        <Kpi
          label="WH util peak"
          value={fmtPct(a.warehouseUtilPeak)}
          numericValue={a.warehouseUtilPeak * 100}
          digits={1}
          tone={
            a.warehouseUtilPeak > 1
              ? "bad"
              : a.warehouseUtilPeak > 0.85
                ? "warn"
                : "good"
          }
          icon={Warehouse}
        />
        <Kpi
          label="NPV 3 năm"
          value={`${fmt(a.npv / 1e9, 2)} tỷ`}
          numericValue={a.npv / 1e9}
          digits={2}
          tone="accent"
          icon={Target}
        />
      </div>

      <NetworkFlow />

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <BenchmarkPanel />
        </div>
        <div className="xl:col-span-3">
          <HistoryPanel />
        </div>
        <div className="xl:col-span-4">
          <MemoGenerator />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <TwinChat compact />
        </div>
        <div className="xl:col-span-4">
          <CostWaterfall />
        </div>
        <div className="xl:col-span-3">
          <MonteCarloMini />
        </div>
      </div>

      {/* Charts wall */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" accent>
          <CardHeader>
            <div className="section-kicker">Capacity theater</div>
            <CardTitle>Over · Residual · Transfer · Outsource</CardTitle>
            <CardDescription>12 tháng Twin live</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gOver" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartTheme.colors.slate} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={chartTheme.colors.slate} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartTheme.colors.amber} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={chartTheme.colors.amber} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 6" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Area type="monotone" dataKey="Over" stroke={chartTheme.colors.slate} fill="url(#gOver)" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                <Area type="monotone" dataKey="Residual" stroke={chartTheme.colors.amber} fill="url(#gRes)" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                <Line type="monotone" dataKey="Transfer" stroke={chartTheme.colors.violet} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                <Line type="monotone" dataKey="Outsource" stroke={chartTheme.colors.sky} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cơ cấu chi phí (tỷ)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costPie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={56}
                  outerRadius={90}
                  paddingAngle={3}
                  stroke="transparent"
                >
                  {costPie.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTheme.tooltip} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chi phí tháng (tỷ VND)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="22%">
                <CartesianGrid strokeDasharray="4 6" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip {...chartTheme.tooltip} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                <Bar dataKey="CostBn" name="Chi phí tỷ" fill={chartTheme.colors.sky} radius={[8, 8, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card accent>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <div className="section-kicker">Geo live</div>
              <CardTitle>Bản đồ mạng lưới + cargo pulse</CardTitle>
              <CardDescription>
                Nationwide {fmt(REGION_CAPS.nationwide.cap100)} xe · owned{" "}
                {REGION_CAPS.hvnOwned.ratio}%
              </CardDescription>
            </div>
            <Link href="/map" className="btn-bank px-3 py-2 text-xs">
              Full map
            </Link>
          </CardHeader>
          <CardContent>
            <VietnamNetworkMap compact showLanes />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
