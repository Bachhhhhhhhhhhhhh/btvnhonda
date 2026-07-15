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
  Area,
  AreaChart,
} from "recharts";
import { ParamPanel } from "@/components/twin/param-panel";
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
import { chartTheme } from "@/components/charts/theme";
import { motion } from "framer-motion";
import {
  Banknote,
  Container,
  Package,
  Ship,
  TrendingDown,
} from "lucide-react";

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
    { name: "Baseline", value: +(a.baselineCost / 1e9).toFixed(2) },
    { name: "Tối ưu", value: +(a.totalCost / 1e9).toFixed(2) },
    { name: "Tiết kiệm", value: +(a.totalSavings / 1e9).toFixed(2) },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-teal-50 px-5 py-5 sm:px-7"
      >
        <div className="section-kicker text-blue-600">Control tower</div>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Digital Twin — mạng lưới kho & vận tải sống
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Thay số xe, m², lead time, cước, tỷ lệ stack/transfer — quan sát ngay
          chi phí, utilization, thuê ngoài và case pool. Đây là DSS điều hành,
          không phải slide tĩnh.
        </p>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Tổng chi phí" value={`${fmt(a.totalCost / 1e9, 2)} tỷ`} tone="accent" icon={Banknote} delay={0.02} />
        <Kpi
          label="Tiết kiệm vs baseline"
          value={`${fmt(a.totalSavings / 1e9, 2)} tỷ`}
          tone={a.totalSavings > 0 ? "good" : "bad"}
          icon={TrendingDown}
          delay={0.05}
        />
        <Kpi label="Thuê ngoài" value={fmt(a.outsourceVol)} icon={Package} delay={0.08} sub="xe-eq / năm" />
        <Kpi label="Transfer N→S" value={fmt(a.transferVol)} icon={Ship} delay={0.11} sub="xe / năm" />
        <Kpi label="Case pool đỉnh" value={fmt(a.peakCasePool)} tone="warn" icon={Container} delay={0.14} />
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <ParamPanel />
        </div>
        <div className="space-y-5 xl:col-span-8">
          <Card>
            <CardHeader>
              <div className="section-kicker">Policy response</div>
              <CardTitle>
                Transfer y_t vs Thuê ngoài z_t · stack NK{" "}
                {fmtPct(params.importStackRatio, 0)}
              </CardTitle>
              <CardDescription>
                Stack import cố định theo slider — residual chia transfer / outsource
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                  <Tooltip {...chartTheme.tooltip} />
                  <Legend />
                  <Bar dataKey="Chuyển y_t" stackId="a" fill="#7c3aed" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Thuê ngoài z_t" stackId="a" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Chi phí mạng lưới (tỷ VND)</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="costG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0891b2" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#0891b2" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                    <Tooltip {...chartTheme.tooltip} />
                    <Area type="monotone" dataKey="Chi phí (tỷ)" stroke="#0891b2" fill="url(#costG)" strokeWidth={3} />
                  </AreaChart>
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
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                    <Tooltip {...chartTheme.tooltip} />
                    <Legend />
                    <Bar dataKey="Container N→S" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Case pool" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cầu chi phí (tỷ VND)</CardTitle>
              <CardDescription>Baseline outsource → tối ưu → savings</CardDescription>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costBridge}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: chartTheme.tick, fontSize: 12 }} axisLine={false} />
                  <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                  <Tooltip {...chartTheme.tooltip} />
                  <Bar dataKey="value" fill="#0d9488" radius={[10, 10, 0, 0]} barSize={48} name="tỷ VND" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đèn giao thông playbook</CardTitle>
              <CardDescription>
                Xanh ≤0 · Vàng &lt;30k · Đỏ ≥30k residual sau stack NK
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {result.months.map((m, i) => (
                  <motion.div
                    key={m.month}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`rounded-2xl px-2 py-3.5 text-center shadow-sm ${
                      m.classification === "green"
                        ? "border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white text-emerald-800"
                        : m.classification === "amber"
                          ? "border border-amber-200 bg-gradient-to-b from-amber-50 to-white text-amber-900"
                          : "border border-rose-200 bg-gradient-to-b from-rose-50 to-white text-rose-800"
                    }`}
                  >
                    <div className="text-xs font-bold">{m.month}</div>
                    <div className="mt-1 text-sm font-black tabular-nums">
                      {fmt(m.residualAfterImport)}
                    </div>
                    <div className="mt-1 text-[9px] font-bold uppercase tracking-wide opacity-70">
                      {m.classification === "green"
                        ? "Xanh"
                        : m.classification === "amber"
                          ? "Vàng"
                          : "Đỏ · T-4"}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
