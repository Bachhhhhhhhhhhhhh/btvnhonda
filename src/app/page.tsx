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
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import { Kpi } from "@/components/ui/kpi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fmt, fmtPct } from "@/lib/utils";
import { ASSUMPTIONS, SOURCES } from "@/lib/data/projectData";
import { chartTheme } from "@/components/charts/theme";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Target,
  TrendingDown,
  Layers,
  Ship,
  Container,
  Landmark,
  Sparkles,
  Gauge,
  Warehouse,
  MapPinned,
} from "lucide-react";
import { VietnamNetworkMap } from "@/components/map/VietnamNetworkMap";
import { REGION_CAPS } from "@/lib/data/warehouseNetwork";
import { NetworkFlow } from "@/components/flow/NetworkFlow";

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
    Container: Math.round(m.nsContainersBase),
  }));

  const scenarioData = [
    { name: "Hiện trạng", value: Math.round(result.scenarios.asIs), fill: "#e11d48" },
    { name: "Chỉ stack NK", value: Math.round(result.scenarios.importOnly), fill: "#d97706" },
    { name: "Full stack", value: Math.round(result.scenarios.fullStackTheory), fill: "#7c3aed" },
    { name: "Tối ưu", value: Math.round(result.scenarios.optimized), fill: "#059669" },
  ];

  const costPie = [
    {
      name: "Thuê + bonus",
      value: Math.round(
        result.months.reduce((s, m) => s + m.northRentalCost + m.bonusCost, 0) / 1e9 * 100
      ) / 100,
    },
    {
      name: "Cước + return",
      value: Math.round(
        result.months.reduce((s, m) => s + m.freightCost + m.returnCost, 0) / 1e9 * 100
      ) / 100,
    },
    {
      name: "Pack + kho Nam",
      value: Math.round(
        result.months.reduce((s, m) => s + m.packingCost + m.southWhCost, 0) / 1e9 * 100
      ) / 100,
    },
    {
      name: "Stack + risk",
      value: Math.round(
        result.months.reduce((s, m) => s + m.importStackCost + m.riskCost, 0) / 1e9 * 100
      ) / 100,
    },
  ];

  const utilPct = Math.min(100, Math.round(a.warehouseUtilPeak * 100));
  const radial = [{ name: "Util", value: utilPct, fill: utilPct > 100 ? "#e11d48" : utilPct > 85 ? "#d97706" : "#059669" }];

  const reductionPct =
    a.baseOutsourceVol > 0 ? a.outsourceReduction / a.baseOutsourceVol : 0;

  return (
    <div className="space-y-7">
      {/* HERO — light bank panel for readability */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="kpi-ring overflow-hidden rounded-[4px] border border-[#dce3ec] bg-white shadow-[0_1px_3px_rgba(7,20,40,0.06)]"
      >
        <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="lg:col-span-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-[3px] border border-[#e8d5a3] bg-[#faf6eb] px-2.5 py-1 text-[11px] font-bold text-[#7a6230]">
              <Sparkles className="h-3.5 w-3.5" />
              DSS · Honda MC Logistics
            </div>
            <h1 className="max-w-2xl text-[1.65rem] font-bold leading-snug tracking-tight text-[#071428] sm:text-[1.9rem]">
              Tối ưu capacity miền Bắc
            </h1>
            <p className="mt-1 text-base font-semibold text-[#0a4d6e] sm:text-lg">
              Quyết định dựa trên số liệu vận hành
            </p>
            <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-slate-600">
              Mô hình stacking nhập khẩu, chuyển kho Bắc–Nam và thuê ngoài có kiểm soát.
              KPI đồng bộ từ Excel 103Ki 2QFC, Word và PPT Yamagomori.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Stacking NK", "Transfer N→S", "Thuê ngoài"].map((t) => (
                <span
                  key={t}
                  className="rounded-[3px] border border-[#dce3ec] bg-[#f7f9fc] px-2.5 py-1 text-[11px] font-bold text-slate-700"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                href="/digital-twin"
                className="btn-bank-gold inline-flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                Mở Digital Twin
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/map"
                className="btn-bank inline-flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                <MapPinned className="h-4 w-4" />
                Bản đồ mạng lưới
              </Link>
              <Link
                href="/report"
                className="btn-bank-outline inline-flex items-center gap-2 px-4 py-2.5 text-sm"
              >
                Báo cáo tư vấn
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 lg:col-span-5">
            {[
              {
                l: "Tiết kiệm ròng",
                v: `${fmt(a.totalSavings / 1e9, 2)} tỷ`,
                s: "VND / năm mô hình",
              },
              {
                l: "Giảm thuê ngoài",
                v: fmtPct(reductionPct),
                s: `${fmt(a.outsourceReduction)} xe-eq`,
              },
              {
                l: "m² giải phóng",
                v: fmt(a.m2Saved),
                s: "từ stacking NK",
              },
              {
                l: "ROI stacking",
                v: fmtPct(a.roi),
                s: `NPV 3y ${fmt(a.npv / 1e9, 1)} tỷ`,
              },
            ].map((x, i) => (
              <motion.div
                key={x.l}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                className="rounded-[3px] border border-[#e8edf2] bg-[#f7f9fc] px-3.5 py-3"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                  {x.l}
                </div>
                <div className="mt-1 text-[1.35rem] font-bold tabular-nums tracking-tight text-[#071428]">
                  {x.v}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">{x.s}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* KPI ROW */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="m² tiết kiệm / năm"
          value={fmt(a.m2Saved)}
          numericValue={a.m2Saved}
          sub={`Stack NK @ ${fmtPct(params.importStackRatio, 0)} · Δ ${(params.unpackM2 - params.stackM2).toFixed(2)} m²/xe`}
          tone="good"
          delta="Relief"
          icon={Layers}
          delay={0.05}
          source={`Word · ${SOURCES.word}`}
        />
        <Kpi
          label="Tăng năng lực kho"
          value={fmtPct(a.capacityIncreasePct)}
          numericValue={a.capacityIncreasePct * 100}
          digits={1}
          sub={`${params.unpackM2} → ${params.stackM2} m²/xe footprint`}
          tone="accent"
          icon={Gauge}
          delay={0.1}
        />
        <Kpi
          label="Giảm thuê ngoài"
          value={fmt(a.outsourceReduction)}
          numericValue={a.outsourceReduction}
          sub={`${fmt(a.baseOutsourceVol)} → ${fmt(a.outsourceVol)} xe-eq`}
          tone="good"
          icon={TrendingDown}
          delay={0.15}
        />
        <Kpi
          label="Tiết kiệm logistics"
          value={`${fmt(a.totalSavings / 1e9, 2)} tỷ`}
          numericValue={a.totalSavings / 1e9}
          digits={2}
          sub={`ROI ${fmtPct(a.roi)} · Hoàn vốn ${Number.isFinite(a.paybackMonths) ? fmt(a.paybackMonths, 1) : "∞"} tháng`}
          tone={a.totalSavings > 0 ? "good" : "bad"}
          delta={a.totalSavings > 0 ? "Net +" : "Net −"}
          icon={Landmark}
          delay={0.2}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Container N→S (base)"
          value={fmt(a.nsContainersBase)}
          numericValue={a.nsContainersBase}
          sub={`Excel @46.6: ${fmt(a.nsContainersExcel)} cont`}
          icon={Container}
          delay={0.08}
        />
        <Kpi
          label="Case pool đỉnh"
          value={fmt(a.peakCasePool)}
          numericValue={a.peakCasePool}
          sub={`Chu kỳ ${params.leadTimeDays}+${params.freeTimeDays} ngày`}
          tone="warn"
          icon={Ship}
          delay={0.12}
        />
        <Kpi
          label="WH util peak"
          value={fmtPct(a.warehouseUtilPeak)}
          numericValue={a.warehouseUtilPeak * 100}
          digits={1}
          sub={`vs ${params.useTtlCapacity ? "TTL Cap" : "Fact Cap"}`}
          tone={a.warehouseUtilPeak > 1 ? "bad" : a.warehouseUtilPeak > 0.85 ? "warn" : "good"}
          icon={Warehouse}
          delay={0.16}
        />
        <Kpi
          label="NPV 3 năm"
          value={`${fmt(a.npv / 1e9, 2)} tỷ`}
          numericValue={a.npv / 1e9}
          digits={2}
          sub={`r=${fmtPct(params.cost.discountRate)}`}
          tone="accent"
          icon={Target}
          delay={0.2}
        />
      </div>

      {/* INSIGHT STRIP */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Layers,
            t: "Nhánh 1 — Nhập khẩu",
            d: "Baseline benefit rõ: stack case sẵn có, relief ~41% capacity/xe. PPT ~3 tỷ VND/năm.",
            c: "from-blue-50 to-white border-blue-100",
            ic: "bg-blue-100 text-blue-700",
          },
          {
            icon: Ship,
            t: "Nhánh 2 — Nội địa",
            d: "Chỉ transfer N→S khi chi phí tránh được ở Bắc > tổng transfer + return case.",
            c: "from-violet-50 to-white border-violet-100",
            ic: "bg-violet-100 text-violet-700",
          },
          {
            icon: Zap,
            t: "Digital Twin",
            d: "Không tối ưu “thuê ngoài = 0” bằng mọi giá — tối ưu tổng chi phí mạng lưới.",
            c: "from-teal-50 to-white border-teal-100",
            ic: "bg-teal-100 text-teal-700",
          },
        ].map((x, i) => (
          <motion.div
            key={x.t}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.05 }}
            className={`glass-hover flex gap-4 rounded-[4px] border bg-gradient-to-br p-5 ${x.c}`}
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[3px] ${x.ic}`}>
              <x.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{x.t}</div>
              <div className="mt-1 text-xs leading-relaxed text-slate-600">{x.d}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* VALUE STREAM */}
      <NetworkFlow />

      {/* NETWORK MAP */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <div className="section-kicker">Mạng lưới địa lý</div>
            <CardTitle>Bản đồ kho Bắc · Trung · Nam + tuyến N→S</CardTitle>
            <CardDescription>
              GIS Việt Nam · {fmt(REGION_CAPS.nationwide.cap100)} xe nationwide · owned{" "}
              {REGION_CAPS.hvnOwned.ratio}% / rented {REGION_CAPS.outside.ratio}% · Hoàng Sa & Trường Sa
            </CardDescription>
          </div>
          <Link
            href="/map"
            className="btn-bank inline-flex items-center gap-1.5 px-3 py-2 text-xs"
          >
            Mở bản đồ đầy đủ
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <VietnamNetworkMap compact showLanes />
        </CardContent>
      </Card>

      {/* MAIN CHARTS */}
      <div className="grid gap-5 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <div className="section-kicker">Capacity gap</div>
            <CardTitle>Vượt kho & phản ứng chính sách theo tháng</CardTitle>
            <CardDescription>
              Over gốc → sau stack NK → thuê ngoài residual (z_t)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gOver" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e11d48" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d97706" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Area type="monotone" dataKey="Vượt gốc" stroke="#e11d48" fill="url(#gOver)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="Sau stack NK" stroke="#d97706" fill="url(#gRes)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="Thuê ngoài" stroke="#2563eb" fill="url(#gOut)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="section-kicker">Scenarios</div>
            <CardTitle>Thuê ngoài tại peak</CardTitle>
            <CardDescription>So sánh 4 tầng chính sách (xe)</CardDescription>
          </CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarioData} layout="vertical" margin={{ left: 4, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={false} />
                <XAxis type="number" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis type="category" dataKey="name" width={88} tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={22}>
                  {scenarioData.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="section-kicker">Flow</div>
            <CardTitle>Relief · Transfer · Container</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Line type="monotone" dataKey="Relief NK" stroke="#059669" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="Chuyển N→S" stroke="#7c3aed" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="Container" stroke="#0891b2" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="section-kicker">Utilization</div>
            <CardTitle>Peak WH util</CardTitle>
          </CardHeader>
          <CardContent className="flex h-72 flex-col items-center justify-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="68%"
                  outerRadius="100%"
                  data={radial}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar background dataKey="value" cornerRadius={8} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="-mt-10 text-center">
              <div className="text-3xl font-black tabular-nums text-slate-900">
                {utilPct}%
              </div>
              <div className="text-xs text-slate-500">
                Max stock / {params.useTtlCapacity ? "TTL" : "Fact"} Cap
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="section-kicker">Cost mix</div>
            <CardTitle>Cơ cấu chi phí tối ưu (tỷ VND)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costPie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={96}
                  paddingAngle={3}
                >
                  {costPie.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        ["#2563eb", "#0d9488", "#7c3aed", "#d97706"][i % 4]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="section-kicker">Assumptions</div>
            <CardTitle>Neo dữ liệu cốt lõi</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3">
              {[
                ["Fact Cap Bắc", `${fmt(ASSUMPTIONS.factCapNorth)} xe`],
                ["TTL Cap Bắc", `${fmt(ASSUMPTIONS.ttlCapNorth)} xe`],
                ["Import năm", `${fmt(a.importVol)} xe`],
                ["Xe/kiện mix", `${ASSUMPTIONS.mcPerCaseMix}`],
                ["Xe/cont Excel", `${ASSUMPTIONS.mcPerContainerExcel}`],
                ["Return kiện/cont", `${ASSUMPTIONS.casesPerContainerReturn}`],
                ["PPT tiết kiệm", `~${ASSUMPTIONS.pptStackingSaveBn} tỷ/năm`],
                ["Excel stack line", `−${ASSUMPTIONS.excelStackingSaveBn} tỷ`],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white px-3.5 py-3"
                >
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {k}
                  </dt>
                  <dd className="mt-1 text-sm font-bold tabular-nums text-slate-900">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[11px] leading-relaxed text-amber-900">
              <strong>Đối chiếu quan trọng:</strong> Word tính over theo Fact Cap
              17.680; Excel theo TTL 28.495. m²: Word 1.7/1.0 vs Excel budget 1.6.
              Bật/tắt trong Digital Twin để so hai chuẩn.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
