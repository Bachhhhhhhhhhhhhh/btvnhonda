"use client";

import { fmt } from "@/lib/utils";

export function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit?: string;
  hint?: string;
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className="space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-medium text-slate-300">{label}</label>
        <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-xs font-bold tabular-nums text-sky-300">
          {fmt(value, step < 1 ? 2 : 0)}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{
          background: `linear-gradient(90deg, #0ea5e9 ${pct}%, #1e293b ${pct}%)`,
        }}
      />
      {hint && <p className="text-[10px] leading-snug text-slate-500">{hint}</p>}
    </div>
  );
}
