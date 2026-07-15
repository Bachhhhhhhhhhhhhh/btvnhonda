"use client";

import Link from "next/link";
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
import {
  Lightbulb,
  CheckCircle2,
  Clock,
  ArrowRight,
  Target,
} from "lucide-react";

export default function RecommendationsPage() {
  const { result, params } = useTwinStore();
  const a = result.annual;
  const unitAvoided =
    params.cost.northOutsourcePerMcMonth + params.cost.bonusPerOverMc;
  const unitTransfer =
    params.cost.packingPerMc +
    params.cost.nsFreightPerMc +
    params.cost.southWhPerMcMonth +
    params.cost.returnPerCase / params.mcPerCase;

  const redMonths = result.months
    .filter((m) => m.classification === "red")
    .map((m) => m.month);
  const amberMonths = result.months
    .filter((m) => m.classification === "amber")
    .map((m) => m.month);

  const recs = [
    {
      title: "Triển khai stacking nhập khẩu như baseline",
      horizon: "0–4 tuần",
      priority: "P0",
      body: `Stack NK mang lại ${fmt(a.importRelief)} xe-eq capacity / năm @ ${fmtPct(params.importStackRatio, 0)}. PPT ~3 tỷ; Excel −2,62 tỷ. Pilot SOP, claim window, layout CBU trước — playbook Word 0–4 tuần.`,
      link: "/import",
      linkLabel: "Module NK",
    },
    {
      title: "Zero thuê ngoài = benchmark kỹ thuật, không KPI tuyệt đối",
      horizon: "Policy",
      priority: "P0",
      body: `Đơn giá transfer ~${fmt(Math.round(unitTransfer))} vs avoid ${fmt(unitAvoided)} VND/xe. Chỉ tăng y_t khi biên dương + cont/case pool sẵn. Savings Twin: ${fmt(a.totalSavings / 1e9, 2)} tỷ.`,
      link: "/domestic",
      linkLabel: "Nội địa",
    },
    {
      title: "Pre-book tháng đỏ từ T-4",
      horizon: "S&OP",
      priority: "P1",
      body: `Tháng residual đỏ: ${redMonths.join(", ") || "không có"}. Vàng: ${amberMonths.join(", ") || "—"}. Kích hoạt Procurement/Transport trước peak — không chờ stock vượt.`,
      link: "/warehouse",
      linkLabel: "Capacity",
    },
    {
      title: "Sizing case pool reverse logistics",
      horizon: "Ops",
      priority: "P1",
      body: `Case pool đỉnh ≈ ${fmt(a.peakCasePool)} kiện với LT ${params.leadTimeDays}+${params.freeTimeDays}n. Cont N→S ${fmt(a.nsContainersBase)} (base) / ${fmt(a.nsContainersExcel)} (Excel 46.6). Thiếu kiện rỗng = đứt plan.`,
      link: "/container",
      linkLabel: "Container",
    },
    {
      title: "Khóa rate card Finance trước cam kết ngân sách",
      horizon: "Finance",
      priority: "P0",
      body: `ROI ${fmtPct(a.roi)}, payback ${Number.isFinite(a.paybackMonths) ? fmt(a.paybackMonths, 1) + " tháng" : "∞"}, NPV 3y ${fmt(a.npv / 1e9, 2)} tỷ. Nhạy với thuê Bắc, cước N→S, m² stack — chạy Sensitivity + Monte Carlo.`,
      link: "/financial",
      linkLabel: "Tài chính",
    },
    {
      title: "Digital Twin hàng tuần mùa cao điểm",
      horizon: "Governance",
      priority: "P1",
      body: `Control tower S&OP: cập nhật forecast tồn, chạy lại transfer ratio, phát hành nhu cầu cont/case cho Transport & WH. Map GIS + lane live hỗ trợ briefing.`,
      link: "/digital-twin",
      linkLabel: "Twin",
    },
    {
      title: "Bảo vệ claim NSX khi delay unpack",
      horizon: "QA",
      priority: "P1",
      body: "RACI rõ Genpo/QA/Import. Sampling VIN/ENG khi còn kiện. Không đánh đổi stacking lấy claim window mù.",
      link: "/risk",
      linkLabel: "Rủi ro",
    },
    {
      title: "Xác nhận capacity Nam trước scale transfer",
      horizon: "Network",
      priority: "P2",
      body: "Tránh dời chi phí Bắc→Nam. Staging Long An / Đồng Nai / Cái Cui phải absorb y_t peak. Xem map owned vs rented.",
      link: "/map",
      linkLabel: "Bản đồ",
    },
  ];

  const roadmap = [
    { phase: "Tuần 0–4", items: ["SOP stack NK", "Layout CBU", "RACI claim", "Pilot 1 lane"] },
    { phase: "Tháng 2–3", items: ["Scale stack ratio", "Lock rate card", "Case pool base", "S&OP weekly"] },
    { phase: "Peak season", items: ["Pre-book cont T-4", "Twin dashboard", "Red-month war room", "Damage KPI"] },
    { phase: "Sau peak", items: ["Post-mortem", "Re-run NPV", "Tender input", "Expand NBF/LOG2 decision"] },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="Báo cáo · Playbook"
        title="Khuyến nghị điều hành"
        subtitle="Playbook Senior Business Manager — số liệu tính lại theo tham số Twin sống."
        actions={
          <Link href="/report" className="btn-bank-gold px-3 py-2 text-xs">
            Mở báo cáo đầy đủ
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Tiết kiệm Twin" value={`${fmt(a.totalSavings / 1e9, 2)} tỷ`} tone="good" icon={Target} />
        <Kpi label="Giảm thuê ngoài" value={fmt(a.outsourceReduction)} sub="xe-eq" tone="accent" icon={CheckCircle2} />
        <Kpi label="Tháng đỏ" value={String(redMonths.length)} sub={redMonths.join(", ") || "—"} tone="warn" icon={Clock} />
        <Kpi label="ROI stacking" value={fmtPct(a.roi)} sub={`NPV ${fmt(a.npv / 1e9, 1)} tỷ`} icon={Lightbulb} />
      </div>

      <MetricRow
        items={[
          { label: "Stack ratio", value: fmtPct(params.importStackRatio, 0) },
          { label: "Transfer ratio", value: fmtPct(params.transferRatio, 0) },
          { label: "m² save", value: fmt(a.m2Saved) },
          { label: "Cont N→S", value: fmt(a.nsContainersBase) },
        ]}
      />

      <InsightBox title="Nguyên tắc vàng" tone="info">
        Tối ưu <strong>tổng chi phí mạng lưới</strong>, không tối ưu “thuê ngoài = 0” bằng mọi giá.
        Stacking là điều kiện cần; transfer chọn lọc + reverse logistics sizing là đủ.
      </InsightBox>

      <div className="space-y-3">
        {recs.map((r, i) => (
          <Card key={r.title} hover accent={r.priority === "P0"}>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] bg-[#071428] text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-[14px]">{r.title}</CardTitle>
                    <span
                      className={`rounded-[2px] px-1.5 py-0.5 text-[9px] font-bold ${
                        r.priority === "P0"
                          ? "bg-rose-100 text-rose-800"
                          : r.priority === "P1"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {r.priority}
                    </span>
                    <span className="rounded-[2px] bg-[#faf6eb] px-1.5 py-0.5 text-[9px] font-bold text-[#7a6230]">
                      {r.horizon}
                    </span>
                  </div>
                  <CardDescription className="mt-1.5 max-w-3xl text-[13px] leading-relaxed text-slate-600">
                    {r.body}
                  </CardDescription>
                </div>
              </div>
              <Link
                href={r.link}
                className="btn-bank-outline inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px]"
              >
                {r.linkLabel}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card accent>
        <CardHeader>
          <div className="section-kicker">Roadmap</div>
          <CardTitle>Lộ trình triển khai</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            {roadmap.map((p) => (
              <div
                key={p.phase}
                className="rounded-[3px] border border-[#dce3ec] bg-[#f7f9fc] p-3"
              >
                <div className="text-[10px] font-bold uppercase tracking-wide text-[#b8954a]">
                  {p.phase}
                </div>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-1.5">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-teal-700" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
