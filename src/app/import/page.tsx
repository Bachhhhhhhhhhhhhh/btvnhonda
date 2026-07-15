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
  ComposedChart,
  Area,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import {
  IMPORT_BY_MODEL,
  IMPORT_VOLUME,
  MONTHS,
  ASSUMPTIONS,
} from "@/lib/data/projectData";
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
import { Package, Layers, MapPin, TrendingUp } from "lucide-react";
import Link from "next/link";

const COLORS = ["#0a4d6e", "#0d6b63", "#b8954a", "#64748b"];

export default function ImportPage() {
  const { result, params } = useTwinStore();
  const reliefRate =
    params.unpackM2 > 0 ? (params.unpackM2 - params.stackM2) / params.unpackM2 : 0;
  const peakImp = Math.max(...MONTHS.map((m) => IMPORT_VOLUME[m]));
  const peakMonth = MONTHS.find((m) => IMPORT_VOLUME[m] === peakImp) ?? "—";
  const totalImp = result.annual.importVol;
  const modelData = Object.entries(IMPORT_BY_MODEL).map(([name, value]) => ({
    name,
    value,
    pct: value / Object.values(IMPORT_BY_MODEL).reduce((s, v) => s + v, 0),
  }));

  const data = result.months.map((m) => ({
    month: m.month,
    "Nhập khẩu": m.importVol,
    Relief: Math.round(m.importRelief),
    Residual: Math.round(m.residualAfterImport),
    "m² tiết kiệm": Math.round(m.m2Saved),
    "Stack cost (triệu)": +(m.importStackCost / 1e6).toFixed(1),
  }));

  const cumulative = (() => {
    let c = 0;
    let r = 0;
    return MONTHS.map((m) => {
      c += IMPORT_VOLUME[m];
      const rel =
        IMPORT_VOLUME[m] *
        reliefRate *
        params.importStackRatio;
      r += rel;
      return { month: m, "Import lũy kế": c, "Relief lũy kế": Math.round(r) };
    });
  })();

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="Vận hành · Nhánh 1"
        title="Tối ưu xe nhập khẩu"
        subtitle={`Stacking kiện NK — công thức Word: Import × (${params.unpackM2} − ${params.stackM2}) / ${params.unpackM2} = ${fmtPct(reliefRate)} capacity tương đương.`}
        actions={
          <Link href="/domestic" className="btn-bank-outline px-3 py-2 text-xs">
            → Nội địa
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Import năm" value={fmt(totalImp)} sub="Rental WH!R11 ≈ 106.460" tone="accent" icon={Package} />
        <Kpi label="Relief năm" value={fmt(result.annual.importRelief)} sub={`@ stack ${fmtPct(params.importStackRatio, 0)}`} tone="good" icon={Layers} />
        <Kpi label="m² tiết kiệm" value={fmt(result.annual.m2Saved)} sub="import × tỷ lệ × Δm²" tone="good" icon={MapPin} />
        <Kpi label="Import đỉnh" value={fmt(peakImp)} sub={`${peakMonth} · Excel`} icon={TrendingUp} />
      </div>

      <MetricRow
        items={[
          { label: "Δ m²/xe", value: fmt(params.unpackM2 - params.stackM2, 2), hint: "unpack − stack" },
          { label: "Relief rate", value: fmtPct(reliefRate), hint: "capacity eq / import" },
          { label: "Chi phí stack năm", value: `${fmt(result.months.reduce((s, m) => s + m.importStackCost, 0) / 1e9, 2)} tỷ`, hint: "VND ops" },
          { label: "PPT neo", value: `~${ASSUMPTIONS.pptStackingSaveBn} tỷ`, hint: "benefit stacking / năm" },
        ]}
      />

      <InsightBox title="Vì sao chỉ stack NK vẫn chưa đủ" tone="warn">
        Relief năm ~{fmt(result.annual.importRelief)} xe-eq, trong khi residual peak sau stack vẫn có tháng đỏ.
        Nhánh 2 (transfer / outsource) xử lý phần còn lại — xem{" "}
        <Link href="/domestic" className="font-bold underline">
          Nội địa
        </Link>
        .
      </InsightBox>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" accent>
          <CardHeader>
            <div className="section-kicker">Monthly flow</div>
            <CardTitle>Volume NK · Relief · Residual</CardTitle>
            <CardDescription>Residual = over − import relief (sau stack ratio)</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Bar dataKey="Nhập khẩu" fill="#0a4d6e" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Relief" fill="#0d6b63" radius={[2, 2, 0, 0]} />
                <Line type="monotone" dataKey="Residual" stroke="#b45309" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cơ cấu model (ước Word)</CardTitle>
            <CardDescription>Tổng ≈ {fmt(Object.values(IMPORT_BY_MODEL).reduce((s, v) => s + v, 0))}</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={modelData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88} paddingAngle={2}>
                  {modelData.map((_, i) => (
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

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lũy kế import & relief</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cumulative}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Area type="monotone" dataKey="Import lũy kế" fill="#e2e8f0" stroke="#64748b" />
                <Line type="monotone" dataKey="Relief lũy kế" stroke="#0d6b63" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>m² tiết kiệm & chi phí stack (tháng)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis yAxisId="l" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis yAxisId="r" orientation="right" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Bar yAxisId="l" dataKey="m² tiết kiệm" fill="#b8954a" radius={[2, 2, 0, 0]} />
                <Bar yAxisId="r" dataKey="Stack cost (triệu)" fill="#94a3b8" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bảng import master</CardTitle>
          <CardDescription>Excel Rental WH F11:Q11 + Twin relief</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="table-dark w-full text-left text-sm">
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Import</th>
                <th>% năm</th>
                <th>Relief</th>
                <th>m² save</th>
                <th>Residual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f6]">
              {result.months.map((m) => (
                <tr key={m.month}>
                  <td className="font-bold text-[#071428]">{m.month}</td>
                  <td className="tabular-nums">{fmt(m.importVol)}</td>
                  <td className="tabular-nums">{fmtPct(m.importVol / totalImp, 1)}</td>
                  <td className="tabular-nums text-teal-800">{fmt(m.importRelief)}</td>
                  <td className="tabular-nums">{fmt(m.m2Saved)}</td>
                  <td className="tabular-nums font-semibold">{fmt(m.residualAfterImport)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        {modelData.map((m) => (
          <div key={m.name} className="rounded-[4px] border border-[#dce3ec] bg-white p-4">
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{m.name}</div>
            <div className="mt-1 text-xl font-bold tabular-nums text-[#071428]">{fmt(m.value)}</div>
            <div className="text-xs text-slate-500">{fmtPct(m.pct)} volume ước</div>
          </div>
        ))}
      </div>
    </div>
  );
}
