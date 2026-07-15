"use client";

import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Kpi } from "@/components/ui/kpi";
import { fmt } from "@/lib/utils";
import { mcPerContainerBase } from "@/lib/engine/digitalTwin";
import { chartTheme } from "@/components/charts/theme";

export default function ContainerPage() {
  const { result, params } = useTwinStore();
  const baseMc = mcPerContainerBase(params.casesPerContainerNS, params.mcPerCase);
  const data = result.months.map((m) => ({
    month: m.month,
    [`N→S @ ${fmt(baseMc, 1)}`]: Math.round(m.nsContainersBase),
    [`N→S @ ${params.mcPerContainerExcel}`]: Math.round(m.nsContainersExcel),
    "Return S→N": Math.round(m.returnContainers),
    "Kiện": Math.round(m.cases),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tối ưu container</h1>
        <p className="mt-1 text-sm text-slate-600">
          Container N→S từ volume transfer. Base: {params.casesPerContainerNS} kiện × {params.mcPerCase} xe/kiện ={" "}
          {fmt(baseMc, 1)} xe/cont. Workbook: {params.mcPerContainerExcel} xe/cont (To South&Sum!Z1).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="N→S năm @ base" value={fmt(result.annual.nsContainersBase)} sub={`${fmt(baseMc, 1)} xe/cont`} tone="accent" />
        <Kpi label="N→S năm @ Excel" value={fmt(result.annual.nsContainersExcel)} sub={`${params.mcPerContainerExcel} xe/cont`} />
        <Kpi label="Return S→N" value={fmt(result.annual.returnContainers)} sub={`${params.casesPerContainerReturn} kiện/cont`} />
        <Kpi label="Case pool đỉnh" value={fmt(result.annual.peakCasePool)} sub={`Chu kỳ ${params.leadTimeDays + params.freeTimeDays}n`} tone="warn" />
      </div>

      <Card>
        <CardHeader><CardTitle>Nhu cầu container theo tháng</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <Tooltip {...chartTheme.tooltip} />
              <Legend />
              <Bar dataKey={`N→S @ ${fmt(baseMc, 1)}`} fill="#0ea5e9" />
              <Bar dataKey={`N→S @ ${params.mcPerContainerExcel}`} fill="#14b8a6" />
              <Bar dataKey="Return S→N" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Số kiện cần cho luồng transfer</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <Tooltip {...chartTheme.tooltip} />
              <Bar dataKey="Kiện" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ghi chú đối chiếu</CardTitle></CardHeader>
        <CardContent className="text-sm leading-relaxed text-slate-400">
          Word nêu ~16.900 kiện cho N→S ở kịch bản zero-outsource — đây là output
          kịch bản, không phải hằng số Excel (tìm 16.900: 0 hits). Tính lại =
          residual_sau_stack_NK / xe_mỗi_kiện với transferRatio=1. Luồng return
          thực tế nằm ở To South&Sum mục (2) theo lane Long An / Đồng Nai / Cái Cui.
        </CardContent>
      </Card>
    </div>
  );
}
