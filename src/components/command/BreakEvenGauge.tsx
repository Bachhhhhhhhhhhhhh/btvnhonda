"use client";

import { useMemo } from "react";
import { useTwinStore } from "@/lib/store";
import { unitEconomics } from "@/lib/engine/analytics";
import { fmt } from "@/lib/utils";
import { Scale } from "lucide-react";

export function BreakEvenGauge() {
  const params = useTwinStore((s) => s.params);
  const ue = useMemo(() => unitEconomics(params), [params]);

  // 0 = TF much more expensive, 50 = equal, 100 = TF much cheaper
  const ratio = ue.avoid > 0 ? ue.transfer / ue.avoid : 1;
  // score: lower ratio = better for transfer
  const score = Math.max(0, Math.min(100, (2 - ratio) * 50));
  const needle = score; // 0-100

  return (
    <div className="cc-panel rounded-xl border border-[var(--line)] bg-[var(--card)] p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gold)]/15 text-[var(--gold)]">
          <Scale className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
            Break-even gauge
          </div>
          <div className="text-sm font-extrabold text-[var(--ink)]">
            Transfer vs Thuê Bắc
          </div>
        </div>
      </div>

      <div className="relative mx-auto h-28 w-full max-w-[240px]">
        <svg viewBox="0 0 200 110" className="h-full w-full">
          <defs>
            <linearGradient id="beGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="var(--line)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#beGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${(needle / 100) * 251} 251`}
          />
          {/* needle */}
          <g
            style={{
              transformOrigin: "100px 100px",
              transform: `rotate(${-90 + (needle / 100) * 180}deg)`,
              transition: "transform 0.6s ease",
            }}
          >
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="35"
              stroke="var(--ink)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="5" fill="var(--gold)" />
          </g>
        </svg>
      </div>

      <div className="mt-1 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2 py-2">
          <div className="text-[9px] font-bold uppercase text-[var(--muted)]">
            Unit TF
          </div>
          <div className="text-sm font-black tabular-nums text-[var(--ink)]">
            {fmt(Math.round(ue.transfer))}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2 py-2">
          <div className="text-[9px] font-bold uppercase text-[var(--muted)]">
            Unit avoid
          </div>
          <div className="text-sm font-black tabular-nums text-[var(--ink)]">
            {fmt(ue.avoid)}
          </div>
        </div>
      </div>
      <div
        className={`mt-3 rounded-lg px-3 py-2 text-center text-xs font-bold ${
          ue.justified
            ? "bg-teal-500/15 text-teal-700 dark:text-teal-300"
            : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
        }`}
      >
        {ue.justified
          ? `✓ Transfer có biên +${fmt(Math.round(ue.margin))} VND/xe`
          : `✗ Transfer đắt hơn ${fmt(Math.round(-ue.margin))} VND/xe`}
      </div>
    </div>
  );
}
