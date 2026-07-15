"use client";

import { useTwinStore } from "@/lib/store";
import { Undo2, Redo2, History } from "lucide-react";
import { fmtPct } from "@/lib/utils";

export function HistoryPanel() {
  const { past, future, undo, redo, params } = useTwinStore();

  return (
    <div className="cc-panel rounded-xl border border-[var(--line)] bg-[var(--card)]">
      <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-4 py-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[var(--gold)]" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
              Change history
            </div>
            <div className="text-sm font-extrabold text-[var(--ink)]">
              Undo / Redo Twin
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={!past.length}
            onClick={() => undo()}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-2 py-1.5 text-[11px] font-bold disabled:opacity-30"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Undo ({past.length})
          </button>
          <button
            type="button"
            disabled={!future.length}
            onClick={() => redo()}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-2 py-1.5 text-[11px] font-bold disabled:opacity-30"
          >
            <Redo2 className="h-3.5 w-3.5" />
            Redo ({future.length})
          </button>
        </div>
      </div>
      <div className="max-h-48 overflow-y-auto p-2">
        {past.length === 0 && (
          <div className="px-2 py-4 text-center text-xs text-[var(--muted)]">
            Chưa có thay đổi · chỉnh slider / preset để ghi lịch sử
          </div>
        )}
        {[...past].reverse().slice(0, 12).map((h, i) => (
          <div
            key={h.id}
            className="flex items-start justify-between gap-2 rounded-lg px-2 py-1.5 text-[11px] hover:bg-[var(--bg)]"
          >
            <div>
              <div className="font-bold text-[var(--ink)]">{h.label}</div>
              <div className="text-[10px] text-[var(--muted)]">
                S {fmtPct(h.params.importStackRatio, 0)} · T{" "}
                {fmtPct(h.params.transferRatio, 0)}
              </div>
            </div>
            <div className="shrink-0 font-mono text-[10px] text-[var(--muted)]">
              {new Date(h.at).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
          </div>
        ))}
        <div className="mt-1 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2 py-1.5 text-[11px]">
          <span className="font-bold text-[var(--ink)]">Hiện tại · </span>
          S {fmtPct(params.importStackRatio, 0)} · T{" "}
          {fmtPct(params.transferRatio, 0)}
        </div>
      </div>
    </div>
  );
}
