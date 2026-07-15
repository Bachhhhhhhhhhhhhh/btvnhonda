"use client";

import { create } from "zustand";
import {
  defaultParams,
  simulate,
  type TwinParams,
  type TwinSummary,
} from "@/lib/engine/digitalTwin";

type TwinStore = {
  params: TwinParams;
  result: TwinSummary;
  setParam: <K extends keyof TwinParams>(key: K, value: TwinParams[K]) => void;
  setCost: (key: keyof TwinParams["cost"], value: number) => void;
  reset: () => void;
  recompute: () => void;
};

function recomputeFrom(params: TwinParams): TwinSummary {
  return simulate(params);
}

export const useTwinStore = create<TwinStore>((set, get) => {
  const params = defaultParams();
  return {
    params,
    result: recomputeFrom(params),
    setParam: (key, value) => {
      const next = { ...get().params, [key]: value };
      set({ params: next, result: recomputeFrom(next) });
    },
    setCost: (key, value) => {
      const prev = get().params;
      const next: TwinParams = {
        ...prev,
        cost: { ...prev.cost, [key]: value },
      };
      set({ params: next, result: recomputeFrom(next) });
    },
    reset: () => {
      const p = defaultParams();
      set({ params: p, result: recomputeFrom(p) });
    },
    recompute: () => {
      set({ result: recomputeFrom(get().params) });
    },
  };
});
