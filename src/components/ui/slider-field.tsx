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
    <div className="space-y-2 rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-3.5 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-semibold text-slate-700">{label}</label>
        <span className="rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 px-2.5 py-0.5 text-xs font-bold tabular-nums text-white shadow-sm">
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
          background: `linear-gradient(90deg, #2563eb ${pct}%, #e2e8f0 ${pct}%)`,
        }}
      />
      {hint && (
        <p className="text-[10px] leading-snug text-slate-500">{hint}</p>
      )}
    </div>
  );
}
