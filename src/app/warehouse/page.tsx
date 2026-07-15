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
  Line,
  ComposedChart,
} from "recharts";
import {
  ASSUMPTIONS,
  MAX_STOCK_ON_HAND,
  MONTHS,
  OVER_FACT_CAP,
  OVER_TTL_CAP,
} from "@/lib/data/projectData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Kpi } from "@/components/ui/kpi";
import { fmt } from "@/lib/utils";
import { chartTheme } from "@/components/charts/theme";

export default function WarehousePage() {
  const data = MONTHS.map((m) => ({
    month: m,
    "Tồn max": MAX_STOCK_ON_HAND[m],
    "Fact Cap": ASSUMPTIONS.factCapNorth,
    "TTL Cap": ASSUMPTIONS.ttlCapNorth,
    "Vượt Fact": OVER_FACT_CAP[m],
    "Vượt TTL": OVER_TTL_CAP[m],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Năng lực kho miền Bắc</h1>
        <p className="mt-1 text-sm text-slate-400">
          Dữ liệu Excel Rental WH. Hai định nghĩa “vượt capacity” được hiển thị
          song song — không gộp nhầm.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Fact Cap (VPC)" value={fmt(ASSUMPTIONS.factCapNorth)} sub="Rental WH!F55:Q55" tone="accent" />
        <Kpi label="TTL Cap Bắc" value={fmt(ASSUMPTIONS.ttlCapNorth)} sub="Gồm open area + HNM" />
        <Kpi label="Peak tồn on-hand" value={fmt(Math.max(...MONTHS.map((m) => MAX_STOCK_ON_HAND[m])))} sub="Rental WH row 54" tone="warn" />
        <Kpi label="Peak vượt @ Fact Cap" value={fmt(Math.max(...MONTHS.map((m) => OVER_FACT_CAP[m])))} sub="Word Bảng 9 · Aug" tone="bad" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tồn max vs Fact Cap vs TTL Cap</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <Tooltip {...chartTheme.tooltip} />
              <Legend />
              <Bar dataKey="Tồn max" fill="#64748b" />
              <Line type="monotone" dataKey="Fact Cap" stroke="#fb7185" strokeWidth={2} />
              <Line type="monotone" dataKey="TTL Cap" stroke="#34d399" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vượt capacity: chuẩn Word (Fact) vs chuẩn Excel (TTL)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <Tooltip {...chartTheme.tooltip} />
              <Legend />
              <Bar dataKey="Vượt Fact" fill="#fb7185" name="Vượt @ Fact Cap (Word)" />
              <Bar dataKey="Vượt TTL" fill="#38bdf8" name="Vượt @ TTL (Excel)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cấu phần capacity Bắc (Excel Rental WH)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="table-dark w-full text-left text-sm">
            <thead className="border-b border-white/10">
              <tr>
                <th className="py-2">Thành phần</th>
                <th>Xe</th>
                <th>Nguồn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr><td className="py-2">VPC Fact Cap</td><td className="tabular-nums">17.680</td><td className="text-slate-500">Rental WH!F55</td></tr>
              <tr><td className="py-2">HNM (NKV)</td><td className="tabular-nums">2.500</td><td className="text-slate-500">Rental WH!F56</td></tr>
              <tr><td className="py-2">Open area HNM VTP</td><td className="tabular-nums">8.315</td><td className="text-slate-500">Rental WH!F58</td></tr>
              <tr className="font-semibold text-sky-300"><td className="py-2">TTL capacity</td><td className="tabular-nums">28.495</td><td className="text-slate-500">Rental WH!F59</td></tr>
              <tr><td className="py-2">m²/xe Bắc dài hạn</td><td className="tabular-nums">1,6</td><td className="text-slate-500">S110 (≠ Word 1,7)</td></tr>
              <tr><td className="py-2">m²/xe Nam dài hạn</td><td className="tabular-nums">2,0</td><td className="text-slate-500">Rental WH!S112</td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
