"use client";

import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import { monteCarlo } from "@/lib/engine/digitalTwin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Kpi } from "@/components/ui/kpi";
import { fmt } from "@/lib/utils";
import { chartTheme } from "@/components/charts/theme";

export default function MonteCarloPage() {
  const { params } = useTwinStore();
  const [n, setN] = useState(500);
  const [seed, setSeed] = useState(0);

  const mc = useMemo(() => {
    void seed;
    return monteCarlo(params, n);
  }, [params, n, seed]);

  const bins = 20;
  const min = mc.samples[0];
  const max = mc.samples[mc.samples.length - 1];
  const width = (max - min) / bins || 1;
  const hist = Array.from({ length: bins }, (_, i) => {
    const lo = min + i * width;
    const hi = lo + width;
    const count = mc.samples.filter((x) => x >= lo && (i === bins - 1 ? x <= hi : x < hi)).length;
    return { bin: `${fmt(lo / 1e9, 1)}`, count };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mô phỏng Monte Carlo</h1>
          <p className="mt-1 text-sm text-slate-600">
            Lấy mẫu ngẫu nhiên m², tỷ lệ stack/transfer, cước & thuê ngoài → phân phối tiết kiệm năm.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Số lần chạy</label>
          <select
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800"
          >
            <option value={200}>200</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
          <button
            onClick={() => setSeed((s) => s + 1)}
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-500"
          >
            Chạy lại
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Trung bình" value={`${fmt(mc.mean / 1e9, 2)} tỷ`} tone="accent" />
        <Kpi label="P10" value={`${fmt(mc.p10 / 1e9, 2)} tỷ`} tone="warn" />
        <Kpi label="P50" value={`${fmt(mc.p50 / 1e9, 2)} tỷ`} />
        <Kpi label="P90" value={`${fmt(mc.p90 / 1e9, 2)} tỷ`} tone="good" />
        <Kpi label="Độ lệch chuẩn" value={`${fmt(mc.std / 1e9, 2)} tỷ`} />
      </div>

      <Card>
        <CardHeader><CardTitle>Phân phối tiết kiệm (tỷ VND)</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hist}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="bin" tick={{ fill: chartTheme.tick, fontSize: 10 }} interval={1} />
              <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} />
              <Tooltip {...chartTheme.tooltip} />
              <Bar dataKey="count" fill="#0ea5e9" name="Tần suất" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
