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

export type HistoryEntry = {
  id: string;
  at: string;
  label: string;
  params: TwinParams;
};

type TwinStore = {
  params: TwinParams;
  result: TwinSummary;
  snapshots: Snapshot[];
  activePresetId: string | null;
  past: HistoryEntry[];
  future: HistoryEntry[];
  setParam: <K extends keyof TwinParams>(key: K, value: TwinParams[K]) => void;
  setCost: (key: keyof TwinParams["cost"], value: number) => void;
  setParams: (params: TwinParams, label?: string) => void;
  applyPolicyPreset: (preset: PolicyPreset | string) => void;
  reset: () => void;
  recompute: () => void;
  saveSnapshot: (name?: string) => void;
  removeSnapshot: (id: string) => void;
  loadSnapshot: (id: string) => void;
  clearSnapshots: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
};

function recomputeFrom(params: TwinParams): TwinSummary {
  return simulate(params);
}

function uid() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function pushHistory(
  past: HistoryEntry[],
  params: TwinParams,
  label: string
): HistoryEntry[] {
  return [
    ...past,
    {
      id: uid(),
      at: new Date().toISOString(),
      label,
      params: structuredClone(params),
    },
  ].slice(-40);
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
        past: [],
        future: [],
        setParam: (key, value) => {
          const cur = get().params;
          const next = { ...cur, [key]: value };
          set({
            past: pushHistory(get().past, cur, `Đổi ${String(key)}`),
            future: [],
            params: next,
            result: recomputeFrom(next),
            activePresetId: null,
          });
        },
        setCost: (key, value) => {
          const cur = get().params;
          const next: TwinParams = {
            ...cur,
            cost: { ...cur.cost, [key]: value },
          };
          set({
            past: pushHistory(get().past, cur, `Cost · ${String(key)}`),
            future: [],
            params: next,
            result: recomputeFrom(next),
            activePresetId: null,
          });
        },
        setParams: (params, label = "Set params") => {
          const cur = get().params;
          set({
            past: pushHistory(get().past, cur, label),
            future: [],
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
          const cur = get().params;
          const next = applyPreset(cur, preset);
          set({
            past: pushHistory(get().past, cur, `Preset · ${preset.name}`),
            future: [],
            params: next,
            result: recomputeFrom(next),
            activePresetId: preset.id,
          });
        },
        reset: () => {
          const cur = get().params;
          const p = defaultParams();
          set({
            past: pushHistory(get().past, cur, "Reset default"),
            future: [],
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
          const cur = get().params;
          set({
            past: pushHistory(get().past, cur, `Load · ${snap.name}`),
            future: [],
            params: structuredClone(snap.params),
            result: recomputeFrom(snap.params),
            activePresetId: null,
          });
        },
        clearSnapshots: () => set({ snapshots: [] }),
        undo: () => {
          const { past, params, future } = get();
          if (!past.length) return;
          const prev = past[past.length - 1];
          const newPast = past.slice(0, -1);
          set({
            past: newPast,
            future: [
              {
                id: uid(),
                at: new Date().toISOString(),
                label: "Redo point",
                params: structuredClone(params),
              },
              ...future,
            ].slice(0, 40),
            params: structuredClone(prev.params),
            result: recomputeFrom(prev.params),
            activePresetId: null,
          });
        },
        redo: () => {
          const { future, params, past } = get();
          if (!future.length) return;
          const next = future[0];
          set({
            future: future.slice(1),
            past: pushHistory(past, params, "Undo point"),
            params: structuredClone(next.params),
            result: recomputeFrom(next.params),
            activePresetId: null,
          });
        },
        canUndo: () => get().past.length > 0,
        canRedo: () => get().future.length > 0,
      };
    },
    {
      name: "log-twin-dss-v2",
      partialize: (s) => ({
        params: s.params,
        snapshots: s.snapshots,
        activePresetId: s.activePresetId,
        past: s.past.slice(-15),
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<TwinStore> | undefined;
        if (!p?.params) return current;
        const params = {
          ...defaultParams(),
          ...p.params,
          cost: { ...defaultParams().cost, ...p.params.cost },
        };
        return {
          ...current,
          ...p,
          params,
          result: recomputeFrom(params),
          snapshots: p.snapshots ?? [],
          past: p.past ?? [],
          future: [],
        };
      },
    }
  )
);

export { POLICY_PRESETS };
