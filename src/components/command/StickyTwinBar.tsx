"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTwinStore } from "@/lib/store";
import { useThemeStore } from "@/lib/theme-store";
import { fmt, fmtPct } from "@/lib/utils";
import { Undo2, Redo2, Pin } from "lucide-react";
import { cn } from "@/lib/utils";

/** Floating strip — always see Twin KPIs + undo/redo */
export function StickyTwinBar() {
  const path = usePathname();
  const { result, params, past, future, undo, redo } = useTwinStore();
  const collapsed = useThemeStore((s) => s.sidebarCollapsed);
  const a = result.annual;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  if (path.startsWith("/report")) return null;

  return (
    <div
      className={cn(
        "no-print fixed bottom-0 right-0 z-[90] border-t border-[var(--line)] bg-[var(--header-bg)] px-3 py-2 backdrop-blur-md left-0",
        collapsed ? "lg:left-[68px]" : "lg:left-[248px]"
      )}
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--gold)]">
          <Pin className="h-3 w-3" />
          Twin
        </div>

        <div className="hidden h-4 w-px bg-[var(--line)] sm:block" />

        <Metric label="S" value={fmtPct(params.importStackRatio, 0)} />
        <Metric label="T" value={fmtPct(params.transferRatio, 0)} />
        <Metric
          label="Save"
          value={`${fmt(a.totalSavings / 1e9, 2)}T`}
          hot={a.totalSavings > 0}
        />
        <Metric label="z" value={fmt(a.outsourceVol)} />
        <Metric label="Cont" value={fmt(a.nsContainersBase)} className="hidden md:flex" />
        <Metric label="Pool" value={fmt(a.peakCasePool)} className="hidden lg:flex" />

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            disabled={!past.length}
            onClick={() => undo()}
            className="rounded-md border border-[var(--line)] p-1.5 text-[var(--ink)] disabled:opacity-30"
            title="Undo"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={!future.length}
            onClick={() => redo()}
            className="rounded-md border border-[var(--line)] p-1.5 text-[var(--ink)] disabled:opacity-30"
            title="Redo"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
          <Link
            href="/digital-twin"
            className="btn-bank ml-1 px-2.5 py-1 text-[10px]"
          >
            Open
          </Link>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  hot,
  className,
}: {
  label: string;
  value: string;
  hot?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--bg)] px-2 py-1",
        className
      )}
    >
      <span className="text-[9px] font-bold uppercase text-[var(--muted)]">
        {label}
      </span>
      <span
        className={cn(
          "text-[11px] font-black tabular-nums",
          hot ? "text-teal-600 dark:text-teal-300" : "text-[var(--ink)]"
        )}
      >
        {value}
      </span>
    </div>
  );
}
