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
  Cell,
} from "recharts";
import {
  ASSUMPTIONS,
  MAX_STOCK_ON_HAND,
  MONTHS,
  OVER_FACT_CAP,
  OVER_TTL_CAP,
} from "@/lib/data/projectData";
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
import { useTwinStore } from "@/lib/store";
import { Warehouse, AlertTriangle, Layers, Gauge } from "lucide-react";
import Link from "next/link";

export default function WarehousePage() {
  const { params, result } = useTwinStore();
  const peakStock = Math.max(...MONTHS.map((m) => MAX_STOCK_ON_HAND[m]));
  const peakOverFact = Math.max(...MONTHS.map((m) => OVER_FACT_CAP[m]));
  const peakOverTtl = Math.max(...MONTHS.map((m) => OVER_TTL_CAP[m]));
  const monthsOverFact = MONTHS.filter((m) => OVER_FACT_CAP[m] > 0).length;
  const monthsOverTtl = MONTHS.filter((m) => OVER_TTL_CAP[m] > 0).length;
  const utilFact = peakStock / ASSUMPTIONS.factCapNorth;
  const utilTtl = peakStock / ASSUMPTIONS.ttlCapNorth;

  const data = MONTHS.map((m) => ({
    month: m,
    "Tồn max": MAX_STOCK_ON_HAND[m],
    "Fact Cap": ASSUMPTIONS.factCapNorth,
    "TTL Cap": ASSUMPTIONS.ttlCapNorth,
    "Vượt Fact": OVER_FACT_CAP[m],
    "Vượt TTL": OVER_TTL_CAP[m],
    "Util Fact %": Math.round((MAX_STOCK_ON_HAND[m] / ASSUMPTIONS.factCapNorth) * 100),
    "Util TTL %": Math.round((MAX_STOCK_ON_HAND[m] / ASSUMPTIONS.ttlCapNorth) * 100),
  }));

  const capParts = [
    { name: "VPC Fact", value: 17680, fill: "#0a4d6e" },
    { name: "HNM", value: 2500, fill: "#0d6b63" },
    { name: "Open HNM VTP", value: 8315, fill: "#b8954a" },
  ];

  const tableRows = MONTHS.map((m) => {
    const stock = MAX_STOCK_ON_HAND[m];
    const twin = result.months.find((x) => x.month === m);
    return {
      m,
      stock,
      overF: OVER_FACT_CAP[m],
      overT: OVER_TTL_CAP[m],
      relief: twin?.importRelief ?? 0,
      residual: twin?.residualAfterImport ?? 0,
      status:
        OVER_FACT_CAP[m] >= 30000
          ? "Đỏ"
          : OVER_FACT_CAP[m] > 0
            ? "Vàng"
            : "Xanh",
    };
  });

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="Vận hành · Capacity"
        title="Năng lực kho miền Bắc"
        subtitle="Hai chuẩn capacity song song (Fact Cap Word vs TTL Cap Excel). Không gộp nhầm khi sizing thuê ngoài hay stacking."
        actions={
          <Link href="/digital-twin" className="btn-bank px-3 py-2 text-xs">
            Mở Twin
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Fact Cap (VPC)" value={fmt(ASSUMPTIONS.factCapNorth)} sub="Rental WH!F55:Q55 · Word baseline" tone="accent" icon={Warehouse} />
        <Kpi label="TTL Cap Bắc" value={fmt(ASSUMPTIONS.ttlCapNorth)} sub="VPC + HNM + Open area" icon={Layers} />
        <Kpi label="Peak tồn on-hand" value={fmt(peakStock)} sub="Rental WH row 54 · Jan" tone="warn" icon={Gauge} />
        <Kpi label="Peak vượt Fact" value={fmt(peakOverFact)} sub="Word Bảng 9 · Aug" tone="bad" icon={AlertTriangle} />
      </div>

      <MetricRow
        items={[
          { label: "Util peak @ Fact", value: fmtPct(utilFact), hint: "Tồn max / 17.680" },
          { label: "Util peak @ TTL", value: fmtPct(utilTtl), hint: "Tồn max / 28.495" },
          { label: "Tháng vượt Fact", value: `${monthsOverFact}/12`, hint: "OVER_FACT_CAP > 0" },
          { label: "Tháng vượt TTL", value: `${monthsOverTtl}/12`, hint: "Chỉ peak Dec–Mar" },
        ]}
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <InsightBox title="Chuẩn Word (Fact Cap)" tone="warn">
          Over sizing theo <strong>{fmt(ASSUMPTIONS.factCapNorth)}</strong> xe VPC — phản ánh “nỗi đau” vận hành khi không tính open area. Peak vượt ~{fmt(peakOverFact)} xe (Aug). Twin mặc định dùng chuẩn này.
        </InsightBox>
        <InsightBox title="Chuẩn Excel (TTL Cap)" tone="info">
          Over sizing theo <strong>{fmt(ASSUMPTIONS.ttlCapNorth)}</strong> xe (đã gồm HNM + open). Residual nhỏ hơn, tập trung Dec–Mar (peak TTL over {fmt(peakOverTtl)}). Bật toggle “TTL” trong Digital Twin để so sánh.
        </InsightBox>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" accent>
          <CardHeader>
            <div className="section-kicker">Stock profile</div>
            <CardTitle>Tồn max vs Fact Cap vs TTL Cap</CardTitle>
            <CardDescription>Max stock on hand (row 54) so với hai đường capacity</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Bar dataKey="Tồn max" fill="#64748b" radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="Fact Cap" stroke="#a31d1d" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="TTL Cap" stroke="#0d6b63" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cấu phần TTL Cap</CardTitle>
            <CardDescription>Rental WH · tổng {fmt(ASSUMPTIONS.ttlCapNorth)}</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={capParts} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={false} />
                <XAxis type="number" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                <Tooltip {...chartTheme.tooltip} />
                <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                  {capParts.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vượt capacity: Fact vs TTL</CardTitle>
            <CardDescription>Hai series độc lập — không cộng dồn</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Bar dataKey="Vượt Fact" fill="#f87171" name="Vượt @ Fact (Word)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Vượt TTL" fill="#38bdf8" name="Vượt @ TTL (Excel)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Utilization % theo tháng</CardTitle>
            <CardDescription>Tồn max / capacity</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} unit="%" />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Area type="monotone" dataKey="Util Fact %" stroke="#a31d1d" fill="#fecaca" strokeWidth={2} />
                <Area type="monotone" dataKey="Util TTL %" stroke="#0d6b63" fill="#99f6e4" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card accent>
        <CardHeader>
          <CardTitle>Bảng tháng — stock, over, relief Twin</CardTitle>
          <CardDescription>
            Twin: stack NK {fmtPct(params.importStackRatio, 0)} · residual sau stack · trạng thái theo over Fact
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="table-dark w-full text-left text-sm">
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Tồn max</th>
                <th>Vượt Fact</th>
                <th>Vượt TTL</th>
                <th>Relief NK</th>
                <th>Residual Twin</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f6]">
              {tableRows.map((r) => (
                <tr key={r.m}>
                  <td className="font-bold text-[#071428]">{r.m}</td>
                  <td className="tabular-nums">{fmt(r.stock)}</td>
                  <td className="tabular-nums">{fmt(r.overF)}</td>
                  <td className="tabular-nums">{fmt(r.overT)}</td>
                  <td className="tabular-nums text-teal-800">{fmt(r.relief)}</td>
                  <td className="tabular-nums font-semibold">{fmt(r.residual)}</td>
                  <td>
                    <span
                      className={`rounded-[2px] px-2 py-0.5 text-[10px] font-bold ${
                        r.status === "Đỏ"
                          ? "bg-rose-100 text-rose-800"
                          : r.status === "Vàng"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-teal-100 text-teal-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            t: "VPC Fact Cap",
            d: "17.680 xe — baseline quản trị capacity “cứng” khi không tính open staging.",
          },
          {
            t: "HNM + Open",
            d: "2.500 + 8.315 = buffer vật lý trong TTL. Dùng cho planning Excel, không xóa áp lực Fact.",
          },
          {
            t: "m² driver",
            d: `Word unpack ${ASSUMPTIONS.unpackM2} / stack ${ASSUMPTIONS.stackM2}. Excel dài hạn Bắc ${ASSUMPTIONS.excelNorthM2} m²/xe — tách khi cost vs capacity.`,
          },
        ].map((x) => (
          <div key={x.t} className="rounded-[4px] border border-[#dce3ec] bg-white p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#b8954a]">{x.t}</div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{x.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
