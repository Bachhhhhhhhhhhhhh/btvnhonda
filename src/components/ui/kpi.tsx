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
    good: "text-teal-700 dark:text-teal-300",
    warn: "text-amber-700 dark:text-amber-300",
    bad: "text-rose-700 dark:text-rose-300",
    accent: "text-sky-800 dark:text-sky-300",
  };
  const iconBg = {
    default: "bg-[var(--bg)] text-[var(--muted)]",
    good: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
    warn: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    bad: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    accent: "bg-sky-500/15 text-sky-800 dark:text-sky-300",
  };
  const deltaTones = {
    default: "bg-[var(--bg)] text-[var(--muted)]",
    good: "bg-teal-500/15 text-teal-800 dark:text-teal-300",
    warn: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    bad: "bg-rose-500/15 text-rose-800 dark:text-rose-300",
    accent: "bg-sky-500/15 text-sky-800 dark:text-sky-300",
  };
  const accentBar = {
    default: "from-[#071428] via-[#b8954a] to-[#071428]",
    good: "from-[#0d6b63] via-[#14b8a6] to-[#0d6b63]",
    warn: "from-[#a65c12] via-[#d4b76a] to-[#a65c12]",
    bad: "from-[#a31d1d] via-[#f87171] to-[#a31d1d]",
    accent: "from-[#0a4d6e] via-[#38bdf8] to-[#0a4d6e]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="cc-panel relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)] p-4"
    >
      <div
        className={cn(
          "absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r",
          accentBar[tone]
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
            {label}
          </div>
          <div
            className={cn(
              "mt-2 text-[1.55rem] font-black tabular-nums tracking-tight leading-none",
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
                    <span className="ml-1 text-[0.75em] font-bold opacity-80">
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
                "flex h-9 w-9 items-center justify-center rounded-lg",
                iconBg[tone]
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.85} />
            </div>
          )}
          {delta && (
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-bold",
                deltaTones[tone]
              )}
            >
              {delta}
            </span>
          )}
        </div>
      </div>
      {sub && (
        <div className="mt-2.5 text-xs leading-relaxed text-[var(--muted)]">{sub}</div>
      )}
      {source && (
        <div
          className="mt-2.5 truncate border-t border-[var(--line-soft)] pt-2 text-[10px] text-[var(--muted)]"
          title={source}
        >
          Nguồn · {source}
        </div>
      )}
    </motion.div>
  );
}
