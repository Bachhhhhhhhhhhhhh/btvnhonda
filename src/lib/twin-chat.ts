/**
 * Rule-based Twin Q&A — answers from live simulate() outputs
 */

import type { TwinParams, TwinSummary } from "@/lib/engine/digitalTwin";
import {
  optimizePolicy,
  unitEconomics,
  scorecard,
  buildAlerts,
} from "@/lib/engine/analytics";
import { ASSUMPTIONS } from "@/lib/data/projectData";
import { fmt, fmtPct } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  at: string;
};

export function answerTwinQuestion(
  q: string,
  result: TwinSummary,
  params: TwinParams
): string {
  const a = result.annual;
  const s = q.toLowerCase().normalize("NFC");
  const red = result.months.filter((m) => m.classification === "red");
  const ue = unitEconomics(params);
  const opt = optimizePolicy(params);
  const sc = scorecard(result, params);
  const alerts = buildAlerts(result, params);

  if (/tiết kiệm|savings|save|lợi ích|benefit/.test(s)) {
    return `Tiết kiệm mô hình hiện tại: **${fmt(a.totalSavings / 1e9, 2)} tỷ VND/năm** (baseline ${fmt(a.baselineCost / 1e9, 2)} → tối ưu ${fmt(a.totalCost / 1e9, 2)}). ROI ${fmtPct(a.roi)}, NPV 3 năm ${fmt(a.npv / 1e9, 2)} tỷ. Neo Excel ≈ ${ASSUMPTIONS.excelStackingSaveBn} tỷ · PPT ≈ ${ASSUMPTIONS.pptStackingSaveBn} tỷ.`;
  }
  if (/tháng đỏ|red month|peak|cao điểm|residual/.test(s)) {
    if (!red.length)
      return `Không có tháng residual **đỏ** với policy hiện tại (stack ${fmtPct(params.importStackRatio, 0)} · TF ${fmtPct(params.transferRatio, 0)}). Vẫn nên monitor Dec–Mar nếu bật TTL Cap.`;
    return `Có **${red.length} tháng đỏ**: ${red.map((m) => `${m.month} (residual ${fmt(m.residualAfterImport)})`).join("; ")}. Pre-book cont & case pool từ **T-4**. Case pool peak toàn năm: ${fmt(a.peakCasePool)} kiện.`;
  }
  if (/transfer|chuyển|n→s|bắc.?nam|y_t/.test(s)) {
    return `Transfer năm: **${fmt(a.transferVol)} xe** · Cont base ${fmt(a.nsContainersBase)} / Excel ${fmt(a.nsContainersExcel)}. Unit TF ~${fmt(Math.round(ue.transfer))} vs avoid ${fmt(ue.avoid)} VND/xe → ${ue.justified ? `có biên +${fmt(Math.round(ue.margin))}` : `đắt hơn ${fmt(Math.round(-ue.margin))}`}. Tỷ lệ TF slider: ${fmtPct(params.transferRatio, 0)}.`;
  }
  if (/outsource|thuê ngoài|z_t|thuê kho/.test(s)) {
    return `Thuê ngoài (z_t) năm: **${fmt(a.outsourceVol)}** xe-eq (giảm ${fmt(a.outsourceReduction)} so baseline ${fmt(a.baseOutsourceVol)}). Không nên KPI “z=0” tuyệt đối nếu unit economics transfer âm.`;
  }
  if (/stack|chồng|nhập khẩu|import|relief|m²|m2/.test(s)) {
    const rate = (params.unpackM2 - params.stackM2) / params.unpackM2;
    return `Stack NK @ ${fmtPct(params.importStackRatio, 0)}: relief **${fmt(a.importRelief)}** xe-eq · **${fmt(a.m2Saved)} m²**. Footprint ${params.unpackM2}→${params.stackM2} m²/xe (rate ${fmtPct(rate)}). Import năm ${fmt(a.importVol)}.`;
  }
  if (/tối ưu|optimizer|optimal|gợi ý|recommend|nên/.test(s)) {
    return `Optimizer lưới (max savings): stack **${fmtPct(opt.bestStackRatio, 0)}** · transfer **${fmtPct(opt.bestTransferRatio, 0)}** → **${fmt(opt.bestSavings / 1e9, 2)} tỷ** (Δ ${fmt((opt.bestSavings - a.totalSavings) / 1e9, 2)} tỷ vs Twin). Mở /insights để áp dụng 1 click.`;
  }
  if (/roi|npv|payback|hoàn vốn|tài chính|capex/.test(s)) {
    return `ROI **${fmtPct(a.roi)}** · Payback **${Number.isFinite(a.paybackMonths) ? fmt(a.paybackMonths, 1) + " tháng" : "∞"}** · NPV 3y **${fmt(a.npv / 1e9, 2)} tỷ** @ r=${fmtPct(params.cost.discountRate)}. Capex stacking ${fmt(params.cost.stackCapex / 1e9, 2)} tỷ.`;
  }
  if (/container|cont|case pool|kiện|return/.test(s)) {
    return `Cont N→S base **${fmt(a.nsContainersBase)}** / Excel **${fmt(a.nsContainersExcel)}** · Return cont **${fmt(a.returnContainers)}** · Case pool peak **${fmt(a.peakCasePool)}** (chu kỳ ${params.leadTimeDays}+${params.freeTimeDays}n, ${params.casesPerContainerReturn} kiện/cont return).`;
  }
  if (/health|score|điểm|cảnh báo|alert|rủi ro/.test(s)) {
    return `Health score **${sc.overall}/100**. Alerts: ${alerts.length} (critical ${alerts.filter((x) => x.level === "critical").length}). ${alerts[0] ? `Top: ${alerts[0].title}.` : "Không alert."}`;
  }
  if (/fact|ttl|capacity|năng lực|cap/.test(s)) {
    return `Chuẩn đang dùng: **${params.useTtlCapacity ? "TTL Cap" : "Fact Cap"}**. Fact ${fmt(params.factCap)} · TTL ${fmt(params.ttlCap)}. Util peak ${fmtPct(a.warehouseUtilPeak)}. Word Fact ${fmt(ASSUMPTIONS.factCapNorth)} · Excel TTL ${fmt(ASSUMPTIONS.ttlCapNorth)}.`;
  }
  if (/policy|tham số|param|hiện tại|đang/.test(s)) {
    return `Policy live: stack ${fmtPct(params.importStackRatio, 0)} · TF ${fmtPct(params.transferRatio, 0)} · mc/case ${fmt(params.mcPerCase, 1)} · ${params.useTtlCapacity ? "TTL" : "Fact"} · cước N→S ${fmt(params.cost.nsFreightPerMc)} · thuê Bắc ${fmt(params.cost.northOutsourcePerMcMonth)}.`;
  }
  if (/xin chào|hello|hi |help|giúp|làm gì/.test(s)) {
    return `Bạn có thể hỏi: **tiết kiệm**, **tháng đỏ**, **transfer**, **stack**, **optimizer**, **ROI/NPV**, **container**, **health**, **capacity**. Dữ liệu lấy từ Twin live — đổi slider rồi hỏi lại.`;
  }

  return `Chưa khớp câu hỏi cụ thể. Thử: "tiết kiệm bao nhiêu?", "tháng đỏ nào?", "nên transfer không?", "optimizer gợi ý gì?", "ROI?".\n\nTóm tắt nhanh: save ${fmt(a.totalSavings / 1e9, 2)} tỷ · S ${fmtPct(params.importStackRatio, 0)}/T ${fmtPct(params.transferRatio, 0)} · health ${sc.overall}.`;
}
