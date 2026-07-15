/**
 * Digital Twin + Optimization Engine
 * Formulas cross-checked against Word report tables and Excel Rental WH / To South&Sum.
 */

import {
  ASSUMPTIONS,
  DEFAULT_COST_RATES,
  IMPORT_VOLUME,
  MAX_STOCK_ON_HAND,
  MONTHS,
  OVER_FACT_CAP,
  OVER_TTL_CAP,
  type Month,
} from "@/lib/data/projectData";

export type TwinParams = {
  unpackM2: number;
  stackM2: number;
  factCap: number;
  ttlCap: number;
  mcPerCase: number;
  casesPerContainerNS: number;
  mcPerContainerExcel: number;
  casesPerContainerReturn: number;
  leadTimeDays: number;
  freeTimeDays: number;
  /** Fraction of import stacked 0–1 */
  importStackRatio: number;
  /** Fraction of residual after import stack that is transferred N→S 0–1 */
  transferRatio: number;
  /** Use Excel TTL over (true) or Word Fact Cap over (false) */
  useTtlCapacity: boolean;
  cost: typeof DEFAULT_COST_RATES;
};

export type MonthResult = {
  month: Month;
  importVol: number;
  importRelief: number;
  baseOver: number;
  residualAfterImport: number;
  transferVol: number;
  outsourceVol: number;
  cases: number;
  nsContainersBase: number;
  nsContainersExcel: number;
  returnContainers: number;
  casePool: number;
  m2Saved: number;
  northRentalCost: number;
  packingCost: number;
  freightCost: number;
  returnCost: number;
  southWhCost: number;
  riskCost: number;
  importStackCost: number;
  bonusCost: number;
  totalCost: number;
  avoidedCost: number;
  netBenefit: number;
  classification: "green" | "amber" | "red";
};

export type TwinSummary = {
  params: TwinParams;
  months: MonthResult[];
  annual: {
    importVol: number;
    importRelief: number;
    m2Saved: number;
    capacityIncreasePct: number;
    transferVol: number;
    outsourceVol: number;
    baseOutsourceVol: number;
    outsourceReduction: number;
    nsContainersBase: number;
    nsContainersExcel: number;
    returnContainers: number;
    peakCasePool: number;
    totalCost: number;
    baselineCost: number;
    totalSavings: number;
    costPerVehicle: number;
    costPerM2: number;
    roi: number;
    paybackMonths: number;
    npv: number;
    breakEvenTransferUnitCost: number;
    warehouseUtilPeak: number;
    containerUtil: number;
  };
  scenarios: {
    asIs: number;
    importOnly: number;
    fullStackTheory: number;
    optimized: number;
  };
};

export function defaultParams(): TwinParams {
  return {
    unpackM2: ASSUMPTIONS.unpackM2,
    stackM2: ASSUMPTIONS.stackM2,
    factCap: ASSUMPTIONS.factCapNorth,
    ttlCap: ASSUMPTIONS.ttlCapNorth,
    mcPerCase: ASSUMPTIONS.mcPerCaseMix,
    casesPerContainerNS: ASSUMPTIONS.casesPerContainerNS,
    mcPerContainerExcel: ASSUMPTIONS.mcPerContainerExcel,
    casesPerContainerReturn: ASSUMPTIONS.casesPerContainerReturn,
    leadTimeDays: ASSUMPTIONS.leadTimeDays,
    freeTimeDays: ASSUMPTIONS.freeTimeDays,
    importStackRatio: 1,
    transferRatio: 0.35,
    useTtlCapacity: false,
    cost: { ...DEFAULT_COST_RATES },
  };
}

/** Word: Import relief = Import × (1.7 − 1.0) / 1.7 */
export function importRelief(
  importVol: number,
  unpackM2: number,
  stackM2: number
): number {
  if (unpackM2 <= 0) return 0;
  return importVol * ((unpackM2 - stackM2) / unpackM2);
}

export function mcPerContainerBase(
  casesPerContainer: number,
  mcPerCase: number
): number {
  return casesPerContainer * mcPerCase;
}

export function classify(residual: number): "green" | "amber" | "red" {
  if (residual <= 0) return "green";
  if (residual < 30000) return "amber";
  return "red";
}

export function simulate(params: TwinParams): TwinSummary {
  const {
    unpackM2,
    stackM2,
    factCap,
    ttlCap,
    mcPerCase,
    casesPerContainerNS,
    mcPerContainerExcel,
    casesPerContainerReturn,
    leadTimeDays,
    freeTimeDays,
    importStackRatio,
    transferRatio,
    useTtlCapacity,
    cost,
  } = params;

  const cycle = leadTimeDays + freeTimeDays;
  const mcPerContBase = mcPerContainerBase(casesPerContainerNS, mcPerCase);
  const m2ReliefPerMc = Math.max(0, unpackM2 - stackM2);

  const months: MonthResult[] = MONTHS.map((month) => {
    const importVol = IMPORT_VOLUME[month];
    const baseOver = useTtlCapacity
      ? OVER_TTL_CAP[month]
      : OVER_FACT_CAP[month];
    const relief =
      importRelief(importVol, unpackM2, stackM2) * importStackRatio;
    const residualAfterImport = Math.max(0, baseOver - relief);
    const transferVol = residualAfterImport * transferRatio;
    const outsourceVol = Math.max(0, residualAfterImport - transferVol);
    const cases = mcPerCase > 0 ? transferVol / mcPerCase : 0;
    const nsContainersBase =
      mcPerContBase > 0 ? transferVol / mcPerContBase : 0;
    const nsContainersExcel =
      mcPerContainerExcel > 0 ? transferVol / mcPerContainerExcel : 0;
    const returnContainers =
      casesPerContainerReturn > 0 ? cases / casesPerContainerReturn : 0;
    const casePool = cases > 0 ? (cases / 30) * cycle : 0;
    const m2Saved = importVol * importStackRatio * m2ReliefPerMc;

    const northRentalCost = outsourceVol * cost.northOutsourcePerMcMonth;
    const bonusCost = outsourceVol * cost.bonusPerOverMc;
    const packingCost = transferVol * cost.packingPerMc;
    const freightCost = transferVol * cost.nsFreightPerMc;
    const returnCost = cases * cost.returnPerCase;
    const southWhCost = transferVol * cost.southWhPerMcMonth;
    const riskCost =
      (packingCost + freightCost + returnCost) * cost.riskPremiumRate;
    const importStackCost =
      importVol * importStackRatio * cost.importStackCostPerMc;

    const totalCost =
      northRentalCost +
      bonusCost +
      packingCost +
      freightCost +
      returnCost +
      southWhCost +
      riskCost +
      importStackCost;

    const avoidedOutsource = baseOver - outsourceVol;
    const avoidedCost =
      avoidedOutsource *
      (cost.northOutsourcePerMcMonth + cost.bonusPerOverMc);
    const netBenefit = avoidedCost - totalCost + northRentalCost + bonusCost;

    return {
      month,
      importVol,
      importRelief: relief,
      baseOver,
      residualAfterImport,
      transferVol,
      outsourceVol,
      cases,
      nsContainersBase,
      nsContainersExcel,
      returnContainers,
      casePool,
      m2Saved,
      northRentalCost,
      packingCost,
      freightCost,
      returnCost,
      southWhCost,
      riskCost,
      importStackCost,
      bonusCost,
      totalCost,
      avoidedCost,
      netBenefit,
      classification: classify(residualAfterImport),
    };
  });

  const sum = (fn: (m: MonthResult) => number) =>
    months.reduce((s, m) => s + fn(m), 0);

  const annualImport = sum((m) => m.importVol);
  const annualRelief = sum((m) => m.importRelief);
  const annualM2 = sum((m) => m.m2Saved);
  const annualTransfer = sum((m) => m.transferVol);
  const annualOutsource = sum((m) => m.outsourceVol);
  const baseOutsource = sum((m) => m.baseOver);
  const totalCost = sum((m) => m.totalCost);

  // Baseline: no stacking, no transfer — all base over outsourced
  const baselineCost = baseOutsource * (
    cost.northOutsourcePerMcMonth + cost.bonusPerOverMc
  );

  const totalSavings = baselineCost - totalCost;
  const capacityIncreasePct =
    stackM2 > 0 ? unpackM2 / stackM2 - 1 : 0;

  // Peak warehouse utilization vs fact or ttl
  const peakStock = Math.max(...MONTHS.map((m) => MAX_STOCK_ON_HAND[m]));
  const activeCap = useTtlCapacity ? ttlCap : factCap;
  const warehouseUtilPeak = activeCap > 0 ? peakStock / activeCap : 0;

  // ROI / Payback / NPV (simple annual)
  const capex = cost.stackCapex;
  const roi = capex > 0 ? totalSavings / capex : 0;
  const paybackMonths =
    totalSavings > 0 ? (capex / totalSavings) * 12 : Infinity;
  const r = cost.discountRate;
  // 3-year NPV assuming constant annual savings
  let npv = -capex;
  for (let y = 1; y <= 3; y++) {
    npv += totalSavings / Math.pow(1 + r, y);
  }

  // Break-even: max transfer unit cost such that avoided = transfer
  const avoidedUnit =
    cost.northOutsourcePerMcMonth + cost.bonusPerOverMc;
  const breakEvenTransferUnitCost = avoidedUnit;

  const peakCasePool = Math.max(...months.map((m) => m.casePool), 0);
  const nsContBase = sum((m) => m.nsContainersBase);
  const nsContExcel = sum((m) => m.nsContainersExcel);
  const returnCont = sum((m) => m.returnContainers);

  // Scenario peaks (outsource peak month Aug for Fact Cap view)
  const peakIdx = months.reduce(
    (best, m, i) => (m.baseOver > months[best].baseOver ? i : best),
    0
  );
  const peak = months[peakIdx];
  const fullStackEffCap = factCap * (unpackM2 / stackM2);
  const fullStackResidual = Math.max(
    0,
    peak.baseOver + factCap - fullStackEffCap
  );

  return {
    params,
    months,
    annual: {
      importVol: annualImport,
      importRelief: annualRelief,
      m2Saved: annualM2,
      capacityIncreasePct,
      transferVol: annualTransfer,
      outsourceVol: annualOutsource,
      baseOutsourceVol: baseOutsource,
      outsourceReduction: baseOutsource - annualOutsource,
      nsContainersBase: nsContBase,
      nsContainersExcel: nsContExcel,
      returnContainers: returnCont,
      peakCasePool,
      totalCost,
      baselineCost,
      totalSavings,
      costPerVehicle:
        annualImport + annualTransfer > 0
          ? totalCost / (annualImport + annualTransfer)
          : 0,
      costPerM2: annualM2 > 0 ? totalCost / annualM2 : 0,
      roi,
      paybackMonths,
      npv,
      breakEvenTransferUnitCost,
      warehouseUtilPeak,
      containerUtil: mcPerContBase / ASSUMPTIONS.mcPerContainerExcel,
    },
    scenarios: {
      asIs: peak.baseOver,
      importOnly: peak.residualAfterImport,
      fullStackTheory: fullStackResidual,
      optimized: peak.outsourceVol,
    },
  };
}

/** Monte Carlo: sample key params and return distribution of savings */
export function monteCarlo(
  base: TwinParams,
  n = 500
): {
  samples: number[];
  mean: number;
  p10: number;
  p50: number;
  p90: number;
  std: number;
} {
  const samples: number[] = [];
  for (let i = 0; i < n; i++) {
    const p: TwinParams = {
      ...base,
      unpackM2: base.unpackM2 * (0.95 + Math.random() * 0.1),
      stackM2: base.stackM2 * (0.9 + Math.random() * 0.2),
      importStackRatio: clamp01(base.importStackRatio * (0.85 + Math.random() * 0.2)),
      transferRatio: clamp01(base.transferRatio * (0.7 + Math.random() * 0.6)),
      mcPerCase: clampNum(base.mcPerCase * (0.9 + Math.random() * 0.2), 2, 4),
      cost: {
        ...base.cost,
        northOutsourcePerMcMonth:
          base.cost.northOutsourcePerMcMonth * (0.8 + Math.random() * 0.4),
        nsFreightPerMc:
          base.cost.nsFreightPerMc * (0.85 + Math.random() * 0.35),
        bonusPerOverMc:
          base.cost.bonusPerOverMc * (0.7 + Math.random() * 0.6),
      },
    };
    samples.push(simulate(p).annual.totalSavings);
  }
  samples.sort((a, b) => a - b);
  const mean = samples.reduce((s, x) => s + x, 0) / samples.length;
  const variance =
    samples.reduce((s, x) => s + (x - mean) ** 2, 0) / samples.length;
  return {
    samples,
    mean,
    p10: samples[Math.floor(0.1 * (n - 1))],
    p50: samples[Math.floor(0.5 * (n - 1))],
    p90: samples[Math.floor(0.9 * (n - 1))],
    std: Math.sqrt(variance),
  };
}

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}
function clampNum(x: number, a: number, b: number) {
  return Math.min(b, Math.max(a, x));
}

/** Sensitivity: one-at-a-time ±% on key drivers */
export function sensitivity(base: TwinParams, pct = 0.2) {
  const baseSave = simulate(base).annual.totalSavings;
  const drivers: { key: string; low: number; high: number; impact: number }[] =
    [];

  const push = (
    key: string,
    lowParams: TwinParams,
    highParams: TwinParams
  ) => {
    const low = simulate(lowParams).annual.totalSavings;
    const high = simulate(highParams).annual.totalSavings;
    drivers.push({ key, low, high, impact: Math.abs(high - low) });
  };

  push(
    "North outsource rate",
    {
      ...base,
      cost: {
        ...base.cost,
        northOutsourcePerMcMonth:
          base.cost.northOutsourcePerMcMonth * (1 - pct),
      },
    },
    {
      ...base,
      cost: {
        ...base.cost,
        northOutsourcePerMcMonth:
          base.cost.northOutsourcePerMcMonth * (1 + pct),
      },
    }
  );
  push(
    "N→S freight rate",
    {
      ...base,
      cost: {
        ...base.cost,
        nsFreightPerMc: base.cost.nsFreightPerMc * (1 - pct),
      },
    },
    {
      ...base,
      cost: {
        ...base.cost,
        nsFreightPerMc: base.cost.nsFreightPerMc * (1 + pct),
      },
    }
  );
  push(
    "Transfer ratio",
    { ...base, transferRatio: clamp01(base.transferRatio * (1 - pct)) },
    { ...base, transferRatio: clamp01(base.transferRatio * (1 + pct)) }
  );
  push(
    "Import stack ratio",
    { ...base, importStackRatio: clamp01(base.importStackRatio * (1 - pct)) },
    { ...base, importStackRatio: clamp01(base.importStackRatio * (1 + pct)) }
  );
  push(
    "Stacked m²/MC",
    { ...base, stackM2: base.stackM2 * (1 + pct) },
    { ...base, stackM2: base.stackM2 * (1 - pct) }
  );
  push(
    "Bonus rate",
    {
      ...base,
      cost: {
        ...base.cost,
        bonusPerOverMc: base.cost.bonusPerOverMc * (1 - pct),
      },
    },
    {
      ...base,
      cost: {
        ...base.cost,
        bonusPerOverMc: base.cost.bonusPerOverMc * (1 + pct),
      },
    }
  );

  drivers.sort((a, b) => b.impact - a.impact);
  return { baseSave, drivers };
}
