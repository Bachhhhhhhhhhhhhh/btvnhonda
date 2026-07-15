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
  Area,
  AreaChart,
} from "recharts";
import { useTwinStore } from "@/lib/store";
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
import { mcPerContainerBase } from "@/lib/engine/digitalTwin";
import { chartTheme } from "@/components/charts/theme";
import { Container, Package, RotateCcw, Boxes } from "lucide-react";
import Link from "next/link";

export default function ContainerPage() {
  const { result, params } = useTwinStore();
  const baseMc = mcPerContainerBase(params.casesPerContainerNS, params.mcPerCase);
  const util =
    params.mcPerContainerExcel > 0
      ? baseMc / params.mcPerContainerExcel
      : 0;
  const gapCont =
    result.annual.nsContainersBase - result.annual.nsContainersExcel;

  const data = result.months.map((m) => ({
    month: m.month,
    base: Math.round(m.nsContainersBase * 10) / 10,
    excel: Math.round(m.nsContainersExcel * 10) / 10,
    ret: Math.round(m.returnContainers * 10) / 10,
    cases: Math.round(m.cases),
    pool: Math.round(m.casePool),
    transfer: Math.round(m.transferVol),
  }));

  const peakCont = Math.max(...data.map((d) => d.base));
  const peakPool = result.annual.peakCasePool;

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="Vận hành · Equipment"
        title="Tối ưu container & case pool"
        subtitle={`N→S: ${params.casesPerContainerNS} kiện × ${params.mcPerCase} xe/kiện = ${fmt(baseMc, 1)} xe/cont (base). Workbook Excel: ${params.mcPerContainerExcel} xe/cont. Return: ${params.casesPerContainerReturn} kiện/cont.`}
        actions={
          <Link href="/transport" className="btn-bank-outline px-3 py-2 text-xs">
            → Vận tải
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="N→S năm @ base" value={fmt(result.annual.nsContainersBase)} sub={`${fmt(baseMc, 1)} xe/cont`} tone="accent" icon={Container} />
        <Kpi label="N→S năm @ Excel" value={fmt(result.annual.nsContainersExcel)} sub={`${params.mcPerContainerExcel} xe/cont`} icon={Boxes} />
        <Kpi label="Return S→N" value={fmt(result.annual.returnContainers)} sub={`${params.casesPerContainerReturn} kiện/cont`} icon={RotateCcw} />
        <Kpi label="Case pool đỉnh" value={fmt(peakPool)} sub={`Chu kỳ ${params.leadTimeDays + params.freeTimeDays}n`} tone="warn" icon={Package} />
      </div>

      <MetricRow
        items={[
          { label: "Xe/cont base", value: fmt(baseMc, 1), hint: "12 × mc/case" },
          { label: "Util vs Excel", value: fmtPct(util), hint: "base / 46.6" },
          { label: "Δ cont (base−excel)", value: fmt(gapCont), hint: "năm" },
          { label: "Peak cont tháng", value: fmt(peakCont, 1), hint: "N→S base" },
        ]}
      />

      <InsightBox title="Ghi chú 16.900 kiện" tone="info">
        Word nêu ~16.900 kiện N→S ở kịch bản zero-outsource — đó là <strong>output kịch bản</strong>,
        không phải hằng số Excel (0 hits). Công thức: residual_sau_stack / xe_mỗi_kiện với transfer=100%.
        Lane return thực tế: Long An / Đồng Nai / Cái Cui → Vĩnh Phúc / Hà Nam.
      </InsightBox>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card accent>
          <CardHeader>
            <div className="section-kicker">Demand</div>
            <CardTitle>Nhu cầu container theo tháng</CardTitle>
            <CardDescription>Base vs Excel fill rate · Return S→N</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Bar dataKey="base" name={`N→S @ ${fmt(baseMc, 1)}`} fill="#0a4d6e" radius={[2, 2, 0, 0]} />
                <Bar dataKey="excel" name={`N→S @ ${params.mcPerContainerExcel}`} fill="#0d6b63" radius={[2, 2, 0, 0]} />
                <Bar dataKey="ret" name="Return S→N" fill="#b8954a" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kiện & case pool</CardTitle>
            <CardDescription>Pool ≈ (cases/30) × (lead+free)</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Bar dataKey="cases" name="Kiện N→S" fill="#7c3aed" radius={[2, 2, 0, 0]} />
                <Line type="monotone" dataKey="pool" name="Case pool" stroke="#b45309" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer volume → container</CardTitle>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
              <Tooltip {...chartTheme.tooltip} />
              <Area type="monotone" dataKey="transfer" name="Transfer xe" stroke="#0a4d6e" fill="#bfdbfe" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bảng equipment theo tháng</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="table-dark w-full text-left text-sm">
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Transfer xe</th>
                <th>Kiện</th>
                <th>Cont base</th>
                <th>Cont Excel</th>
                <th>Return</th>
                <th>Case pool</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f6]">
              {data.map((r) => (
                <tr key={r.month}>
                  <td className="font-bold text-[#071428]">{r.month}</td>
                  <td className="tabular-nums">{fmt(r.transfer)}</td>
                  <td className="tabular-nums">{fmt(r.cases)}</td>
                  <td className="tabular-nums font-semibold">{fmt(r.base, 1)}</td>
                  <td className="tabular-nums">{fmt(r.excel, 1)}</td>
                  <td className="tabular-nums">{fmt(r.ret, 1)}</td>
                  <td className="tabular-nums text-amber-800">{fmt(r.pool)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { t: "Chiều đi N→S", d: "Sea case lane VPC/HNM → Long An, Đồng Nai, Cái Cui. Fill rate quyết định số cont." },
          { t: "Chiều về S→N", d: "Empty cases 80/cont. Thiếu return → đứt packing dù cont đi đủ." },
          { t: "Case pool", d: `Sizing (lead ${params.leadTimeDays}+free ${params.freeTimeDays}) ngày. Peak Twin: ${fmt(peakPool)} kiện.` },
        ].map((x) => (
          <div key={x.t} className="rounded-[4px] border border-[#dce3ec] bg-white p-4">
            <div className="text-[10px] font-bold uppercase tracking-wide text-[#b8954a]">{x.t}</div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{x.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
