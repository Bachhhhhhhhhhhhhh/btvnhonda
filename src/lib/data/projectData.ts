/**
 * Project knowledge base — sourced from:
 * - Bài toán tối ưu log packing miền Bắc.docx
 * - MC DOM_BUDGET 103Ki 2QFC_update Jun.xlsx
 * - UNTITLED.pptx (LOG Unit Yamagomori, Apr 26)
 */

export const MONTHS = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
] as const;

export type Month = (typeof MONTHS)[number];

/** Rental WH!F11:Q11 — Import units (103Ki 2QFC) */
export const IMPORT_VOLUME: Record<Month, number> = {
  Apr: 6503,
  May: 2738,
  Jun: 3575,
  Jul: 10786,
  Aug: 13891,
  Sep: 12579,
  Oct: 11584,
  Nov: 12494,
  Dec: 9869,
  Jan: 9191,
  Feb: 8682,
  Mar: 4568,
};

/** Word Table 9 — Over capacity vs Fact Cap 17,680 (management view) */
export const OVER_FACT_CAP: Record<Month, number> = {
  Apr: 2518,
  May: 10876,
  Jun: 25776,
  Jul: 46324,
  Aug: 49960,
  Sep: 49124,
  Oct: 37378,
  Nov: 37421,
  Dec: 41234,
  Jan: 41986,
  Feb: 41752,
  Mar: 28630,
};

/**
 * Rental WH data_only Max stock on hand (row 54) — physical peak approximation.
 * Peak months Dec–Mar show pressure under TTL capacity 28,495.
 */
export const MAX_STOCK_ON_HAND: Record<Month, number> = {
  Apr: 18060,
  May: 18136,
  Jun: 16216,
  Jul: 21084,
  Aug: 25602,
  Sep: 25227,
  Oct: 24686,
  Nov: 24712,
  Dec: 35029,
  Jan: 44494,
  Feb: 44364,
  Mar: 36344,
};

/** Excel over capacity using TTL cap 28,495 (row 60, data_only) */
export const OVER_TTL_CAP: Record<Month, number> = {
  Apr: 0,
  May: 0,
  Jun: 0,
  Jul: 0,
  Aug: 0,
  Sep: 0,
  Oct: 0,
  Nov: 0,
  Dec: 6500,
  Jan: 16000,
  Feb: 15900,
  Mar: 7800,
};

export const ASSUMPTIONS = {
  /** Word problem statement */
  unpackM2: 1.7,
  stackM2: 1.0,
  /** Rental WH!S110 North budget driver */
  excelNorthM2: 1.6,
  /** Rental WH!S112 South */
  excelSouthM2: 2.0,
  factCapNorth: 17680,
  ttlCapNorth: 28495,
  maxLayers: 3,
  mcPerCaseMin: 2,
  mcPerCaseMax: 4,
  mcPerCaseMix: 3.5, // To South&Sum!X1
  casesPerContainerNS: 12,
  mcPerContainerBase: 42, // 12 * 3.5
  mcPerContainerExcel: 46.6, // To South&Sum!Z1
  casesPerContainerReturn: 80,
  leadTimeDays: 7,
  freeTimeDays: 3,
  cycleDays: 10,
  northImportRatio: 0.3, // Rental WH!S45
  /** PPT: ~3B VND/year stacking benefit */
  pptStackingSaveBn: 3.0,
  /** Excel Rental WH!C123 Stacking case allocation */
  excelStackingSaveBn: 2.62,
  /** PPT CBU WH ~10,000 m2 */
  cbuWhM2: 10000,
  /** Network caps from PPT slide 1 (100%) */
  nationwideCap100: 60961,
  northCap100: 22961,
  centralCap100: 13500,
  southCap100: 24500,
  hvnOwnedCap: 15993,
  outsideCap: 32800,
} as const;

/** Default cost rates (VND) — placeholders until Finance rate card locked */
export const DEFAULT_COST_RATES = {
  /** VND per MC-month for North outsource/temp rental */
  northOutsourcePerMcMonth: 150_000,
  /** Bonus peak surcharge VND per over MC */
  bonusPerOverMc: 80_000,
  /** Domestic packing/stacking VND per MC */
  packingPerMc: 45_000,
  /** N-S sea case freight VND per MC (approx from To South unit costs ~350k) */
  nsFreightPerMc: 350_000,
  /** S-N empty case return VND per case */
  returnPerCase: 25_000,
  /** South incremental WH VND per MC-month */
  southWhPerMcMonth: 55_000,
  /** Risk premium as fraction of transfer cost */
  riskPremiumRate: 0.03,
  /** Stacking operational cost VND per import MC */
  importStackCostPerMc: 12_000,
  /** Discount rate for NPV */
  discountRate: 0.1,
  /** Capex for stacking layout/SOP (VND) */
  stackCapex: 500_000_000,
};

export const IMPORT_BY_MODEL = {
  "Vario 125": 85356,
  EV: 11676,
  K4HA: 4860,
  Others: 4568,
} as const;

export const SOURCES = {
  word: "Bài toán tối ưu log packing miền Bắc.docx",
  excel: "MC DOM_BUDGET 103Ki 2QFC_update Jun.xlsx",
  ppt: "UNTITLED.pptx (LOG Unit Yamagomori, Apr 26)",
} as const;

export function totalImport(): number {
  return MONTHS.reduce((s, m) => s + IMPORT_VOLUME[m], 0);
}

export function monthIndex(m: Month): number {
  return MONTHS.indexOf(m);
}
