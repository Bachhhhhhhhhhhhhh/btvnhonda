"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Network,
  Brain,
  FileText,
  MapPinned,
  Plus,
  X,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { href: "/digital-twin", label: "Twin", icon: Network },
  { href: "/wsb", label: "WSB", icon: FlaskConical },
  { href: "/insights", label: "Insights", icon: Brain },
  { href: "/map", label: "Map", icon: MapPinned },
  { href: "/report", label: "Report", icon: FileText },
];

export function QuickFab({ onShortcuts }: { onShortcuts?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="no-print fixed bottom-5 right-5 z-[120] flex flex-col items-end gap-2">
      {open && (
        <div className="mb-1 flex flex-col items-end gap-1.5">
          {ACTIONS.map((a, i) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href}
                href={a.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] py-2 pl-3 pr-3.5 text-xs font-bold text-[var(--ink)] shadow-lg transition hover:border-[var(--gold)]/50"
                style={{
                  animation: `fab-in 0.2s ease ${i * 0.04}s both`,
                }}
              >
                <Icon className="h-3.5 w-3.5 text-[var(--gold)]" />
                {a.label}
              </Link>
            );
          })}
          {onShortcuts && (
            <button
              type="button"
              onClick={() => {
                onShortcuts();
                setOpen(false);
              }}
              className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] py-2 pl-3 pr-3.5 text-xs font-bold text-[var(--ink)] shadow-lg"
            >
              <Keyboard className="h-3.5 w-3.5 text-[var(--gold)]" />
              Shortcuts
            </button>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full shadow-xl transition",
          open
            ? "bg-[var(--ink)] text-[var(--card)]"
            : "bg-gradient-to-br from-[#d4b76a] to-[#b8954a] text-[#071428]"
        )}
        aria-label="Quick actions"
      >
        {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </button>
      <style jsx global>{`
        @keyframes fab-in {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
