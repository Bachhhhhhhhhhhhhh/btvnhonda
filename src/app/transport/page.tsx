"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Kpi } from "@/components/ui/kpi";
import { useTwinStore } from "@/lib/store";
import { fmt } from "@/lib/utils";
import { chartTheme } from "@/components/charts/theme";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";

export default function TransportPage() {
  const { result, params } = useTwinStore();
  const data = result.months.map((m) => ({
    month: m.month,
    "Cước N→S (tỷ)": +(m.freightCost / 1e9).toFixed(3),
    "Return (tỷ)": +(m.returnCost / 1e9).toFixed(3),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mô phỏng vận tải</h1>
        <p className="mt-1 text-sm text-slate-400">
          Vận tải xe Bắc→Nam và hoàn kiện rỗng Nam→Bắc. Đơn giá xấp xỉ To South&Sum
          sea (~350k VND/xe).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Cước / xe" value={fmt(params.cost.nsFreightPerMc)} sub="VND" />
        <Kpi
          label="Cước năm"
          value={`${fmt(result.months.reduce((s, m) => s + m.freightCost, 0) / 1e9, 2)} tỷ`}
          tone="accent"
        />
        <Kpi label="Return / kiện" value={fmt(params.cost.returnPerCase)} sub="VND" />
        <Kpi label="Lead + Free" value={`${params.leadTimeDays}+${params.freeTimeDays}n`} sub="Chu kỳ case pool" />
      </div>

      <Card>
        <CardHeader><CardTitle>Cước & return theo tháng (tỷ VND)</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <Tooltip {...chartTheme.tooltip} />
              <Legend />
              <Bar dataKey="Cước N→S (tỷ)" fill="#0ea5e9" stackId="a" />
              <Bar dataKey="Return (tỷ)" fill="#f59e0b" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Cấu trúc lane (To South&Sum)</CardTitle></CardHeader>
          <CardContent className="text-sm text-slate-300">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Vĩnh Phúc → Long An / Đồng Nai / Cái Cui (Sea Case)</li>
              <li>Hà Nam → Long An / Đồng Nai / Cái Cui (Sea Case)</li>
              <li>Phương án Truck Case/Jig (fuel ratio 0,4)</li>
              <li>Return: Long An / Đồng Nai / Cái Cui → Vĩnh Phúc / Hà Nam</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Lưu ý lead time</CardTitle></CardHeader>
          <CardContent className="text-sm leading-relaxed text-slate-400">
            Lead 7 ngày + free 3 ngày (Word/đề bài) dùng để sizing case pool
            reverse logistics. Excel Rental WH!C63 “Lead time” là khái niệm khác —
            ngày transit nội vùng tới Trung (N.An / NVR 0–2 ngày). Không thay thế
            lẫn nhau.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
