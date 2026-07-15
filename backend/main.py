"""
Honda LOG Digital Twin — FastAPI optimization engine
Mirrors the TypeScript engine for server-side / batch use.
"""

from __future__ import annotations

from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

MONTHS = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
]

IMPORT_VOLUME = {
    "Apr": 6503, "May": 2738, "Jun": 3575, "Jul": 10786,
    "Aug": 13891, "Sep": 12579, "Oct": 11584, "Nov": 12494,
    "Dec": 9869, "Jan": 9191, "Feb": 8682, "Mar": 4568,
}

OVER_FACT = {
    "Apr": 2518, "May": 10876, "Jun": 25776, "Jul": 46324,
    "Aug": 49960, "Sep": 49124, "Oct": 37378, "Nov": 37421,
    "Dec": 41234, "Jan": 41986, "Feb": 41752, "Mar": 28630,
}

OVER_TTL = {
    "Apr": 0, "May": 0, "Jun": 0, "Jul": 0, "Aug": 0, "Sep": 0,
    "Oct": 0, "Nov": 0, "Dec": 6500, "Jan": 16000, "Feb": 15900, "Mar": 7800,
}


class CostRates(BaseModel):
    northOutsourcePerMcMonth: float = 150_000
    bonusPerOverMc: float = 80_000
    packingPerMc: float = 45_000
    nsFreightPerMc: float = 350_000
    returnPerCase: float = 25_000
    southWhPerMcMonth: float = 55_000
    riskPremiumRate: float = 0.03
    importStackCostPerMc: float = 12_000
    discountRate: float = 0.1
    stackCapex: float = 500_000_000


class TwinParams(BaseModel):
    unpackM2: float = 1.7
    stackM2: float = 1.0
    factCap: float = 17_680
    ttlCap: float = 28_495
    mcPerCase: float = 3.5
    casesPerContainerNS: float = 12
    mcPerContainerExcel: float = 46.6
    casesPerContainerReturn: float = 80
    leadTimeDays: float = 7
    freeTimeDays: float = 3
    importStackRatio: float = Field(1.0, ge=0, le=1)
    transferRatio: float = Field(0.35, ge=0, le=1)
    useTtlCapacity: bool = False
    cost: CostRates = Field(default_factory=CostRates)


app = FastAPI(
    title="Honda LOG Digital Twin API",
    version="1.0.0",
    description="Optimization engine for North WH stacking / transfer / outsource",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def simulate(p: TwinParams) -> dict:
    cycle = p.leadTimeDays + p.freeTimeDays
    mc_base = p.casesPerContainerNS * p.mcPerCase
    m2_relief = max(0.0, p.unpackM2 - p.stackM2)
    months = []
    for m in MONTHS:
        imp = IMPORT_VOLUME[m]
        base_over = OVER_TTL[m] if p.useTtlCapacity else OVER_FACT[m]
        relief = (
            imp * ((p.unpackM2 - p.stackM2) / p.unpackM2) * p.importStackRatio
            if p.unpackM2 > 0
            else 0
        )
        residual = max(0.0, base_over - relief)
        transfer = residual * p.transferRatio
        outsource = max(0.0, residual - transfer)
        cases = transfer / p.mcPerCase if p.mcPerCase else 0
        ns_base = transfer / mc_base if mc_base else 0
        ns_xl = transfer / p.mcPerContainerExcel if p.mcPerContainerExcel else 0
        ret = cases / p.casesPerContainerReturn if p.casesPerContainerReturn else 0
        pool = (cases / 30.0) * cycle if cases else 0
        m2 = imp * p.importStackRatio * m2_relief

        north = outsource * p.cost.northOutsourcePerMcMonth
        bonus = outsource * p.cost.bonusPerOverMc
        packing = transfer * p.cost.packingPerMc
        freight = transfer * p.cost.nsFreightPerMc
        ret_c = cases * p.cost.returnPerCase
        south = transfer * p.cost.southWhPerMcMonth
        risk = (packing + freight + ret_c) * p.cost.riskPremiumRate
        stack_c = imp * p.importStackRatio * p.cost.importStackCostPerMc
        total = north + bonus + packing + freight + ret_c + south + risk + stack_c

        months.append(
            {
                "month": m,
                "importVol": imp,
                "importRelief": relief,
                "baseOver": base_over,
                "residualAfterImport": residual,
                "transferVol": transfer,
                "outsourceVol": outsource,
                "cases": cases,
                "nsContainersBase": ns_base,
                "nsContainersExcel": ns_xl,
                "returnContainers": ret,
                "casePool": pool,
                "m2Saved": m2,
                "totalCost": total,
            }
        )

    def s(key: str) -> float:
        return sum(x[key] for x in months)

    base_out = s("baseOver")
    total_cost = s("totalCost")
    baseline = base_out * (
        p.cost.northOutsourcePerMcMonth + p.cost.bonusPerOverMc
    )
    savings = baseline - total_cost
    capex = p.cost.stackCapex
    roi = savings / capex if capex else 0
    payback = (capex / savings) * 12 if savings > 0 else float("inf")
    npv = -capex
    for y in range(1, 4):
        npv += savings / ((1 + p.cost.discountRate) ** y)

    return {
        "months": months,
        "annual": {
            "importVol": s("importVol"),
            "importRelief": s("importRelief"),
            "m2Saved": s("m2Saved"),
            "transferVol": s("transferVol"),
            "outsourceVol": s("outsourceVol"),
            "baseOutsourceVol": base_out,
            "outsourceReduction": base_out - s("outsourceVol"),
            "nsContainersBase": s("nsContainersBase"),
            "nsContainersExcel": s("nsContainersExcel"),
            "returnContainers": s("returnContainers"),
            "peakCasePool": max(x["casePool"] for x in months),
            "totalCost": total_cost,
            "baselineCost": baseline,
            "totalSavings": savings,
            "roi": roi,
            "paybackMonths": payback,
            "npv": npv,
            "capacityIncreasePct": (p.unpackM2 / p.stackM2 - 1) if p.stackM2 else 0,
        },
    }


@app.get("/health")
def health():
    return {"status": "ok", "service": "honda-log-digital-twin"}


@app.post("/simulate")
def api_simulate(params: TwinParams):
    return simulate(params)


@app.get("/defaults")
def defaults():
    return TwinParams()
