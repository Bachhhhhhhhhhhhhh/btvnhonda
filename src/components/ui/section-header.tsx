"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  kicker,
  title,
  subtitle,
  actions,
  className,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-[#eef2f6] pb-4",
        className
      )}
    >
      <div className="min-w-0 max-w-3xl">
        {kicker && (
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b8954a]">
            {kicker}
          </div>
        )}
        <h1 className="mt-1 text-[1.45rem] font-bold tracking-tight text-[#071428] sm:text-[1.65rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function InsightBox({
  title,
  children,
  tone = "info",
}: {
  title: string;
  children: ReactNode;
  tone?: "info" | "good" | "warn" | "bad";
}) {
  const tones = {
    info: "border-[#c5d4e8] bg-[#f4f8fc] text-[#0a4d6e]",
    good: "border-teal-200 bg-teal-50 text-teal-900",
    warn: "border-amber-200 bg-amber-50 text-amber-950",
    bad: "border-rose-200 bg-rose-50 text-rose-900",
  };
  return (
    <div className={cn("rounded-[4px] border px-4 py-3 text-sm leading-relaxed", tones[tone])}>
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] opacity-80">
        {title}
      </div>
      <div className="mt-1 text-[13px] text-slate-700">{children}</div>
    </div>
  );
}

export function MetricRow({
  items,
}: {
  items: { label: string; value: string; hint?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-[#dce3ec] bg-[#dce3ec] sm:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="bg-white px-3 py-3">
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {it.label}
          </div>
          <div className="mt-1 text-base font-bold tabular-nums text-[#071428]">
            {it.value}
          </div>
          {it.hint && (
            <div className="mt-0.5 text-[11px] text-slate-500">{it.hint}</div>
          )}
        </div>
      ))}
    </div>
  );
}
