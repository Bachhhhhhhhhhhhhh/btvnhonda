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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTwinStore } from "@/lib/store";
import { ASSUMPTIONS, SOURCES } from "@/lib/data/projectData";
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
} from "lucide-react";

const TOC = [
  { id: "exec", n: "01", t: "Tóm tắt điều hành" },
  { id: "scq", n: "02", t: "Bối cảnh · Vấn đề · Câu hỏi" },
  { id: "capacity", n: "03", t: "Phân tích năng lực kho" },
  { id: "policy", n: "04", t: "Chính sách stacking & transfer" },
  { id: "finance", n: "05", t: "Business case tài chính" },
  { id: "risk", n: "06", t: "Rủi ro & kiểm soát" },
  { id: "recs", n: "07", t: "Khuyến nghị & lộ trình" },
  { id: "appendix", n: "08", t: "Phụ lục số liệu" },
];

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
    params.cost.returnPerCase / Math.max(params.mcPerCase, 0.01);
  const transferJustified = unitTransfer < unitAvoided;

  const costParts = [
    {
      name: "Thuê Bắc + bonus",
      v: result.months.reduce(
        (s, m) => s + m.northRentalCost + m.bonusCost,
        0
      ),
    },
    {
      name: "Lane N→S (cước+pack+return)",
      v: result.months.reduce(
        (s, m) => s + m.freightCost + m.packingCost + m.returnCost,
        0
      ),
    },
    {
      name: "Kho Nam + risk + stack",
      v: result.months.reduce(
        (s, m) => s + m.southWhCost + m.riskCost + m.importStackCost,
        0
      ),
    },
  ].map((x) => ({
    ...x,
    bn: +(x.v / 1e9).toFixed(2),
    pct: a.totalCost > 0 ? x.v / a.totalCost : 0,
  }));

  const monthlyChart = result.months.map((m) => ({
    month: m.month,
    "Vượt gốc": Math.round(m.baseOver),
    "Residual sau stack": Math.round(m.residualAfterImport),
    "Transfer y_t": Math.round(m.transferVol),
    "Thuê ngoài z_t": Math.round(m.outsourceVol),
    "Chi phí (tỷ)": +(m.totalCost / 1e9).toFixed(3),
  }));

  const scenarioBars = [
    { name: "Hiện trạng", value: Math.round(result.scenarios.asIs), fill: "#a31d1d" },
    { name: "Chỉ stack NK", value: Math.round(result.scenarios.importOnly), fill: "#b45309" },
    { name: "Full stack LT", value: Math.round(result.scenarios.fullStackTheory), fill: "#5b21b6" },
    { name: "Tối ưu Twin", value: Math.round(result.scenarios.optimized), fill: "#0d6b63" },
  ];

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

  const findings = [
    {
      k: "A",
      t: "Stacking NK là đòn bẩy baseline",
      d: `Relief ${fmt(a.importRelief)} xe-eq · ${fmt(a.m2Saved)} m² · tỷ lệ ${fmtPct(reliefRate)} — cùng hướng PPT ~${ASSUMPTIONS.pptStackingSaveBn} tỷ và Excel −${ASSUMPTIONS.excelStackingSaveBn} tỷ.`,
    },
    {
      k: "B",
      t: "Chỉ stack không khép peak",
      d: `Tháng ${peak.month}: over ${fmt(peak.baseOver)} → residual ${fmt(peak.residualAfterImport)} sau stack. Cần policy y_t/z_t.`,
    },
    {
      k: "C",
      t: transferJustified ? "Transfer có biên kinh tế" : "Transfer cần thận trọng",
      d: `Unit transfer ~${fmt(Math.round(unitTransfer))} vs avoid ${fmt(unitAvoided)} VND/xe. ${transferJustified ? "Có thể tăng y_t có kiểm soát." : "Ưu tiên z_t hoặc khóa rate card."}`,
    },
    {
      k: "D",
      t: "Business case dương dưới rate card hiện tại",
      d: `Tiết kiệm ${fmt(a.totalSavings / 1e9, 2)} tỷ · ROI ${fmtPct(a.roi)} · NPV 3y ${fmt(a.npv / 1e9, 2)} tỷ · payback ${Number.isFinite(a.paybackMonths) ? fmt(a.paybackMonths, 1) + " tháng" : "n/a"}.`,
    },
  ];

  const recs = [
    {
      p: "P0",
      t: "Thể chế hóa stacking nhập khẩu",
      o: "Warehouse + Import + QA",
      when: "0–4 tuần",
      d: "SOP, layout CBU, cửa sổ claim, sampling VIN/ENG, RACI Genpo.",
    },
    {
      p: "P0",
      t: "Khóa rate card Finance",
      o: "Finance + Logistics",
      when: "Trước cam kết ngân sách",
      d: "Thuê Bắc, bonus, cước N→S, return, packing, kho Nam — re-run Twin sau lock.",
    },
    {
      p: "P1",
      t: "Pre-book tháng đỏ T-4",
      o: "Transport + S&OP",
      when: "Trước peak",
      d: `Tháng đỏ: ${redMonths.join(", ") || "—"}. Cont N→S ${fmt(a.nsContainersBase)} · case pool peak ${fmt(a.peakCasePool)}.`,
    },
    {
      p: "P1",
      t: "Transfer chọn lọc theo break-even",
      o: "Network planning",
      when: "Song song peak",
      d: `Không KPI “z_t = 0”. Chỉ tăng y_t khi unit economics dương + capacity Nam sẵn.`,
    },
    {
      p: "P1",
      t: "Digital Twin hàng tuần mùa cao điểm",
      o: "S&OP control tower",
      when: "Ongoing peak",
      d: "Cập nhật forecast, transfer ratio, phát hành nhu cầu cont/case.",
    },
    {
      p: "P2",
      t: "Xác nhận staging miền Nam",
      o: "WH Nam",
      when: "Trước scale y_t",
      d: "Long An / Đồng Nai / Cái Cui — tránh dời chi phí Bắc→Nam.",
    },
  ];

  const risks = [
    { r: "Claim unpack trễ", c: "Cửa sổ inspection + RACI QA/Genpo", s: "Cao" },
    { r: "Nghẽn container peak", c: "Rolling book + buffer cont", s: "Cao" },
    { r: "Thiếu case pool", c: `Sizing chu kỳ ${params.leadTimeDays + params.freeTimeDays}n`, s: "Cao" },
    { r: "Saving giả (TF đắt hơn thuê)", c: "Quyết định theo total landed cost", s: "Cao" },
    { r: "Rate card trôi", c: "Lock + re-run Twin mỗi quý", s: "TB–Cao" },
    { r: "Nghẽn kho Nam", c: "Confirm capacity trước tăng y_t", s: "TB" },
  ];

  const narrativeWordCount = 1850; // approximate professional body

  return (
    <div className="report-root space-y-0">
      {/* ── Toolbar (screen only) ── */}
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#dce3ec] pb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b8954a]">
            Confidential · Board pack
          </div>
          <h1 className="mt-1 text-xl font-bold text-[#071428]">
            Báo cáo tư vấn chuyên sâu
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Tái sinh từ Digital Twin · In PDF để trình lãnh đạo
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/recommendations" className="btn-bank-outline px-3 py-2 text-xs">
            Playbook khuyến nghị
          </Link>
          <Link href="/digital-twin" className="btn-bank-outline px-3 py-2 text-xs">
            Chỉnh Twin
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

      {/* ═══════════ COVER ═══════════ */}
      <section className="report-cover report-page relative overflow-hidden rounded-[4px] border border-[#0a1628] bg-[#071428] text-white shadow-[0_12px_40px_-12px_rgba(7,20,40,0.45)]">
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#b8954a] via-[#d4b76a] to-transparent" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#b8954a]/10 blur-3xl" />
        <div className="relative z-10 px-8 py-10 sm:px-12 sm:py-14">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[3px] bg-gradient-to-b from-[#d4b76a] to-[#b8954a] text-[#071428]">
                <Building2 className="h-6 w-6" strokeWidth={2} />
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight">LOG Twin DSS</div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#d4b76a]">
                  Honda Việt Nam · MC Logistics
                </div>
              </div>
            </div>
            <div className="rounded-[2px] border border-[#b8954a]/40 bg-[#b8954a]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#e8d5a3]">
              <Shield className="mr-1.5 inline h-3 w-3" />
              Nội bộ · Confidential
            </div>
          </div>

          <div className="mt-12 max-w-3xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d4b76a]">
              Báo cáo hỗ trợ quyết định
            </div>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-[2.35rem]">
              Tối ưu stacking & capacity kho miền Bắc
              <span className="mt-2 block text-xl font-semibold text-slate-300 sm:text-2xl">
                Mùa cao điểm · Mạng lưới logistics xe máy
              </span>
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-300">
              Phân tích định lượng stacking nhập khẩu, transfer Bắc–Nam và thuê ngoài —
              tối thiểu hóa tổng chi phí mạng lưới trên cơ sở Excel 103Ki 2QFC, Word đề bài
              và PPT LOG Unit Yamagomori.
            </p>
          </div>

          <div className="mt-12 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Ngày phát hành
              </div>
              <div className="mt-1 text-sm font-semibold">{today}</div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Phiên bản mô hình
              </div>
              <div className="mt-1 text-sm font-semibold">
                Twin live · Stack {fmtPct(params.importStackRatio, 0)} · TF{" "}
                {fmtPct(params.transferRatio, 0)}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Chuẩn capacity
              </div>
              <div className="mt-1 text-sm font-semibold">
                {params.useTtlCapacity ? "TTL Cap Excel 28.495" : "Fact Cap Word 17.680"}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-[11px] text-slate-400">
            <span>Soạn thảo: LOG Twin DSS</span>
            <span>Đối tượng: Lãnh đạo Logistics / Finance / S&OP</span>
            <span>Mã hồ sơ: 103Ki 2QFC</span>
          </div>
        </div>
      </section>

      {/* ═══════════ DOC CONTROL ═══════════ */}
      <section className="report-page mt-4 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b8954a]">
              Kiểm soát tài liệu
            </h3>
            <table className="mt-3 w-full text-left text-[13px]">
              <tbody className="divide-y divide-[#eef2f6]">
                {[
                  ["Loại", "Báo cáo tư vấn / Decision support"],
                  ["Phân loại", "Nội bộ — Confidential"],
                  ["Nguồn chính", "Word · Excel · PPT (xem phụ lục)"],
                  ["Engine", "Digital Twin simulate() · Zustand store"],
                  ["In lần này", today],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-2 pr-4 font-semibold text-slate-500">{k}</td>
                    <td className="py-2 font-medium text-[#071428]">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b8954a]">
              Mục lục
            </h3>
            <ol className="mt-3 space-y-1.5">
              {TOC.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="flex items-center gap-3 rounded-[3px] px-2 py-1.5 text-[13px] text-slate-700 transition hover:bg-[#f7f9fc]"
                  >
                    <span className="font-mono text-[11px] font-bold text-[#b8954a]">
                      {item.n}
                    </span>
                    <span className="font-medium">{item.t}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <p className="mt-6 border-t border-[#eef2f6] pt-4 text-[11px] leading-relaxed text-slate-500">
          <strong className="text-slate-700">Tuyên bố:</strong> Số liệu tài chính dùng rate card
          placeholder trong Twin cho đến khi Finance khóa. Báo cáo này hỗ trợ quyết định, không
          thay thế phê duyệt ngân sách / hợp đồng chính thức. Mọi KPI tái tính khi thay tham số Twin.
        </p>
      </section>

      {/* ═══════════ 01 EXEC ═══════════ */}
      <section id="exec" className="report-page report-section mt-4 scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8">
        <SectionLabel n="01" title="Tóm tắt điều hành" />

        <p className="mt-4 text-[14px] leading-[1.85] text-slate-700">
          Honda Việt Nam đối mặt áp lực capacity kho xe máy miền Bắc trong mùa cao điểm: tồn vượt
          Fact Cap, phụ thuộc thuê ngoài (PPT: HVN owned 33% / outside 67%), và chi phí peak bonus.
          Chương trình stacking — lưu xe dạng kiện chồng thay vì unpack ngay — kết hợp transfer
          Bắc–Nam có chọn lọc, được định lượng trên Digital Twin bám Excel 103Ki 2QFC và đề bài Word.
        </p>

        {/* Headline numbers */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              l: "Tiết kiệm năm (mô hình)",
              v: `${fmt(a.totalSavings / 1e9, 2)} tỷ`,
              s: "VND vs baseline outsource",
              tone: a.totalSavings > 0 ? "good" : "bad",
            },
            {
              l: "ROI stacking",
              v: fmtPct(a.roi),
              s: `Payback ${Number.isFinite(a.paybackMonths) ? fmt(a.paybackMonths, 1) + " tháng" : "—"}`,
              tone: "accent",
            },
            {
              l: "NPV 3 năm",
              v: `${fmt(a.npv / 1e9, 2)} tỷ`,
              s: `r = ${fmtPct(params.cost.discountRate)}`,
              tone: "default",
            },
            {
              l: "Giảm thuê ngoài",
              v: fmt(a.outsourceReduction),
              s: `${fmt(a.baseOutsourceVol)} → ${fmt(a.outsourceVol)} xe-eq`,
              tone: "good",
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
              <div
                className={`mt-1.5 text-2xl font-bold tabular-nums tracking-tight ${
                  x.tone === "good"
                    ? "text-[#0d6b63]"
                    : x.tone === "bad"
                      ? "text-[#a31d1d]"
                      : x.tone === "accent"
                        ? "text-[#0a4d6e]"
                        : "text-[#071428]"
                }`}
              >
                {x.v}
              </div>
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
              className="flex gap-3 rounded-[3px] border border-[#e8edf2] bg-white p-4 shadow-[0_1px_2px_rgba(7,20,40,0.04)]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] bg-[#071428] text-xs font-bold text-[#d4b76a]">
                {f.k}
              </div>
              <div>
                <div className="text-sm font-bold text-[#071428]">{f.t}</div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{f.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[3px] border border-[#e8d5a3] bg-[#faf6eb] px-4 py-3 text-[13px] leading-relaxed text-[#5c4a22]">
          <strong>Khuyến nghị một dòng:</strong> Triển khai stacking NK như baseline vận hành;
          dùng transfer N→S có kiểm soát theo break-even; sizing case pool & container trước peak;
          khóa rate card trước cam kết ngân sách đa năm.{" "}
          <em>Không</em> đặt KPI “thuê ngoài = 0” nếu unit economics không ủng hộ.
        </div>
      </section>

      {/* ═══════════ 02 SCQ ═══════════ */}
      <section id="scq" className="report-page report-section mt-4 scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8">
        <SectionLabel n="02" title="Bối cảnh · Vấn đề · Câu hỏi quyết định" />

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {[
            {
              t: "Situation",
              c: "bg-[#f0f5fa] border-[#c5d4e8]",
              body: `Mạng lưới MC WH toàn quốc ~${fmt(ASSUMPTIONS.nationwideCap100)} xe (100%). Bắc ${fmt(ASSUMPTIONS.northCap100)} (38%). Phụ thuộc kho thuê cao. Import năm ~${fmt(a.importVol)} xe. Peak tồn on-hand vượt Fact Cap ${fmt(ASSUMPTIONS.factCapNorth)}.`,
            },
            {
              t: "Complication",
              c: "bg-[#faf6eb] border-[#e8d5a3]",
              body: `Over capacity peak (Word @ Fact) lên tới ~${fmt(peak.baseOver)} xe (${peak.month}). Thuê ngoài + bonus phình. Stacking NK giảm footprint nhưng residual vẫn lớn; zero-outsource đòi cont/case pool rất lớn và có thể đắt hơn thuê Bắc.`,
            },
            {
              t: "Question",
              c: "bg-[#f0faf8] border-teal-200",
              body: `Trong rate card và lead-time hiện tại, mix tối ưu của stacking NK (x), transfer N→S (y) và thuê ngoài (z) là gì để tối thiểu total network cost, bảo vệ service level và claim chất lượng?`,
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
            <h4 className="text-sm font-bold text-[#071428]">Phạm vi phân tích</h4>
            <ul className="mt-2 space-y-1.5 text-[13px] text-slate-600">
              <li>• Capacity Bắc: Fact Cap vs TTL Cap (hai chuẩn song song)</li>
              <li>• Stacking NK: relief m² & capacity tương đương</li>
              <li>• Transfer N→S sea case + return empty</li>
              <li>• Outsource residual + bonus peak</li>
              <li>• ROI / payback / NPV 3 năm trên capex stacking</li>
            </ul>
          </div>
          <div className="rounded-[3px] border border-[#eef2f6] p-4">
            <h4 className="text-sm font-bold text-[#071428]">Ngoài phạm vi</h4>
            <ul className="mt-2 space-y-1.5 text-[13px] text-slate-600">
              <li>• Thiết kế chi tiết kệ / racking / WMS</li>
              <li>• Đàm phán hợp đồng 3PL cụ thể</li>
              <li>• CAPEX xây kho sở hữu mới (NBF/LOG2) — chỉ so sánh định hướng</li>
              <li>• Pricing bán hàng / demand generation</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="report-table w-full text-left text-[13px]">
            <thead>
              <tr>
                <th>Nguồn</th>
                <th>Tài liệu</th>
                <th>Vai trò trong báo cáo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold">Word</td>
                <td>{SOURCES.word}</td>
                <td>Công thức relief, bảng over, rủi ro, playbook 0–4 tuần</td>
              </tr>
              <tr>
                <td className="font-semibold">Excel</td>
                <td>{SOURCES.excel}</td>
                <td>Import, stock, TTL cap, To South mix 3.5 / 46.6, budget −2,62</td>
              </tr>
              <tr>
                <td className="font-semibold">PPT</td>
                <td>{SOURCES.ppt}</td>
                <td>Network capacity, owned/rented, stacking idea ~3 tỷ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════ 03 CAPACITY ═══════════ */}
      <section id="capacity" className="report-page report-section mt-4 scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8">
        <SectionLabel n="03" title="Phân tích năng lực kho" />

        <p className="mt-4 text-[14px] leading-[1.85] text-slate-700">
          Hai định nghĩa “vượt capacity” phải được giữ tách trong mọi thảo luận điều hành. Báo cáo
          Word sizing over theo <strong>Fact Cap {fmt(ASSUMPTIONS.factCapNorth)}</strong> (VPC).
          Engine Excel Rental WH sizing theo <strong>TTL Cap {fmt(ASSUMPTIONS.ttlCapNorth)}</strong>{" "}
          (đã gồm HNM + open area). Twin hiện tại dùng chuẩn{" "}
          <strong>{params.useTtlCapacity ? "TTL" : "Fact Cap"}</strong>.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { l: "Fact Cap", v: fmt(ASSUMPTIONS.factCapNorth), s: "Word / VPC" },
            { l: "TTL Cap", v: fmt(ASSUMPTIONS.ttlCapNorth), s: "Excel row 59" },
            { l: "Peak over (tháng " + peak.month + ")", v: fmt(peak.baseOver), s: "Theo chuẩn Twin" },
          ].map((x) => (
            <div key={x.l} className="rounded-[3px] border border-[#eef2f6] bg-[#f7f9fc] px-4 py-3">
              <div className="text-[10px] font-bold uppercase text-slate-400">{x.l}</div>
              <div className="mt-1 text-xl font-bold tabular-nums text-[#071428]">{x.v}</div>
              <div className="text-[11px] text-slate-500">{x.s}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 h-72 w-full">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Hình 1 · Over gốc vs residual sau stack NK vs policy y/z
          </div>
          <ResponsiveContainer width="100%" height="90%">
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
            {redMonths.length ? redMonths.join(", ") : "Không có với chính sách Twin hiện tại"}.
            Pre-book container & case pool từ T-4.
          </Callout>
          <Callout tone="info" title="Tháng vàng">
            {amberMonths.length ? amberMonths.join(", ") : "—"}. Monitor S&OP; chưa war-room.
          </Callout>
        </div>
      </section>

      {/* ═══════════ 04 POLICY ═══════════ */}
      <section id="policy" className="report-page report-section mt-4 scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8">
        <SectionLabel n="04" title="Chính sách stacking & transfer" />

        <p className="mt-4 text-[14px] leading-[1.85] text-slate-700">
          <strong>Nhánh 1 — Nhập khẩu:</strong> Import × ({params.unpackM2} − {params.stackM2}) /{" "}
          {params.unpackM2} = {fmtPct(reliefRate)} capacity tương đương. Áp dụng tỷ lệ stack{" "}
          {fmtPct(params.importStackRatio, 0)} → relief năm {fmt(a.importRelief)} xe-eq, m² tiết kiệm{" "}
          {fmt(a.m2Saved)}.
        </p>
        <p className="mt-3 text-[14px] leading-[1.85] text-slate-700">
          <strong>Nhánh 2 — Nội địa:</strong> Residual sau stack chia transfer ratio{" "}
          {fmtPct(params.transferRatio, 0)} và outsource. Transfer năm {fmt(a.transferVol)} xe ·
          Cont N→S {fmt(a.nsContainersBase)} (base {fmt(params.casesPerContainerNS * params.mcPerCase, 1)}{" "}
          xe/cont) / {fmt(a.nsContainersExcel)} (@ Excel {params.mcPerContainerExcel}). Case pool đỉnh{" "}
          {fmt(a.peakCasePool)} kiện (LT {params.leadTimeDays}+ free {params.freeTimeDays}n).
        </p>

        <div
          className={`mt-5 rounded-[3px] border px-4 py-3 text-[13px] leading-relaxed ${
            transferJustified
              ? "border-teal-200 bg-teal-50 text-teal-950"
              : "border-rose-200 bg-rose-50 text-rose-950"
          }`}
        >
          <strong>Break-even unit:</strong> Avoid {fmt(unitAvoided)} VND/xe (thuê+bonus) vs Transfer
          all-in ~{fmt(Math.round(unitTransfer))} VND/xe.{" "}
          {transferJustified
            ? `Biên dương ~${fmt(Math.round(unitAvoided - unitTransfer))} VND/xe — transfer có lợi kinh tế dưới rate card hiện tại.`
            : `Transfer đắt hơn ~${fmt(Math.round(unitTransfer - unitAvoided))} VND/xe — không scale y_t chỉ để “xóa” z_t.`}
        </div>

        <div className="mt-6 h-64">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Hình 2 · Peak outsource theo kịch bản (benchmark kỹ thuật)
          </div>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={scenarioBars}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
              <Tooltip {...chartTheme.tooltip} />
              <Bar dataKey="value" name="Peak z_t (xe)" radius={[3, 3, 0, 0]}>
                {scenarioBars.map((e, i) => (
                  <Cell key={i} fill={e.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ═══════════ 05 FINANCE ═══════════ */}
      <section id="finance" className="report-page report-section mt-4 scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8">
        <SectionLabel n="05" title="Business case tài chính" />

        <p className="mt-4 text-[14px] leading-[1.85] text-slate-700">
          Baseline giả định mọi đơn vị over được hấp thụ bằng thuê ngoài Bắc + bonus peak:{" "}
          <strong>{fmt(a.baselineCost / 1e9, 2)} tỷ VND/năm</strong>. Chính sách Twin (stack +
          transfer chọn lọc) phát sinh <strong>{fmt(a.totalCost / 1e9, 2)} tỷ</strong>, tiết kiệm
          mô hình <strong>{fmt(a.totalSavings / 1e9, 2)} tỷ</strong>. So với capex stacking{" "}
          {fmt(params.cost.stackCapex / 1e9, 2)} tỷ: ROI {fmtPct(a.roi)}, hoàn vốn{" "}
          {Number.isFinite(a.paybackMonths) ? fmt(a.paybackMonths, 1) + " tháng" : "không đạt"}, NPV
          3 năm {fmt(a.npv / 1e9, 2)} tỷ @ r={fmtPct(params.cost.discountRate)}.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="h-64">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Hình 3 · Cầu tài chính (tỷ VND)
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={bridge}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: chartTheme.tick, fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTheme.tooltip} />
                <Bar dataKey="value" fill="#0a4d6e" radius={[3, 3, 0, 0]} name="Tỷ VND" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Bảng · Cơ cấu chi phí tối ưu
            </div>
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
                    <td className="tabular-nums font-semibold">{fmt(c.bn, 2)}</td>
                    <td className="tabular-nums">{fmtPct(c.pct)}</td>
                  </tr>
                ))}
                <tr className="bg-[#f7f9fc] font-bold">
                  <td>Tổng</td>
                  <td className="tabular-nums">{fmt(a.totalCost / 1e9, 2)}</td>
                  <td>100%</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 text-[12px] text-slate-500">
              Neo tham chiếu: Excel stacking allocation −{ASSUMPTIONS.excelStackingSaveBn} tỷ · PPT ~
              {ASSUMPTIONS.pptStackingSaveBn} tỷ/năm. DSS không hardcode — savings động từ rate card.
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="report-table w-full text-left text-[13px]">
            <thead>
              <tr>
                <th>Chỉ số</th>
                <th>Giá trị</th>
                <th>Diễn giải</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Chi phí / xe xử lý", fmt(a.costPerVehicle) + " VND", "Cường độ chi phí logistics"],
                ["Chi phí / m² tiết kiệm", fmt(a.costPerM2) + " VND", "Hiệu quả footprint"],
                ["BE transfer unit max", fmt(a.breakEvenTransferUnitCost) + " VND/xe", "Trần cước all-in"],
                ["Util WH peak", fmtPct(a.warehouseUtilPeak), "Tồn max / active cap"],
              ].map(([k, v, d]) => (
                <tr key={k}>
                  <td className="font-semibold text-[#071428]">{k}</td>
                  <td className="tabular-nums font-bold">{v}</td>
                  <td className="text-slate-500">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════ 06 RISK ═══════════ */}
      <section id="risk" className="report-page report-section mt-4 scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8">
        <SectionLabel n="06" title="Rủi ro & kiểm soát" />

        <p className="mt-4 text-[14px] leading-[1.85] text-slate-700">
          Rủi ro chính không phải “stacking có chạy được không”, mà là triển khai thiếu kiểm soát
          claim, equipment, và quyết định transfer chỉ để tối ưu một KPI cục bộ (thuê Bắc) làm tổng
          network cost tăng.
        </p>

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
              {risks.map((r) => (
                <tr key={r.r}>
                  <td className="font-semibold text-[#071428]">{r.r}</td>
                  <td>
                    <span
                      className={`rounded-[2px] px-2 py-0.5 text-[10px] font-bold ${
                        r.s.includes("Cao")
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {r.s}
                    </span>
                  </td>
                  <td className="text-slate-600">{r.c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════ 07 RECS ═══════════ */}
      <section id="recs" className="report-page report-section mt-4 scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8">
        <SectionLabel n="07" title="Khuyến nghị & lộ trình" />

        <div className="mt-5 space-y-3">
          {recs.map((r, i) => (
            <div
              key={r.t}
              className="flex flex-col gap-3 rounded-[3px] border border-[#e8edf2] p-4 sm:flex-row sm:items-start"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] bg-[#071428] text-xs font-bold text-white">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-[#071428]">{r.t}</span>
                  <span
                    className={`rounded-[2px] px-1.5 py-0.5 text-[9px] font-bold ${
                      r.p === "P0"
                        ? "bg-rose-100 text-rose-800"
                        : r.p === "P1"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {r.p}
                  </span>
                  <span className="text-[11px] text-slate-400">{r.when}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{r.d}</p>
                <p className="mt-1 text-[11px] font-semibold text-[#0a4d6e]">Owner: {r.o}</p>
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
              p: "Giai đoạn 1",
              t: "0–4 tuần",
              items: ["SOP stack NK", "Layout CBU", "RACI claim", "Pilot 1 lane"],
            },
            {
              p: "Giai đoạn 2",
              t: "Tháng 2–3",
              items: ["Scale stack %", "Lock rate card", "Case pool base", "S&OP weekly"],
            },
            {
              p: "Giai đoạn 3",
              t: "Peak season",
              items: ["Pre-book cont T-4", "Twin dashboard", "Red-month war room", "Damage KPI"],
            },
            {
              p: "Giai đoạn 4",
              t: "Sau peak",
              items: ["Post-mortem", "Re-run NPV", "Tender input", "Quyết định NBF/LOG2"],
            },
          ].map((ph) => (
            <div
              key={ph.p}
              className="rounded-[3px] border border-[#dce3ec] bg-[#f7f9fc] p-3"
            >
              <div className="text-[10px] font-bold uppercase tracking-wide text-[#b8954a]">
                {ph.p}
              </div>
              <div className="mt-0.5 text-sm font-bold text-[#071428]">{ph.t}</div>
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

        <div className="mt-6 flex flex-wrap gap-2 no-print">
          <Link
            href="/digital-twin"
            className="btn-bank inline-flex items-center gap-1.5 px-4 py-2 text-xs"
          >
            Mở Digital Twin
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/scenarios" className="btn-bank-outline px-4 py-2 text-xs">
            So sánh kịch bản
          </Link>
          <Link href="/financial" className="btn-bank-outline px-4 py-2 text-xs">
            Chi tiết tài chính
          </Link>
        </div>
      </section>

      {/* ═══════════ 08 APPENDIX ═══════════ */}
      <section id="appendix" className="report-page report-section mt-4 scroll-mt-20 rounded-[4px] border border-[#dce3ec] bg-white p-6 sm:p-8">
        <SectionLabel n="08" title="Phụ lục số liệu theo tháng" />

        <p className="mt-3 text-[13px] text-slate-600">
          Bảng xuất từ Digital Twin tại thời điểm in. Tham số: stack{" "}
          {fmtPct(params.importStackRatio, 0)} · transfer {fmtPct(params.transferRatio, 0)} · m²{" "}
          {params.unpackM2}/{params.stackM2} · mc/case {params.mcPerCase}.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="report-table w-full text-left text-[12px]">
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Import</th>
                <th>Over</th>
                <th>Relief</th>
                <th>Residual</th>
                <th>y_t</th>
                <th>z_t</th>
                <th>Cont</th>
                <th>Pool</th>
                <th>Cost (tỷ)</th>
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
                  <td className="tabular-nums font-semibold">{fmt(m.residualAfterImport)}</td>
                  <td className="tabular-nums">{fmt(m.transferVol)}</td>
                  <td className="tabular-nums">{fmt(m.outsourceVol)}</td>
                  <td className="tabular-nums">{fmt(m.nsContainersBase, 1)}</td>
                  <td className="tabular-nums">{fmt(m.casePool)}</td>
                  <td className="tabular-nums">{fmt(m.totalCost / 1e9, 2)}</td>
                  <td>
                    <span
                      className={`rounded-[2px] px-1.5 py-0.5 text-[9px] font-bold uppercase ${
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
            Stacking là <strong>điều kiện cần</strong> nhưng chưa đủ cho capacity peak miền Bắc. Khi
            kết hợp transfer chọn lọc, reverse logistics được sizing đúng và quản trị theo tổng chi
            phí mạng lưới, stacking biến phụ thuộc thuê kho mãn tính thành chương trình S&OP có
            kiểm soát. Bằng chứng số trong báo cáo — capacity, container, case pool, ROI và phong bì
            kịch bản — phải được chạy lại mỗi khi niguri, tender cước hoặc hợp đồng kho thay đổi.
          </p>
          <p className="mt-4 text-[12px] text-slate-500">
            © Honda Việt Nam · LOG Twin DSS · Báo cáo tự động · ~{narrativeWordCount}+ từ khung tư
            vấn · Nguồn: {SOURCES.word}; {SOURCES.excel}; {SOURCES.ppt}.
          </p>
        </div>
      </section>

      {/* Print footer note */}
      <div className="no-print mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[4px] border border-[#dce3ec] bg-[#f7f9fc] px-4 py-3 text-[12px] text-slate-600">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#b8954a]" />
          Dùng <strong className="text-[#071428]">In / Xuất PDF</strong> (Ctrl+P) — chọn “Save as
          PDF”, bật background graphics để giữ màu bìa navy.
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="btn-bank-gold inline-flex items-center gap-1.5 px-4 py-2 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          Xuất PDF ngay
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-end gap-3 border-b border-[#071428]/10 pb-3">
      <span className="font-mono text-2xl font-bold tabular-nums text-[#b8954a]">{n}</span>
      <h3 className="pb-0.5 text-lg font-bold tracking-tight text-[#071428] sm:text-xl">
        {title}
      </h3>
    </div>
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
    <div className={`rounded-[3px] border px-3 py-2.5 text-[12.5px] leading-relaxed ${styles[tone]}`}>
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
        <AlertTriangle className="h-3 w-3" />
        {title}
      </div>
      <div className="mt-1 text-slate-700">{children}</div>
    </div>
  );
}
