"use client";

import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import { IMPORT_BY_MODEL, IMPORT_VOLUME, MONTHS } from "@/lib/data/projectData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Kpi } from "@/components/ui/kpi";
import { fmt, fmtPct } from "@/lib/utils";
import { chartTheme } from "@/components/charts/theme";

const COLORS = ["#38bdf8", "#34d399", "#a78bfa", "#64748b"];

export default function ImportPage() {
  const { result, params } = useTwinStore();
  const data = result.months.map((m) => ({
    month: m.month,
    "Nhập khẩu": m.importVol,
    "Relief": Math.round(m.importRelief),
    "Residual": Math.round(m.residualAfterImport),
  }));
  const modelData = Object.entries(IMPORT_BY_MODEL).map(([name, value]) => ({ name, value }));
  const reliefRate = params.unpackM2 > 0 ? (params.unpackM2 - params.stackM2) / params.unpackM2 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tối ưu xe nhập khẩu</h1>
        <p className="mt-1 text-sm text-slate-400">
          Nhánh 1 — chồng kiện xe NK. Công thức (Word §3): Import × ({params.unpackM2} − {params.stackM2}) / {params.unpackM2} ={" "}
          <span className="font-semibold text-emerald-300">{fmtPct(reliefRate)}</span> capacity tương đương.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Import năm" value={fmt(result.annual.importVol)} sub="Rental WH!R11 ≈ 106.460" tone="accent" />
        <Kpi label="Relief năm" value={fmt(result.annual.importRelief)} sub={`@ tỷ lệ stack ${fmtPct(params.importStackRatio, 0)}`} tone="good" />
        <Kpi label="m² tiết kiệm" value={fmt(result.annual.m2Saved)} sub="import × tỷ lệ × Δm²" tone="good" />
        <Kpi label="Import đỉnh" value={fmt(Math.max(...MONTHS.map((m) => IMPORT_VOLUME[m])))} sub="Aug · Excel 13.891" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Volume NK & relief stacking theo tháng</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Bar dataKey="Nhập khẩu" fill="#0ea5e9" />
                <Bar dataKey="Relief" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Cơ cấu model (ước Word)</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={modelData} dataKey="value" nameKey="name" outerRadius={100} label>
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

      <Card>
        <CardHeader>
          <CardTitle>Residual sau stack NK — vẫn cần chính sách nội địa</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <Tooltip {...chartTheme.tooltip} />
              <Bar dataKey="Residual" fill="#fbbf24" name="Vượt còn lại sau stack NK" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
