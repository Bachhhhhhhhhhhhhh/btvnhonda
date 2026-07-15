"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Scatter,
  ScatterChart,
  ZAxis,
  Cell,
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
import { ShieldAlert, AlertTriangle } from "lucide-react";
import Link from "next/link";

const RISKS = [
  {
    risk: "Claim unpack trễ",
    impact: "Phát hiện lỗi muộn; khó claim NSX",
    likelihood: 3,
    severity: 5,
    likelihoodLabel: "Trung bình",
    severityLabel: "Cao",
    control: "Cửa sổ inspection, sampling, RACI Logistics/QA/Genpo/Import",
    owner: "QA + Import",
  },
  {
    risk: "Nghẽn container",
    impact: "Kế hoạch zero-outsource thất bại ở peak",
    likelihood: 4,
    severity: 5,
    likelihoodLabel: "Cao",
    severityLabel: "Cao",
    control: "Book rolling forecast + buffer cont + cut-off tuần",
    owner: "Transport",
  },
  {
    risk: "Thiếu case pool",
    impact: "Kiện rỗng trễ → đứt packing/transfer",
    likelihood: 3,
    severity: 5,
    likelihoodLabel: "Trung bình",
    severityLabel: "Cao",
    control: "Sizing pool chu kỳ 10 ngày; theo dõi LT thực tế",
    owner: "Warehouse",
  },
  {
    risk: "Nghẽn kho Nam",
    impact: "Chỉ chuyển chi phí Bắc → Nam",
    likelihood: 3,
    severity: 3,
    likelihoodLabel: "Trung bình",
    severityLabel: "Trung bình",
    control: "Xác nhận capacity/staging Nam trước tăng y_t",
    owner: "Network WH",
  },
  {
    risk: "Saving giả",
    impact: "Thuê Bắc ↓ nhưng total network cost ↑",
    likelihood: 4,
    severity: 5,
    likelihoodLabel: "Cao",
    severityLabel: "Cao",
    control: "Quyết định theo break-even + total landed cost",
    owner: "Finance + Twin",
  },
  {
    risk: "Hỏng hóc handling",
    impact: "Repack & multi-touch tăng damage",
    likelihood: 3,
    severity: 3,
    likelihoodLabel: "Trung bình",
    severityLabel: "Trung bình",
    control: "KPI damage theo route & packing method",
    owner: "Ops",
  },
  {
    risk: "Rate card trôi",
    impact: "ROI/payback sai khi tender đổi",
    likelihood: 4,
    severity: 4,
    likelihoodLabel: "Cao",
    severityLabel: "Cao",
    control: "Lock rate card + re-run Twin mỗi quý",
    owner: "Finance",
  },
  {
    risk: "Forecast volume",
    impact: "Over/under size cont & outsource",
    likelihood: 4,
    severity: 4,
    likelihoodLabel: "Cao",
    severityLabel: "Cao",
    control: "S&OP weekly peak + niguri update",
    owner: "S&OP",
  },
];

export default function RiskPage() {
  const { result, params } = useTwinStore();
  const redMonths = result.months.filter((m) => m.classification === "red");
  const unitAvoided =
    params.cost.northOutsourcePerMcMonth + params.cost.bonusPerOverMc;
  const unitTransfer =
    params.cost.packingPerMc +
    params.cost.nsFreightPerMc +
    params.cost.southWhPerMcMonth +
    params.cost.returnPerCase / params.mcPerCase;
  const transferRisk = unitTransfer >= unitAvoided;

  const scored = useMemo(
    () =>
      RISKS.map((r) => ({
        ...r,
        score: r.likelihood * r.severity,
      })).sort((a, b) => b.score - a.score),
    []
  );

  const heat = scored.map((r) => ({
    name: r.risk,
    score: r.score,
    L: r.likelihood,
    S: r.severity,
  }));

  const scatter = scored.map((r) => ({
    x: r.likelihood,
    y: r.severity,
    z: r.score * 20,
    name: r.risk,
  }));

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="Phân tích · Risk register"
        title="Quản trị rủi ro"
        subtitle="Ma trận likelihood × severity (Word Bảng 7 + mở rộng). Control bắt buộc trước phê duyệt playbook stacking / transfer."
        actions={
          <Link href="/recommendations" className="btn-bank-outline px-3 py-2 text-xs">
            → Khuyến nghị
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Rủi ro đăng ký" value={String(RISKS.length)} sub="trong register" icon={ShieldAlert} />
        <Kpi label="Top score" value={String(scored[0]?.score)} sub={scored[0]?.risk} tone="bad" icon={AlertTriangle} />
        <Kpi label="Tháng đỏ Twin" value={String(redMonths.length)} sub={redMonths.map((m) => m.month).join(", ") || "—"} tone="warn" />
        <Kpi
          label="Rủi ro saving giả"
          value={transferRisk ? "Cao" : "Thấp"}
          sub={transferRisk ? "TF ≥ avoid unit" : "TF có biên"}
          tone={transferRisk ? "bad" : "good"}
        />
      </div>

      <MetricRow
        items={[
          { label: "Case pool peak", value: fmt(result.annual.peakCasePool), hint: "kiện" },
          { label: "Cont N→S", value: fmt(result.annual.nsContainersBase), hint: "năm" },
          { label: "Unit avoid", value: fmt(unitAvoided), hint: "VND/xe" },
          { label: "Unit TF", value: fmt(Math.round(unitTransfer)), hint: "VND/xe" },
        ]}
      />

      <InsightBox title="Tín hiệu Twin sống" tone={transferRisk || redMonths.length > 3 ? "warn" : "good"}>
        {redMonths.length > 0 ? (
          <>
            Tháng residual đỏ: <strong>{redMonths.map((m) => m.month).join(", ")}</strong> — pre-book cont & case pool T-4.
          </>
        ) : (
          <>Không có tháng đỏ với chính sách Twin hiện tại — vẫn monitor peak Dec–Mar nếu bật TTL.</>
        )}{" "}
        Stack ratio {fmtPct(params.importStackRatio, 0)} · Transfer {fmtPct(params.transferRatio, 0)}.
      </InsightBox>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card accent>
          <CardHeader>
            <div className="section-kicker">Heat ranking</div>
            <CardTitle>Điểm rủi ro (L × S)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={heat} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={false} />
                <XAxis type="number" domain={[0, 25]} tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: chartTheme.tick, fontSize: 10 }} />
                <Tooltip {...chartTheme.tooltip} />
                <Bar dataKey="score" name="Score" radius={[0, 3, 3, 0]}>
                  {heat.map((e, i) => (
                    <Cell key={i} fill={e.score >= 16 ? "#a31d1d" : e.score >= 12 ? "#b45309" : "#0d6b63"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ma trận Likelihood × Severity</CardTitle>
            <CardDescription>Bubble size = score</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid stroke={chartTheme.grid} />
                <XAxis type="number" dataKey="x" name="L" domain={[1, 5]} tick={{ fill: chartTheme.tick, fontSize: 11 }} label={{ value: "Likelihood", position: "bottom", fontSize: 11 }} />
                <YAxis type="number" dataKey="y" name="S" domain={[1, 5]} tick={{ fill: chartTheme.tick, fontSize: 11 }} label={{ value: "Severity", angle: -90, position: "insideLeft", fontSize: 11 }} />
                <ZAxis type="number" dataKey="z" range={[80, 400]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} {...chartTheme.tooltip} />
                <Scatter data={scatter} fill="#0a4d6e" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {scored.map((r) => (
          <Card key={r.risk} hover>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-[14px]">{r.risk}</CardTitle>
                <span
                  className={`shrink-0 rounded-[2px] px-2 py-0.5 text-[10px] font-bold ${
                    r.score >= 16
                      ? "bg-rose-100 text-rose-800"
                      : r.score >= 12
                        ? "bg-amber-100 text-amber-900"
                        : "bg-teal-100 text-teal-800"
                  }`}
                >
                  Score {r.score}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-500">Tác động: </span>
                {r.impact}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-[2px] bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                  L: {r.likelihoodLabel} ({r.likelihood})
                </span>
                <span className="rounded-[2px] bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800">
                  S: {r.severityLabel} ({r.severity})
                </span>
                <span className="rounded-[2px] bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  Owner: {r.owner}
                </span>
              </div>
              <p className="rounded-[3px] border border-[#eef2f6] bg-[#f7f9fc] p-2.5 text-xs text-slate-600">
                <span className="font-bold text-[#0a4d6e]">Kiểm soát: </span>
                {r.control}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
