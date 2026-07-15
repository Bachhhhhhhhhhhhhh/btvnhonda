"use client";

import { useTwinStore } from "@/lib/store";
import { ASSUMPTIONS } from "@/lib/data/projectData";
import { fmt, fmtPct } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compare Twin live vs Excel/PPT/Word anchors */
export function BenchmarkPanel() {
  const { result, params } = useTwinStore();
  const a = result.annual;

  const rows = [
    {
      label: "Tiết kiệm stacking (tỷ)",
      twin: a.totalSavings / 1e9,
      anchor: ASSUMPTIONS.excelStackingSaveBn,
      anchorLabel: `Excel −${ASSUMPTIONS.excelStackingSaveBn}`,
      better: "higher" as const,
    },
    {
      label: "PPT neo (tỷ)",
      twin: a.totalSavings / 1e9,
      anchor: ASSUMPTIONS.pptStackingSaveBn,
      anchorLabel: `PPT ~${ASSUMPTIONS.pptStackingSaveBn}`,
      better: "higher" as const,
    },
    {
      label: "Import năm",
      twin: a.importVol,
      anchor: 106460,
      anchorLabel: "Excel R11 ≈ 106.460",
      better: "closer" as const,
    },
    {
      label: "Fact Cap",
      twin: params.factCap,
      anchor: ASSUMPTIONS.factCapNorth,
      anchorLabel: "Word 17.680",
      better: "closer" as const,
    },
    {
      label: "Xe/cont (base plan)",
      twin: params.casesPerContainerNS * params.mcPerCase,
      anchor: ASSUMPTIONS.mcPerContainerExcel,
      anchorLabel: `Excel ${ASSUMPTIONS.mcPerContainerExcel}`,
      better: "closer" as const,
    },
    {
      label: "Relief rate",
      twin: (params.unpackM2 - params.stackM2) / params.unpackM2,
      anchor: (1.7 - 1.0) / 1.7,
      anchorLabel: "Word 41.2%",
      better: "closer" as const,
      pct: true,
    },
  ];

  return (
    <div className="cc-panel overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)]">
      <div className="flex items-center gap-2 border-b border-[var(--line-soft)] px-4 py-3">
        <BookOpen className="h-4 w-4 text-[var(--gold)]" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
            Benchmark
          </div>
          <div className="text-sm font-extrabold text-[var(--ink)]">
            Twin vs Excel · PPT · Word
          </div>
        </div>
      </div>
      <div className="divide-y divide-[var(--line-soft)]">
        {rows.map((r) => {
          const twinV = r.pct ? r.twin * 100 : r.twin;
          const ancV = r.pct ? r.anchor * 100 : r.anchor;
          const delta = twinV - ancV;
          const ok =
            r.better === "higher"
              ? twinV >= ancV * 0.85
              : Math.abs(delta) / Math.max(Math.abs(ancV), 1) < 0.15;
          return (
            <div
              key={r.label}
              className="grid grid-cols-12 items-center gap-2 px-4 py-2.5 text-[12px]"
            >
              <div className="col-span-4 font-semibold text-[var(--muted)]">
                {r.label}
              </div>
              <div className="col-span-3 font-black tabular-nums text-[var(--ink)]">
                {r.pct ? fmtPct(r.twin) : fmt(r.twin, r.twin > 100 ? 0 : 2)}
              </div>
              <div className="col-span-3 text-[11px] text-[var(--muted)]">
                {r.anchorLabel}
              </div>
              <div
                className={cn(
                  "col-span-2 text-right font-bold tabular-nums",
                  ok
                    ? "text-teal-600 dark:text-teal-300"
                    : "text-amber-600 dark:text-amber-300"
                )}
              >
                {delta >= 0 ? "+" : ""}
                {r.pct ? fmt(delta, 1) + "pp" : fmt(delta, delta > 100 ? 0 : 2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
