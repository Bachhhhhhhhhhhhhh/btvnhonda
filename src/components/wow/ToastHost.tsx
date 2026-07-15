"use client";

import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

type Toast = {
  id: string;
  title: string;
  detail?: string;
  tone?: "good" | "info" | "warn";
};

type ToastStore = {
  items: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
};

export const useToast = create<ToastStore>((set) => ({
  items: [],
  push: (t) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ items: [...s.items, { ...t, id }].slice(-5) }));
    setTimeout(() => {
      set((s) => ({ items: s.items.filter((x) => x.id !== id) }));
    }, 4200);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
}));

export function ToastHost() {
  const { items, dismiss } = useToast();
  const icon = {
    good: CheckCircle2,
    info: Info,
    warn: AlertTriangle,
  };
  const box = {
    good: "border-teal-200 bg-teal-50 text-teal-950",
    info: "border-sky-200 bg-white text-[#071428]",
    warn: "border-amber-200 bg-amber-50 text-amber-950",
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[250] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      <AnimatePresence>
        {items.map((t) => {
          const tone = t.tone ?? "info";
          const Icon = icon[tone];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              className={`pointer-events-auto flex gap-2 rounded-[4px] border px-3 py-2.5 shadow-lg ${box[tone]}`}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold">{t.title}</div>
                {t.detail && (
                  <div className="text-[12px] opacity-80">{t.detail}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="shrink-0 opacity-50 hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
