"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Line,
  ComposedChart,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import { defaultParams, simulate } from "@/lib/engine/digitalTwin";
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
import { GitCompare, Trophy, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ScenariosPage() {
  const { params } = useTwinStore();

  const rows = useMemo(() => {
    const base = defaultParams();
    const scenarios = [
      {
        name: "Hiện trạng",
        short: "As-is",
        p: { ...base, importStackRatio: 0, transferRatio: 0, cost: { ...base.cost } },
      },
      {
        name: "Chỉ stack NK",
        short: "Import only",
        p: { ...base, importStackRatio: 1, transferRatio: 0, cost: { ...base.cost } },
      },
      {
        name: "Stack + 35% TF",
        short: "Base 35%",
        p: { ...base, importStackRatio: 1, transferRatio: 0.35, cost: { ...base.cost } },
      },
      {
        name: "Stack + 70% TF",
        short: "Aggressive",
        p: { ...base, importStackRatio: 1, transferRatio: 0.7, cost: { ...base.cost } },
      },
      {
        name: "Zero outsource",
        short: "TF 100%",
        p: { ...base, importStackRatio: 1, transferRatio: 1, cost: { ...base.cost } },
      },
      { name: "Twin hiện tại", short: "Live Twin", p: params },
      {
        name: "Thận trọng 40 xe/cont",
        short: "40/cont",
        p: {
          ...params,
          casesPerContainerNS: 12,
          mcPerCase: 40 / 12,
          cost: { ...params.cost },
        },
      },
      {
        name: "TTL capacity",
        short: "TTL over",
        p: { ...params, useTtlCapacity: true, cost: { ...params.cost } },
      },
    ];
    return scenarios.map((s) => {
      const r = simulate(s.p);
      return {
        name: s.name,
        short: s.short,
        saveBn: +(r.annual.totalSavings / 1e9).toFixed(2),
        costBn: +(r.annual.totalCost / 1e9).toFixed(2),
        outsource: Math.round(r.annual.outsourceVol),
        transfer: Math.round(r.annual.transferVol),
        cont: Math.round(r.annual.nsContainersBase),
        pool: Math.round(r.annual.peakCasePool),
        m2: Math.round(r.annual.m2Saved),
        roi: r.annual.roi,
        npv: +(r.annual.npv / 1e9).toFixed(2),
      };
    });
  }, [params]);

  const best = rows.reduce((b, r) => (r.saveBn > b.saveBn ? r : b), rows[0]);
  const live = rows.find((r) => r.name === "Twin hiện tại") ?? rows[0];
  const asIs = rows.find((r) => r.name === "Hiện trạng") ?? rows[0];

  const radar = rows.slice(0, 6).map((r) => ({
    name: r.short,
    save: Math.max(0, r.saveBn),
    transfer: r.transfer / 5000,
    outsource: Math.max(0, 50 - r.outsource / 8000),
  }));

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="Phân tích · Scenarios"
        title="So sánh kịch bản"
        subtitle="Word §15: conservative / base / efficiency + cực chính sách (zero outsource = benchmark kỹ thuật). Live Twin luôn nằm trong bảng."
        actions={
          <Link href="/digital-twin" className="btn-bank px-3 py-2 text-xs">
            Chỉnh Twin
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Kịch bản tốt nhất" value={`${fmt(best.saveBn, 2)} tỷ`} sub={best.name} tone="good" icon={Trophy} />
        <Kpi label="Twin hiện tại" value={`${fmt(live.saveBn, 2)} tỷ`} sub="Tiết kiệm năm" tone="accent" icon={GitCompare} />
        <Kpi label="Vs hiện trạng" value={`${fmt(live.saveBn - asIs.saveBn, 2)} tỷ`} sub="Δ savings" tone="good" />
        <Kpi label="Zero-OS cont" value={fmt(rows.find((r) => r.name === "Zero outsource")?.cont ?? 0)} sub="Cont nếu TF 100%" tone="warn" icon={AlertCircle} />
      </div>

      <MetricRow
        items={[
          { label: "Số kịch bản", value: String(rows.length), hint: "đã mô phỏng" },
          { label: "Live outsource", value: fmt(live.outsource), hint: "xe-eq" },
          { label: "Live transfer", value: fmt(live.transfer), hint: "xe" },
          { label: "Live ROI", value: fmtPct(live.roi), hint: "stacking" },
        ]}
      />

      <InsightBox title="Cách đọc" tone="info">
        Zero outsource thường <strong>không</strong> phải savings cao nhất nếu cước N→S + return đắt hơn thuê Bắc.
        So cột “Tiết kiệm” với “Cont N→S” và “Case pool” trước khi cam kết KPI “z_t = 0”.
      </InsightBox>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" accent>
          <CardHeader>
            <div className="section-kicker">Savings ranking</div>
            <CardTitle>Tiết kiệm năm theo kịch bản (tỷ VND)</CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={false} />
                <XAxis type="number" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fill: chartTheme.tick, fontSize: 10 }}
                />
                <Tooltip {...chartTheme.tooltip} />
                <Bar dataKey="saveBn" name="Tiết kiệm tỷ" fill="#0d6b63" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Radar 6 kịch bản đầu</CardTitle>
            <CardDescription>Save · Transfer scale · Outsource inverse</CardDescription>
          </CardHeader>
          <CardContent className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar}>
                <PolarGrid stroke={chartTheme.grid} />
                <PolarAngleAxis dataKey="name" tick={{ fill: chartTheme.tick, fontSize: 10 }} />
                <PolarRadiusAxis tick={false} />
                <Radar dataKey="save" stroke="#0a4d6e" fill="#0a4d6e" fillOpacity={0.3} name="Save" />
                <Radar dataKey="transfer" stroke="#b8954a" fill="#b8954a" fillOpacity={0.2} name="TF" />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chi phí vs tiết kiệm</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="short" tick={{ fill: chartTheme.tick, fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
              <Tooltip {...chartTheme.tooltip} />
              <Legend />
              <Bar dataKey="costBn" name="Chi phí tỷ" fill="#94a3b8" radius={[2, 2, 0, 0]} />
              <Line type="monotone" dataKey="saveBn" name="Tiết kiệm tỷ" stroke="#0d6b63" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bảng chi tiết kịch bản</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="table-dark w-full text-left text-sm">
            <thead>
              <tr>
                <th>Kịch bản</th>
                <th>Tiết kiệm tỷ</th>
                <th>Chi phí tỷ</th>
                <th>NPV tỷ</th>
                <th>ROI</th>
                <th>Thuê ngoài</th>
                <th>Transfer</th>
                <th>Cont</th>
                <th>Pool</th>
                <th>m² save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f6]">
              {rows.map((r) => (
                <tr
                  key={r.name}
                  className={r.name === "Twin hiện tại" ? "selected" : undefined}
                >
                  <td className="font-bold text-[#071428]">{r.name}</td>
                  <td className="tabular-nums font-semibold text-teal-800">{fmt(r.saveBn, 2)}</td>
                  <td className="tabular-nums">{fmt(r.costBn, 2)}</td>
                  <td className="tabular-nums">{fmt(r.npv, 2)}</td>
                  <td className="tabular-nums">{fmtPct(r.roi)}</td>
                  <td className="tabular-nums">{fmt(r.outsource)}</td>
                  <td className="tabular-nums">{fmt(r.transfer)}</td>
                  <td className="tabular-nums">{fmt(r.cont)}</td>
                  <td className="tabular-nums">{fmt(r.pool)}</td>
                  <td className="tabular-nums">{fmt(r.m2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
