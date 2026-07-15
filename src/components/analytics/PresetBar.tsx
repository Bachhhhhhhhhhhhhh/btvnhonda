"use client";

import { POLICY_PRESETS, useTwinStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { RotateCcw, Camera } from "lucide-react";

export function PresetBar({
  showSnapshot = true,
}: {
  showSnapshot?: boolean;
}) {
  const {
    activePresetId,
    applyPolicyPreset,
    reset,
    saveSnapshot,
    snapshots,
  } = useTwinStore();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[4px] border border-[#dce3ec] bg-white p-2.5 shadow-sm">
      <span className="px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Preset
      </span>
      {POLICY_PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          title={p.description}
          onClick={() => applyPolicyPreset(p)}
          className={cn(
            "rounded-[3px] border px-2.5 py-1.5 text-[11px] font-bold transition",
            activePresetId === p.id
              ? "border-[#071428] bg-[#071428] text-white"
              : "border-[#dce3ec] bg-[#f7f9fc] text-slate-700 hover:border-[#b8954a]/50"
          )}
        >
          {p.name}
        </button>
      ))}
      <button
        type="button"
        onClick={() => reset()}
        className="inline-flex items-center gap-1 rounded-[3px] border border-[#dce3ec] px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
      >
        <RotateCcw className="h-3 w-3" />
        Reset
      </button>
      {showSnapshot && (
        <button
          type="button"
          onClick={() =>
            saveSnapshot(`Policy ${new Date().toLocaleTimeString("vi-VN")}`)
          }
          className="btn-bank-outline ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px]"
        >
          <Camera className="h-3 w-3" />
          Lưu snapshot ({snapshots.length})
        </button>
      )}
    </div>
  );
}
