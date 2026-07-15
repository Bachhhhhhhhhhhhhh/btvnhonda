"use client";

import { X } from "lucide-react";

const ROWS = [
  { k: "Ctrl / ⌘ + K", d: "Command palette — tìm trang & actions" },
  { k: "Esc", d: "Đóng palette / presentation / modal" },
  { k: "← →", d: "Chuyển slide Presentation mode" },
  { k: "☀ / 🌙", d: "Toggle dark / light (header)" },
  { k: "Density", d: "Compact / comfortable layout" },
  { k: "FAB +", d: "Quick jump Twin · WSB · Insights · Map · Report" },
  { k: "Export", d: "Tải JSON params + CSV monthly/annual" },
  { k: "WSB Apply", d: "Ghi what-if vào Twin + snapshot" },
];

export function ShortcutsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-5 py-3">
          <div className="text-sm font-extrabold text-[var(--ink)]">Keyboard & shortcuts</div>
          <button type="button" onClick={onClose}>
            <X className="h-4 w-4 text-[var(--muted)]" />
          </button>
        </div>
        <div className="divide-y divide-[var(--line-soft)]">
          {ROWS.map((r) => (
            <div key={r.k} className="flex items-start justify-between gap-4 px-5 py-3">
              <kbd className="shrink-0 rounded-md border border-[var(--line)] bg-[var(--bg)] px-2 py-1 font-mono text-[11px] font-bold text-[var(--ink)]">
                {r.k}
              </kbd>
              <div className="text-right text-xs text-[var(--muted)]">{r.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
