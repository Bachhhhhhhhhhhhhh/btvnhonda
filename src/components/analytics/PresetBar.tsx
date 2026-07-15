"use client";

import { POLICY_PRESETS, useTwinStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { RotateCcw, Camera } from "lucide-react";
import { useToast } from "@/components/wow/ToastHost";
import { ParamLockButton, useParamLock } from "@/components/command/ParamLock";

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
  const pushToast = useToast((s) => s.push);
  const locked = useParamLock((s) => s.locked);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-2.5 shadow-[var(--shadow-sm)]">
      <span className="px-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        Preset
      </span>
      <ParamLockButton />
      {POLICY_PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          title={p.description}
          disabled={locked}
          onClick={() => {
            if (locked) {
              pushToast({ title: "Twin đang khóa", tone: "warn" });
              return;
            }
            applyPolicyPreset(p);
            pushToast({
              title: `Preset · ${p.name}`,
              detail: p.description,
              tone: "info",
            });
          }}
          className={cn(
            "rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold transition disabled:opacity-40",
            activePresetId === p.id
              ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--card)] shadow-sm"
              : "border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] hover:border-[color-mix(in_srgb,var(--gold)_45%,var(--line))]"
          )}
        >
          {p.name}
        </button>
      ))}
      <button
        type="button"
        disabled={locked}
        onClick={() => {
          if (locked) return;
          reset();
          pushToast({ title: "Đã reset Twin về default", tone: "warn" });
        }}
        className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--muted)] hover:bg-[var(--bg)] disabled:opacity-40"
      >
        <RotateCcw className="h-3 w-3" />
        Reset
      </button>
      {showSnapshot && (
        <button
          type="button"
          onClick={() => {
            saveSnapshot(`Policy ${new Date().toLocaleTimeString("vi-VN")}`);
            pushToast({
              title: "Snapshot đã lưu",
              detail: "Xem trong Insights · A/B",
              tone: "good",
            });
          }}
          className="btn-bank-outline ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px]"
        >
          <Camera className="h-3 w-3" />
          Lưu snapshot ({snapshots.length})
        </button>
      )}
    </div>
  );
}
