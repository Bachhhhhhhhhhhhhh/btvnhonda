"use client";

import { useMemo } from "react";
import { useTwinStore } from "@/lib/store";
import { scorecard } from "@/lib/engine/analytics";
import { cn } from "@/lib/utils";

export function ScorecardRing({ className }: { className?: string }) {
  const { result, params } = useTwinStore();
  const sc = useMemo(() => scorecard(result, params), [result, params]);

  const tone =
    sc.overall >= 75
      ? "text-teal-700"
      : sc.overall >= 55
        ? "text-amber-700"
        : "text-rose-700";

  return (
    <div
      className={cn(
        "rounded-[4px] border border-[#dce3ec] bg-white p-4 shadow-sm",
        className
      )}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#b8954a]">
        Health scorecard
      </div>
      <div className="mt-3 flex items-center gap-5">
        <div
          className={cn(
            "relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4",
            sc.overall >= 75
              ? "border-teal-500"
              : sc.overall >= 55
                ? "border-amber-500"
                : "border-rose-500"
          )}
        >
          <div className="text-center">
            <div className={cn("text-2xl font-bold tabular-nums", tone)}>
              {sc.overall}
            </div>
            <div className="text-[9px] font-bold uppercase text-slate-400">
              / 100
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          {sc.dimensions.map((d) => (
            <div key={d.key}>
              <div className="flex justify-between text-[11px]">
                <span className="font-semibold text-slate-600">{d.label}</span>
                <span className="tabular-nums text-slate-500">
                  {d.score} · {d.note}
                </span>
              </div>
              <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-full rounded-full",
                    d.score >= 75
                      ? "bg-teal-600"
                      : d.score >= 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  )}
                  style={{ width: `${d.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
