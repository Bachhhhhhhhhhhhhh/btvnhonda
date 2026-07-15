"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import { monteCarlo } from "@/lib/engine/digitalTwin";
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
import { Dices, RefreshCw } from "lucide-react";

export default function MonteCarloPage() {
  const { params, result } = useTwinStore();
  const [n, setN] = useState(500);
  const [seed, setSeed] = useState(0);

  const mc = useMemo(() => {
    void seed;
    return monteCarlo(params, n);
  }, [params, n, seed]);

  const bins = 24;
  const min = mc.samples[0];
  const max = mc.samples[mc.samples.length - 1];
  const width = (max - min) / bins || 1;
  const hist = Array.from({ length: bins }, (_, i) => {
    const lo = min + i * width;
    const hi = lo + width;
    const count = mc.samples.filter((x) =>
      x >= lo && (i === bins - 1 ? x <= hi : x < hi)
    ).length;
    return {
      bin: fmt(lo / 1e9, 1),
      mid: +((lo + hi) / 2 / 1e9).toFixed(2),
      count,
      pct: count / n,
    };
  });

  const cdf = (() => {
    let acc = 0;
    return hist.map((h) => {
      acc += h.count;
      return { mid: h.mid, cdf: +(acc / n).toFixed(3) };
    });
  })();

  const det = result.annual.totalSavings;
  const pNeg = mc.samples.filter((x) => x < 0).length / n;
  const pAboveDet = mc.samples.filter((x) => x >= det).length / n;
  const iqr = (mc.p90 - mc.p10) / 1e9;

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="Phân tích · Stochastic"
        title="Mô phỏng Monte Carlo"
        subtitle="Lấy mẫu ngẫu nhiên m², tỷ lệ stack/transfer, cước & thuê ngoài → phân phối tiết kiệm năm. Dùng để đọc rủi ro downside, không chỉ mean."
        actions={
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">N</label>
            <select
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="rounded-[3px] border border-[#dce3ec] bg-white px-3 py-1.5 text-sm font-semibold text-[#071428]"
            >
              <option value={200}>200</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
              <option value={2000}>2000</option>
            </select>
            <button
              type="button"
              onClick={() => setSeed((s) => s + 1)}
              className="btn-bank inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Chạy lại
            </button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Trung bình" value={`${fmt(mc.mean / 1e9, 2)} tỷ`} tone="accent" icon={Dices} />
        <Kpi label="P10 (xấu)" value={`${fmt(mc.p10 / 1e9, 2)} tỷ`} tone="warn" />
        <Kpi label="P50" value={`${fmt(mc.p50 / 1e9, 2)} tỷ`} />
        <Kpi label="P90 (tốt)" value={`${fmt(mc.p90 / 1e9, 2)} tỷ`} tone="good" />
        <Kpi label="Std dev" value={`${fmt(mc.std / 1e9, 2)} tỷ`} />
      </div>

      <MetricRow
        items={[
          { label: "Deterministic Twin", value: `${fmt(det / 1e9, 2)} tỷ`, hint: "point estimate" },
          { label: "P(save < 0)", value: fmtPct(pNeg), hint: "downside" },
          { label: "P(≥ Twin det)", value: fmtPct(pAboveDet), hint: "vs point" },
          { label: "IQR P10–P90", value: `${fmt(iqr, 2)} tỷ`, hint: "spread" },
        ]}
      />

      <InsightBox title="Cách dùng với lãnh đạo" tone="info">
        Báo cáo <strong>P10–P50–P90</strong>, không chỉ mean. Nếu P10 âm trong khi mean dương —
        dự án có rủi ro mất tiền ở đuôi trái; cần hedge rate card hoặc giảm transfer.
      </InsightBox>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" accent>
          <CardHeader>
            <div className="section-kicker">Distribution</div>
            <CardTitle>Histogram tiết kiệm (tỷ VND)</CardTitle>
            <CardDescription>{n} samples · bins {bins}</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hist}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="bin" tick={{ fill: chartTheme.tick, fontSize: 9 }} interval={2} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <ReferenceLine x={fmt(mc.mean / 1e9, 1)} stroke="#0a4d6e" strokeDasharray="3 3" />
                <Bar dataKey="count" fill="#0a4d6e" name="Tần suất" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CDF tích lũy</CardTitle>
            <CardDescription>P(savings ≤ x)</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cdf}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="mid" tick={{ fill: chartTheme.tick, fontSize: 10 }} axisLine={false} />
                <YAxis domain={[0, 1]} tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Area type="monotone" dataKey="cdf" stroke="#0d6b63" fill="#99f6e4" strokeWidth={2} name="CDF" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bảng phân vị</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="table-dark w-full text-left text-sm">
            <thead>
              <tr>
                <th>Chỉ số</th>
                <th>Tỷ VND</th>
                <th>VND</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f6]">
              {[
                { l: "Min", v: min, n: "Mẫu xấu nhất" },
                { l: "P10", v: mc.p10, n: "Đuôi trái" },
                { l: "P50", v: mc.p50, n: "Trung vị" },
                { l: "Mean", v: mc.mean, n: "Kỳ vọng" },
                { l: "Deterministic", v: det, n: "Twin point" },
                { l: "P90", v: mc.p90, n: "Đuôi phải" },
                { l: "Max", v: max, n: "Mẫu tốt nhất" },
              ].map((r) => (
                <tr key={r.l}>
                  <td className="font-bold text-[#071428]">{r.l}</td>
                  <td className="tabular-nums font-semibold">{fmt(r.v / 1e9, 2)}</td>
                  <td className="tabular-nums text-slate-500">{fmt(r.v)}</td>
                  <td className="text-xs text-slate-500">{r.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
