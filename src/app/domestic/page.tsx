"use client";

import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Kpi } from "@/components/ui/kpi";
import { fmt } from "@/lib/utils";
import { chartTheme } from "@/components/charts/theme";

export default function DomesticPage() {
  const { result, params } = useTwinStore();
  const data = result.months.map((m) => ({
    month: m.month,
    residual: Math.round(m.residualAfterImport),
    "Chuyển y_t": Math.round(m.transferVol),
    "Thuê ngoài z_t": Math.round(m.outsourceVol),
    "Chi phí tránh (triệu)": Math.round(m.avoidedCost / 1e6),
    "Chi phí transfer (triệu)": Math.round(
      (m.packingCost + m.freightCost + m.returnCost + m.southWhCost + m.riskCost) / 1e6
    ),
  }));

  const unitAvoided = params.cost.northOutsourcePerMcMonth + params.cost.bonusPerOverMc;
  const unitTransfer =
    params.cost.packingPerMc +
    params.cost.nsFreightPerMc +
    params.cost.southWhPerMcMonth +
    params.cost.returnPerCase / params.mcPerCase +
    (params.cost.packingPerMc + params.cost.nsFreightPerMc) * params.cost.riskPremiumRate;

  const justified = unitTransfer < unitAvoided;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tối ưu xe nội địa</h1>
        <p className="mt-1 text-sm text-slate-400">
          Nhánh 2 — residual sau stack NK: chọn chuyển N→S (y_t) hay thuê ngoài Bắc (z_t).
          Quy tắc (Word §13): chuyển khi chi phí tránh được ở Bắc &gt; tổng chi phí transfer.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Tỷ lệ chuyển" value={`${(params.transferRatio * 100).toFixed(0)}%`} sub="Đòn bẩy Digital Twin" tone="accent" />
        <Kpi label="Transfer năm" value={fmt(result.annual.transferVol)} sub="Xe N→S" />
        <Kpi label="Đơn giá tránh được" value={fmt(unitAvoided)} sub="VND / xe (thuê+bonus)" tone="good" />
        <Kpi label="Đơn giá transfer" value={fmt(unitTransfer)} sub="VND / xe all-in" tone={justified ? "good" : "bad"} />
      </div>

      <Card>
        <CardHeader><CardTitle>Trạng thái hòa vốn (break-even)</CardTitle></CardHeader>
        <CardContent>
          <div className={`rounded-2xl border p-4 text-sm leading-relaxed ${
            justified
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
              : "border-rose-500/30 bg-rose-500/10 text-rose-100"
          }`}>
            {justified ? (
              <>Transfer <strong>có lợi kinh tế</strong> với rate card hiện tại: biên {fmt(unitAvoided - unitTransfer)} VND/xe.
              Tăng y_t ở tháng đỏ đến khi container hoặc capacity Nam chặn.</>
            ) : (
              <>Transfer <strong>đắt hơn</strong> thuê ngoài Bắc: chênh {fmt(unitTransfer - unitAvoided)} VND/xe.
              Ưu tiên z_t trừ khi service/rủi ro đảo quyết định — cần Finance khóa rate card.</>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>y_t transfer vs z_t thuê ngoài theo tháng</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <Tooltip {...chartTheme.tooltip} />
              <Legend />
              <Bar dataKey="Chuyển y_t" stackId="a" fill="#a78bfa" />
              <Bar dataKey="Thuê ngoài z_t" stackId="a" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Chi phí tránh được vs chi phí transfer (triệu VND)</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <Tooltip {...chartTheme.tooltip} />
              <Legend />
              <Bar dataKey="Chi phí tránh (triệu)" fill="#34d399" />
              <Bar dataKey="Chi phí transfer (triệu)" fill="#fb923c" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
