"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import { ASSUMPTIONS, SOURCES } from "@/lib/data/projectData";
import { defaultParams, sensitivity, simulate } from "@/lib/engine/digitalTwin";
import { fmt, fmtPct } from "@/lib/utils";
import { chartTheme } from "@/components/charts/theme";
import {
  Printer,
  Download,
  FileText,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Building2,
  Target,
  Scale,
  Layers,
  Ship,
  Landmark,
  Clock3,
  Users,
  BookOpen,
} from "lucide-react";

const TOC = [
  { id: "onepager", n: "00", t: "One-pager lãnh đạo" },
  { id: "exec", n: "01", t: "Tóm tắt điều hành" },
  { id: "scq", n: "02", t: "Bối cảnh · Vấn đề · Câu hỏi" },
  { id: "capacity", n: "03", t: "Phân tích năng lực kho" },
  { id: "policy", n: "04", t: "Chính sách stacking & transfer" },
  { id: "finance", n: "05", t: "Business case tài chính" },
  { id: "sensitivity", n: "06", t: "Độ nhạy & kịch bản" },
  { id: "risk", n: "07", t: "Rủi ro · RACI · kiểm soát" },
  { id: "recs", n: "08", t: "Khuyến nghị & lộ trình" },
  { id: "gates", n: "09", t: "Cổng phê duyệt & 30-60-90" },
  { id: "appendix", n: "10", t: "Phụ lục số liệu & giả định" },
];

const SENS_LABEL: Record<string, string> = {
  "North outsource rate": "Thuê ngoài Bắc",
  "N→S freight rate": "Cước N→S",
  "Transfer ratio": "Tỷ lệ transfer",
  "Import stack ratio": "Tỷ lệ stack NK",
  "Stacked m²/MC": "m²/xe stack",
  "Bonus rate": "Bonus peak",
};

const PIE_COLORS = ["#0a4d6e", "#0d6b63", "#b8954a", "#5b21b6", "#64748b", "#b45309"];

export default function ReportPage() {
  const { result, params } = useTwinStore();
  const a = result.annual;

  const peak = useMemo(
    () => result.months.reduce((b, m) => (m.baseOver > b.baseOver ? m : b)),
    [result.months]
  );
  const redMonths = result.months
    .filter((m) => m.classification === "red")
    .map((m) => m.month);
  const amberMonths = result.months
    .filter((m) => m.classification === "amber")
    .map((m) => m.month);
  const greenMonths = result.months
    .filter((m) => m.classification === "green")
    .map((m) => m.month);

  const reliefRate =
    params.unpackM2 > 0
      ? (params.unpackM2 - params.stackM2) / params.unpackM2
      : 0;

  const unitAvoided =
    params.cost.northOutsourcePerMcMonth + params.cost.bonusPerOverMc;
  const unitTransfer =
    params.cost.packingPerMc +
    params.cost.nsFreightPerMc +
    params.cost.southWhPerMcMonth +
    params.cost.returnPerCase / Math.max(params.mcPerCase, 0.01) +
    (params.cost.packingPerMc + params.cost.nsFreightPerMc) *
      params.cost.riskPremiumRate;
  const transferJustified = unitTransfer < unitAvoided;
  const unitMargin = unitAvoided - unitTransfer;

  const costParts = useMemo(() => {
    const parts = [
      {
        name: "Thuê Bắc",
        v: result.months.reduce((s, m) => s + m.northRentalCost, 0),
      },
      {
        name: "Bonus",
        v: result.months.reduce((s, m) => s + m.bonusCost, 0),
      },
      {
        name: "Cước N→S",
        v: result.months.reduce((s, m) => s + m.freightCost, 0),
      },
      {
        name: "Packing",
        v: result.months.reduce((s, m) => s + m.packingCost, 0),
      },
      {
        name: "Return",
        v: result.months.reduce((s, m) => s + m.returnCost, 0),
      },
      {
        name: "Nam + risk + stack",
        v: result.months.reduce(
          (s, m) => s + m.southWhCost + m.riskCost + m.importStackCost,
          0
        ),
      },
    ];
    return parts.map((x) => ({
      ...x,
      bn: +(x.v / 1e9).toFixed(3),
      pct: a.totalCost > 0 ? x.v / a.totalCost : 0,
    }));
  }, [result.months, a.totalCost]);

  const monthlyChart = result.months.map((m) => ({
    month: m.month,
    "Vượt gốc": Math.round(m.baseOver),
    "Residual sau stack": Math.round(m.residualAfterImport),
    "Transfer y_t": Math.round(m.transferVol),
    "Thuê ngoài z_t": Math.round(m.outsourceVol),
    "Chi phí (tỷ)": +(m.totalCost / 1e9).toFixed(3),
    "Net benefit (tỷ)": +(m.netBenefit / 1e9).toFixed(3),
    Cont: +(m.nsContainersBase).toFixed(1),
    Pool: Math.round(m.casePool),
  }));

  const scenarioTable = useMemo(() => {
    const base = defaultParams();
    const defs = [
      {
        id: "as-is",
        name: "Hiện trạng",
        p: { ...base, importStackRatio: 0, transferRatio: 0, cost: { ...base.cost } },
      },
      {
        id: "import",
        name: "Chỉ stack NK",
        p: { ...base, importStackRatio: 1, transferRatio: 0, cost: { ...base.cost } },
      },
      {
        id: "base35",
        name: "Stack + TF 35%",
        p: { ...base, importStackRatio: 1, transferRatio: 0.35, cost: { ...base.cost } },
      },
      {
        id: "tf70",
        name: "Stack + TF 70%",
        p: { ...base, importStackRatio: 1, transferRatio: 0.7, cost: { ...base.cost } },
      },
      {
        id: "zero",
        name: "Zero outsource",
        p: { ...base, importStackRatio: 1, transferRatio: 1, cost: { ...base.cost } },
      },
      { id: "live", name: "★ Twin hiện tại", p: params },
    ];
    return defs.map((d) => {
      const r = simulate(d.p);
      return {
        id: d.id,
        name: d.name,
        saveBn: r.annual.totalSavings / 1e9,
        costBn: r.annual.totalCost / 1e9,
        outsource: r.annual.outsourceVol,
        transfer: r.annual.transferVol,
        cont: r.annual.nsContainersBase,
        pool: r.annual.peakCasePool,
        roi: r.annual.roi,
        npv: r.annual.npv / 1e9,
        m2: r.annual.m2Saved,
      };
    });
  }, [params]);

  const bestScenario = scenarioTable.reduce((b, r) =>
    r.saveBn > b.saveBn ? r : b
  );

  const sens = useMemo(() => sensitivity(params, 0.2), [params]);
  const sensData = sens.drivers
    .map((d) => ({
      name: SENS_LABEL[d.key] || d.key,
      low: +(d.low / 1e9).toFixed(2),
      high: +(d.high / 1e9).toFixed(2),
      impact: +(d.impact / 1e9).toFixed(2),
    }))
    .sort((a, b) => b.impact - a.impact);

  const bridge = [
    { name: "Baseline", value: +(a.baselineCost / 1e9).toFixed(2) },
    { name: "Tối ưu", value: +(a.totalCost / 1e9).toFixed(2) },
    { name: "Tiết kiệm", value: +(a.totalSavings / 1e9).toFixed(2) },
    { name: "Capex", value: +(params.cost.stackCapex / 1e9).toFixed(2) },
    { name: "NPV 3y", value: +(a.npv / 1e9).toFixed(2) },
  ];

  const today = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const docId = `LOG-TWIN-RPT-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const findings = [
    {
      k: "01",
      t: "Stacking NK là đòn bẩy baseline ít tranh cãi",
      d: `Relief ${fmt(a.importRelief)} xe-eq · ${fmt(a.m2Saved)} m² · tỷ lệ ${fmtPct(reliefRate)}. Cùng hướng PPT ~${ASSUMPTIONS.pptStackingSaveBn} tỷ và Excel −${ASSUMPTIONS.excelStackingSaveBn} tỷ.`,
      icon: Layers,
    },
    {
      k: "02",
      t: "Chỉ stack không khép được peak",
      d: `Tháng ${peak.month}: over ${fmt(peak.baseOver)} → residual ${fmt(peak.residualAfterImport)}. Cần policy y_t/z_t có kiểm soát.`,
      icon: AlertTriangle,
    },
    {
      k: "03",
      t: transferJustified
        ? "Transfer có biên kinh tế dương"
        : "Transfer đắt hơn thuê Bắc — không scale mù",
      d: `Unit TF ~${fmt(Math.round(unitTransfer))} vs avoid ${fmt(unitAvoided)} VND/xe (biên ${unitMargin >= 0 ? "+" : ""}${fmt(Math.round(unitMargin))}).`,
      icon: Scale,
    },
    {
      k: "04",
      t: "Business case dương dưới rate card Twin",
      d: `Tiết kiệm ${fmt(a.totalSavings / 1e9, 2)} tỷ · ROI ${fmtPct(a.roi)} · NPV 3y ${fmt(a.npv / 1e9, 2)} tỷ · kịch bản tốt nhất bảng so sánh: ${bestScenario.name}.`,
      icon: Landmark,
    },
  ];

  const recs = [
    {
      p: "P0",
      t: "Thể chế hóa stacking nhập khẩu",
      o: "WH + Import + QA",
      when: "0–4 tuần",
      d: "SOP, layout CBU, claim window, sampling VIN/ENG, RACI Genpo.",
      kpi: `Relief ≥ ${fmt(a.importRelief * 0.9)} xe-eq`,
    },
    {
      p: "P0",
      t: "Khóa rate card Finance",
      o: "Finance + Logistics",
      when: "Trước cam kết NS",
      d: "Thuê Bắc, bonus, cước, return, packing, kho Nam — re-run Twin sau lock.",
      kpi: "Rate card signed",
    },
    {
      p: "P1",
      t: "Pre-book tháng đỏ T-4",
      o: "Transport + S&OP",
      when: "Trước peak",
      d: `Đỏ: ${redMonths.join(", ") || "—"}. Cont ${fmt(a.nsContainersBase)} · pool ${fmt(a.peakCasePool)}.`,
      kpi: "Cont booked ≥ plan",
    },
    {
      p: "P1",
      t: "Transfer theo break-even, không KPI z=0",
      o: "Network planning",
      when: "Peak",
      d: "Chỉ tăng y_t khi unit economics + capacity Nam sẵn sàng.",
      kpi: `TF ratio ~${fmtPct(params.transferRatio, 0)}`,
    },
    {
      p: "P1",
      t: "Digital Twin hàng tuần mùa cao điểm",
      o: "S&OP tower",
      when: "Ongoing",
      d: "Cập nhật forecast, phát hành nhu cầu cont/case, review residual.",
      kpi: "Weekly twin pack",
    },
    {
      p: "P2",
      t: "Xác nhận staging miền Nam",
      o: "WH Nam",
      when: "Trước scale y_t",
      d: "Long An / Đồng Nai / Cái Cui — tránh dời chi phí Bắc→Nam.",
      kpi: "South cap confirmed",
    },
  ];

  const raci = [
    { act: "SOP stacking NK", R: "WH Bắc", A: "LOG Head", C: "QA, Import", I: "S&OP" },
    { act: "Lock rate card", R: "Finance", A: "CFO/Controller", C: "LOG, Transport", I: "GM" },
    { act: "Book container peak", R: "Transport", A: "LOG Head", C: "S&OP, WH", I: "Plant" },
    { act: "Case pool sizing", R: "WH Bắc", A: "LOG Head", C: "Transport", I: "S&OP" },
    { act: "Twin weekly review", R: "S&OP", A: "LOG Head", C: "All", I: "Leadership" },
    { act: "Claim window / sampling", R: "QA", A: "QA Head", C: "Import, Genpo", I: "LOG" },
  ];

  const gates = [
    {
      g: "G1",
      t: "Go pilot stacking",
      criteria: "SOP draft + layout CBU + RACI claim ký",
      status: "Cần phê duyệt",
    },
    {
      g: "G2",
      t: "Go scale stack %",
      criteria: "Pilot damage/claim OK · rate card draft",
      status: "Phụ thuộc G1",
    },
    {
      g: "G3",
      t: "Go transfer scale",
      criteria: "BE unit dương · Nam capacity · cont booked",
      status: transferJustified ? "Điều kiện kinh tế OK" : "Chặn — TF đắt",
    },
    {
      g: "G4",
      t: "Budget multi-year",
      criteria: "Rate card lock · NPV re-run · board pack",
      status: "Chờ Finance",
    },
  ];

  const plan3090 = [
    {
      h: "30 ngày",
      items: [
        "Kick-off pilot stack NK + training",
        "Draft rate card gửi Finance",
        "Baseline damage/claim KPI",
        "Map case pool hiện hữu",
      ],
    },
    {
      h: "60 ngày",
      items: [
        "Scale stack ratio theo Twin",
        "Lock rate card v1",
        "Pre-book cont tháng đỏ đầu tiên",
        "Twin dashboard S&OP live",
      ],
    },
    {
      h: "90 ngày",
      items: [
        "Full peak playbook + war room",
        "Post-mortem mid-peak",
        "NPV update cho board",
        "Input tender / NBF-LOG2 decision",
      ],
    },
  ];

  const assumptions = [
    { k: "Fact Cap Bắc", v: fmt(params.factCap), src: "Word / Rental WH" },
    { k: "TTL Cap Bắc", v: fmt(params.ttlCap), src: "Excel row 59" },
    { k: "m² unpack / stack", v: `${params.unpackM2} / ${params.stackM2}`, src: "Word đề bài" },
    { k: "Stack ratio", v: fmtPct(params.importStackRatio, 0), src: "Twin slider" },
    { k: "Transfer ratio", v: fmtPct(params.transferRatio, 0), src: "Twin slider" },
    { k: "Xe/kiện", v: fmt(params.mcPerCase, 1), src: "To South!X1 mix" },
    { k: "Xe/cont Excel", v: fmt(params.mcPerContainerExcel, 1), src: "To South!Z1" },
    { k: "Return kiện/cont", v: String(params.casesPerContainerReturn), src: "Word/Excel" },
    { k: "Lead + free (ngày)", v: `${params.leadTimeDays}+${params.freeTimeDays}`, src: "Word reverse LT" },
    { k: "Thuê Bắc /xe-th", v: fmt(params.cost.northOutsourcePerMcMonth), src: "Rate card placeholder" },
    { k: "Cước N→S /xe", v: fmt(params.cost.nsFreightPerMc), src: "≈ To South sea" },
    { k: "Capex stacking", v: fmt(params.cost.stackCapex), src: "Twin default" },
    { k: "Discount rate", v: fmtPct(params.cost.discountRate), src: "Twin default" },
    { k: "Capacity baseline", v: params.useTtlCapacity ? "TTL" : "Fact Cap", src: "Twin toggle" },
  ];

  return (
    <div className="report-root relative">
      {/* Toolbar */}
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#dce3ec] pb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b8954a]">
            Confidential · Board pack v2
          </div>
          <h1 className="mt-1 text-xl font-bold text-[#071428]">
            Báo cáo tư vấn chuyên sâu
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {docId} · Live Twin · In PDF trình lãnh đạo
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/digital-twin" className="btn-bank-outline px-3 py-2 text-xs">
            Chỉnh Twin
          </Link>
          <Link href="/scenarios" className="btn-bank-outline px-3 py-2 text-xs">
            Kịch bản
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-bank-gold inline-flex items-center gap-1.5 px-4 py-2 text-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            In / Xuất PDF
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sticky TOC — desktop */}
        <nav className="no-print sticky top-20 hidden w-44 shrink-0 self-start xl:block">
          <div className="rounded-[4px] border border-[#dce3ec] bg-white p-3 shadow-sm">
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#b8954a]">
              Mục lục
            </div>
            <ul className="mt-2 max-h-[70vh] space-y-0.5 overflow-y-auto">
              {TOC.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="flex gap-2 rounded-[2px] px-1.5 py-1 text-[11px] text-slate-600 hover:bg-[#f7f9fc] hover:text-[#071428]"
                  >
                    <span className="font-mono text-[10px] font-bold text-[#b8954a]">
                      {item.n}
                    </span>
                    <span className="leading-snug">{item.t}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="min-w-0 flex-1 space-y-4">
          {/* ════ COVER ════ */}
          <section className="report-cover report-page relative overflow-hidden rounded-[4px] border border-[#0a1628] bg-[#071428] text-white">
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#b8954a] via-[#d4b76a] to-transparent" />
            <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#b8954a]/[0.07] blur-3xl" />
            <div className="relative z-10 px-8 py-10 sm:px-12 sm:py-12">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[3px] bg-gradient-to-b from-[#d4b76a] to-[#b8954a] text-[#071428]">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">LOG Twin DSS</div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#d4b76a]">
                      Honda Việt Nam · MC Logistics
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="rounded-[2px] border border-[#b8954a]/40 bg-[#b8954a]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#e8d5a3]">
                    <Shield className="mr-1 inline h-3 w-3" />
                    Confidential · Nội bộ
                  </div>
                  <div className="font-mono text-[10px] text-slate-500">{docId}</div>
                </div>
              </div>

              <div className="mt-10 max-w-3xl">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d4b76a]">
                  Báo cáo hỗ trợ quyết định · Decision support pack
                </div>
                <h2 className="mt-3 text-3xl font-bold leading-[1.15] tracking-tight sm:text-[2.4rem]">
                  Tối ưu stacking & capacity
                  <span className="mt-1 block text-[#d4b76a]">kho miền Bắc mùa cao điểm</span>
                </h2>
                <p className="mt-3 text-[12px] font-medium text-slate-400">
                  Prepared by{" "}
                  <span className="font-semibold text-[#e8d5a3]">Bach Truong</span>
                  {" · "}
                  Intern · phòng BMLG · Honda Việt Nam
                </p>
                <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-slate-300">
                  Định lượng stacking nhập khẩu, transfer Bắc–Nam và thuê ngoài để tối thiểu hóa
                  tổng chi phí mạng lưới — bám Excel 103Ki 2QFC, Word đề bài và PPT LOG Unit
                  Yamagomori. Số liệu tái tính từ Digital Twin sống.
                </p>
              </div>

              {/* Cover KPI strip */}
              <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { l: "Tiết kiệm năm", v: `${fmt(a.totalSavings / 1e9, 2)} tỷ` },
                  { l: "ROI", v: fmtPct(a.roi) },
                  { l: "NPV 3 năm", v: `${fmt(a.npv / 1e9, 2)} tỷ` },
                  { l: "Giảm outsource", v: fmt(a.outsourceReduction) },
                ].map((x) => (
                  <div
                    key={x.l}
                    className="rounded-[3px] border border-white/10 bg-white/[0.04] px-3 py-3"
                  >
                    <div className="text-[9px] font-bold uppercase tracking-wider text-[#d4b76a]">
                      {x.l}
                    </div>
                    <div className="mt-1 text-xl font-bold tabular-nums tracking-tight">
                      {x.v}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 text-[12px] sm:grid-cols-4">
                <Meta label="Ngày" value={today} />
                <Meta
                  label="Mô hình"
                  value={`Stack ${fmtPct(params.importStackRatio, 0)} · TF ${fmtPct(params.transferRatio, 0)}`}
                />
                <Meta
                  label="Capacity"
                  value={params.useTtlCapacity ? "TTL Cap 28.495" : "Fact Cap 17.680"}
                />
                <Meta label="Đối tượng" value="LOG / Finance / S&OP" />
              </div>
            </div>
          </section>

          {/* ════ 00 ONE-PAGER ════ */}
          <section
            id="onepager"
            className="report-page report-section scroll-mt-20 rounded-[4px] border-2 border-[#071428] bg-white p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#071428] pb-3">
              <SectionLabel n="00" title="One-pager lãnh đạo" />
              <span className="rounded-[2px] bg-[#071428] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#d4b76a]">
                Đọc trong 2 phút
              </span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-[3px] border border-[#e8d5a3] bg-[#faf6eb] p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7a6230]">
                    Quyết định đề xuất
                  </div>
                  <p className="mt-2 text-[14px] font-semibold leading-snug text-[#071428]">
                    Phê duyệt triển khai stacking NK làm baseline; transfer N→S chỉ khi unit
                    economics dương; khóa rate card trước cam kết ngân sách; pre-book cont/case pool
                    tháng đỏ T-4.{" "}
                    <span className="text-[#a31d1d]">Không</span> đặt KPI “thuê ngoài = 0” tuyệt đối.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    {
                      icon: Target,
                      t: "Lợi ích",
                      d: `${fmt(a.totalSavings / 1e9, 2)} tỷ VND/năm mô hình · ${fmt(a.m2Saved)} m² · −${fmt(a.outsourceReduction)} xe-eq thuê ngoài`,
                    },
                    {
                      icon: Ship,
                      t: "Yêu cầu mạng lưới",
                      d: `${fmt(a.nsContainersBase)} cont N→S · pool ${fmt(a.peakCasePool)} kiện · TF ${fmt(a.transferVol)} xe`,
                    },
                    {
                      icon: Scale,
                      t: "Unit economics",
                      d: transferJustified
                        ? `TF rẻ hơn thuê Bắc ~${fmt(Math.round(unitMargin))} VND/xe`
                        : `TF đắt hơn ~${fmt(Math.round(-unitMargin))} VND/xe — hạn chế y_t`,
                    },
                    {
                      icon: Clock3,
                      t: "Timeline",
                      d: "Pilot 0–4 tuần → scale 60 ngày → peak playbook 90 ngày",
                    },
                  ].map((x) => (
                    <div
                      key={x.t}
                      className="rounded-[3px] border border-[#eef2f6] bg-[#fafbfc] p-3"
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[#b8954a]">
                        <x.icon className="h-3 w-3" />
                        {x.t}
                      </div>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-slate-700">{x.d}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-3">
                <div className="rounded-[3px] border border-[#dce3ec] p-3">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    So với baseline outsource 100%
                  </div>
                  <div className="mt-2 space-y-2">
                    {[
                      {
                        l: "Baseline",
                        v: `${fmt(a.baselineCost / 1e9, 2)} tỷ`,
                        w: 100,
                      },
                      {
                        l: "Tối ưu Twin",
                        v: `${fmt(a.totalCost / 1e9, 2)} tỷ`,
                        w: Math.min(
                          100,
                          (a.totalCost / Math.max(a.baselineCost, 1)) * 100
                        ),
                      },
                    ].map((r) => (
                      <div key={r.l}>
                        <div className="flex justify-between text-[12px]">
                          <span className="font-semibold text-slate-600">{r.l}</span>
                          <span className="font-bold tabular-nums">{r.v}</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#071428]"
                            style={{ width: `${r.w}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 border-t border-[#eef2f6] pt-2 text-center">
                    <div className="text-[10px] font-bold uppercase text-teal-700">
                      Tiết kiệm
                    </div>
                    <div className="text-2xl font-bold tabular-nums text-teal-800">
                      {fmt(a.totalSavings / 1e9, 2)} tỷ VND
                    </div>
                  </div>
                </div>
                <div className="rounded-[3px] border border-[#dce3ec] bg-[#071428] p-3 text-white">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-[#d4b76a]">
                    Ask lãnh đạo hôm nay
                  </div>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-[12.5px] leading-snug text-slate-200">
                    <li>Approve pilot stacking NK (G1)</li>
                    <li>Chỉ định owner lock rate card (G2/G4)</li>
                    <li>Xác nhận ngân sách cont peak T-4</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* ════ 01 EXEC ════ */}
          <section
            id="exec"
            className="report-page report-section scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8"
          >
            <SectionLabel n="01" title="Tóm tắt điều hành" />

            <p className="mt-4 text-[14px] leading-[1.85] text-slate-700">
              Honda Việt Nam đối mặt áp lực capacity kho xe máy miền Bắc: tồn vượt Fact Cap, phụ
              thuộc thuê ngoài (PPT: owned 33% / outside 67%), và chi phí peak. Chương trình stacking
              — lưu kiện chồng thay unpack ngay — kết hợp transfer Bắc–Nam chọn lọc, được định lượng
              trên Digital Twin bám Excel 103Ki 2QFC và Word.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  l: "Tiết kiệm năm",
                  v: `${fmt(a.totalSavings / 1e9, 2)} tỷ`,
                  s: "vs baseline outsource",
                  c: "text-[#0d6b63]",
                },
                {
                  l: "ROI / Payback",
                  v: fmtPct(a.roi),
                  s: Number.isFinite(a.paybackMonths)
                    ? `${fmt(a.paybackMonths, 1)} tháng`
                    : "—",
                  c: "text-[#0a4d6e]",
                },
                {
                  l: "NPV 3 năm",
                  v: `${fmt(a.npv / 1e9, 2)} tỷ`,
                  s: `r=${fmtPct(params.cost.discountRate)}`,
                  c: "text-[#071428]",
                },
                {
                  l: "Giảm outsource",
                  v: fmt(a.outsourceReduction),
                  s: "xe-eq / năm",
                  c: "text-[#0d6b63]",
                },
              ].map((x) => (
                <div
                  key={x.l}
                  className="relative overflow-hidden rounded-[3px] border border-[#dce3ec] bg-[#fafbfc] p-4"
                >
                  <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-[#071428] via-[#b8954a] to-[#071428]" />
                  <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                    {x.l}
                  </div>
                  <div className={`mt-1.5 text-2xl font-bold tabular-nums ${x.c}`}>{x.v}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{x.s}</div>
                </div>
              ))}
            </div>

            <h4 className="mt-8 text-[12px] font-bold uppercase tracking-[0.12em] text-[#071428]">
              Bốn phát hiện then chốt
            </h4>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {findings.map((f) => (
                <div
                  key={f.k}
                  className="flex gap-3 rounded-[3px] border border-[#e8edf2] p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[3px] bg-[#071428] text-[#d4b76a]">
                    <f.icon className="h-4 w-4" />
                    <span className="text-[8px] font-bold">{f.k}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#071428]">{f.t}</div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <StatPill
                label="Tháng đỏ / vàng / xanh"
                value={`${redMonths.length} / ${amberMonths.length} / ${greenMonths.length}`}
              />
              <StatPill label="Cont N→S (base)" value={fmt(a.nsContainersBase)} />
              <StatPill label="Case pool đỉnh" value={fmt(a.peakCasePool)} />
            </div>
          </section>

          {/* ════ 02 SCQ ════ */}
          <section
            id="scq"
            className="report-page report-section scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8"
          >
            <SectionLabel n="02" title="Bối cảnh · Vấn đề · Câu hỏi quyết định" />

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {[
                {
                  t: "Situation",
                  c: "border-[#c5d4e8] bg-[#f0f5fa]",
                  body: `Mạng lưới MC ~${fmt(ASSUMPTIONS.nationwideCap100)} xe (100%). Bắc ${fmt(ASSUMPTIONS.northCap100)}. Import ~${fmt(a.importVol)}. Peak tồn vượt Fact Cap ${fmt(ASSUMPTIONS.factCapNorth)}. HVN owned 33% / rented 67%.`,
                },
                {
                  t: "Complication",
                  c: "border-[#e8d5a3] bg-[#faf6eb]",
                  body: `Over peak ~${fmt(peak.baseOver)} (${peak.month}). Stacking giảm footprint nhưng residual lớn. Zero-outsource đòi cont/case pool rất lớn và có thể đắt hơn thuê Bắc.`,
                },
                {
                  t: "Question",
                  c: "border-teal-200 bg-teal-50",
                  body: `Mix tối ưu stacking (x), transfer (y), outsource (z) để min total network cost, bảo vệ service level và claim — dưới rate card & lead-time hiện tại?`,
                },
              ].map((b) => (
                <div key={b.t} className={`rounded-[3px] border p-4 ${b.c}`}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#071428]">
                    {b.t}
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-700">{b.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[3px] border border-[#eef2f6] p-4">
                <h4 className="flex items-center gap-2 text-sm font-bold text-[#071428]">
                  <BookOpen className="h-4 w-4 text-[#b8954a]" />
                  Trong phạm vi
                </h4>
                <ul className="mt-2 space-y-1 text-[13px] text-slate-600">
                  <li>• Capacity Bắc Fact vs TTL</li>
                  <li>• Stack NK · transfer N→S · outsource</li>
                  <li>• Container / case pool / reverse LT</li>
                  <li>• ROI · payback · NPV 3 năm</li>
                </ul>
              </div>
              <div className="rounded-[3px] border border-[#eef2f6] p-4">
                <h4 className="text-sm font-bold text-[#071428]">Ngoài phạm vi</h4>
                <ul className="mt-2 space-y-1 text-[13px] text-slate-600">
                  <li>• Thiết kế racking / WMS chi tiết</li>
                  <li>• Đàm phán 3PL hợp đồng cụ thể</li>
                  <li>• CAPEX kho sở hữu mới (chỉ định hướng)</li>
                  <li>• Pricing / demand generation</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="report-table w-full text-left text-[13px]">
                <thead>
                  <tr>
                    <th>Nguồn</th>
                    <th>Tài liệu</th>
                    <th>Vai trò</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold">Word</td>
                    <td>{SOURCES.word}</td>
                    <td>Công thức relief, over, rủi ro, playbook</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Excel</td>
                    <td>{SOURCES.excel}</td>
                    <td>Import, stock, TTL, To South 3.5/46.6, −2,62 tỷ</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">PPT</td>
                    <td>{SOURCES.ppt}</td>
                    <td>Network, owned/rented, stacking ~3 tỷ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ════ 03 CAPACITY ════ */}
          <section
            id="capacity"
            className="report-page report-section scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8"
          >
            <SectionLabel n="03" title="Phân tích năng lực kho" />

            <p className="mt-4 text-[14px] leading-[1.85] text-slate-700">
              Hai chuẩn capacity <strong>không được trộn</strong>: Word/Fact Cap{" "}
              {fmt(ASSUMPTIONS.factCapNorth)} vs Excel/TTL {fmt(ASSUMPTIONS.ttlCapNorth)}. Twin đang
              dùng <strong>{params.useTtlCapacity ? "TTL Cap" : "Fact Cap"}</strong>.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { l: "Fact Cap", v: fmt(ASSUMPTIONS.factCapNorth), s: "Word / VPC" },
                { l: "TTL Cap", v: fmt(ASSUMPTIONS.ttlCapNorth), s: "Excel + HNM + open" },
                {
                  l: `Peak over (${peak.month})`,
                  v: fmt(peak.baseOver),
                  s: `Residual sau stack ${fmt(peak.residualAfterImport)}`,
                },
              ].map((x) => (
                <div
                  key={x.l}
                  className="rounded-[3px] border border-[#eef2f6] bg-[#f7f9fc] px-4 py-3"
                >
                  <div className="text-[10px] font-bold uppercase text-slate-400">{x.l}</div>
                  <div className="mt-1 text-xl font-bold tabular-nums text-[#071428]">{x.v}</div>
                  <div className="text-[11px] text-slate-500">{x.s}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 h-72">
              <Fig n="1" t="Over gốc · residual sau stack · y_t / z_t theo tháng" />
              <ResponsiveContainer width="100%" height="88%">
                <ComposedChart data={monthlyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                  <Tooltip {...chartTheme.tooltip} />
                  <Legend />
                  <Bar dataKey="Vượt gốc" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Residual sau stack" fill="#b45309" radius={[2, 2, 0, 0]} />
                  <Line type="monotone" dataKey="Transfer y_t" stroke="#5b21b6" strokeWidth={2} />
                  <Line type="monotone" dataKey="Thuê ngoài z_t" stroke="#0a4d6e" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Callout tone="warn" title="Tháng đỏ (residual ≥ 30.000)">
                {redMonths.length ? redMonths.join(", ") : "Không có với Twin hiện tại"}. Pre-book
                cont & case pool từ T-4.
              </Callout>
              <Callout tone="info" title="Tháng vàng / xanh">
                Vàng: {amberMonths.join(", ") || "—"} · Xanh: {greenMonths.join(", ") || "—"}.
              </Callout>
            </div>
          </section>

          {/* ════ 04 POLICY ════ */}
          <section
            id="policy"
            className="report-page report-section scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8"
          >
            <SectionLabel n="04" title="Chính sách stacking & transfer" />

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[3px] border border-[#eef2f6] p-4">
                <div className="text-[10px] font-bold uppercase tracking-wide text-[#b8954a]">
                  Nhánh 1 — Nhập khẩu (x)
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-700">
                  Relief = Import × ({params.unpackM2}−{params.stackM2})/{params.unpackM2} ={" "}
                  <strong>{fmtPct(reliefRate)}</strong>. @ stack{" "}
                  {fmtPct(params.importStackRatio, 0)} →{" "}
                  <strong>{fmt(a.importRelief)}</strong> xe-eq ·{" "}
                  <strong>{fmt(a.m2Saved)}</strong> m².
                </p>
              </div>
              <div className="rounded-[3px] border border-[#eef2f6] p-4">
                <div className="text-[10px] font-bold uppercase tracking-wide text-[#b8954a]">
                  Nhánh 2 — Nội địa (y, z)
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-700">
                  Transfer ratio {fmtPct(params.transferRatio, 0)} → y={fmt(a.transferVol)} · z=
                  {fmt(a.outsourceVol)}. Cont base {fmt(a.nsContainersBase)} / Excel{" "}
                  {fmt(a.nsContainersExcel)}. Pool peak {fmt(a.peakCasePool)}.
                </p>
              </div>
            </div>

            <div
              className={`mt-4 rounded-[3px] border px-4 py-3 text-[13px] leading-relaxed ${
                transferJustified
                  ? "border-teal-200 bg-teal-50 text-teal-950"
                  : "border-rose-200 bg-rose-50 text-rose-950"
              }`}
            >
              <strong>Break-even unit:</strong> Avoid {fmt(unitAvoided)} vs TF all-in ~
              {fmt(Math.round(unitTransfer))} VND/xe · biên{" "}
              <strong>
                {unitMargin >= 0 ? "+" : ""}
                {fmt(Math.round(unitMargin))}
              </strong>
              . Max TF unit (BE) = {fmt(a.breakEvenTransferUnitCost)} VND/xe.
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="h-64">
                <Fig n="2" t="Chi phí tháng & net benefit (tỷ VND)" />
                <ResponsiveContainer width="100%" height="88%">
                  <ComposedChart data={monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 10 }} axisLine={false} />
                    <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                    <Tooltip {...chartTheme.tooltip} />
                    <Legend />
                    <Bar dataKey="Chi phí (tỷ)" fill="#0a4d6e" radius={[2, 2, 0, 0]} />
                    <Line
                      type="monotone"
                      dataKey="Net benefit (tỷ)"
                      stroke="#0d6b63"
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="h-64">
                <Fig n="3" t="Container N→S & case pool" />
                <ResponsiveContainer width="100%" height="88%">
                  <ComposedChart data={monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: chartTheme.tick, fontSize: 10 }} axisLine={false} />
                    <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                    <Tooltip {...chartTheme.tooltip} />
                    <Legend />
                    <Bar dataKey="Cont" fill="#5b21b6" radius={[2, 2, 0, 0]} />
                    <Line type="monotone" dataKey="Pool" stroke="#b45309" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* ════ 05 FINANCE ════ */}
          <section
            id="finance"
            className="report-page report-section scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8"
          >
            <SectionLabel n="05" title="Business case tài chính" />

            <p className="mt-4 text-[14px] leading-[1.85] text-slate-700">
              Baseline (100% over → thuê+bonus): <strong>{fmt(a.baselineCost / 1e9, 2)} tỷ</strong>.
              Twin tối ưu: <strong>{fmt(a.totalCost / 1e9, 2)} tỷ</strong> → tiết kiệm{" "}
              <strong>{fmt(a.totalSavings / 1e9, 2)} tỷ</strong>. Capex stacking{" "}
              {fmt(params.cost.stackCapex / 1e9, 2)} tỷ → ROI {fmtPct(a.roi)}, payback{" "}
              {Number.isFinite(a.paybackMonths) ? fmt(a.paybackMonths, 1) + " tháng" : "n/a"}, NPV 3y{" "}
              {fmt(a.npv / 1e9, 2)} tỷ.
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="h-64">
                <Fig n="4" t="Cầu tài chính (tỷ VND)" />
                <ResponsiveContainer width="100%" height="88%">
                  <BarChart data={bridge}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                    <Tooltip {...chartTheme.tooltip} />
                    <Bar dataKey="value" fill="#0a4d6e" radius={[3, 3, 0, 0]} name="Tỷ VND" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-64">
                <Fig n="5" t="Cơ cấu chi phí tối ưu" />
                <ResponsiveContainer width="100%" height="88%">
                  <PieChart>
                    <Pie
                      data={costParts}
                      dataKey="bn"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={88}
                      paddingAngle={1}
                    >
                      {costParts.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTheme.tooltip} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="report-table w-full text-left text-[13px]">
                <thead>
                  <tr>
                    <th>Hạng mục</th>
                    <th>Tỷ VND</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {costParts.map((c) => (
                    <tr key={c.name}>
                      <td className="font-medium">{c.name}</td>
                      <td className="tabular-nums font-semibold">{fmt(c.bn, 3)}</td>
                      <td className="tabular-nums">{fmtPct(c.pct)}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#f7f9fc] font-bold">
                    <td>Tổng</td>
                    <td className="tabular-nums">{fmt(a.totalCost / 1e9, 3)}</td>
                    <td>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-[12px] text-slate-500">
              Neo: Excel −{ASSUMPTIONS.excelStackingSaveBn} tỷ · PPT ~{ASSUMPTIONS.pptStackingSaveBn}{" "}
              tỷ. DSS dynamic — không hardcode. Chi phí/xe {fmt(a.costPerVehicle)} VND · /m²{" "}
              {fmt(a.costPerM2)} VND.
            </p>
          </section>

          {/* ════ 06 SENSITIVITY ════ */}
          <section
            id="sensitivity"
            className="report-page report-section scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8"
          >
            <SectionLabel n="06" title="Độ nhạy & so sánh kịch bản" />

            <p className="mt-4 text-[14px] leading-[1.85] text-slate-700">
              Base savings <strong>{fmt(sens.baseSave / 1e9, 2)} tỷ</strong>. Tornado ±20% từng
              driver. Kịch bản zero-outsource là benchmark kỹ thuật — không mặc định tối ưu kinh tế.
            </p>

            <div className="mt-6 h-80">
              <Fig n="6" t="Tornado độ nhạy — tiết kiệm tỷ VND (±20%)" />
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={sensData} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis type="number" tick={{ fill: chartTheme.tick, fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fill: chartTheme.tick, fontSize: 11 }}
                  />
                  <Tooltip {...chartTheme.tooltip} />
                  <Legend />
                  <ReferenceLine x={sens.baseSave / 1e9} stroke="#94a3b8" strokeDasharray="4 4" />
                  <Bar dataKey="low" name="−20%" fill="#f87171" />
                  <Bar dataKey="high" name="+20%" fill="#34d399" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 overflow-x-auto">
              <Fig n="7" t="Bảng so sánh kịch bản" />
              <table className="report-table mt-1 w-full text-left text-[12px]">
                <thead>
                  <tr>
                    <th>Kịch bản</th>
                    <th>Tiết kiệm tỷ</th>
                    <th>Chi phí tỷ</th>
                    <th>NPV tỷ</th>
                    <th>ROI</th>
                    <th>Outsource</th>
                    <th>Transfer</th>
                    <th>Cont</th>
                    <th>Pool</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioTable.map((r) => (
                    <tr
                      key={r.id}
                      className={r.id === "live" ? "bg-[#f0f7f4] font-semibold" : undefined}
                    >
                      <td className="font-bold text-[#071428]">{r.name}</td>
                      <td className="tabular-nums text-teal-800">{fmt(r.saveBn, 2)}</td>
                      <td className="tabular-nums">{fmt(r.costBn, 2)}</td>
                      <td className="tabular-nums">{fmt(r.npv, 2)}</td>
                      <td className="tabular-nums">{fmtPct(r.roi)}</td>
                      <td className="tabular-nums">{fmt(r.outsource)}</td>
                      <td className="tabular-nums">{fmt(r.transfer)}</td>
                      <td className="tabular-nums">{fmt(r.cont)}</td>
                      <td className="tabular-nums">{fmt(r.pool)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Callout tone="info" title="Gợi ý đọc bảng">
              Kịch bản tiết kiệm cao nhất: <strong>{bestScenario.name}</strong> (
              {fmt(bestScenario.saveBn, 2)} tỷ). So cột Cont/Pool trước khi cam kết zero-OS.
            </Callout>
          </section>

          {/* ════ 07 RISK + RACI ════ */}
          <section
            id="risk"
            className="report-page report-section scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8"
          >
            <SectionLabel n="07" title="Rủi ro · RACI · kiểm soát" />

            <div className="mt-5 overflow-x-auto">
              <table className="report-table w-full text-left text-[13px]">
                <thead>
                  <tr>
                    <th>Rủi ro</th>
                    <th>Mức</th>
                    <th>Kiểm soát bắt buộc</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Claim unpack trễ", "Cao", "Inspection window + RACI QA/Genpo"],
                    ["Nghẽn container peak", "Cao", "Rolling book + buffer cont"],
                    ["Thiếu case pool", "Cao", `Sizing chu kỳ ${params.leadTimeDays + params.freeTimeDays}n`],
                    ["Saving giả (TF đắt)", "Cao", "Quyết định total landed cost"],
                    ["Rate card trôi", "Cao", "Lock + re-run Twin mỗi quý"],
                    ["Nghẽn kho Nam", "TB", "Confirm capacity trước scale y_t"],
                    ["Damage multi-touch", "TB", "KPI damage theo route/packing"],
                  ].map(([r, s, c]) => (
                    <tr key={r}>
                      <td className="font-semibold text-[#071428]">{r}</td>
                      <td>
                        <span
                          className={`rounded-[2px] px-2 py-0.5 text-[10px] font-bold ${
                            s === "Cao"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {s}
                        </span>
                      </td>
                      <td className="text-slate-600">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className="mt-8 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[#071428]">
              <Users className="h-4 w-4 text-[#b8954a]" />
              Ma trận RACI
            </h4>
            <div className="mt-3 overflow-x-auto">
              <table className="report-table w-full text-left text-[12px]">
                <thead>
                  <tr>
                    <th>Hoạt động</th>
                    <th>R — Responsible</th>
                    <th>A — Accountable</th>
                    <th>C — Consulted</th>
                    <th>I — Informed</th>
                  </tr>
                </thead>
                <tbody>
                  {raci.map((row) => (
                    <tr key={row.act}>
                      <td className="font-semibold text-[#071428]">{row.act}</td>
                      <td>{row.R}</td>
                      <td>{row.A}</td>
                      <td>{row.C}</td>
                      <td>{row.I}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ════ 08 RECS ════ */}
          <section
            id="recs"
            className="report-page report-section scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8"
          >
            <SectionLabel n="08" title="Khuyến nghị & lộ trình" />

            <div className="mt-5 space-y-3">
              {recs.map((r, i) => (
                <div
                  key={r.t}
                  className="flex flex-col gap-3 rounded-[3px] border border-[#e8edf2] p-4 sm:flex-row"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] bg-[#071428] text-xs font-bold text-white">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#071428]">{r.t}</span>
                      <PriorityBadge p={r.p} />
                      <span className="text-[11px] text-slate-400">{r.when}</span>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{r.d}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
                      <span className="font-semibold text-[#0a4d6e]">Owner: {r.o}</span>
                      <span className="text-slate-500">KPI: {r.kpi}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h4 className="mt-8 text-[12px] font-bold uppercase tracking-[0.12em] text-[#071428]">
              Lộ trình 4 giai
            </h4>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              {[
                {
                  p: "GĐ 1",
                  t: "0–4 tuần",
                  items: ["SOP stack NK", "Layout CBU", "RACI claim", "Pilot 1 lane"],
                },
                {
                  p: "GĐ 2",
                  t: "Tháng 2–3",
                  items: ["Scale stack %", "Lock rate card", "Case pool base", "S&OP weekly"],
                },
                {
                  p: "GĐ 3",
                  t: "Peak",
                  items: ["Pre-book T-4", "Twin dashboard", "War room đỏ", "Damage KPI"],
                },
                {
                  p: "GĐ 4",
                  t: "Sau peak",
                  items: ["Post-mortem", "Re-run NPV", "Tender input", "NBF/LOG2 decision"],
                },
              ].map((ph) => (
                <div
                  key={ph.p}
                  className="rounded-[3px] border border-[#dce3ec] bg-[#f7f9fc] p-3"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wide text-[#b8954a]">
                    {ph.p}
                  </div>
                  <div className="text-sm font-bold text-[#071428]">{ph.t}</div>
                  <ul className="mt-2 space-y-1.5 text-[12px] text-slate-600">
                    {ph.items.map((it) => (
                      <li key={it} className="flex gap-1.5">
                        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-teal-700" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ════ 09 GATES ════ */}
          <section
            id="gates"
            className="report-page report-section scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8"
          >
            <SectionLabel n="09" title="Cổng phê duyệt & kế hoạch 30-60-90" />

            <div className="mt-5 overflow-x-auto">
              <table className="report-table w-full text-left text-[13px]">
                <thead>
                  <tr>
                    <th>Cổng</th>
                    <th>Quyết định</th>
                    <th>Tiêu chí Go</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {gates.map((g) => (
                    <tr key={g.g}>
                      <td className="font-mono font-bold text-[#b8954a]">{g.g}</td>
                      <td className="font-semibold text-[#071428]">{g.t}</td>
                      <td className="text-slate-600">{g.criteria}</td>
                      <td>
                        <span className="rounded-[2px] bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {plan3090.map((p) => (
                <div
                  key={p.h}
                  className="rounded-[3px] border border-[#071428]/10 bg-[#fafbfc] p-4"
                >
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b8954a]">
                    {p.h}
                  </div>
                  <ul className="mt-3 space-y-2 text-[13px] text-slate-700">
                    {p.items.map((it) => (
                      <li key={it} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#071428]" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Signature block */}
            <div className="mt-8 rounded-[3px] border border-[#dce3ec] p-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#071428]">
                Khối phê duyệt (in PDF · ký tay / e-sign)
              </div>
              <div className="mt-4 grid gap-6 sm:grid-cols-3">
                {["Soạn thảo / Trình", "Thẩm định Finance", "Phê duyệt LOG Head"].map((role) => (
                  <div key={role} className="min-h-[100px] border-b border-dashed border-slate-300 pb-2">
                    <div className="text-[12px] font-semibold text-slate-600">{role}</div>
                    <div className="mt-8 text-[11px] text-slate-400">Họ tên / Ngày</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════ 10 APPENDIX ════ */}
          <section
            id="appendix"
            className="report-page report-section scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8"
          >
            <SectionLabel n="10" title="Phụ lục số liệu & giả định" />

            <h4 className="mt-5 text-[12px] font-bold uppercase tracking-wide text-slate-500">
              A. Sổ giả định (Assumptions register)
            </h4>
            <div className="mt-2 overflow-x-auto">
              <table className="report-table w-full text-left text-[12px]">
                <thead>
                  <tr>
                    <th>Giả định</th>
                    <th>Giá trị</th>
                    <th>Nguồn</th>
                  </tr>
                </thead>
                <tbody>
                  {assumptions.map((row) => (
                    <tr key={row.k}>
                      <td className="font-medium text-[#071428]">{row.k}</td>
                      <td className="tabular-nums font-semibold">{row.v}</td>
                      <td className="text-slate-500">{row.src}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className="mt-8 text-[12px] font-bold uppercase tracking-wide text-slate-500">
              B. Output Twin theo tháng
            </h4>
            <div className="mt-2 overflow-x-auto">
              <table className="report-table w-full text-left text-[11px]">
                <thead>
                  <tr>
                    <th>Th</th>
                    <th>Import</th>
                    <th>Over</th>
                    <th>Relief</th>
                    <th>Resid</th>
                    <th>y_t</th>
                    <th>z_t</th>
                    <th>Cont</th>
                    <th>Pool</th>
                    <th>Cost tỷ</th>
                    <th>Class</th>
                  </tr>
                </thead>
                <tbody>
                  {result.months.map((m) => (
                    <tr key={m.month}>
                      <td className="font-bold">{m.month}</td>
                      <td className="tabular-nums">{fmt(m.importVol)}</td>
                      <td className="tabular-nums">{fmt(m.baseOver)}</td>
                      <td className="tabular-nums">{fmt(m.importRelief)}</td>
                      <td className="tabular-nums font-semibold">
                        {fmt(m.residualAfterImport)}
                      </td>
                      <td className="tabular-nums">{fmt(m.transferVol)}</td>
                      <td className="tabular-nums">{fmt(m.outsourceVol)}</td>
                      <td className="tabular-nums">{fmt(m.nsContainersBase, 1)}</td>
                      <td className="tabular-nums">{fmt(m.casePool)}</td>
                      <td className="tabular-nums">{fmt(m.totalCost / 1e9, 2)}</td>
                      <td>
                        <span
                          className={`rounded-[2px] px-1 py-0.5 text-[9px] font-bold uppercase ${
                            m.classification === "red"
                              ? "bg-rose-100 text-rose-800"
                              : m.classification === "amber"
                                ? "bg-amber-100 text-amber-900"
                                : "bg-teal-100 text-teal-800"
                          }`}
                        >
                          {m.classification}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 border-t border-[#eef2f6] pt-6">
              <h4 className="text-sm font-bold text-[#071428]">Kết luận</h4>
              <p className="mt-2 text-[14px] leading-[1.85] text-slate-700">
                Stacking là <strong>điều kiện cần</strong> nhưng chưa đủ. Kết hợp transfer chọn lọc,
                reverse logistics sizing đúng và quản trị total network cost biến phụ thuộc thuê kho
                thành chương trình S&OP có kiểm soát. Mọi số trong pack này phải được chạy lại khi
                niguri, tender cước hoặc hợp đồng kho thay đổi.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
                <span>
                  © Honda Việt Nam · LOG Twin DSS · {docId} · {today}
                  {" · "}
                  Tạo bởi Bach Truong · Intern · phòng BMLG
                </span>
                <span>
                  {SOURCES.word} · {SOURCES.excel} · {SOURCES.ppt}
                </span>
              </div>
            </div>
          </section>

          {/* Print help */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-[4px] border border-[#dce3ec] bg-[#f7f9fc] px-4 py-3 text-[12px] text-slate-600">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#b8954a]" />
              <span>
                In PDF: bật <strong>Background graphics</strong> · khổ A4 dọc · lề mặc định
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                href="/digital-twin"
                className="btn-bank-outline inline-flex items-center gap-1 px-3 py-2 text-xs"
              >
                Twin
                <ArrowRight className="h-3 w-3" />
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-bank-gold inline-flex items-center gap-1.5 px-4 py-2 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                Xuất PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Small presentational helpers ── */

function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-end gap-3">
      <span className="font-mono text-2xl font-bold tabular-nums text-[#b8954a]">{n}</span>
      <h3 className="pb-0.5 text-lg font-bold tracking-tight text-[#071428] sm:text-xl">
        {title}
      </h3>
    </div>
  );
}

function Fig({ n, t }: { n: string; t: string }) {
  return (
    <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
      Hình {n} · {t}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 font-semibold text-slate-200">{value}</div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[3px] border border-[#eef2f6] bg-[#f7f9fc] px-3 py-2">
      <div className="text-[10px] font-bold uppercase text-slate-400">{label}</div>
      <div className="mt-0.5 text-sm font-bold tabular-nums text-[#071428]">{value}</div>
    </div>
  );
}

function PriorityBadge({ p }: { p: string }) {
  const c =
    p === "P0"
      ? "bg-rose-100 text-rose-800"
      : p === "P1"
        ? "bg-amber-100 text-amber-900"
        : "bg-slate-100 text-slate-600";
  return (
    <span className={`rounded-[2px] px-1.5 py-0.5 text-[9px] font-bold ${c}`}>{p}</span>
  );
}

function Callout({
  title,
  children,
  tone,
}: {
  title: string;
  children: ReactNode;
  tone: "info" | "warn" | "good";
}) {
  const styles = {
    info: "border-[#c5d4e8] bg-[#f4f8fc]",
    warn: "border-amber-200 bg-amber-50",
    good: "border-teal-200 bg-teal-50",
  };
  return (
    <div
      className={`mt-4 rounded-[3px] border px-3 py-2.5 text-[12.5px] leading-relaxed ${styles[tone]}`}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
        <AlertTriangle className="h-3 w-3" />
        {title}
      </div>
      <div className="mt-1 text-slate-700">{children}</div>
    </div>
  );
}
