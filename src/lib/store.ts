"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  defaultParams,
  simulate,
  type TwinParams,
  type TwinSummary,
} from "@/lib/engine/digitalTwin";
import {
  POLICY_PRESETS,
  applyPreset,
  type PolicyPreset,
} from "@/lib/engine/analytics";

export type Snapshot = {
  id: string;
  name: string;
  savedAt: string;
  params: TwinParams;
  result: TwinSummary;
};

type TwinStore = {
  params: TwinParams;
  result: TwinSummary;
  snapshots: Snapshot[];
  activePresetId: string | null;
  setParam: <K extends keyof TwinParams>(key: K, value: TwinParams[K]) => void;
  setCost: (key: keyof TwinParams["cost"], value: number) => void;
  setParams: (params: TwinParams) => void;
  applyPolicyPreset: (preset: PolicyPreset | string) => void;
  reset: () => void;
  recompute: () => void;
  saveSnapshot: (name?: string) => void;
  removeSnapshot: (id: string) => void;
  loadSnapshot: (id: string) => void;
  clearSnapshots: () => void;
};

function recomputeFrom(params: TwinParams): TwinSummary {
  return simulate(params);
}

function uid() {
  return `snap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const useTwinStore = create<TwinStore>()(
  persist(
    (set, get) => {
      const params = defaultParams();
      return {
        params,
        result: recomputeFrom(params),
        snapshots: [],
        activePresetId: "base",
        setParam: (key, value) => {
          const next = { ...get().params, [key]: value };
          set({
            params: next,
            result: recomputeFrom(next),
            activePresetId: null,
          });
        },
        setCost: (key, value) => {
          const prev = get().params;
          const next: TwinParams = {
            ...prev,
            cost: { ...prev.cost, [key]: value },
          };
          set({
            params: next,
            result: recomputeFrom(next),
            activePresetId: null,
          });
        },
        setParams: (params) => {
          set({
            params,
            result: recomputeFrom(params),
            activePresetId: null,
          });
        },
        applyPolicyPreset: (presetOrId) => {
          const preset =
            typeof presetOrId === "string"
              ? POLICY_PRESETS.find((p) => p.id === presetOrId)
              : presetOrId;
          if (!preset) return;
          const next = applyPreset(get().params, preset);
          set({
            params: next,
            result: recomputeFrom(next),
            activePresetId: preset.id,
          });
        },
        reset: () => {
          const p = defaultParams();
          set({
            params: p,
            result: recomputeFrom(p),
            activePresetId: "base",
          });
        },
        recompute: () => {
          set({ result: recomputeFrom(get().params) });
        },
        saveSnapshot: (name) => {
          const { params, result, snapshots } = get();
          const snap: Snapshot = {
            id: uid(),
            name: name || `Snapshot ${snapshots.length + 1}`,
            savedAt: new Date().toISOString(),
            params: structuredClone(params),
            result,
          };
          set({ snapshots: [...snapshots, snap].slice(-12) });
        },
        removeSnapshot: (id) => {
          set({ snapshots: get().snapshots.filter((s) => s.id !== id) });
        },
        loadSnapshot: (id) => {
          const snap = get().snapshots.find((s) => s.id === id);
          if (!snap) return;
          set({
            params: structuredClone(snap.params),
            result: recomputeFrom(snap.params),
            activePresetId: null,
          });
        },
        clearSnapshots: () => set({ snapshots: [] }),
      };
    },
    {
      name: "log-twin-dss-v1",
      partialize: (s) => ({
        params: s.params,
        snapshots: s.snapshots,
        activePresetId: s.activePresetId,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<TwinStore> | undefined;
        if (!p?.params) return current;
        const params = { ...defaultParams(), ...p.params, cost: { ...defaultParams().cost, ...p.params.cost } };
        return {
          ...current,
          ...p,
          params,
          result: recomputeFrom(params),
          snapshots: p.snapshots ?? [],
        };
      },
    }
  )
);

export { POLICY_PRESETS };
