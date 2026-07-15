"use client";

import { useMemo } from "react";
import { useWorkspaceStore, type ChecklistItem } from "@/lib/workspace";
import { cn } from "@/lib/utils";
import { CheckSquare, RotateCcw, ListTodo } from "lucide-react";

const PHASES: { key: ChecklistItem["phase"]; label: string }[] = [
  { key: "30d", label: "30 ngày" },
  { key: "60d", label: "60 ngày" },
  { key: "90d", label: "90 ngày" },
  { key: "ongoing", label: "Ongoing" },
];

export function ActionChecklist({ compact = false }: { compact?: boolean }) {
  const { checklist, toggleCheck, resetChecklist } = useWorkspaceStore();
  const done = checklist.filter((c) => c.done).length;
  const pct = checklist.length ? done / checklist.length : 0;

  const byPhase = useMemo(() => {
    return PHASES.map((p) => ({
      ...p,
      items: checklist.filter((c) => c.phase === p.key),
    }));
  }, [checklist]);

  return (
    <div className="cc-panel rounded-xl border border-[var(--line)] bg-[var(--card)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line-soft)] px-4 py-3">
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-[var(--gold)]" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
              Action checklist
            </div>
            <div className="text-sm font-extrabold text-[var(--ink)]">
              Playbook 30-60-90
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tabular-nums text-[var(--muted)]">
            {done}/{checklist.length} · {Math.round(pct * 100)}%
          </span>
          <button
            type="button"
            onClick={resetChecklist}
            className="rounded-lg border border-[var(--line)] p-1.5 text-[var(--muted)] hover:text-[var(--ink)]"
            title="Reset"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="h-2 overflow-hidden rounded-full bg-[var(--bg)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#b8954a] to-teal-500 transition-all"
            style={{ width: `${pct * 100}%` }}
          />
        </div>
      </div>

      <div className={cn("space-y-4 p-4", compact && "max-h-80 overflow-y-auto")}>
        {byPhase.map((p) => (
          <div key={p.key}>
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
              {p.label} · {p.items.filter((i) => i.done).length}/{p.items.length}
            </div>
            <div className="space-y-1">
              {p.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleCheck(item.id)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left transition",
                    item.done
                      ? "border-teal-500/25 bg-teal-500/5"
                      : "border-[var(--line)] bg-[var(--bg)]/40 hover:border-[var(--gold)]/30"
                  )}
                >
                  <CheckSquare
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      item.done ? "text-teal-500" : "text-[var(--muted)]"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        "text-[12.5px] font-semibold leading-snug",
                        item.done
                          ? "text-[var(--muted)] line-through"
                          : "text-[var(--ink)]"
                      )}
                    >
                      {item.title}
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-1.5 text-[10px]">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 font-bold",
                          item.priority === "P0"
                            ? "bg-rose-500/15 text-rose-600"
                            : item.priority === "P1"
                              ? "bg-amber-500/15 text-amber-700"
                              : "bg-[var(--bg)] text-[var(--muted)]"
                        )}
                      >
                        {item.priority}
                      </span>
                      <span className="text-[var(--muted)]">{item.owner}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
