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
  const shells = {
    default: "border-slate-200 bg-white",
    good: "border-emerald-200 bg-emerald-50/60",
    warn: "border-amber-200 bg-amber-50/60",
    bad: "border-rose-200 bg-rose-50/60",
    accent: "border-sky-200 bg-sky-50/60",
  };
  const valueTones = {
    default: "text-slate-900",
    good: "text-emerald-700",
    warn: "text-amber-700",
    bad: "text-rose-700",
    accent: "text-sky-800",
  };
  const deltaTones = {
    default: "bg-slate-100 text-slate-600",
    good: "bg-emerald-100 text-emerald-700",
    warn: "bg-amber-100 text-amber-800",
    bad: "bg-rose-100 text-rose-700",
    accent: "bg-sky-100 text-sky-800",
  };

  return (
    <div
      className={cn(
        "kpi-ring glass-hover rounded-xl border p-4",
        shells[tone]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </div>
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
      <div
        className={cn(
          "mt-2 text-2xl font-bold tabular-nums tracking-tight sm:text-[1.65rem]",
          valueTones[tone]
        )}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-1.5 text-xs leading-snug text-slate-600">{sub}</div>
      )}
      {source && (
        <div
          className="mt-3 truncate border-t border-slate-100 pt-2 text-[10px] text-slate-400"
          title={source}
        >
          {source}
        </div>
      )}
    </div>
  );
}
