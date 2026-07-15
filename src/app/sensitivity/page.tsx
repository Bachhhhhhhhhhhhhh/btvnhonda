"use client";

import { useMemo } from "react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, Legend,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import { sensitivity } from "@/lib/engine/digitalTwin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmt } from "@/lib/utils";
import { chartTheme } from "@/components/charts/theme";

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
    "Thấp −20%": +(d.low / 1e9).toFixed(2),
    "Cao +20%": +(d.high / 1e9).toFixed(2),
    impact: +(d.impact / 1e9).toFixed(2),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Phân tích độ nhạy</h1>
        <p className="mt-1 text-sm text-slate-400">
          Thay ±20% từng driver. Tornado xếp theo tác động lên tiết kiệm năm.
          Base: {fmt(result.annual.totalSavings / 1e9, 2)} tỷ VND.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Tornado — tác động lên tiết kiệm (tỷ VND)</CardTitle></CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis type="number" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <Tooltip {...chartTheme.tooltip} />
              <Legend />
              <ReferenceLine x={sens.baseSave / 1e9} stroke="#94a3b8" strokeDasharray="4 4" />
              <Bar dataKey="Thấp −20%" fill="#fb7185" />
              <Bar dataKey="Cao +20%" fill="#34d399" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Xếp hạng driver</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="table-dark w-full text-left text-sm text-slate-300">
            <thead className="border-b border-white/10">
              <tr>
                <th className="py-2">Driver</th>
                <th>Tiết kiệm thấp</th>
                <th>Tiết kiệm cao</th>
                <th>Tác động (tỷ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((d) => (
                <tr key={d.name}>
                  <td className="py-2 font-medium text-slate-100">{d.name}</td>
                  <td className="tabular-nums">{d["Thấp −20%"]}</td>
                  <td className="tabular-nums">{d["Cao +20%"]}</td>
                  <td className="tabular-nums font-semibold text-sky-300">{d.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
