"use client";

import { useTwinStore } from "@/lib/store";
import { fmt } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** 12-month residual heat calendar */
export function HeatCalendar({ className }: { className?: string }) {
  const months = useTwinStore((s) => s.result.months);
  const maxR = Math.max(...months.map((m) => m.residualAfterImport), 1);

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)]",
        className
      )}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="panel-kicker">Peak calendar</div>
          <div className="panel-title">Residual sau stack · 12 tháng</div>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-semibold text-[var(--muted)]">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-teal-500/80" /> Xanh
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-amber-500/80" /> Vàng
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-rose-500/80" /> Đỏ
          </span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
        {months.map((m) => {
          const intensity = m.residualAfterImport / maxR;
          const bg =
            m.classification === "red"
              ? `color-mix(in srgb, var(--bad) ${18 + intensity * 42}%, var(--card))`
              : m.classification === "amber"
                ? `color-mix(in srgb, var(--warn) ${16 + intensity * 38}%, var(--card))`
                : `color-mix(in srgb, var(--good) ${14 + intensity * 36}%, var(--card))`;
          return (
            <div
              key={m.month}
              className="group relative overflow-hidden rounded-xl border border-[var(--line)] p-2.5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
              style={{ background: bg }}
              title={`${m.month}: residual ${fmt(m.residualAfterImport)} · y=${fmt(m.transferVol)} · z=${fmt(m.outsourceVol)}`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink)]">
                {m.month}
              </div>
              <div className="mt-1 text-[12px] font-bold tabular-nums text-[var(--ink)]">
                {fmt(m.residualAfterImport)}
              </div>
              <div className="mt-0.5 text-[8px] font-bold uppercase tracking-wide text-[var(--muted)]">
                {m.classification}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-[var(--ink)]/10">
                <div
                  className="h-full bg-[var(--ink)]/40 transition-all"
                  style={{ width: `${Math.min(100, intensity * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
