"use client";

import { ResponsiveContainer, Area, AreaChart } from "recharts";
import { cn } from "@/lib/utils";

export function SparkKpi({
  label,
  value,
  sub,
  data,
  dataKey = "v",
  tone = "sky",
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  data: { v: number }[] | Record<string, number>[];
  dataKey?: string;
  tone?: "sky" | "teal" | "amber" | "rose" | "gold";
  className?: string;
}) {
  const stroke = {
    sky: "#38bdf8",
    teal: "#14b8a6",
    amber: "#f59e0b",
    rose: "#f43f5e",
    gold: "#d4b76a",
  }[tone];

  return (
    <div
      className={cn(
        "cc-panel relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)] p-3.5",
        className
      )}
    >
      <div className="relative z-10">
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          {label}
        </div>
        <div className="mt-1 text-xl font-black tabular-nums tracking-tight text-[var(--ink)]">
          {value}
        </div>
        {sub && (
          <div className="mt-0.5 text-[11px] text-[var(--muted)]">{sub}</div>
        )}
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0 h-14 w-[55%] opacity-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`sg-${tone}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={stroke}
              fill={`url(#sg-${tone})`}
              strokeWidth={1.5}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
