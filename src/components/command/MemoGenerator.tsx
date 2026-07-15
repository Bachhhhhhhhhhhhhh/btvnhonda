"use client";

import { useMemo, useState } from "react";
import { useTwinStore } from "@/lib/store";
import {
  buildAlerts,
  optimizePolicy,
  scorecard,
  unitEconomics,
} from "@/lib/engine/analytics";
import { ASSUMPTIONS } from "@/lib/data/projectData";
import { fmt, fmtPct } from "@/lib/utils";
import { copyText } from "@/lib/workspace";
import { useToast } from "@/components/wow/ToastHost";
import { Copy, FileText, Check } from "lucide-react";

export function MemoGenerator() {
  const { result, params } = useTwinStore();
  const pushToast = useToast((s) => s.push);
  const [copied, setCopied] = useState(false);

  const memo = useMemo(() => {
    const a = result.annual;
    const sc = scorecard(result, params);
    const opt = optimizePolicy(params);
    const ue = unitEconomics(params);
    const alerts = buildAlerts(result, params);
    const red = result.months
      .filter((m) => m.classification === "red")
      .map((m) => m.month);
    const today = new Date().toLocaleDateString("vi-VN");

    return `MEMO NỘI BỘ — LOGISTICS / S&OP
Ngày: ${today}
Chủ đề: Tối ưu capacity kho miền Bắc — cập nhật Digital Twin

1. TÓM TẮT
Health score ${sc.overall}/100. Policy hiện tại: stack ${fmtPct(params.importStackRatio, 0)}, transfer ${fmtPct(params.transferRatio, 0)}, chuẩn ${params.useTtlCapacity ? "TTL Cap" : "Fact Cap"}.
Tiết kiệm mô hình: ${fmt(a.totalSavings / 1e9, 2)} tỷ VND/năm | ROI ${fmtPct(a.roi)} | NPV 3 năm ${fmt(a.npv / 1e9, 2)} tỷ | Payback ${Number.isFinite(a.paybackMonths) ? fmt(a.paybackMonths, 1) + " tháng" : "n/a"}.

2. VẬN HÀNH
- Import relief: ${fmt(a.importRelief)} xe-eq · ${fmt(a.m2Saved)} m²
- Outsource: ${fmt(a.outsourceVol)} (giảm ${fmt(a.outsourceReduction)} vs baseline)
- Transfer N→S: ${fmt(a.transferVol)} xe · Cont base ${fmt(a.nsContainersBase)} / Excel ${fmt(a.nsContainersExcel)}
- Case pool peak: ${fmt(a.peakCasePool)} kiện (LT ${params.leadTimeDays}+${params.freeTimeDays}n)
- Tháng residual đỏ: ${red.length ? red.join(", ") : "không"}

3. UNIT ECONOMICS
Transfer all-in ~${fmt(Math.round(ue.transfer))} VND/xe vs avoid ${fmt(ue.avoid)} VND/xe → ${ue.justified ? "CÓ BIÊN (+" + fmt(Math.round(ue.margin)) + ")" : "ÂM (" + fmt(Math.round(ue.margin)) + ")"}.

4. OPTIMIZER
Gợi ý lưới: stack ${fmtPct(opt.bestStackRatio, 0)} · TF ${fmtPct(opt.bestTransferRatio, 0)} → max ${fmt(opt.bestSavings / 1e9, 2)} tỷ (Δ ${fmt((opt.bestSavings - a.totalSavings) / 1e9, 2)} tỷ vs Twin).

5. ALERTS (${alerts.length})
${alerts
  .slice(0, 5)
  .map((x) => `- [${x.level.toUpperCase()}] ${x.title}`)
  .join("\n") || "- Không có alert"}

6. NEO TÀI LIỆU
Excel stacking line ≈ −${ASSUMPTIONS.excelStackingSaveBn} tỷ | PPT ≈ ${ASSUMPTIONS.pptStackingSaveBn} tỷ/năm | Fact Cap ${fmt(ASSUMPTIONS.factCapNorth)} | TTL ${fmt(ASSUMPTIONS.ttlCapNorth)}.

7. ĐỀ XUẤT HÀNH ĐỘNG
(1) Pilot stacking NK + SOP/RACI claim
(2) Lock rate card Finance trước cam kết ngân sách
(3) Pre-book cont/case pool tháng đỏ T-4
(4) Stress-test trên WSB trước scale transfer
(5) Chạy lại Twin khi tender/niguri đổi

— Sinh tự động từ LOG Twin DSS · không thay thế phê duyệt chính thức —
`;
  }, [result, params]);

  const onCopy = async () => {
    await copyText(memo);
    setCopied(true);
    pushToast({ title: "Đã copy memo", detail: "Dán vào email / Word", tone: "good" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cc-panel overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line-soft)] px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[var(--gold)]" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
              Memo generator
            </div>
            <div className="text-sm font-extrabold text-[var(--ink)]">
              Draft email / S&OP note
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="btn-bank-gold inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy memo"}
        </button>
      </div>
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap p-4 font-mono text-[11px] leading-relaxed text-[var(--muted)]">
        {memo}
      </pre>
    </div>
  );
}
