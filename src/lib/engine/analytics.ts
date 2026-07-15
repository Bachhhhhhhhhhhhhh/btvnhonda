/**
 * Deep analytics layer on top of Digital Twin simulate()
 * — alerts, insights, grid search, contribution, cashflow, scorecard
 */

import {
  simulate,
  type TwinParams,
  type TwinSummary,
  type MonthResult,
} from "@/lib/engine/digitalTwin";
import { fmt, fmtPct } from "@/lib/utils";

export type AlertLevel = "critical" | "warning" | "info" | "good";

export type OpsAlert = {
  id: string;
  level: AlertLevel;
  title: string;
  detail: string;
  month?: string;
  metric?: string;
  action?: string;
  href?: string;
};

export type InsightItem = {
  id: string;
  category: "capacity" | "cost" | "policy" | "risk" | "equipment" | "finance";
  headline: string;
  body: string;
  impact: "high" | "medium" | "low";
  value?: string;
};

export type PolicyPreset = {
  id: string;
  name: string;
  description: string;
  patch: Partial<TwinParams> & { cost?: Partial<TwinParams["cost"]> };
};

export type OptimizeResult = {
  bestTransferRatio: number;
  bestStackRatio: number;
  bestSavings: number;
  bestCost: number;
  grid: {
    stack: number;
    transfer: number;
    savings: number;
    cost: number;
    outsource: number;
    cont: number;
  }[];
  recommendation: string;
};

export type ContributionRow = {
  name: string;
  amount: number;
  pct: number;
};

export type CashflowYear = {
  year: number;
  label: string;
  savings: number;
  capex: number;
  net: number;
  cumulative: number;
  discounted: number;
};

export type Scorecard = {
  overall: number; // 0-100
  dimensions: { key: string; label: string; score: number; note: string }[];
};

export const POLICY_PRESETS: PolicyPreset[] = [
  {
    id: "conservative",
    name: "Thận trọng",
    description: "Stack 70% · Transfer 15% · ưu tiên ổn định ops",
    patch: { importStackRatio: 0.7, transferRatio: 0.15 },
  },
  {
    id: "base",
    name: "Cơ sở (Base)",
    description: "Stack 100% · Transfer 35% — default đề xuất",
    patch: { importStackRatio: 1, transferRatio: 0.35 },
  },
  {
    id: "aggressive",
    name: "Tấn công peak",
    description: "Stack 100% · Transfer 70% — giảm thuê Bắc mạnh",
    patch: { importStackRatio: 1, transferRatio: 0.7 },
  },
  {
    id: "zero-os",
    name: "Zero outsource",
    description: "Benchmark kỹ thuật — transfer 100% residual",
    patch: { importStackRatio: 1, transferRatio: 1 },
  },
  {
    id: "ttl-view",
    name: "Góc nhìn TTL Cap",
    description: "Dùng over Excel TTL thay Fact Cap Word",
    patch: { useTtlCapacity: true, importStackRatio: 1, transferRatio: 0.35 },
  },
  {
    id: "import-only",
    name: "Chỉ stack NK",
    description: "Không transfer — đo benefit nhánh 1 thuần",
    patch: { importStackRatio: 1, transferRatio: 0 },
  },
];

export function unitEconomics(params: TwinParams) {
  const avoid =
    params.cost.northOutsourcePerMcMonth + params.cost.bonusPerOverMc;
  const transfer =
    params.cost.packingPerMc +
    params.cost.nsFreightPerMc +
    params.cost.southWhPerMcMonth +
    params.cost.returnPerCase / Math.max(params.mcPerCase, 0.01) +
    (params.cost.packingPerMc + params.cost.nsFreightPerMc) *
      params.cost.riskPremiumRate;
  return {
    avoid,
    transfer,
    margin: avoid - transfer,
    justified: transfer < avoid,
  };
}

export function buildAlerts(
  result: TwinSummary,
  params: TwinParams
): OpsAlert[] {
  const alerts: OpsAlert[] = [];
  const a = result.annual;
  const ue = unitEconomics(params);

  const red = result.months.filter((m) => m.classification === "red");
  const amber = result.months.filter((m) => m.classification === "amber");

  if (red.length >= 3) {
    alerts.push({
      id: "red-cluster",
      level: "critical",
      title: `${red.length} tháng residual đỏ liên tục áp lực`,
      detail: `Tháng: ${red.map((m) => m.month).join(", ")}. Cần pre-book cont & case pool T-4.`,
      action: "Mở Capacity / Transport",
      href: "/warehouse",
    });
  } else if (red.length > 0) {
    alerts.push({
      id: "red-months",
      level: "warning",
      title: `Tháng đỏ: ${red.map((m) => m.month).join(", ")}`,
      detail: `Residual ≥ 30.000 sau stack NK. Peak residual ${fmt(Math.max(...red.map((m) => m.residualAfterImport)))}.`,
      href: "/domestic",
    });
  }

  if (!ue.justified && params.transferRatio > 0.2) {
    alerts.push({
      id: "tf-uneconomic",
      level: "critical",
      title: "Transfer đang đắt hơn thuê ngoài Bắc",
      detail: `Unit TF ~${fmt(Math.round(ue.transfer))} vs avoid ${fmt(ue.avoid)} VND/xe. Cân nhắc giảm transfer ratio.`,
      action: "Giảm TF hoặc khóa rate card",
      href: "/domestic",
    });
  } else if (ue.justified && params.transferRatio < 0.25 && a.outsourceVol > 50000) {
    alerts.push({
      id: "tf-underused",
      level: "info",
      title: "Transfer còn biên — có thể tăng y_t",
      detail: `Biên unit +${fmt(Math.round(ue.margin))} VND/xe trong khi outsource năm ${fmt(a.outsourceVol)}.`,
      href: "/digital-twin",
    });
  }

  if (a.peakCasePool > 5000) {
    alerts.push({
      id: "case-pool",
      level: "warning",
      title: `Case pool đỉnh cao: ${fmt(a.peakCasePool)} kiện`,
      detail: `Chu kỳ ${params.leadTimeDays}+${params.freeTimeDays}n. Thiếu kiện rỗng sẽ đứt packing dù có container.`,
      href: "/container",
    });
  }

  if (a.nsContainersBase > 2000) {
    alerts.push({
      id: "cont-volume",
      level: "warning",
      title: `Nhu cầu cont N→S lớn: ${fmt(a.nsContainersBase)}/năm`,
      detail: `Excel fill @${params.mcPerContainerExcel}: ${fmt(a.nsContainersExcel)} cont. Cần book sớm với carrier.`,
      href: "/transport",
    });
  }

  if (a.totalSavings < 0) {
    alerts.push({
      id: "neg-savings",
      level: "critical",
      title: "Tiết kiệm mô hình đang âm",
      detail: `Baseline rẻ hơn policy hiện tại ${fmt(Math.abs(a.totalSavings) / 1e9, 2)} tỷ. Kiểm tra rate card / transfer.`,
      href: "/financial",
    });
  } else if (a.roi > 2) {
    alerts.push({
      id: "strong-roi",
      level: "good",
      title: `ROI stacking mạnh: ${fmtPct(a.roi)}`,
      detail: `NPV 3y ${fmt(a.npv / 1e9, 2)} tỷ · payback ${Number.isFinite(a.paybackMonths) ? fmt(a.paybackMonths, 1) + " tháng" : "—"}.`,
      href: "/financial",
    });
  }

  if (a.warehouseUtilPeak > 1.5) {
    alerts.push({
      id: "util-extreme",
      level: "critical",
      title: `Util peak ${fmtPct(a.warehouseUtilPeak)} — vượt capacity nghiêm trọng`,
      detail: "Stacking + transfer + outsource phải đồng bộ; không chỉ 1 đòn bẩy.",
      href: "/warehouse",
    });
  }

  if (params.importStackRatio < 0.5) {
    alerts.push({
      id: "low-stack",
      level: "info",
      title: "Tỷ lệ stack NK thấp — bỏ lỡ relief baseline",
      detail: `Hiện ${fmtPct(params.importStackRatio, 0)}. Full stack có thể tăng relief rõ (xem preset Base).`,
      href: "/import",
    });
  }

  if (amber.length >= 4 && red.length === 0) {
    alerts.push({
      id: "amber-spread",
      level: "info",
      title: `${amber.length} tháng vàng — monitor S&OP`,
      detail: amber.map((m) => m.month).join(", "),
      href: "/digital-twin",
    });
  }

  const order: Record<AlertLevel, number> = {
    critical: 0,
    warning: 1,
    info: 2,
    good: 3,
  };
  return alerts.sort((a, b) => order[a.level] - order[b.level]);
}

export function buildInsights(
  result: TwinSummary,
  params: TwinParams
): InsightItem[] {
  const a = result.annual;
  const ue = unitEconomics(params);
  const peak = result.months.reduce((b, m) =>
    m.baseOver > b.baseOver ? m : b
  );
  const costShare = contributionCosts(result);
  const topCost = costShare[0];

  const items: InsightItem[] = [
    {
      id: "i-relief",
      category: "capacity",
      impact: "high",
      headline: "Stacking NK giải phóng capacity tương đương",
      body: `Relief năm ${fmt(a.importRelief)} xe-eq (${fmtPct(a.importRelief / Math.max(a.importVol, 1))} import) và ${fmt(a.m2Saved)} m² sàn @ stack ${fmtPct(params.importStackRatio, 0)}.`,
      value: fmt(a.importRelief),
    },
    {
      id: "i-residual",
      category: "capacity",
      impact: "high",
      headline: `Peak residual sau stack: ${peak.month}`,
      body: `Over gốc ${fmt(peak.baseOver)} → residual ${fmt(peak.residualAfterImport)} → y=${fmt(peak.transferVol)} / z=${fmt(peak.outsourceVol)}.`,
      value: fmt(peak.residualAfterImport),
    },
    {
      id: "i-unit",
      category: "policy",
      impact: "high",
      headline: ue.justified
        ? "Transfer có biên kinh tế dương"
        : "Transfer không hòa vốn với rate card hiện tại",
      body: `Avoid ${fmt(ue.avoid)} vs TF ${fmt(Math.round(ue.transfer))} VND/xe (biên ${ue.margin >= 0 ? "+" : ""}${fmt(Math.round(ue.margin))}).`,
      value: `${ue.margin >= 0 ? "+" : ""}${fmt(Math.round(ue.margin))}`,
    },
    {
      id: "i-save",
      category: "finance",
      impact: "high",
      headline: `Tiết kiệm mô hình ${fmt(a.totalSavings / 1e9, 2)} tỷ VND/năm`,
      body: `Baseline ${fmt(a.baselineCost / 1e9, 2)} → tối ưu ${fmt(a.totalCost / 1e9, 2)} tỷ. ROI ${fmtPct(a.roi)} · NPV 3y ${fmt(a.npv / 1e9, 2)} tỷ.`,
      value: `${fmt(a.totalSavings / 1e9, 2)} tỷ`,
    },
    {
      id: "i-cost-driver",
      category: "cost",
      impact: "medium",
      headline: `Driver chi phí lớn nhất: ${topCost?.name ?? "—"}`,
      body: topCost
        ? `${fmt(topCost.amount / 1e9, 2)} tỷ (${fmtPct(topCost.pct)} tổng chi phí tối ưu).`
        : "",
      value: topCost ? fmtPct(topCost.pct) : undefined,
    },
    {
      id: "i-equip",
      category: "equipment",
      impact: "medium",
      headline: "Equipment N→S & reverse logistics",
      body: `Cont base ${fmt(a.nsContainersBase)} / Excel ${fmt(a.nsContainersExcel)} · return ${fmt(a.returnContainers)} · pool peak ${fmt(a.peakCasePool)}.`,
      value: fmt(a.nsContainersBase),
    },
    {
      id: "i-outsource-cut",
      category: "policy",
      impact: "medium",
      headline: `Giảm thuê ngoài ${fmt(a.outsourceReduction)} xe-eq`,
      body: `Từ ${fmt(a.baseOutsourceVol)} xuống ${fmt(a.outsourceVol)} (${fmtPct(a.outsourceReduction / Math.max(a.baseOutsourceVol, 1))} reduction).`,
      value: fmtPct(a.outsourceReduction / Math.max(a.baseOutsourceVol, 1)),
    },
    {
      id: "i-risk",
      category: "risk",
      impact: redMonthsCount(result) > 2 ? "high" : "low",
      headline:
        redMonthsCount(result) > 0
          ? `${redMonthsCount(result)} tháng đỏ cần war-room`
          : "Không có tháng đỏ với policy hiện tại",
      body:
        redMonthsCount(result) > 0
          ? `Chuỗi đỏ: ${result.months
              .filter((m) => m.classification === "red")
              .map((m) => m.month)
              .join(", ")}.`
          : "Vẫn monitor peak Dec–Mar nếu bật TTL Cap.",
    },
  ];

  return items;
}

function redMonthsCount(result: TwinSummary) {
  return result.months.filter((m) => m.classification === "red").length;
}

export function contributionCosts(result: TwinSummary): ContributionRow[] {
  const rows = [
    {
      name: "Thuê Bắc",
      amount: result.months.reduce((s, m) => s + m.northRentalCost, 0),
    },
    {
      name: "Bonus peak",
      amount: result.months.reduce((s, m) => s + m.bonusCost, 0),
    },
    {
      name: "Cước N→S",
      amount: result.months.reduce((s, m) => s + m.freightCost, 0),
    },
    {
      name: "Packing",
      amount: result.months.reduce((s, m) => s + m.packingCost, 0),
    },
    {
      name: "Return case",
      amount: result.months.reduce((s, m) => s + m.returnCost, 0),
    },
    {
      name: "Kho Nam",
      amount: result.months.reduce((s, m) => s + m.southWhCost, 0),
    },
    {
      name: "Risk premium",
      amount: result.months.reduce((s, m) => s + m.riskCost, 0),
    },
    {
      name: "Stack ops NK",
      amount: result.months.reduce((s, m) => s + m.importStackCost, 0),
    },
  ];
  const total = rows.reduce((s, r) => s + r.amount, 0) || 1;
  return rows
    .map((r) => ({ ...r, pct: r.amount / total }))
    .sort((a, b) => b.amount - a.amount);
}

/** Grid search optimal stack × transfer for max savings */
export function optimizePolicy(
  base: TwinParams,
  stackSteps = [0.5, 0.7, 0.85, 1],
  transferSteps = [0, 0.15, 0.25, 0.35, 0.5, 0.7, 0.85, 1]
): OptimizeResult {
  const grid: OptimizeResult["grid"] = [];
  let best = {
    bestTransferRatio: base.transferRatio,
    bestStackRatio: base.importStackRatio,
    bestSavings: -Infinity,
    bestCost: Infinity,
  };

  for (const stack of stackSteps) {
    for (const transfer of transferSteps) {
      const r = simulate({
        ...base,
        importStackRatio: stack,
        transferRatio: transfer,
        cost: { ...base.cost },
      });
      const row = {
        stack,
        transfer,
        savings: r.annual.totalSavings,
        cost: r.annual.totalCost,
        outsource: r.annual.outsourceVol,
        cont: r.annual.nsContainersBase,
      };
      grid.push(row);
      if (r.annual.totalSavings > best.bestSavings) {
        best = {
          bestTransferRatio: transfer,
          bestStackRatio: stack,
          bestSavings: r.annual.totalSavings,
          bestCost: r.annual.totalCost,
        };
      }
    }
  }

  const recommendation = `Policy tối ưu lưới: stack ${fmtPct(best.bestStackRatio, 0)} · transfer ${fmtPct(best.bestTransferRatio, 0)} → tiết kiệm ${fmt(best.bestSavings / 1e9, 2)} tỷ VND/năm (chi phí ${fmt(best.bestCost / 1e9, 2)} tỷ). So với Twin hiện tại để quyết định bước chuyển.`;

  return { ...best, grid, recommendation };
}

export function multiYearCashflow(
  result: TwinSummary,
  params: TwinParams,
  years = 5
): CashflowYear[] {
  const annual = result.annual.totalSavings;
  const capex = params.cost.stackCapex;
  const r = params.cost.discountRate;
  let cumulative = 0;
  const rows: CashflowYear[] = [];
  for (let y = 0; y <= years; y++) {
    const savings = y === 0 ? 0 : annual;
    const cap = y === 0 ? -capex : 0;
    const net = savings + cap;
    cumulative += net;
    const discounted = net / Math.pow(1 + r, y);
    rows.push({
      year: y,
      label: y === 0 ? "Y0" : `Y${y}`,
      savings,
      capex: cap,
      net,
      cumulative,
      discounted,
    });
  }
  return rows;
}

export function scorecard(result: TwinSummary, params: TwinParams): Scorecard {
  const a = result.annual;
  const ue = unitEconomics(params);
  const red = redMonthsCount(result);

  const dims = [
    {
      key: "savings",
      label: "Tiết kiệm",
      score: clampScore((a.totalSavings / 1e9 / 15) * 100), // ~15 tỷ = 100
      note: `${fmt(a.totalSavings / 1e9, 2)} tỷ VND`,
    },
    {
      key: "roi",
      label: "ROI",
      score: clampScore(a.roi * 40), // 2.5x = 100
      note: fmtPct(a.roi),
    },
    {
      key: "capacity",
      label: "Giảm outsource",
      score: clampScore(
        (a.outsourceReduction / Math.max(a.baseOutsourceVol, 1)) * 100
      ),
      note: fmtPct(a.outsourceReduction / Math.max(a.baseOutsourceVol, 1)),
    },
    {
      key: "unit",
      label: "Unit economics",
      score: ue.justified
        ? clampScore(50 + (ue.margin / Math.max(ue.avoid, 1)) * 100)
        : clampScore(40 - (Math.abs(ue.margin) / Math.max(ue.avoid, 1)) * 80),
      note: ue.justified ? "TF có biên" : "TF đắt",
    },
    {
      key: "risk",
      label: "Áp lực peak",
      score: clampScore(100 - red * 18),
      note: `${red} tháng đỏ`,
    },
    {
      key: "stack",
      label: "Mức stack NK",
      score: clampScore(params.importStackRatio * 100),
      note: fmtPct(params.importStackRatio, 0),
    },
  ];

  const overall = Math.round(
    dims.reduce((s, d) => s + d.score, 0) / dims.length
  );
  return { overall, dimensions: dims };
}

function clampScore(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function monthlyRiskMatrix(months: MonthResult[]) {
  return months.map((m) => ({
    month: m.month,
    residual: m.residualAfterImport,
    outsource: m.outsourceVol,
    transfer: m.transferVol,
    costBn: m.totalCost / 1e9,
    class: m.classification,
    score:
      m.classification === "red" ? 3 : m.classification === "amber" ? 2 : 1,
  }));
}

export function applyPreset(
  base: TwinParams,
  preset: PolicyPreset
): TwinParams {
  const { cost: costPatch, ...rest } = preset.patch;
  return {
    ...base,
    ...rest,
    cost: { ...base.cost, ...(costPatch ?? {}) },
  };
}

export function compareSummaries(a: TwinSummary, b: TwinSummary) {
  const keys = [
    "totalSavings",
    "totalCost",
    "outsourceVol",
    "transferVol",
    "nsContainersBase",
    "peakCasePool",
    "m2Saved",
    "roi",
    "npv",
  ] as const;
  return keys.map((k) => ({
    key: k,
    a: a.annual[k],
    b: b.annual[k],
    delta: b.annual[k] - a.annual[k],
  }));
}

export function heatmapTransferStack(base: TwinParams) {
  const stacks = [0.5, 0.75, 1];
  const transfers = [0, 0.25, 0.5, 0.75, 1];
  return stacks.flatMap((stack) =>
    transfers.map((transfer) => {
      const r = simulate({
        ...base,
        importStackRatio: stack,
        transferRatio: transfer,
        cost: { ...base.cost },
      });
      return {
        stack,
        transfer,
        savingsBn: +(r.annual.totalSavings / 1e9).toFixed(2),
        outsource: Math.round(r.annual.outsourceVol),
      };
    })
  );
}
