"use client";

import { ResponsiveContainer, Area, AreaChart } from "recharts";
import { cn } from "@/lib/utils";

const TONES = {
  sky: { stroke: "var(--chart-1)", soft: "color-mix(in srgb, var(--chart-1) 45%, transparent)" },
  teal: { stroke: "var(--chart-2)", soft: "color-mix(in srgb, var(--chart-2) 45%, transparent)" },
  amber: { stroke: "var(--warn)", soft: "color-mix(in srgb, var(--warn) 40%, transparent)" },
  rose: { stroke: "var(--chart-6)", soft: "color-mix(in srgb, var(--chart-6) 40%, transparent)" },
  gold: { stroke: "var(--chart-3)", soft: "color-mix(in srgb, var(--chart-3) 45%, transparent)" },
} as const;

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
  tone?: keyof typeof TONES;
  className?: string;
}) {
  const t = TONES[tone];
  const gid = `sg-${tone}`;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]",
        className
      )}
    >
      <div
        className="absolute left-0 top-0 h-full w-[3px] opacity-90"
        style={{ background: t.stroke }}
      />
      <div className="relative z-10 pl-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
          {label}
        </div>
        <div className="mt-1.5 text-xl font-bold tabular-nums tracking-tight text-[var(--ink)]">
          {value}
        </div>
        {sub && (
          <div className="mt-0.5 text-[11px] text-[var(--muted)]">{sub}</div>
        )}
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0 h-16 w-[58%] opacity-70 transition-opacity group-hover:opacity-90">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={t.stroke} stopOpacity={0.32} />
                <stop offset="100%" stopColor={t.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={t.stroke}
              fill={`url(#${gid})`}
              strokeWidth={1.75}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
