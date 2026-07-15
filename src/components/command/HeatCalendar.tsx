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
        "cc-panel rounded-xl border border-[var(--line)] bg-[var(--card)] p-4",
        className
      )}
    >
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
            Peak calendar
          </div>
          <div className="text-sm font-extrabold text-[var(--ink)]">
            Residual sau stack · 12 tháng
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--muted)]">
          <span className="h-2 w-2 rounded-sm bg-teal-500/80" /> Xanh
          <span className="h-2 w-2 rounded-sm bg-amber-500/80" /> Vàng
          <span className="h-2 w-2 rounded-sm bg-rose-500/80" /> Đỏ
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
        {months.map((m) => {
          const intensity = m.residualAfterImport / maxR;
          const bg =
            m.classification === "red"
              ? `rgba(244,63,94,${0.25 + intensity * 0.55})`
              : m.classification === "amber"
                ? `rgba(245,158,11,${0.2 + intensity * 0.5})`
                : `rgba(20,184,166,${0.15 + intensity * 0.45})`;
          return (
            <div
              key={m.month}
              className="group relative overflow-hidden rounded-lg border border-[var(--line)] p-2 transition hover:scale-[1.03] hover:shadow-md"
              style={{ background: bg }}
              title={`${m.month}: residual ${fmt(m.residualAfterImport)} · y=${fmt(m.transferVol)} · z=${fmt(m.outsourceVol)}`}
            >
              <div className="text-[10px] font-black uppercase text-[var(--ink)]">
                {m.month}
              </div>
              <div className="mt-1 text-[11px] font-bold tabular-nums text-[var(--ink)]">
                {fmt(m.residualAfterImport)}
              </div>
              <div className="mt-0.5 text-[8px] font-bold uppercase opacity-70">
                {m.classification}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-[var(--ink)]/20">
                <div
                  className="h-full bg-[var(--ink)]/50"
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
