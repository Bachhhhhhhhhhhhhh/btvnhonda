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
import { chartTheme } from "@/components/charts/theme";
import { Ship, Package, Scale, ArrowRightLeft } from "lucide-react";
import Link from "next/link";

export default function DomesticPage() {
  const { result, params } = useTwinStore();
  const unitAvoided =
    params.cost.northOutsourcePerMcMonth + params.cost.bonusPerOverMc;
  const unitTransfer =
    params.cost.packingPerMc +
    params.cost.nsFreightPerMc +
    params.cost.southWhPerMcMonth +
    params.cost.returnPerCase / params.mcPerCase +
    (params.cost.packingPerMc + params.cost.nsFreightPerMc) *
      params.cost.riskPremiumRate;
  const justified = unitTransfer < unitAvoided;
  const margin = unitAvoided - unitTransfer;

  const data = result.months.map((m) => {
    const transferCost =
      m.packingCost + m.freightCost + m.returnCost + m.southWhCost + m.riskCost;
    return {
      month: m.month,
      residual: Math.round(m.residualAfterImport),
      "Chuyển y_t": Math.round(m.transferVol),
      "Thuê ngoài z_t": Math.round(m.outsourceVol),
      "Chi phí tránh (triệu)": Math.round(m.avoidedCost / 1e6),
      "Chi phí transfer (triệu)": Math.round(transferCost / 1e6),
      "Net benefit (triệu)": Math.round(m.netBenefit / 1e6),
      class: m.classification,
    };
  });

  const red = result.months.filter((m) => m.classification === "red");
  const amber = result.months.filter((m) => m.classification === "amber");
  const green = result.months.filter((m) => m.classification === "green");

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="Vận hành · Nhánh 2"
        title="Tối ưu xe nội địa"
        subtitle="Residual sau stack NK: chọn transfer N→S (y_t) hay thuê ngoài Bắc (z_t). Quy tắc Word §13 — chuyển khi chi phí tránh được > total transfer cost."
        actions={
          <Link href="/transport" className="btn-bank-outline px-3 py-2 text-xs">
            → Vận tải
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Tỷ lệ transfer" value={fmtPct(params.transferRatio, 0)} sub="Đòn bẩy Twin" tone="accent" icon={ArrowRightLeft} />
        <Kpi label="Transfer năm" value={fmt(result.annual.transferVol)} sub="Xe N→S" icon={Ship} />
        <Kpi label="Đơn giá tránh được" value={fmt(unitAvoided)} sub="VND/xe · thuê+bonus" tone="good" icon={Scale} />
        <Kpi
          label="Đơn giá transfer all-in"
          value={fmt(Math.round(unitTransfer))}
          sub="pack+cước+Nam+return+risk"
          tone={justified ? "good" : "bad"}
          icon={Package}
        />
      </div>

      <MetricRow
        items={[
          { label: "Thuê ngoài năm", value: fmt(result.annual.outsourceVol), hint: "z_t residual" },
          { label: "Giảm vs baseline", value: fmt(result.annual.outsourceReduction), hint: "xe-eq" },
          { label: "Biên unit", value: `${margin >= 0 ? "+" : ""}${fmt(Math.round(margin))}`, hint: "VND/xe" },
          { label: "Tháng đỏ / vàng / xanh", value: `${red.length} / ${amber.length} / ${green.length}`, hint: "theo residual" },
        ]}
      />

      <InsightBox title="Trạng thái hòa vốn" tone={justified ? "good" : "bad"}>
        {justified ? (
          <>
            Transfer <strong>có lợi kinh tế</strong> với rate card hiện tại: biên{" "}
            <strong>{fmt(Math.round(margin))}</strong> VND/xe. Có thể tăng y_t ở tháng đỏ đến khi
            container / capacity Nam chặn. Break-even transfer unit max ≈{" "}
            {fmt(result.annual.breakEvenTransferUnitCost)} VND/xe.
          </>
        ) : (
          <>
            Transfer <strong>đắt hơn</strong> thuê ngoài Bắc: chênh{" "}
            <strong>{fmt(Math.round(-margin))}</strong> VND/xe. Ưu tiên z_t trừ khi service/rủi ro
            đảo quyết định — khóa rate card Finance trước khi cam kết zero-outsource.
          </>
        )}
      </InsightBox>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card accent>
          <CardHeader>
            <div className="section-kicker">Policy split</div>
            <CardTitle>y_t transfer vs z_t thuê ngoài</CardTitle>
            <CardDescription>Residual chia theo transfer ratio {fmtPct(params.transferRatio, 0)}</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Bar dataKey="Chuyển y_t" stackId="a" fill="#5b21b6" />
                <Bar dataKey="Thuê ngoài z_t" stackId="a" fill="#0a4d6e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chi phí tránh vs transfer (triệu VND)</CardTitle>
            <CardDescription>So sánh kinh tế theo tháng</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Legend />
                <Bar dataKey="Chi phí tránh (triệu)" fill="#0d6b63" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Chi phí transfer (triệu)" fill="#d97706" radius={[2, 2, 0, 0]} />
                <Line type="monotone" dataKey="Net benefit (triệu)" stroke="#071428" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Residual sau stack NK</CardTitle>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
              <Tooltip {...chartTheme.tooltip} />
              <Area type="monotone" dataKey="residual" name="Residual" stroke="#b45309" fill="#fde68a" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bảng quyết định tháng</CardTitle>
          <CardDescription>Phân loại residual: xanh ≤0 · vàng &lt;30k · đỏ ≥30k</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="table-dark w-full text-left text-sm">
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Residual</th>
                <th>y_t</th>
                <th>z_t</th>
                <th>Avoid (tr)</th>
                <th>Transfer (tr)</th>
                <th>Net (tr)</th>
                <th>Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f6]">
              {data.map((r) => (
                <tr key={r.month}>
                  <td className="font-bold text-[#071428]">{r.month}</td>
                  <td className="tabular-nums">{fmt(r.residual)}</td>
                  <td className="tabular-nums">{fmt(r["Chuyển y_t"])}</td>
                  <td className="tabular-nums">{fmt(r["Thuê ngoài z_t"])}</td>
                  <td className="tabular-nums">{fmt(r["Chi phí tránh (triệu)"])}</td>
                  <td className="tabular-nums">{fmt(r["Chi phí transfer (triệu)"])}</td>
                  <td className="tabular-nums font-semibold">{fmt(r["Net benefit (triệu)"])}</td>
                  <td>
                    <span
                      className={`rounded-[2px] px-2 py-0.5 text-[10px] font-bold ${
                        r.class === "red"
                          ? "bg-rose-100 text-rose-800"
                          : r.class === "amber"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-teal-100 text-teal-800"
                      }`}
                    >
                      {r.class}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[4px] border border-[#dce3ec] bg-white p-4">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[#b8954a]">Biến x_t</div>
          <p className="mt-2 text-xs text-slate-600">Stack NK — đã xử lý ở nhánh import. Residual = over − relief.</p>
        </div>
        <div className="rounded-[4px] border border-[#dce3ec] bg-white p-4">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[#b8954a]">Biến y_t</div>
          <p className="mt-2 text-xs text-slate-600">Transfer ratio hiện {fmtPct(params.transferRatio, 0)}. Kéo slider Twin để test 0–100%.</p>
        </div>
        <div className="rounded-[4px] border border-[#dce3ec] bg-white p-4">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[#b8954a]">Biến z_t</div>
          <p className="mt-2 text-xs text-slate-600">Outsource = residual − transfer. Zero z_t là benchmark kỹ thuật, không phải KPI tuyệt đối.</p>
        </div>
      </div>
    </div>
  );
}
