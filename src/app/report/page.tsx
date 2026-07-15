"use client";

import { useTwinStore } from "@/lib/store";
import { ASSUMPTIONS, SOURCES } from "@/lib/data/projectData";
import { fmt, fmtPct } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionHeader, MetricRow } from "@/components/ui/section-header";
import { Kpi } from "@/components/ui/kpi";
import { FileText, Printer } from "lucide-react";
import Link from "next/link";

export default function ReportPage() {
  const { result, params } = useTwinStore();
  const a = result.annual;
  const peak = result.months.reduce((b, m) => (m.baseOver > b.baseOver ? m : b));
  const redMonths = result.months.filter((m) => m.classification === "red").map((m) => m.month);

  const execSummary = [
    {
      h: "1. Bối cảnh & câu hỏi quyết định",
      p: `Chương trình tối ưu năng lực kho xe máy miền Bắc mùa cao điểm Honda Việt Nam kết nối nghiên cứu stacking (${SOURCES.word}), workbook logistics 103Ki 2QFC (${SOURCES.excel}) và slide LOG Unit Yamagomori (${SOURCES.ppt}). Câu hỏi không phải stacking có hấp dẫn khái niệm hay không, mà trong điều kiện định lượng nào thì stacking, thuê ngoài Bắc hoặc chuyển Bắc–Nam tối thiểu hóa tổng chi phí mạng lưới mà vẫn bảo vệ service level và claim chất lượng.`,
    },
    {
      h: "2. Capacity & stacking nhập khẩu",
      p: `Fact Cap mô hình ${fmt(params.factCap)} xe; footprint unpack ${params.unpackM2} m²/xe, stack ${params.stackM2} m²/xe → relief ${fmtPct((params.unpackM2 - params.stackM2) / params.unpackM2)}. Import năm ${fmt(a.importVol)} xe @ stack ${fmtPct(params.importStackRatio, 0)} tạo ${fmt(a.importRelief)} capacity tương đương và ~${fmt(a.m2Saved)} m² sàn. Cùng hướng PPT (~${ASSUMPTIONS.pptStackingSaveBn} tỷ/năm, ~${fmt(ASSUMPTIONS.cbuWhM2)} m² CBU) và Excel budget line −${ASSUMPTIONS.excelStackingSaveBn} tỷ.`,
    },
    {
      h: "3. Residual & chính sách nội địa",
      p: `Chỉ stack NK không khép peak. Dưới chuẩn ${params.useTtlCapacity ? "TTL Cap Excel" : "Fact Cap Word"}, tháng over gốc cao nhất ${peak.month} (${fmt(peak.baseOver)} → residual ${fmt(peak.residualAfterImport)} sau stack). Transfer ${fmtPct(params.transferRatio, 0)} → outsource residual tháng đó ${fmt(peak.outsourceVol)}; năm: thuê ngoài ${fmt(a.baseOutsourceVol)} → ${fmt(a.outsourceVol)} (giảm ${fmt(a.outsourceReduction)}). Tháng đỏ: ${redMonths.join(", ") || "không"}.`,
    },
    {
      h: "4. Vận tải & equipment",
      p: `Container N→S: ${fmt(a.nsContainersBase)} @ ${params.casesPerContainerNS} kiện × ${params.mcPerCase} xe/kiện vs ${fmt(a.nsContainersExcel)} @ workbook ${params.mcPerContainerExcel} xe/cont. Return ${params.casesPerContainerReturn} kiện/cont → ${fmt(a.returnContainers)} cont return. Case pool đỉnh ~${fmt(a.peakCasePool)} kiện với chu kỳ ${params.leadTimeDays}+${params.freeTimeDays} ngày. Bỏ qua case pool = thất bại vận hành dù cont chiều đi đủ.`,
    },
    {
      h: "5. Tài chính",
      p: `Baseline (toàn over → thuê+bonus): ${fmt(a.baselineCost / 1e9, 2)} tỷ VND. Chính sách tối ưu: ${fmt(a.totalCost / 1e9, 2)} tỷ → tiết kiệm mô hình ${fmt(a.totalSavings / 1e9, 2)} tỷ. Capex stacking ${fmt(params.cost.stackCapex / 1e9, 2)} tỷ → ROI ${fmtPct(a.roi)}, payback ${Number.isFinite(a.paybackMonths) ? fmt(a.paybackMonths, 1) + " tháng" : "không đạt"}, NPV 3 năm ${fmt(a.npv / 1e9, 2)} tỷ @ r=${fmtPct(params.cost.discountRate)}. Cường độ: ${fmt(a.costPerVehicle)} VND/xe · ${fmt(a.costPerM2)} VND/m². Break-even transfer unit max ${fmt(a.breakEvenTransferUnitCost)} VND/xe.`,
    },
    {
      h: "6. Hai chuẩn capacity",
      p: `Word sizing over theo Fact Cap ${fmt(ASSUMPTIONS.factCapNorth)} (peak gap ~50k Aug). Excel Rental WH theo TTL ${fmt(ASSUMPTIONS.ttlCapNorth)} (gồm open + HNM) → residual nhỏ hơn, tập trung Dec–Mar. Cả hai nhất quán nội bộ; chọn sai baseline sẽ đánh giá thấp/n thr phồng khẩn cấp thuê ngoài. Footprint: Word 1,7/1,0 vs Excel dài hạn 1,6 m²/xe Bắc.`,
    },
    {
      h: "7. Khuyến nghị phân tầng",
      p: `Thứ nhất, thể chế hóa stacking NK + kiểm soát claim. Thứ hai, phân loại tháng xanh–vàng–đỏ theo residual; pre-book cont & case pool T-4 trước cụm đỏ. Thứ ba, mở rộng transfer chỉ khi chi phí tránh được Bắc > transfer all-in. Thứ tư, Digital Twin hàng tuần mùa cao điểm. Stacking là điều kiện cần; transfer chọn lọc + reverse logistics sizing + quản trị total network cost là đủ.`,
    },
  ];

  const wordCount = execSummary.map((s) => s.p).join(" ").split(/\s+/).length;

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="Báo cáo · Board pack"
        title="Báo cáo tư vấn chuyên sâu"
        subtitle="Văn bản tư vấn sống — tái sinh từ Digital Twin · phong cách tư vấn, bám số Excel/Word/PPT."
        actions={
          <div className="flex gap-2 no-print">
            <Link href="/recommendations" className="btn-bank-outline px-3 py-2 text-xs">
              Khuyến nghị
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-bank inline-flex items-center gap-1.5 px-4 py-2 text-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              In / PDF
            </button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Tiết kiệm" value={`${fmt(a.totalSavings / 1e9, 2)} tỷ`} tone="good" icon={FileText} />
        <Kpi label="ROI" value={fmtPct(a.roi)} tone="accent" />
        <Kpi label="NPV 3y" value={`${fmt(a.npv / 1e9, 2)} tỷ`} />
        <Kpi label="Giảm outsource" value={fmt(a.outsourceReduction)} sub="xe-eq" />
      </div>

      <MetricRow
        items={[
          { label: "Import", value: fmt(a.importVol) },
          { label: "Relief", value: fmt(a.importRelief) },
          { label: "Transfer", value: fmt(a.transferVol) },
          { label: "Cont N→S", value: fmt(a.nsContainersBase) },
        ]}
      />

      <Card className="no-print">
        <CardHeader>
          <CardTitle>Mục lục nhanh</CardTitle>
          <CardDescription>Bảy mục tường thuật điều hành</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-1 text-sm text-slate-700 sm:grid-cols-2">
            {execSummary.map((s) => (
              <li key={s.h} className="rounded-[3px] border border-[#eef2f6] bg-[#f7f9fc] px-3 py-2">
                {s.h}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card accent>
        <CardHeader>
          <div className="section-kicker">Executive narrative</div>
          <CardTitle>
            Tối ưu kho miền Bắc mùa cao điểm — Tường thuật điều hành
          </CardTitle>
          <CardDescription>
            Tham số: stack {fmtPct(params.importStackRatio, 0)} · transfer {fmtPct(params.transferRatio, 0)} ·{" "}
            {params.useTtlCapacity ? "TTL Cap" : "Fact Cap"}
          </CardDescription>
        </CardHeader>
        <CardContent className="prose-report max-w-none space-y-6">
          {execSummary.map((s) => (
            <section key={s.h}>
              <h2 className="mb-2 text-base font-bold text-[#071428]">{s.h}</h2>
              <p className="text-[13.5px] leading-[1.85] text-slate-700">{s.p}</p>
            </section>
          ))}

          <div className="mt-8 overflow-x-auto rounded-[3px] border border-[#dce3ec]">
            <table className="table-dark w-full text-left text-sm">
              <thead>
                <tr>
                  <th>Chỉ số</th>
                  <th>Giá trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f6]">
                {[
                  ["Baseline cost", `${fmt(a.baselineCost / 1e9, 2)} tỷ`],
                  ["Optimized cost", `${fmt(a.totalCost / 1e9, 2)} tỷ`],
                  ["Savings", `${fmt(a.totalSavings / 1e9, 2)} tỷ`],
                  ["m² saved", fmt(a.m2Saved)],
                  ["Peak case pool", fmt(a.peakCasePool)],
                  ["Payback", Number.isFinite(a.paybackMonths) ? `${fmt(a.paybackMonths, 1)} tháng` : "—"],
                ].map(([k, v]) => (
                  <tr key={k as string}>
                    <td className="font-semibold text-[#071428]">{k}</td>
                    <td className="tabular-nums font-bold">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            Số từ ≈ {wordCount}. Nguồn: {SOURCES.word}; {SOURCES.excel}; {SOURCES.ppt}. Báo cáo tái
            tính mỗi khi chỉnh Twin — không phải file tĩnh.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
