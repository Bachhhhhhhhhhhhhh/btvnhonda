"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TwinParams } from "@/lib/engine/digitalTwin";

export type GoalTargets = {
  savingsBn: number;
  outsourceMax: number;
  stackMin: number;
  transferTarget: number;
  roiMin: number;
};

export type ChecklistItem = {
  id: string;
  title: string;
  owner: string;
  phase: "30d" | "60d" | "90d" | "ongoing";
  done: boolean;
  priority: "P0" | "P1" | "P2";
};

const DEFAULT_GOALS: GoalTargets = {
  savingsBn: 5,
  outsourceMax: 150000,
  stackMin: 0.8,
  transferTarget: 0.35,
  roiMin: 1,
};

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "c1", title: "Kick-off pilot stacking NK + SOP draft", owner: "WH Bắc", phase: "30d", done: false, priority: "P0" },
  { id: "c2", title: "RACI claim / inspection window với QA-Genpo", owner: "QA", phase: "30d", done: false, priority: "P0" },
  { id: "c3", title: "Draft rate card gửi Finance", owner: "Finance", phase: "30d", done: false, priority: "P0" },
  { id: "c4", title: "Baseline damage KPI & case pool inventory", owner: "WH", phase: "30d", done: false, priority: "P1" },
  { id: "c5", title: "Lock rate card v1", owner: "Finance", phase: "60d", done: false, priority: "P0" },
  { id: "c6", title: "Scale stack ratio theo Twin", owner: "LOG", phase: "60d", done: false, priority: "P1" },
  { id: "c7", title: "Pre-book container tháng đỏ đầu tiên", owner: "Transport", phase: "60d", done: false, priority: "P0" },
  { id: "c8", title: "Twin dashboard S&OP weekly live", owner: "S&OP", phase: "60d", done: false, priority: "P1" },
  { id: "c9", title: "Peak war-room + playbook T-4", owner: "LOG Head", phase: "90d", done: false, priority: "P0" },
  { id: "c10", title: "Post-mortem mid-peak & re-run NPV", owner: "S&OP", phase: "90d", done: false, priority: "P1" },
  { id: "c11", title: "Tender input / NBF-LOG2 decision pack", owner: "Leadership", phase: "90d", done: false, priority: "P2" },
  { id: "c12", title: "WSB stress-test mỗi khi tender cước đổi", owner: "Planning", phase: "ongoing", done: false, priority: "P1" },
];

type WorkspaceStore = {
  goals: GoalTargets;
  checklist: ChecklistItem[];
  notes: string;
  setGoal: <K extends keyof GoalTargets>(k: K, v: GoalTargets[K]) => void;
  setGoals: (g: Partial<GoalTargets>) => void;
  toggleCheck: (id: string) => void;
  resetChecklist: () => void;
  setNotes: (n: string) => void;
  importWorkspace: (data: Partial<{ goals: GoalTargets; checklist: ChecklistItem[]; notes: string }>) => void;
};

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      goals: DEFAULT_GOALS,
      checklist: DEFAULT_CHECKLIST,
      notes: "",
      setGoal: (k, v) => set({ goals: { ...get().goals, [k]: v } }),
      setGoals: (g) => set({ goals: { ...get().goals, ...g } }),
      toggleCheck: (id) =>
        set({
          checklist: get().checklist.map((c) =>
            c.id === id ? { ...c, done: !c.done } : c
          ),
        }),
      resetChecklist: () => set({ checklist: DEFAULT_CHECKLIST.map((c) => ({ ...c, done: false })) }),
      setNotes: (notes) => set({ notes }),
      importWorkspace: (data) =>
        set({
          goals: data.goals ?? get().goals,
          checklist: data.checklist ?? get().checklist,
          notes: data.notes ?? get().notes,
        }),
    }),
    { name: "log-twin-workspace-v1" }
  )
);

/** Encode twin params into shareable query string */
export function encodeParamsToQuery(params: TwinParams): string {
  const q = new URLSearchParams();
  q.set("s", String(params.importStackRatio));
  q.set("t", String(params.transferRatio));
  q.set("u", String(params.unpackM2));
  q.set("k", String(params.stackM2));
  q.set("mc", String(params.mcPerCase));
  q.set("ttl", params.useTtlCapacity ? "1" : "0");
  q.set("nf", String(params.cost.nsFreightPerMc));
  q.set("no", String(params.cost.northOutsourcePerMcMonth));
  return q.toString();
}

export function decodeParamsFromQuery(
  search: string,
  base: TwinParams
): TwinParams | null {
  const q = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  if (!q.has("s") && !q.has("t")) return null;
  const num = (k: string, d: number) => {
    const v = q.get(k);
    if (v == null) return d;
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  };
  return {
    ...base,
    importStackRatio: Math.min(1, Math.max(0, num("s", base.importStackRatio))),
    transferRatio: Math.min(1, Math.max(0, num("t", base.transferRatio))),
    unpackM2: num("u", base.unpackM2),
    stackM2: num("k", base.stackM2),
    mcPerCase: num("mc", base.mcPerCase),
    useTtlCapacity: q.get("ttl") === "1",
    cost: {
      ...base.cost,
      nsFreightPerMc: num("nf", base.cost.nsFreightPerMc),
      northOutsourcePerMcMonth: num("no", base.cost.northOutsourcePerMcMonth),
    },
  };
}

export function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  return Promise.resolve();
}
