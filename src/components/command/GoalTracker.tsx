"use client";

import { useMemo } from "react";
import { useTwinStore } from "@/lib/store";
import { useWorkspaceStore } from "@/lib/workspace";
import { fmt, fmtPct } from "@/lib/utils";
import { Target, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

function bar(pct: number, good: boolean) {
  const w = Math.max(0, Math.min(100, pct * 100));
  return (
    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--bg)]">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          good ? "bg-teal-500" : "bg-amber-500"
        )}
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

export function GoalTracker() {
  const { result, params } = useTwinStore();
  const { goals, setGoal } = useWorkspaceStore();
  const a = result.annual;

  const rows = useMemo(() => {
    const savePct = goals.savingsBn > 0 ? a.totalSavings / 1e9 / goals.savingsBn : 0;
    const outPct =
      goals.outsourceMax > 0
        ? 1 - a.outsourceVol / goals.outsourceMax
        : 0;
    const stackPct =
      goals.stackMin > 0 ? params.importStackRatio / goals.stackMin : 0;
    const tfPct =
      goals.transferTarget > 0
        ? 1 - Math.abs(params.transferRatio - goals.transferTarget) / goals.transferTarget
        : 0;
    const roiPct = goals.roiMin > 0 ? a.roi / goals.roiMin : 0;
    return [
      {
        id: "save" as const,
        label: "Tiết kiệm (tỷ)",
        actual: `${fmt(a.totalSavings / 1e9, 2)}`,
        targetKey: "savingsBn" as const,
        target: goals.savingsBn,
        progress: savePct,
        ok: a.totalSavings / 1e9 >= goals.savingsBn,
        step: 0.5,
      },
      {
        id: "out" as const,
        label: "Outsource ≤ max",
        actual: fmt(a.outsourceVol),
        targetKey: "outsourceMax" as const,
        target: goals.outsourceMax,
        progress: Math.max(0, outPct),
        ok: a.outsourceVol <= goals.outsourceMax,
        step: 10000,
      },
      {
        id: "stack" as const,
        label: "Stack min",
        actual: fmtPct(params.importStackRatio, 0),
        targetKey: "stackMin" as const,
        target: goals.stackMin,
        progress: stackPct,
        ok: params.importStackRatio >= goals.stackMin,
        step: 0.05,
        pct: true,
      },
      {
        id: "roi" as const,
        label: "ROI min",
        actual: fmtPct(a.roi),
        targetKey: "roiMin" as const,
        target: goals.roiMin,
        progress: roiPct,
        ok: a.roi >= goals.roiMin,
        step: 0.1,
        pct: true,
      },
    ];
  }, [a, params, goals]);

  const hit = rows.filter((r) => r.ok).length;

  return (
    <div className="cc-panel rounded-xl border border-[var(--line)] bg-[var(--card)] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15 text-teal-600">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
              Goal tracker
            </div>
            <div className="text-sm font-extrabold text-[var(--ink)]">
              Mục tiêu vs Twin live
            </div>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-black",
            hit === rows.length
              ? "bg-teal-500/15 text-teal-700 dark:text-teal-300"
              : "bg-amber-500/15 text-amber-800 dark:text-amber-300"
          )}
        >
          {hit}/{rows.length} đạt
        </span>
      </div>

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id}>
            <div className="flex items-center justify-between gap-2 text-[12px]">
              <span className="font-semibold text-[var(--muted)]">{r.label}</span>
              <span className="flex items-center gap-1.5 font-bold tabular-nums text-[var(--ink)]">
                {r.actual}
                {r.ok && <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />}
              </span>
            </div>
            {bar(r.progress, r.ok)}
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-[10px] text-[var(--muted)]">
                Target:{" "}
                {r.pct
                  ? fmtPct(r.target as number, 0)
                  : r.id === "save"
                    ? `${r.target} tỷ`
                    : fmt(r.target as number)}
              </span>
              <input
                type="range"
                min={r.id === "save" ? 0 : r.id === "out" ? 0 : 0}
                max={r.id === "save" ? 20 : r.id === "out" ? 400000 : r.id === "roi" ? 5 : 1}
                step={r.step}
                value={r.target}
                onChange={(e) => setGoal(r.targetKey, Number(e.target.value))}
                className="h-1 w-24"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
