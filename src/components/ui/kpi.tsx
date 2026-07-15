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
    default: "border-[#dce3ec] bg-white",
    good: "border-[#dce3ec] bg-white",
    warn: "border-[#dce3ec] bg-white",
    bad: "border-[#dce3ec] bg-white",
    accent: "border-[#dce3ec] bg-white",
  };
  const valueTones = {
    default: "text-[#071428]",
    good: "text-[#0d6b63]",
    warn: "text-[#a65c12]",
    bad: "text-[#a31d1d]",
    accent: "text-[#0a4d6e]",
  };
  const iconBg = {
    default: "bg-[#f0f3f7] text-[#334155]",
    good: "bg-teal-50 text-teal-800",
    warn: "bg-amber-50 text-amber-800",
    bad: "bg-rose-50 text-rose-800",
    accent: "bg-sky-50 text-sky-900",
  };
  const deltaTones = {
    default: "bg-slate-100 text-slate-600",
    good: "bg-teal-50 text-teal-800",
    warn: "bg-amber-50 text-amber-800",
    bad: "bg-rose-50 text-rose-800",
    accent: "bg-sky-50 text-sky-900",
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        "glass-hover relative overflow-hidden rounded-[4px] border p-4 shadow-[0_1px_2px_rgba(7,20,40,0.05)]",
        shells[tone]
      )}
    >
      <div
        className={cn(
          "absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r",
          accentBar[tone]
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
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
                "flex h-9 w-9 items-center justify-center rounded-[3px]",
                iconBg[tone]
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.85} />
            </div>
          )}
          {delta && (
            <span
              className={cn(
                "rounded-[2px] px-2 py-0.5 text-[10px] font-bold",
                deltaTones[tone]
              )}
            >
              {delta}
            </span>
          )}
        </div>
      </div>
      {sub && (
        <div className="mt-2.5 text-xs leading-relaxed text-slate-500">{sub}</div>
      )}
      {source && (
        <div
          className="mt-2.5 truncate border-t border-[#eef2f6] pt-2 text-[10px] text-slate-400"
          title={source}
        >
          Nguồn · {source}
        </div>
      )}
    </motion.div>
  );
}
