"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-counter";

export function Kpi({
  label,
  value,
  sub,
  tone = "default",
  source,
  delta,
  icon: Icon,
  delay = 0,
  numericValue,
  digits = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "good" | "warn" | "bad" | "accent";
  source?: string;
  delta?: string;
  icon?: LucideIcon;
  delay?: number;
  numericValue?: number;
  digits?: number;
}) {
  const valueTones = {
    default: "text-[var(--ink)]",
    good: "text-[var(--good)]",
    warn: "text-[var(--warn)]",
    bad: "text-[var(--bad)]",
    accent: "text-[var(--link)]",
  };
  const iconBg = {
    default: "bg-[var(--bg)] text-[var(--muted)]",
    good: "bg-[color-mix(in_srgb,var(--good)_12%,transparent)] text-[var(--good)]",
    warn: "bg-[color-mix(in_srgb,var(--warn)_12%,transparent)] text-[var(--warn)]",
    bad: "bg-[color-mix(in_srgb,var(--bad)_12%,transparent)] text-[var(--bad)]",
    accent: "bg-[color-mix(in_srgb,var(--link)_12%,transparent)] text-[var(--link)]",
  };
  const deltaTones = {
    default: "bg-[var(--bg)] text-[var(--muted)]",
    good: "bg-[color-mix(in_srgb,var(--good)_12%,transparent)] text-[var(--good)]",
    warn: "bg-[color-mix(in_srgb,var(--warn)_12%,transparent)] text-[var(--warn)]",
    bad: "bg-[color-mix(in_srgb,var(--bad)_12%,transparent)] text-[var(--bad)]",
    accent: "bg-[color-mix(in_srgb,var(--link)_12%,transparent)] text-[var(--link)]",
  };
  const bar = {
    default: "bg-[var(--chart-1)]",
    good: "bg-[var(--good)]",
    warn: "bg-[var(--warn)]",
    bad: "bg-[var(--bad)]",
    accent: "bg-[var(--link)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
      className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-px hover:shadow-[var(--shadow-md)]"
    >
      <div className={cn("absolute left-0 top-0 h-full w-[3px] rounded-l-2xl", bar[tone])} />
      <div className="flex items-start justify-between gap-3 pl-1">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
            {label}
          </div>
          <div
            className={cn(
              "mt-2 text-[1.55rem] font-bold tabular-nums tracking-tight leading-none",
              valueTones[tone]
            )}
          >
            {numericValue !== undefined ? (
              <>
                <AnimatedNumber value={numericValue} digits={digits} />
                {(() => {
                  const suffix = value.replace(/^[\d.,\s%]+/, "").trim();
                  const hasPct = value.includes("%") && !suffix.includes("%");
                  if (!suffix && !hasPct) return null;
                  return (
                    <span className="ml-1 text-[0.72em] font-semibold opacity-75">
                      {hasPct ? "%" : ""}
                      {suffix ? ` ${suffix}` : ""}
                    </span>
                  );
                })()}
              </>
            ) : (
              value
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {Icon && (
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                iconBg[tone]
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </div>
          )}
          {delta && (
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                deltaTones[tone]
              )}
            >
              {delta}
            </span>
          )}
        </div>
      </div>
      {sub && (
        <div className="mt-2.5 pl-1 text-xs leading-relaxed text-[var(--muted)]">
          {sub}
        </div>
      )}
      {source && (
        <div
          className="mt-2.5 truncate border-t border-[var(--line-soft)] pt-2 pl-1 text-[10px] text-[var(--muted)] opacity-80"
          title={source}
        >
          {source}
        </div>
      )}
    </motion.div>
  );
}
