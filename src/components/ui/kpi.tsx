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
  const shells = {
    default: "border-slate-200 bg-white",
    good: "border-teal-200 bg-white",
    warn: "border-amber-200 bg-white",
    bad: "border-rose-200 bg-white",
    accent: "border-slate-300 bg-white",
  };
  const valueTones = {
    default: "text-[#0a1628]",
    good: "text-teal-800",
    warn: "text-amber-800",
    bad: "text-rose-800",
    accent: "text-[#0c4a6e]",
  };
  const iconBg = {
    default: "bg-slate-100 text-slate-600",
    good: "bg-teal-50 text-teal-700",
    warn: "bg-amber-50 text-amber-700",
    bad: "bg-rose-50 text-rose-700",
    accent: "bg-sky-50 text-sky-800",
  };
  const deltaTones = {
    default: "bg-slate-100 text-slate-600",
    good: "bg-teal-50 text-teal-800",
    warn: "bg-amber-50 text-amber-800",
    bad: "bg-rose-50 text-rose-800",
    accent: "bg-sky-50 text-sky-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={cn(
        "kpi-ring glass-hover rounded-lg border p-4 shadow-sm",
        shells[tone]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
            {label}
          </div>
          <div
            className={cn(
              "mt-2 text-[1.65rem] font-bold tabular-nums tracking-tight leading-none",
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
                    <span className="ml-1 text-[0.8em] font-bold opacity-80">
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
                "flex h-9 w-9 items-center justify-center rounded-md",
                iconBg[tone]
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </div>
          )}
          {delta && (
            <span
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-bold",
                deltaTones[tone]
              )}
            >
              {delta}
            </span>
          )}
        </div>
      </div>
      {sub && (
        <div className="mt-2.5 text-xs leading-relaxed text-slate-600">{sub}</div>
      )}
      {source && (
        <div
          className="mt-2.5 truncate border-t border-slate-100 pt-2 text-[10px] text-slate-400"
          title={source}
        >
          {source}
        </div>
      )}
    </motion.div>
  );
}
