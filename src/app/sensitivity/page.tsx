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
  ReferenceLine,
  Legend,
  Line,
  LineChart,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import { sensitivity, simulate } from "@/lib/engine/digitalTwin";
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
import { Activity, ArrowUpDown } from "lucide-react";
import Link from "next/link";

const LABEL_VN: Record<string, string> = {
  "North outsource rate": "Đơn giá thuê ngoài Bắc",
  "N→S freight rate": "Cước N→S",
  "Transfer ratio": "Tỷ lệ transfer",
  "Import stack ratio": "Tỷ lệ stack NK",
  "Stacked m²/MC": "m²/xe khi stack",
  "Bonus rate": "Đơn giá bonus",
};

export default function SensitivityPage() {
  const { params, result } = useTwinStore();
  const sens = useMemo(() => sensitivity(params, 0.2), [params]);
  const data = sens.drivers.map((d) => ({
    name: LABEL_VN[d.key] || d.key,
    key: d.key,
    "Thấp −20%": +(d.low / 1e9).toFixed(2),
    "Cao +20%": +(d.high / 1e9).toFixed(2),
    impact: +(d.impact / 1e9).toFixed(2),
    low: d.low,
    high: d.high,
  }));

  const top = data[0];
  const baseBn = sens.baseSave / 1e9;

  // Transfer ratio sweep for deep dive
  const transferSweep = useMemo(() => {
    return [0, 0.15, 0.25, 0.35, 0.5, 0.7, 0.85, 1].map((tr) => {
      const r = simulate({ ...params, transferRatio: tr, cost: { ...params.cost } });
      return {
        tr: `${Math.round(tr * 100)}%`,
        save: +(r.annual.totalSavings / 1e9).toFixed(2),
        outsource: Math.round(r.annual.outsourceVol),
        cont: Math.round(r.annual.nsContainersBase),
      };
    });
  }, [params]);

  const stackSweep = useMemo(() => {
    return [0, 0.25, 0.5, 0.75, 1].map((sr) => {
      const r = simulate({ ...params, importStackRatio: sr, cost: { ...params.cost } });
      return {
        sr: `${Math.round(sr * 100)}%`,
        save: +(r.annual.totalSavings / 1e9).toFixed(2),
        m2: Math.round(r.annual.m2Saved),
        relief: Math.round(r.annual.importRelief),
      };
    });
  }, [params]);

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="Phân tích · Sensitivity"
        title="Phân tích độ nhạy"
        subtitle={`Thay ±20% từng driver. Tornado xếp theo tác động lên tiết kiệm năm. Base: ${fmt(baseBn, 2)} tỷ VND.`}
        actions={
          <Link href="/monte-carlo" className="btn-bank-outline px-3 py-2 text-xs">
            → Monte Carlo
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Base savings" value={`${fmt(baseBn, 2)} tỷ`} tone="accent" icon={Activity} />
        <Kpi label="Driver mạnh nhất" value={top?.name ?? "—"} sub={`Impact ${top?.impact ?? 0} tỷ`} tone="warn" icon={ArrowUpDown} />
        <Kpi label="Biên ±20% top" value={`${fmt(top?.["Thấp −20%"] ?? 0, 2)} → ${fmt(top?.["Cao +20%"] ?? 0, 2)}`} sub="tỷ VND" />
        <Kpi label="Số driver" value={String(data.length)} sub="đã quét" />
      </div>

      <MetricRow
        items={[
          { label: "Twin stack ratio", value: fmtPct(params.importStackRatio, 0), hint: "hiện tại" },
          { label: "Twin transfer", value: fmtPct(params.transferRatio, 0), hint: "hiện tại" },
          { label: "Cước N→S", value: fmt(params.cost.nsFreightPerMc), hint: "VND/xe" },
          { label: "Thuê Bắc", value: fmt(params.cost.northOutsourcePerMcMonth), hint: "VND/xe-th" },
        ]}
      />

      <InsightBox title="Hàm ý quản trị" tone="warn">
        Driver chi phối phương sai savings thường là <strong>đơn giá thuê Bắc</strong>,{" "}
        <strong>cước N→S</strong> và <strong>mật độ stack</strong>. Khóa rate card Finance trước cam kết ngân sách đa năm.
      </InsightBox>

      <Card accent>
        <CardHeader>
          <div className="section-kicker">Tornado</div>
          <CardTitle>Tác động ±20% lên tiết kiệm (tỷ VND)</CardTitle>
          <CardDescription>Đường nét đứt = base {fmt(baseBn, 2)} tỷ</CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis type="number" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fill: chartTheme.tick, fontSize: 11 }}
              />
              <Tooltip {...chartTheme.tooltip} />
              <Legend />
              <ReferenceLine x={baseBn} stroke="#94a3b8" strokeDasharray="4 4" />
              <Bar dataKey="Thấp −20%" fill="#f87171" />
              <Bar dataKey="Cao +20%" fill="#34d399" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quét tỷ lệ transfer</CardTitle>
            <CardDescription>Giữ nguyên stack & rate card Twin</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transferSweep}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="tr" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Line type="monotone" dataKey="save" name="Tiết kiệm tỷ" stroke="#0d6b63" strokeWidth={2} />
                <Line type="monotone" dataKey="cont" name="Cont N→S" stroke="#b8954a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quét tỷ lệ stack NK</CardTitle>
            <CardDescription>Giữ transfer & rate card Twin</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stackSweep}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="sr" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Line type="monotone" dataKey="save" name="Tiết kiệm tỷ" stroke="#0a4d6e" strokeWidth={2} />
                <Line type="monotone" dataKey="m2" name="m² save" stroke="#0d6b63" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Xếp hạng driver</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="table-dark w-full text-left text-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Driver</th>
                <th>Tiết kiệm −20%</th>
                <th>Base</th>
                <th>Tiết kiệm +20%</th>
                <th>Impact (tỷ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f6]">
              {data.map((d, i) => (
                <tr key={d.name}>
                  <td className="font-bold text-slate-400">{i + 1}</td>
                  <td className="font-semibold text-[#071428]">{d.name}</td>
                  <td className="tabular-nums text-rose-700">{d["Thấp −20%"]}</td>
                  <td className="tabular-nums">{fmt(baseBn, 2)}</td>
                  <td className="tabular-nums text-teal-800">{d["Cao +20%"]}</td>
                  <td className="tabular-nums font-bold text-[#0a4d6e]">{d.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
