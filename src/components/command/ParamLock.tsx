"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Lock, Unlock } from "lucide-react";
import { useToast } from "@/components/wow/ToastHost";
import { cn } from "@/lib/utils";

type LockStore = {
  locked: boolean;
  setLocked: (v: boolean) => void;
  toggle: () => void;
};

export const useParamLock = create<LockStore>()(
  persist(
    (set, get) => ({
      locked: false,
      setLocked: (locked) => set({ locked }),
      toggle: () => set({ locked: !get().locked }),
    }),
    { name: "log-twin-param-lock" }
  )
);

export function ParamLockButton() {
  const { locked, toggle } = useParamLock();
  const pushToast = useToast((s) => s.push);

  return (
    <button
      type="button"
      onClick={() => {
        toggle();
        pushToast({
          title: locked ? "Đã mở khóa Twin" : "Đã khóa Twin",
          detail: locked
            ? "Có thể chỉnh slider / preset"
            : "Chặn chỉnh nhầm khi present",
          tone: locked ? "info" : "warn",
        });
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold",
        locked
          ? "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300"
          : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
      )}
      title="Khóa tham số Twin"
    >
      {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
      {locked ? "Locked" : "Lock"}
    </button>
  );
}
