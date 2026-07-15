"use client";

import { useMemo } from "react";
import { useTwinStore, POLICY_PRESETS } from "@/lib/store";
import { applyPreset } from "@/lib/engine/analytics";
import { simulate } from "@/lib/engine/digitalTwin";
import { fmt, fmtPct } from "@/lib/utils";
import { GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/wow/ToastHost";

const PRESET_IDS = ["conservative", "base", "aggressive", "zero-os"] as const;

export function PolicyMatrix() {
  const { params, applyPolicyPreset, activePresetId } = useTwinStore();
  const pushToast = useToast((s) => s.push);

  const rows = useMemo(() => {
    return PRESET_IDS.map((id) => {
      const preset = POLICY_PRESETS.find((p) => p.id === id)!;
      const p = applyPreset(params, preset);
      // keep cost from current twin for fair compare of policy levers only
      const r = simulate({ ...p, cost: { ...params.cost } });
      return {
        id,
        name: preset.name,
        desc: preset.description,
        save: r.annual.totalSavings,
        cost: r.annual.totalCost,
        out: r.annual.outsourceVol,
        tf: r.annual.transferVol,
        cont: r.annual.nsContainersBase,
        pool: r.annual.peakCasePool,
        roi: r.annual.roi,
        stack: p.importStackRatio,
        transfer: p.transferRatio,
      };
    });
  }, [params]);

  const bestId = rows.reduce((b, r) => (r.save > b.save ? r : b), rows[0]).id;

  return (
    <div className="cc-panel overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line-soft)] px-4 py-3">
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-[var(--gold)]" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
              Policy matrix
            </div>
            <div className="text-sm font-extrabold text-[var(--ink)]">
              So 4 preset trên rate card hiện tại
            </div>
          </div>
        </div>
        <span className="text-[10px] text-[var(--muted)]">
          Click hàng → áp dụng preset
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-[var(--line-soft)] bg-[var(--bg)]/50 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
              <th className="px-3 py-2.5">Preset</th>
              <th className="px-2 py-2.5">S / T</th>
              <th className="px-2 py-2.5">Save tỷ</th>
              <th className="px-2 py-2.5">Outsource</th>
              <th className="px-2 py-2.5">Cont</th>
              <th className="px-2 py-2.5">Pool</th>
              <th className="px-2 py-2.5">ROI</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const active = activePresetId === r.id;
              return (
                <tr
                  key={r.id}
                  onClick={() => {
                    applyPolicyPreset(r.id);
                    pushToast({
                      title: `Áp dụng · ${r.name}`,
                      detail: r.desc,
                      tone: "good",
                    });
                  }}
                  className={cn(
                    "cursor-pointer border-b border-[var(--line-soft)] transition last:border-0",
                    active
                      ? "bg-[var(--gold)]/10"
                      : "hover:bg-[var(--bg)]",
                    r.id === bestId && !active && "bg-teal-500/5"
                  )}
                >
                  <td className="px-3 py-2.5">
                    <div className="font-bold text-[var(--ink)]">
                      {r.name}
                      {r.id === bestId && (
                        <span className="ml-1.5 rounded bg-teal-500/15 px-1.5 py-0.5 text-[9px] font-black text-teal-700 dark:text-teal-300">
                          BEST SAVE
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[var(--muted)]">{r.desc}</div>
                  </td>
                  <td className="px-2 py-2.5 font-mono font-bold tabular-nums text-[var(--ink)]">
                    {fmtPct(r.stack, 0)}/{fmtPct(r.transfer, 0)}
                  </td>
                  <td className="px-2 py-2.5 font-bold tabular-nums text-teal-700 dark:text-teal-300">
                    {fmt(r.save / 1e9, 2)}
                  </td>
                  <td className="px-2 py-2.5 tabular-nums">{fmt(r.out)}</td>
                  <td className="px-2 py-2.5 tabular-nums">{fmt(r.cont)}</td>
                  <td className="px-2 py-2.5 tabular-nums">{fmt(r.pool)}</td>
                  <td className="px-2 py-2.5 tabular-nums font-semibold">
                    {fmtPct(r.roi)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
