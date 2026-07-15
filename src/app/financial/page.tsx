"use client";

import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Kpi } from "@/components/ui/kpi";
import { fmt, fmtPct } from "@/lib/utils";
import { chartTheme } from "@/components/charts/theme";

const COLORS = ["#38bdf8", "#34d399", "#a78bfa", "#f59e0b", "#fb7185", "#64748b", "#14b8a6", "#fbbf24"];

export default function FinancialPage() {
  const { result, params } = useTwinStore();
  const a = result.annual;
  const costParts = [
    { name: "Thuê Bắc", value: result.months.reduce((s, m) => s + m.northRentalCost, 0) },
    { name: "Bonus", value: result.months.reduce((s, m) => s + m.bonusCost, 0) },
    { name: "Đóng kiện", value: result.months.reduce((s, m) => s + m.packingCost, 0) },
    { name: "Cước N→S", value: result.months.reduce((s, m) => s + m.freightCost, 0) },
    { name: "Return", value: result.months.reduce((s, m) => s + m.returnCost, 0) },
    { name: "Kho Nam", value: result.months.reduce((s, m) => s + m.southWhCost, 0) },
    { name: "Rủi ro", value: result.months.reduce((s, m) => s + m.riskCost, 0) },
    { name: "Stack NK", value: result.months.reduce((s, m) => s + m.importStackCost, 0) },
  ].map((x) => ({ ...x, value: +(x.value / 1e9).toFixed(3) }));

  const monthly = result.months.map((m) => ({
    month: m.month,
    "Tổng": +(m.totalCost / 1e9).toFixed(3),
    "Thuê": +(m.northRentalCost / 1e9).toFixed(3),
    "Cước": +(m.freightCost / 1e9).toFixed(3),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Phân tích tài chính</h1>
        <p className="mt-1 text-sm text-slate-400">
          Tổng chi phí mạng lưới, ROI, payback, NPV. Rate card chỉnh trong Digital Twin
          đến khi Finance khóa (Word §15).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Chi phí baseline" value={`${fmt(a.baselineCost / 1e9, 2)} tỷ`} sub="Toàn bộ over thuê ngoài" />
        <Kpi label="Chi phí tối ưu" value={`${fmt(a.totalCost / 1e9, 2)} tỷ`} tone="accent" />
        <Kpi label="Tiết kiệm" value={`${fmt(a.totalSavings / 1e9, 2)} tỷ`} tone={a.totalSavings > 0 ? "good" : "bad"} />
        <Kpi label="ROI" value={fmtPct(a.roi)} sub={`Hoàn vốn ${Number.isFinite(a.paybackMonths) ? fmt(a.paybackMonths, 1) : "∞"} tháng`} tone="good" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="NPV 3 năm" value={`${fmt(a.npv / 1e9, 2)} tỷ`} sub={`r=${fmtPct(params.cost.discountRate)}`} />
        <Kpi label="Chi phí / xe" value={fmt(a.costPerVehicle)} sub="VND" />
        <Kpi label="Chi phí / m²" value={fmt(a.costPerM2)} sub="VND" />
        <Kpi label="Hòa vốn transfer" value={fmt(a.breakEvenTransferUnitCost)} sub="Max VND/xe cho transfer" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Cơ cấu chi phí (tỷ VND)</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={costParts} dataKey="value" nameKey="name" outerRadius={110} label>
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
          <CardHeader><CardTitle>Chi phí theo tháng (tỷ)</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Bar dataKey="Thuê" stackId="a" fill="#38bdf8" />
                <Bar dataKey="Cước" stackId="a" fill="#a78bfa" />
                <Bar dataKey="Tổng" fill="#475569" name="Tổng (tham chiếu)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Neo ngân sách Excel</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-400">
          Rental WH!C123 “Stacking case” phân bổ <strong className="text-emerald-300">−2,62 tỷ VND</strong>{" "}
          qua các tháng peak. PPT tuyên bố ~3 tỷ/năm — cùng bậc độ lớn. DSS này tính
          savings động từ rate card, không hardcode −2,62.
        </CardContent>
      </Card>
    </div>
  );
}
