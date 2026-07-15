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
  LineChart,
} from "recharts";
import { ParamPanel } from "@/components/twin/param-panel";
import { useTwinStore } from "@/lib/store";
import { Kpi } from "@/components/ui/kpi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmt, fmtPct } from "@/lib/utils";
import { chartTheme } from "@/components/charts/theme";

export default function DigitalTwinPage() {
  const { result, params } = useTwinStore();
  const a = result.annual;
  const data = result.months.map((m) => ({
    month: m.month,
    "Thuê ngoài z_t": Math.round(m.outsourceVol),
    "Chuyển y_t": Math.round(m.transferVol),
    "Chi phí (tỷ)": +(m.totalCost / 1e9).toFixed(3),
    "Case pool": Math.round(m.casePool),
    "Container N→S": Math.round(m.nsContainersBase),
  }));

  const costBridge = [
    { name: "Baseline thuê ngoài", value: +(a.baselineCost / 1e9).toFixed(2) },
    { name: "Chi phí tối ưu", value: +(a.totalCost / 1e9).toFixed(2) },
    { name: "Tiết kiệm ròng", value: +(a.totalSavings / 1e9).toFixed(2) },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 px-5 py-4">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Digital Twin — Mô phỏng toàn mạng lưới
        </h1>
        <p className="mt-1.5 max-w-4xl text-sm leading-relaxed text-slate-600">
          Đây là trung tâm ra quyết định. Thay số xe, diện tích kho, lead time,
          chi phí thuê ngoài, giá vận chuyển hay số container — quan sát ngay
          tác động đến chi phí, mức sử dụng kho, tỷ lệ thuê ngoài và hiệu quả
          vận hành. Không phải báo cáo tĩnh.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Tổng chi phí" value={`${fmt(a.totalCost / 1e9, 2)} tỷ`} tone="accent" />
        <Kpi
          label="Tiết kiệm vs baseline"
          value={`${fmt(a.totalSavings / 1e9, 2)} tỷ`}
          tone={a.totalSavings > 0 ? "good" : "bad"}
        />
        <Kpi label="Thuê ngoài (xe-eq)" value={fmt(a.outsourceVol)} />
        <Kpi label="Chuyển N→S (xe)" value={fmt(a.transferVol)} />
        <Kpi label="Case pool đỉnh" value={fmt(a.peakCasePool)} tone="warn" />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <ParamPanel />
        </div>
        <div className="space-y-4 xl:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>
                Thuê ngoài z_t vs Chuyển y_t theo tháng (stack NK{" "}
                {fmtPct(params.importStackRatio, 0)})
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                  <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                  <Tooltip {...chartTheme.tooltip} />
                  <Legend />
                  <Bar dataKey="Chuyển y_t" stackId="a" fill={chartTheme.colors.violet} />
                  <Bar dataKey="Thuê ngoài z_t" stackId="a" fill={chartTheme.colors.sky} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Chi phí mạng lưới theo tháng (tỷ VND)</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                    <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                    <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                    <Tooltip {...chartTheme.tooltip} />
                    <Line
                      type="monotone"
                      dataKey="Chi phí (tỷ)"
                      stroke={chartTheme.colors.cyan}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Container & case pool</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                    <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                    <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                    <Tooltip {...chartTheme.tooltip} />
                    <Legend />
                    <Bar dataKey="Container N→S" fill={chartTheme.colors.sky} />
                    <Bar dataKey="Case pool" fill={chartTheme.colors.amber} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cầu chi phí (tỷ VND)</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costBridge}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis dataKey="name" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                  <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                  <Tooltip {...chartTheme.tooltip} />
                  <Bar dataKey="value" fill="#14b8a6" radius={[8, 8, 0, 0]} name="tỷ VND" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phân loại tháng (đèn giao thông playbook)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {result.months.map((m) => (
                  <div
                    key={m.month}
                    className={`rounded-xl px-2 py-3 text-center text-xs font-bold ${
                      m.classification === "green"
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                        : m.classification === "amber"
                          ? "border border-amber-200 bg-amber-50 text-amber-900"
                          : "border border-rose-200 bg-rose-50 text-rose-800"
                    }`}
                  >
                    <div>{m.month}</div>
                    <div className="mt-1 tabular-nums opacity-90">
                      {fmt(m.residualAfterImport)}
                    </div>
                    <div className="mt-0.5 text-[9px] font-medium uppercase opacity-70">
                      {m.classification === "green"
                        ? "Xanh"
                        : m.classification === "amber"
                          ? "Vàng"
                          : "Đỏ"}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                Xanh: residual ≤ 0 · Vàng: &lt; 30.000 · Đỏ: ≥ 30.000 (KPI Word).
                Tháng đỏ cần pre-book container/case pool trước T-4.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
