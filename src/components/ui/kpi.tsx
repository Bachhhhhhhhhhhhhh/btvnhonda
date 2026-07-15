import { cn } from "@/lib/utils";

export function Kpi({
  label,
  value,
  sub,
  tone = "default",
  source,
  delta,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "good" | "warn" | "bad" | "accent";
  source?: string;
  delta?: string;
}) {
  const valueTones = {
    default: "text-slate-50",
    good: "text-emerald-300",
    warn: "text-amber-300",
    bad: "text-rose-300",
    accent: "text-sky-300",
  };
  const glow = {
    default: "",
    good: "shadow-[0_0_30px_-12px_rgba(52,211,153,0.5)]",
    warn: "shadow-[0_0_30px_-12px_rgba(251,191,36,0.45)]",
    bad: "shadow-[0_0_30px_-12px_rgba(251,113,133,0.45)]",
    accent: "shadow-[0_0_30px_-12px_rgba(56,189,248,0.5)]",
  };

  return (
    <div
      className={cn(
        "kpi-ring glass glass-hover rounded-2xl p-4",
        glow[tone]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </div>
        {delta && (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
            {delta}
          </span>
        )}
      </div>
      <div
        className={cn(
          "mt-2 text-2xl font-bold tabular-nums tracking-tight sm:text-3xl",
          valueTones[tone]
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-1.5 text-xs leading-snug text-slate-400">{sub}</div>}
      {source && (
        <div
          className="mt-3 truncate border-t border-white/5 pt-2 text-[10px] text-slate-500"
          title={source}
        >
          📎 {source}
        </div>
      )}
    </div>
  );
}
