"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Line,
  ComposedChart,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Kpi } from "@/components/ui/kpi";
import { SectionHeader, InsightBox, MetricRow } from "@/components/ui/section-header";
import { useTwinStore } from "@/lib/store";
import { fmt, fmtPct } from "@/lib/utils";
import { chartTheme } from "@/components/charts/theme";
import { Truck, Ship, Clock, Banknote } from "lucide-react";
import Link from "next/link";
import { LANES } from "@/lib/data/warehouseNetwork";

const COLORS = ["#0a4d6e", "#b8954a", "#0d6b63", "#64748b"];

export default function TransportPage() {
  const { result, params } = useTwinStore();
  const freightYear = result.months.reduce((s, m) => s + m.freightCost, 0);
  const returnYear = result.months.reduce((s, m) => s + m.returnCost, 0);
  const packingYear = result.months.reduce((s, m) => s + m.packingCost, 0);
  const riskYear = result.months.reduce((s, m) => s + m.riskCost, 0);
  const totalLane = freightYear + returnYear + packingYear + riskYear;

  const data = result.months.map((m) => ({
    month: m.month,
    "Cước N→S (tỷ)": +(m.freightCost / 1e9).toFixed(3),
    "Return (tỷ)": +(m.returnCost / 1e9).toFixed(3),
    "Packing (tỷ)": +(m.packingCost / 1e9).toFixed(3),
    "Risk (tỷ)": +(m.riskCost / 1e9).toFixed(3),
    transfer: Math.round(m.transferVol),
    cont: +(m.nsContainersBase).toFixed(1),
  }));

  const costPie = [
    { name: "Cước N→S", value: +(freightYear / 1e9).toFixed(3) },
    { name: "Return", value: +(returnYear / 1e9).toFixed(3) },
    { name: "Packing", value: +(packingYear / 1e9).toFixed(3) },
    { name: "Risk premium", value: +(riskYear / 1e9).toFixed(3) },
  ];

  const unitAllIn =
    params.cost.packingPerMc +
    params.cost.nsFreightPerMc +
    params.cost.returnPerCase / params.mcPerCase +
    params.cost.southWhPerMcMonth;

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="Vận hành · Network lanes"
        title="Mô phỏng vận tải Bắc–Nam"
        subtitle="Sea/Truck case N→S và hoàn kiện rỗng S→N. Đơn giá ~To South&Sum sea (~350k VND/xe). Lead 7n + free 3n sizing case pool — khác lead time nội vùng Excel."
        actions={
          <Link href="/map" className="btn-bank-outline px-3 py-2 text-xs">
            → Bản đồ
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Cước / xe" value={fmt(params.cost.nsFreightPerMc)} sub="VND · rate card" icon={Banknote} />
        <Kpi label="Cước năm" value={`${fmt(freightYear / 1e9, 2)} tỷ`} tone="accent" icon={Ship} />
        <Kpi label="Return / kiện" value={fmt(params.cost.returnPerCase)} sub="VND" icon={Truck} />
        <Kpi label="Lead + Free" value={`${params.leadTimeDays}+${params.freeTimeDays}n`} sub="Case pool cycle" icon={Clock} />
      </div>

      <MetricRow
        items={[
          { label: "Tổng lane cost", value: `${fmt(totalLane / 1e9, 2)} tỷ`, hint: "cước+return+pack+risk" },
          { label: "Transfer năm", value: fmt(result.annual.transferVol), hint: "xe" },
          { label: "Unit all-in", value: fmt(Math.round(unitAllIn)), hint: "VND/xe (ước)" },
          { label: "Cont N→S", value: fmt(result.annual.nsContainersBase), hint: "base fill" },
        ]}
      />

      <InsightBox title="Hai khái niệm lead time" tone="warn">
        <strong>Lead 7 + free 3</strong> (Word) = reverse logistics case pool. Excel Rental WH “Lead time”
        là transit nội vùng tới Trung (0–2 ngày) — <strong>không thay thế</strong> lẫn nhau khi sizing.
      </InsightBox>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" accent>
          <CardHeader>
            <div className="section-kicker">Cost stack</div>
            <CardTitle>Cước · Return · Packing · Risk (tỷ VND)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Bar dataKey="Cước N→S (tỷ)" stackId="a" fill="#0a4d6e" />
                <Bar dataKey="Return (tỷ)" stackId="a" fill="#b8954a" />
                <Bar dataKey="Packing (tỷ)" stackId="a" fill="#0d6b63" />
                <Bar dataKey="Risk (tỷ)" stackId="a" fill="#94a3b8" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cơ cấu chi phí lane</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={costPie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85} paddingAngle={2}>
                  {costPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Volume transfer & container</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
              <YAxis yAxisId="l" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
              <YAxis yAxisId="r" orientation="right" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
              <Tooltip {...chartTheme.tooltip} />
              <Legend />
              <Bar yAxisId="l" dataKey="transfer" name="Transfer xe" fill="#5b21b6" radius={[2, 2, 0, 0]} />
              <Line yAxisId="r" type="monotone" dataKey="cont" name="Cont N→S" stroke="#b45309" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lane network (Twin map)</CardTitle>
            <CardDescription>{LANES.length} tuyến khai báo</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="table-dark w-full text-left text-sm">
              <thead>
                <tr>
                  <th>Lane</th>
                  <th>Mode</th>
                  <th>Nhãn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f6]">
                {LANES.map((l) => (
                  <tr key={l.id}>
                    <td className="font-semibold text-[#071428]">
                      {l.fromId} → {l.toId}
                    </td>
                    <td>
                      <span className="rounded-[2px] bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase">
                        {l.mode}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600">{l.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cấu trúc To South&Sum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Vĩnh Phúc → Long An / Đồng Nai / Cái Cui (Sea Case)</li>
              <li>Hà Nam → Long An / Đồng Nai / Cái Cui (Sea Case)</li>
              <li>Phương án Truck Case/Jig (fuel ratio ~0,4)</li>
              <li>Return: Long An / Đồng Nai / Cái Cui → VPC / Hà Nam</li>
              <li>Mix 3.5 xe/kiện · 46.6 xe/cont workbook</li>
            </ul>
            <p className="mt-3 rounded-[3px] border border-[#e8d5a3] bg-[#faf6eb] p-2.5 text-xs text-[#7a6230]">
              Risk premium Twin: {fmtPct(params.cost.riskPremiumRate)} trên (pack + freight + return).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
