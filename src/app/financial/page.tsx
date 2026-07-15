"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Line,
  LineChart,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Kpi } from "@/components/ui/kpi";
import { SectionHeader, InsightBox, MetricRow } from "@/components/ui/section-header";
import { fmt, fmtPct } from "@/lib/utils";
import { chartTheme } from "@/components/charts/theme";
import { ASSUMPTIONS } from "@/lib/data/projectData";
import { Landmark, TrendingUp, Wallet, Timer } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  multiYearCashflow,
  contributionCosts,
  optimizePolicy,
} from "@/lib/engine/analytics";

const COLORS = [
  "#0a4d6e",
  "#0d6b63",
  "#5b21b6",
  "#b8954a",
  "#b45309",
  "#64748b",
  "#a31d1d",
  "#0369a1",
];

export default function FinancialPage() {
  const { result, params } = useTwinStore();
  const a = result.annual;

  const cashflow = useMemo(
    () => multiYearCashflow(result, params, 5),
    [result, params]
  );
  const contrib = useMemo(() => contributionCosts(result), [result]);
  const opt = useMemo(() => optimizePolicy(params), [params]);

  const costParts = [
    { name: "Thuê Bắc", value: result.months.reduce((s, m) => s + m.northRentalCost, 0) },
    { name: "Bonus", value: result.months.reduce((s, m) => s + m.bonusCost, 0) },
    { name: "Đóng kiện", value: result.months.reduce((s, m) => s + m.packingCost, 0) },
    { name: "Cước N→S", value: result.months.reduce((s, m) => s + m.freightCost, 0) },
    { name: "Return", value: result.months.reduce((s, m) => s + m.returnCost, 0) },
    { name: "Kho Nam", value: result.months.reduce((s, m) => s + m.southWhCost, 0) },
    { name: "Rủi ro", value: result.months.reduce((s, m) => s + m.riskCost, 0) },
    { name: "Stack NK", value: result.months.reduce((s, m) => s + m.importStackCost, 0) },
  ].map((x) => ({
    ...x,
    bn: +(x.value / 1e9).toFixed(3),
    pct: a.totalCost > 0 ? x.value / a.totalCost : 0,
  }));

  const monthly = result.months.map((m) => ({
    month: m.month,
    "Tổng (tỷ)": +(m.totalCost / 1e9).toFixed(3),
    "Thuê+bonus": +((m.northRentalCost + m.bonusCost) / 1e9).toFixed(3),
    "Lane": +((m.freightCost + m.returnCost + m.packingCost) / 1e9).toFixed(3),
    "Net benefit": +(m.netBenefit / 1e9).toFixed(3),
  }));

  const bridge = [
    { name: "Baseline", value: +(a.baselineCost / 1e9).toFixed(2) },
    { name: "Tối ưu", value: +(a.totalCost / 1e9).toFixed(2) },
    { name: "Tiết kiệm", value: +(a.totalSavings / 1e9).toFixed(2) },
    { name: "Capex stack", value: +(params.cost.stackCapex / 1e9).toFixed(2) },
    { name: "NPV 3y", value: +(a.npv / 1e9).toFixed(2) },
  ];

  const rateCard = [
    { k: "Thuê ngoài Bắc /xe-tháng", v: params.cost.northOutsourcePerMcMonth },
    { k: "Bonus peak /xe", v: params.cost.bonusPerOverMc },
    { k: "Packing /xe", v: params.cost.packingPerMc },
    { k: "Cước N→S /xe", v: params.cost.nsFreightPerMc },
    { k: "Return /kiện", v: params.cost.returnPerCase },
    { k: "Kho Nam /xe-tháng", v: params.cost.southWhPerMcMonth },
    { k: "Risk premium", v: params.cost.riskPremiumRate },
    { k: "Stack ops /xe NK", v: params.cost.importStackCostPerMc },
    { k: "Discount rate", v: params.cost.discountRate },
    { k: "Stack capex", v: params.cost.stackCapex },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="Phân tích · Finance"
        title="Phân tích tài chính"
        subtitle="Tổng chi phí mạng lưới, ROI, payback, NPV. Rate card chỉnh trong Digital Twin đến khi Finance khóa (Word §15)."
        actions={
          <Link href="/sensitivity" className="btn-bank-outline px-3 py-2 text-xs">
            → Độ nhạy
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Chi phí baseline" value={`${fmt(a.baselineCost / 1e9, 2)} tỷ`} sub="Toàn over → thuê ngoài" icon={Wallet} />
        <Kpi label="Chi phí tối ưu" value={`${fmt(a.totalCost / 1e9, 2)} tỷ`} tone="accent" icon={Landmark} />
        <Kpi label="Tiết kiệm" value={`${fmt(a.totalSavings / 1e9, 2)} tỷ`} tone={a.totalSavings > 0 ? "good" : "bad"} icon={TrendingUp} />
        <Kpi
          label="ROI"
          value={fmtPct(a.roi)}
          sub={`Hoàn vốn ${Number.isFinite(a.paybackMonths) ? fmt(a.paybackMonths, 1) : "∞"} tháng`}
          tone="good"
          icon={Timer}
        />
      </div>

      <MetricRow
        items={[
          { label: "NPV 3 năm", value: `${fmt(a.npv / 1e9, 2)} tỷ`, hint: `r=${fmtPct(params.cost.discountRate)}` },
          { label: "Chi phí / xe", value: fmt(a.costPerVehicle), hint: "VND" },
          { label: "Chi phí / m²", value: fmt(a.costPerM2), hint: "VND" },
          { label: "BE transfer unit", value: fmt(a.breakEvenTransferUnitCost), hint: "max VND/xe" },
        ]}
      />

      <InsightBox title="Neo ngân sách Excel / PPT" tone="info">
        Rental WH!C123 “Stacking case” phân bổ <strong>−{ASSUMPTIONS.excelStackingSaveBn} tỷ VND</strong>.
        PPT ~{ASSUMPTIONS.pptStackingSaveBn} tỷ/năm. DSS tính savings động từ rate card (
        <strong>{fmt(a.totalSavings / 1e9, 2)} tỷ</strong>) — không hardcode −2,62.
      </InsightBox>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card accent>
          <CardHeader>
            <div className="section-kicker">Cost structure</div>
            <CardTitle>Cơ cấu chi phí tối ưu (tỷ VND)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={costParts} dataKey="bn" nameKey="name" innerRadius={50} outerRadius={100} paddingAngle={1}>
                  {costParts.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
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
            <CardTitle>Cầu tài chính (tỷ)</CardTitle>
            <CardDescription>Baseline → tối ưu → savings → capex → NPV</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bridge}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Bar dataKey="value" fill="#0a4d6e" radius={[3, 3, 0, 0]} name="Tỷ VND" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chi phí theo tháng</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Bar dataKey="Thuê+bonus" stackId="a" fill="#38bdf8" />
                <Bar dataKey="Lane" stackId="a" fill="#a78bfa" radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="Tổng (tỷ)" stroke="#071428" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net benefit theo tháng (tỷ)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Area type="monotone" dataKey="Net benefit" stroke="#0d6b63" fill="#99f6e4" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết cơ cấu chi phí</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="table-dark w-full text-left text-sm">
            <thead>
              <tr>
                <th>Hạng mục</th>
                <th>Tỷ VND</th>
                <th>% tổng</th>
                <th>VND tuyệt đối</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f6]">
              {costParts.map((c) => (
                <tr key={c.name}>
                  <td className="font-semibold text-[#071428]">{c.name}</td>
                  <td className="tabular-nums">{fmt(c.bn, 3)}</td>
                  <td className="tabular-nums">{fmtPct(c.pct)}</td>
                  <td className="tabular-nums text-slate-500">{fmt(c.value)}</td>
                </tr>
              ))}
              <tr className="bg-[#f7f9fc] font-bold">
                <td>Tổng</td>
                <td className="tabular-nums">{fmt(a.totalCost / 1e9, 3)}</td>
                <td>100%</td>
                <td className="tabular-nums">{fmt(a.totalCost)}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card accent>
          <CardHeader>
            <div className="section-kicker">Multi-year</div>
            <CardTitle>Cashflow 5 năm (tỷ VND)</CardTitle>
            <CardDescription>
              Y0 = −capex · Y1–Y5 = savings không đổi · r=
              {fmtPct(params.cost.discountRate)}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={cashflow.map((c) => ({
                  label: c.label,
                  "Net năm": +(c.net / 1e9).toFixed(2),
                  "Lũy kế": +(c.cumulative / 1e9).toFixed(2),
                  "Chiết khấu": +(c.discounted / 1e9).toFixed(2),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Line type="monotone" dataKey="Net năm" stroke="#64748b" strokeWidth={2} />
                <Line type="monotone" dataKey="Lũy kế" stroke="#0d6b63" strokeWidth={2} />
                <Line type="monotone" dataKey="Chiết khấu" stroke="#b8954a" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pareto driver chi phí</CardTitle>
            <CardDescription>Sắp xếp theo đóng góp tuyệt đối</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contrib.map((c) => ({
                  name: c.name,
                  bn: +(c.amount / 1e9).toFixed(3),
                }))}
                layout="vertical"
                margin={{ left: 8 }}
              >
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
      </div>

      <div className="rounded-[4px] border border-[#e8d5a3] bg-[#faf6eb] px-4 py-3 text-sm text-[#5c4a22]">
        <strong>Optimizer:</strong> policy max savings ≈ stack{" "}
        {fmtPct(opt.bestStackRatio, 0)} · TF {fmtPct(opt.bestTransferRatio, 0)} →{" "}
        {fmt(opt.bestSavings / 1e9, 2)} tỷ (
        {fmt((opt.bestSavings - a.totalSavings) / 1e9, 2)} tỷ so Twin).{" "}
        <Link href="/insights" className="font-bold underline">
          Mở Insights
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rate card đang dùng (Twin)</CardTitle>
          <CardDescription>Chỉnh trong Digital Twin · placeholder đến khi Finance lock</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {rateCard.map((r) => (
            <div
              key={r.k}
              className="flex items-center justify-between rounded-[3px] border border-[#eef2f6] bg-[#f7f9fc] px-3 py-2 text-sm"
            >
              <span className="text-slate-500">{r.k}</span>
              <span className="font-bold tabular-nums text-[#071428]">
                {typeof r.v === "number" && r.v < 1 && r.v > 0
                  ? fmtPct(r.v)
                  : fmt(r.v)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
