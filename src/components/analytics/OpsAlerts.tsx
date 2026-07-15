"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTwinStore } from "@/lib/store";
import { buildAlerts, type AlertLevel } from "@/lib/engine/analytics";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Siren,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LEVEL: Record<
  AlertLevel,
  { icon: typeof Siren; box: string; badge: string; label: string }
> = {
  critical: {
    icon: Siren,
    box: "alert-critical",
    badge: "bg-[var(--bad)] text-white",
    label: "Critical",
  },
  warning: {
    icon: AlertTriangle,
    box: "alert-warning",
    badge: "bg-[var(--warn)] text-white",
    label: "Warning",
  },
  info: {
    icon: Info,
    box: "alert-info",
    badge: "bg-[var(--link)] text-white",
    label: "Info",
  },
  good: {
    icon: CheckCircle2,
    box: "alert-good",
    badge: "bg-[var(--good)] text-white",
    label: "Good",
  },
};

export function OpsAlerts({
  compact = false,
  max = 6,
}: {
  compact?: boolean;
  max?: number;
}) {
  const { result, params } = useTwinStore();
  const alerts = useMemo(
    () => buildAlerts(result, params).slice(0, max),
    [result, params, max]
  );

  if (!alerts.length) {
    return (
      <div className="alert-good flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm text-[var(--ink)]">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--good)]" />
        Không có cảnh báo nghiêm trọng với policy Twin hiện tại.
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      {!compact && (
        <div className="flex items-center justify-between px-0.5">
          <div className="panel-kicker">Cảnh báo điều hành · Live</div>
          <div className="text-[11px] text-[var(--muted)]">
            {alerts.filter((a) => a.level === "critical").length} critical ·{" "}
            {alerts.filter((a) => a.level === "warning").length} warning
          </div>
        </div>
      )}
      {alerts.map((a) => {
        const conf = LEVEL[a.level];
        const Icon = conf.icon;
        return (
          <div
            key={a.id}
            className={cn(
              "flex flex-wrap items-start gap-3 rounded-2xl border px-3.5 py-3 shadow-[var(--shadow-sm)]",
              conf.box
            )}
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--card)]/70 text-[var(--ink)]">
              <Icon className="h-4 w-4 opacity-80" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                    conf.badge
                  )}
                >
                  {conf.label}
                </span>
                <span className="text-sm font-bold text-[var(--ink)]">{a.title}</span>
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--muted)]">
                {a.detail}
              </p>
              {a.action && (
                <p className="mt-1 text-[11px] font-semibold text-[var(--ink)]/80">
                  → {a.action}
                </p>
              )}
            </div>
            {a.href && (
              <Link
                href={a.href}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--card)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--link)] hover:bg-[var(--bg)]"
              >
                Xem
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
