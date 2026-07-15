"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ASSUMPTIONS,
  IMPORT_VOLUME,
  MAX_STOCK_ON_HAND,
  MONTHS,
  OVER_FACT_CAP,
  OVER_TTL_CAP,
  SOURCES,
  IMPORT_BY_MODEL,
  totalImport,
} from "@/lib/data/projectData";
import { fmt, fmtPct } from "@/lib/utils";
import { SectionHeader, InsightBox, MetricRow } from "@/components/ui/section-header";
import { Kpi } from "@/components/ui/kpi";
import { Database, FileSpreadsheet, FileText, Presentation } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { chartTheme } from "@/components/charts/theme";

export default function DataPage() {
  const master = MONTHS.map((m) => ({
    month: m,
    import: IMPORT_VOLUME[m],
    stock: MAX_STOCK_ON_HAND[m],
    overF: OVER_FACT_CAP[m],
    overT: OVER_TTL_CAP[m],
  }));

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="Hệ thống · Data room"
        title="Dữ liệu & nguồn"
        subtitle="Bảng validation — mọi số headline trích dẫn file / sheet / logic. Hai chuẩn capacity và footprint được giữ tách."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Import năm" value={fmt(totalImport())} sub="Σ Rental WH F11:Q11" tone="accent" icon={Database} />
        <Kpi label="Fact Cap" value={fmt(ASSUMPTIONS.factCapNorth)} sub="Word / VPC" icon={FileSpreadsheet} />
        <Kpi label="TTL Cap" value={fmt(ASSUMPTIONS.ttlCapNorth)} sub="Excel row 59" icon={FileText} />
        <Kpi label="Nationwide 100%" value={fmt(ASSUMPTIONS.nationwideCap100)} sub="PPT slide network" icon={Presentation} />
      </div>

      <MetricRow
        items={[
          { label: "Sheets Excel", value: "25", hint: "named ranges 2.766" },
          { label: "Xe/cont Excel", value: String(ASSUMPTIONS.mcPerContainerExcel), hint: "To South!Z1" },
          { label: "Mix xe/kiện", value: String(ASSUMPTIONS.mcPerCaseMix), hint: "To South!X1" },
          { label: "Stack save PPT", value: `~${ASSUMPTIONS.pptStackingSaveBn} tỷ`, hint: "CBU WH" },
        ]}
      />

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { icon: FileText, t: "Word", d: SOURCES.word, s: "Công thức capacity, bảng over, rủi ro, playbook" },
          { icon: FileSpreadsheet, t: "Excel", d: SOURCES.excel, s: "103Ki 2QFC · Rental WH · To South&Sum" },
          { icon: Presentation, t: "PPT", d: SOURCES.ppt, s: "LOG Unit Yamagomori · network & stacking idea" },
        ].map((x) => (
          <Card key={x.t} hover>
            <CardHeader>
              <div className="flex items-center gap-2">
                <x.icon className="h-4 w-4 text-[#b8954a]" />
                <CardTitle>{x.t}</CardTitle>
              </div>
              <CardDescription className="text-[12px] leading-relaxed">{x.d}</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">{x.s}</CardContent>
          </Card>
        ))}
      </div>

      <InsightBox title="Mâu thuẫn đã nhận diện — không “hòa” bừa" tone="warn">
        Word và Excel dùng baseline capacity & m² khác nhau. DSS cho phép toggle Twin (Fact vs TTL)
        và hiển thị cả hai series — tránh báo cáo “peak over” sai chuẩn.
      </InsightBox>

      <Card accent>
        <CardHeader>
          <CardTitle>Bảng mâu thuẫn & ưu tiên</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="table-dark w-full text-left text-sm">
            <thead>
              <tr>
                <th>Chủ đề</th>
                <th>Word</th>
                <th>Excel</th>
                <th>Ưu tiên DSS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f6]">
              <tr>
                <td className="font-semibold">m² unpack</td>
                <td>1,7</td>
                <td>1,6 (S110)</td>
                <td>Excel cho cost; Word cho đề bài capacity</td>
              </tr>
              <tr>
                <td className="font-semibold">Cơ sở over</td>
                <td>Fact Cap 17.680</td>
                <td>TTL Cap 28.495</td>
                <td>Ghi nhãn cả hai; toggle Twin</td>
              </tr>
              <tr>
                <td className="font-semibold">Import năm</td>
                <td>~106.407</td>
                <td>106.460 (R11)</td>
                <td>Excel</td>
              </tr>
              <tr>
                <td className="font-semibold">Import Aug</td>
                <td>13.922</td>
                <td>13.891</td>
                <td>Excel</td>
              </tr>
              <tr>
                <td className="font-semibold">Xe/container</td>
                <td>40–48 / plan 42</td>
                <td>46,6</td>
                <td>Hai kịch bản song song</td>
              </tr>
              <tr>
                <td className="font-semibold">Tiết kiệm stacking</td>
                <td>mô hình capacity</td>
                <td>−2,62 tỷ</td>
                <td>Cùng bậc ~3 tỷ PPT; DSS dynamic</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Master data theo tháng</CardTitle>
          <CardDescription>Import · Max stock · Over Fact · Over TTL</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={master}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
              <Tooltip {...chartTheme.tooltip} />
              <Legend />
              <Bar dataKey="import" name="Import" fill="#0a4d6e" radius={[2, 2, 0, 0]} />
              <Bar dataKey="overF" name="Over Fact" fill="#f87171" radius={[2, 2, 0, 0]} />
              <Bar dataKey="overT" name="Over TTL" fill="#38bdf8" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bảng số master</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="table-dark w-full text-left text-sm">
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Import</th>
                <th>% năm</th>
                <th>Tồn max</th>
                <th>Vượt Fact</th>
                <th>Vượt TTL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f6]">
              {MONTHS.map((m) => (
                <tr key={m}>
                  <td className="font-bold text-[#071428]">{m}</td>
                  <td className="tabular-nums">{fmt(IMPORT_VOLUME[m])}</td>
                  <td className="tabular-nums">{fmtPct(IMPORT_VOLUME[m] / totalImport())}</td>
                  <td className="tabular-nums">{fmt(MAX_STOCK_ON_HAND[m])}</td>
                  <td className="tabular-nums">{fmt(OVER_FACT_CAP[m])}</td>
                  <td className="tabular-nums">{fmt(OVER_TTL_CAP[m])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Import by model (ước)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(IMPORT_BY_MODEL).map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between rounded-[3px] border border-[#eef2f6] bg-[#f7f9fc] px-3 py-2 text-sm"
              >
                <span className="text-slate-600">{k}</span>
                <span className="font-bold tabular-nums text-[#071428]">{fmt(v)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Hằng số lõi ASSUMPTIONS</CardTitle>
          </CardHeader>
          <CardContent className="max-h-80 space-y-1.5 overflow-y-auto">
            {Object.entries(ASSUMPTIONS).map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between gap-3 rounded-[3px] border border-[#eef2f6] px-3 py-1.5 text-xs"
              >
                <span className="truncate text-slate-500">{k}</span>
                <span className="shrink-0 font-mono tabular-nums text-slate-800">{String(v)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
