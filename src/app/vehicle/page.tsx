"use client";

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
import { ASSUMPTIONS, IMPORT_VOLUME, MONTHS } from "@/lib/data/projectData";
import { chartTheme } from "@/components/charts/theme";
import { Bike, Boxes, Layers, Ruler } from "lucide-react";
import Link from "next/link";

export default function VehiclePage() {
  const { params, result } = useTwinStore();
  const layers = ASSUMPTIONS.maxLayers;
  const densityUnpack = 1 / params.unpackM2;
  const densityStack = 1 / params.stackM2;
  const densityGain = params.unpackM2 / params.stackM2;
  const reliefRate = (params.unpackM2 - params.stackM2) / params.unpackM2;
  const effCapFact = params.factCap * densityGain;
  const effCapTtl = params.ttlCap * densityGain;
  const mcPerPallet = params.mcPerCase;
  const stackedImport = result.annual.importVol * params.importStackRatio;

  const densityBars = [
    { mode: "Unpack", "Xe/m²": +densityUnpack.toFixed(3), "m²/xe": params.unpackM2 },
    { mode: "Stack", "Xe/m²": +densityStack.toFixed(3), "m²/xe": params.stackM2 },
    { mode: "Excel Bắc 1.6", "Xe/m²": +(1 / ASSUMPTIONS.excelNorthM2).toFixed(3), "m²/xe": ASSUMPTIONS.excelNorthM2 },
    { mode: "Excel Nam 2.0", "Xe/m²": +(1 / ASSUMPTIONS.excelSouthM2).toFixed(3), "m²/xe": ASSUMPTIONS.excelSouthM2 },
  ];

  const caseMix = [
    { mix: "2 xe/kiện", cases: Math.round(result.annual.transferVol / 2), cont: Math.round(result.annual.transferVol / (2 * 12)) },
    { mix: "3.5 mix", cases: Math.round(result.annual.transferVol / 3.5), cont: Math.round(result.annual.transferVol / (3.5 * 12)) },
    { mix: "4 xe/kiện", cases: Math.round(result.annual.transferVol / 4), cont: Math.round(result.annual.transferVol / (4 * 12)) },
    { mix: "Excel 46.6/cont", cases: "—", cont: Math.round(result.annual.transferVol / params.mcPerContainerExcel) },
  ];

  const monthlyDensity = MONTHS.map((m) => {
    const imp = IMPORT_VOLUME[m];
    const stacked = imp * params.importStackRatio;
    const m2Unpack = stacked * params.unpackM2;
    const m2Stack = stacked * params.stackM2;
    return {
      month: m,
      "m² nếu unpack": Math.round(m2Unpack),
      "m² nếu stack": Math.round(m2Stack),
      "m² tiết kiệm": Math.round(m2Unpack - m2Stack),
    };
  });

  const radar = [
    { metric: "Mật độ", full: 100, v: Math.min(100, densityGain * 40) },
    { metric: "Relief %", full: 100, v: reliefRate * 100 },
    { metric: "Stack ratio", full: 100, v: params.importStackRatio * 100 },
    { metric: "Tầng max", full: 100, v: (layers / 3) * 100 },
    { metric: "Mix xe/kiện", full: 100, v: (mcPerPallet / 4) * 100 },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="Vận hành · Density"
        title="Năng lực xe & mật độ lưu kho"
        subtitle="Stacking đổi số xe trên mỗi m² và capacity hiệu dụng. So sánh unpack vs stack, mix kiện và footprint theo tháng."
        actions={
          <Link href="/import" className="btn-bank-outline px-3 py-2 text-xs">
            → Nhập khẩu
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Mật độ unpack" value={`${fmt(densityUnpack, 2)} xe/m²`} sub={`${params.unpackM2} m²/xe`} icon={Ruler} />
        <Kpi label="Mật độ stack" value={`${fmt(densityStack, 2)} xe/m²`} sub={`${params.stackM2} m²/xe`} tone="good" icon={Layers} />
        <Kpi label="Hệ số tăng mật độ" value={`${fmt(densityGain, 2)}×`} sub={`Tối đa ${layers} tầng`} tone="accent" icon={Boxes} />
        <Kpi label="Fact Cap hiệu dụng" value={fmt(effCapFact)} sub={`từ ${fmt(params.factCap)} nếu full stack`} tone="good" icon={Bike} />
      </div>

      <MetricRow
        items={[
          { label: "Relief capacity", value: fmtPct(reliefRate), hint: "(unpack−stack)/unpack" },
          { label: "TTL Cap hiệu dụng", value: fmt(effCapTtl), hint: "nếu full stack density" },
          { label: "Xe stack năm", value: fmt(stackedImport), hint: `@ ${fmtPct(params.importStackRatio, 0)}` },
          { label: "Xe/kiện Twin", value: fmt(mcPerPallet, 1), hint: "To South mix 3.5" },
        ]}
      />

      <InsightBox title="Little’s Law — lưu ý điều hành" tone="warn">
        Stacking tăng <strong>mật độ tồn</strong>, không tự tăng throughput bán/giao. Inventory vẫn cần outbound.
        Lợi ích thật là giải phóng m² thuê / tránh outsource — Twin đo bằng relief {fmt(result.annual.importRelief)} xe-eq và {fmt(result.annual.m2Saved)} m².
      </InsightBox>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" accent>
          <CardHeader>
            <div className="section-kicker">Footprint</div>
            <CardTitle>m² sàn theo tháng — unpack vs stack</CardTitle>
            <CardDescription>
              Chỉ phần import được stack @ {fmtPct(params.importStackRatio, 0)}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyDensity}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Bar dataKey="m² nếu unpack" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="m² nếu stack" fill="#0d6b63" radius={[2, 2, 0, 0]} />
                <Bar dataKey="m² tiết kiệm" fill="#b8954a" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hồ sơ stacking</CardTitle>
            <CardDescription>Radar chuẩn hóa 0–100</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar}>
                <PolarGrid stroke={chartTheme.grid} />
                <PolarAngleAxis dataKey="metric" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar dataKey="v" stroke="#0a4d6e" fill="#0a4d6e" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>So sánh mật độ theo chuẩn</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={densityBars}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="mode" tick={{ fill: chartTheme.tick, fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Bar dataKey="Xe/m²" fill="#0a4d6e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tải kiện & container (theo transfer năm)</CardTitle>
            <CardDescription>Transfer Twin {fmt(result.annual.transferVol)} xe</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="table-dark w-full text-left text-sm">
              <thead>
                <tr>
                  <th>Mix</th>
                  <th>Kiện N→S</th>
                  <th>Cont ước</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f6]">
                {caseMix.map((r) => (
                  <tr key={r.mix}>
                    <td className="font-semibold text-[#071428]">{r.mix}</td>
                    <td className="tabular-nums">{typeof r.cases === "number" ? fmt(r.cases) : r.cases}</td>
                    <td className="tabular-nums font-semibold">{fmt(r.cont as number)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card hover>
          <CardHeader>
            <CardTitle>Thông số kiện / tầng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>
              Đề bài: <strong className="text-[#071428]">2–4 xe/kiện</strong>, tối đa{" "}
              <strong className="text-[#071428]">{layers} tầng</strong>.
            </p>
            <p>
              Workbook mix: <strong className="text-[#0a4d6e]">{ASSUMPTIONS.mcPerCaseMix}</strong> xe/kiện
              (To South&Sum!X1). Twin: <strong>{fmt(mcPerPallet, 1)}</strong>.
            </p>
            <p>
              Container: {params.casesPerContainerNS} kiện →{" "}
              {fmt(params.casesPerContainerNS * params.mcPerCase, 1)} xe base · Excel{" "}
              {params.mcPerContainerExcel} xe/cont.
            </p>
            <p className="text-xs text-slate-500">
              Chỉnh xe/kiện trong Digital Twin để thấy case pool & return đổi ngay.
            </p>
          </CardContent>
        </Card>
        <Card hover>
          <CardHeader>
            <CardTitle>Hàm ý capacity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>
              Import stack năm: <strong className="text-[#071428]">{fmt(stackedImport)}</strong> xe.
            </p>
            <p>
              Capacity tương đương giải phóng:{" "}
              <strong className="text-teal-800">{fmt(result.annual.importRelief)}</strong> xe-eq (
              {fmtPct(result.annual.capacityIncreasePct)} so footprint).
            </p>
            <p>
              Fact Cap “cảm nhận” sau full density: <strong>{fmt(effCapFact)}</strong> vs vật lý{" "}
              {fmt(params.factCap)}.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
