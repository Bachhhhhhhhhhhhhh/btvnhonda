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
  /** If set, animate count-up for this number (display still uses value prefix/suffix via value if needed) */
  numericValue?: number;
  digits?: number;
}) {
  const shells = {
    default: "from-white to-slate-50 border-slate-200/80",
    good: "from-emerald-50 to-white border-emerald-200",
    warn: "from-amber-50 to-white border-amber-200",
    bad: "from-rose-50 to-white border-rose-200",
    accent: "from-blue-50 to-white border-blue-200",
  };
  const valueTones = {
    default: "text-slate-900",
    good: "text-emerald-700",
    warn: "text-amber-700",
    bad: "text-rose-700",
    accent: "text-blue-800",
  };
  const iconBg = {
    default: "bg-slate-100 text-slate-600",
    good: "bg-emerald-100 text-emerald-700",
    warn: "bg-amber-100 text-amber-700",
    bad: "bg-rose-100 text-rose-700",
    accent: "bg-blue-100 text-blue-700",
  };
  const deltaTones = {
    default: "bg-slate-100 text-slate-600",
    good: "bg-emerald-100 text-emerald-800",
    warn: "bg-amber-100 text-amber-800",
    bad: "bg-rose-100 text-rose-800",
    accent: "bg-blue-100 text-blue-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "kpi-ring glass-hover rounded-2xl border bg-gradient-to-br p-5",
        shells[tone]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
            {label}
          </div>
          <div
            className={cn(
              "mt-2 text-[1.75rem] font-extrabold tabular-nums tracking-tight leading-none sm:text-[1.9rem]",
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
                    <span className="ml-1 text-[0.85em] font-bold opacity-80">
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
                "flex h-10 w-10 items-center justify-center rounded-xl",
                iconBg[tone]
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
          {delta && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                deltaTones[tone]
              )}
            >
              {delta}
            </span>
          )}
        </div>
      </div>
      {sub && (
        <div className="mt-3 text-xs leading-relaxed text-slate-600">{sub}</div>
      )}
      {source && (
        <div
          className="mt-3 truncate border-t border-slate-100/80 pt-2 text-[10px] text-slate-400"
          title={source}
        >
          {source}
        </div>
      )}
    </motion.div>
  );
}
