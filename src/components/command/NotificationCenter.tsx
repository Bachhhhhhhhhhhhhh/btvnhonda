"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";
import { useTwinStore } from "@/lib/store";
import { buildAlerts } from "@/lib/engine/analytics";
import { cn } from "@/lib/utils";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { result, params } = useTwinStore();
  const alerts = useMemo(() => buildAlerts(result, params), [result, params]);
  const crit = alerts.filter((a) => a.level === "critical" || a.level === "warning").length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg border border-[var(--line)] p-2 text-[var(--muted)] hover:text-[var(--ink)]"
        title="Notifications"
      >
        <Bell className="h-3.5 w-3.5" />
        {crit > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
            {crit}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[180]"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-[190] mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-3 py-2.5">
              <div className="text-xs font-extrabold text-[var(--ink)]">
                Notifications · {alerts.length}
              </div>
              <button type="button" onClick={() => setOpen(false)}>
                <X className="h-3.5 w-3.5 text-[var(--muted)]" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {alerts.length === 0 && (
                <div className="px-3 py-6 text-center text-xs text-[var(--muted)]">
                  Không có cảnh báo
                </div>
              )}
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="border-b border-[var(--line-soft)] px-3 py-2.5 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase",
                        a.level === "critical"
                          ? "bg-rose-500/15 text-rose-600"
                          : a.level === "warning"
                            ? "bg-amber-500/15 text-amber-700"
                            : a.level === "good"
                              ? "bg-teal-500/15 text-teal-700"
                              : "bg-sky-500/15 text-sky-700"
                      )}
                    >
                      {a.level}
                    </span>
                    <span className="text-[12px] font-bold text-[var(--ink)]">
                      {a.title}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
                    {a.detail}
                  </p>
                  {a.href && (
                    <Link
                      href={a.href}
                      onClick={() => setOpen(false)}
                      className="mt-1 inline-block text-[11px] font-bold text-[var(--link)]"
                    >
                      Mở →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
