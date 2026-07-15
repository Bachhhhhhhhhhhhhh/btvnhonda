"use client";

import { useMemo } from "react";
import { useTwinStore } from "@/lib/store";
import { fmt, fmtPct } from "@/lib/utils";
import { unitEconomics } from "@/lib/engine/analytics";

export function LiveTicker() {
  const { result, params } = useTwinStore();
  const a = result.annual;
  const ue = unitEconomics(params);

  const items = useMemo(() => {
    const red = result.months.filter((m) => m.classification === "red").length;
    const base = [
      `● LIVE TWIN`,
      `Tiết kiệm ${fmt(a.totalSavings / 1e9, 2)} tỷ VND/năm`,
      `ROI ${fmtPct(a.roi)} · NPV ${fmt(a.npv / 1e9, 2)} tỷ`,
      `Stack ${fmtPct(params.importStackRatio, 0)} · TF ${fmtPct(params.transferRatio, 0)}`,
      `Relief ${fmt(a.importRelief)} xe-eq · ${fmt(a.m2Saved)} m²`,
      `Outsource ${fmt(a.outsourceVol)} · Transfer ${fmt(a.transferVol)}`,
      `Cont N→S ${fmt(a.nsContainersBase)} · Pool peak ${fmt(a.peakCasePool)}`,
      `Unit TF ${fmt(Math.round(ue.transfer))} vs Avoid ${fmt(ue.avoid)}`,
      red > 0 ? `⚠ ${red} tháng residual ĐỎ` : `✓ Không tháng đỏ`,
      `Fact Cap ${fmt(params.factCap)} · ${params.useTtlCapacity ? "TTL mode" : "Fact mode"}`,
    ];
    return [...base, ...base];
  }, [a, params, result.months, ue]);

  return (
    <div className="ticker-wrap no-print relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)] text-[11px] font-medium text-[var(--muted)] shadow-[var(--shadow-sm)]">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[var(--card)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[var(--card)] to-transparent" />
      <div className="ticker-track flex whitespace-nowrap py-2.5">
        {items.map((t, i) => (
          <span key={i} className="mx-4 inline-flex items-center gap-2">
            <span
              className={
                t.startsWith("●")
                  ? "inline-flex items-center gap-1.5 font-semibold text-[var(--gold)]"
                  : t.startsWith("⚠")
                    ? "text-[var(--bad)]"
                    : "text-[var(--ink)]"
              }
            >
              {t.startsWith("●") && (
                <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--good)]" />
              )}
              {t}
            </span>
            <span className="text-[var(--line)]">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
