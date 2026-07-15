"use client";

import { useMemo } from "react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import { defaultParams, simulate } from "@/lib/engine/digitalTwin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmt } from "@/lib/utils";
import { chartTheme } from "@/components/charts/theme";

export default function ScenariosPage() {
  const { params } = useTwinStore();

  const rows = useMemo(() => {
    const base = defaultParams();
    const scenarios = [
      { name: "Hiện trạng (không stack, không chuyển)", p: { ...base, importStackRatio: 0, transferRatio: 0, cost: { ...base.cost } } },
      { name: "Chỉ stack nhập khẩu", p: { ...base, importStackRatio: 1, transferRatio: 0, cost: { ...base.cost } } },
      { name: "Stack NK + 35% transfer (base)", p: { ...base, importStackRatio: 1, transferRatio: 0.35, cost: { ...base.cost } } },
      { name: "Stack NK + 70% transfer", p: { ...base, importStackRatio: 1, transferRatio: 0.7, cost: { ...base.cost } } },
      { name: "Zero outsource (transfer 100%)", p: { ...base, importStackRatio: 1, transferRatio: 1, cost: { ...base.cost } } },
      { name: "Cài đặt Twin hiện tại", p: params },
      { name: "Thận trọng 40 xe/cont", p: { ...params, casesPerContainerNS: 12, mcPerCase: 40 / 12, cost: { ...params.cost } } },
      { name: "Hiệu suất Excel 46,6", p: { ...params, mcPerContainerExcel: 46.6, cost: { ...params.cost } } },
    ];
    return scenarios.map((s) => {
      const r = simulate(s.p);
      return {
        name: s.name,
        "Tiết kiệm tỷ": +(r.annual.totalSavings / 1e9).toFixed(2),
        outsource: Math.round(r.annual.outsourceVol),
        transfer: Math.round(r.annual.transferVol),
        cont: Math.round(r.annual.nsContainersBase),
        peakOut: Math.round(r.scenarios.optimized),
        costBn: +(r.annual.totalCost / 1e9).toFixed(2),
      };
    });
  }, [params]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">So sánh kịch bản</h1>
        <p className="mt-1 text-sm text-slate-400">
          Word §15: conservative / base / efficiency + các cực chính sách (zero outsource là benchmark kỹ thuật).
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Tiết kiệm năm theo kịch bản (tỷ VND)</CardTitle></CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis type="number" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={200} tick={{ fill: chartTheme.tick, fontSize: 10 }} />
              <Tooltip {...chartTheme.tooltip} />
              <Bar dataKey="Tiết kiệm tỷ" fill="#14b8a6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Bảng chi tiết</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="table-dark w-full text-left text-sm text-slate-300">
            <thead className="border-b border-white/10">
              <tr>
                <th className="py-2 pr-3">Kịch bản</th>
                <th className="pr-3">Tiết kiệm tỷ</th>
                <th className="pr-3">Chi phí tỷ</th>
                <th className="pr-3">Thuê ngoài</th>
                <th className="pr-3">Transfer</th>
                <th className="pr-3">Cont N→S</th>
                <th>Peak z_t</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => (
                <tr key={r.name}>
                  <td className="py-2 pr-3 font-medium text-slate-100">{r.name}</td>
                  <td className="tabular-nums pr-3 text-emerald-300">{fmt(r["Tiết kiệm tỷ"], 2)}</td>
                  <td className="tabular-nums pr-3">{fmt(r.costBn, 2)}</td>
                  <td className="tabular-nums pr-3">{fmt(r.outsource)}</td>
                  <td className="tabular-nums pr-3">{fmt(r.transfer)}</td>
                  <td className="tabular-nums pr-3">{fmt(r.cont)}</td>
                  <td className="tabular-nums">{fmt(r.peakOut)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
