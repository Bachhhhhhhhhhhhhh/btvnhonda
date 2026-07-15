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
    box: "border-rose-200 bg-rose-50",
    badge: "bg-rose-600 text-white",
    label: "Critical",
  },
  warning: {
    icon: AlertTriangle,
    box: "border-amber-200 bg-amber-50",
    badge: "bg-amber-600 text-white",
    label: "Warning",
  },
  info: {
    icon: Info,
    box: "border-sky-200 bg-sky-50",
    badge: "bg-sky-700 text-white",
    label: "Info",
  },
  good: {
    icon: CheckCircle2,
    box: "border-teal-200 bg-teal-50",
    badge: "bg-teal-700 text-white",
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
      <div className="rounded-[4px] border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
        <CheckCircle2 className="mr-1.5 inline h-4 w-4" />
        Không có cảnh báo nghiêm trọng với policy Twin hiện tại.
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      {!compact && (
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#b8954a]">
            Cảnh báo điều hành · Live
          </div>
          <div className="text-[11px] text-slate-500">
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
              "flex flex-wrap items-start gap-3 rounded-[3px] border px-3 py-2.5",
              conf.box
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-80" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-[2px] px-1.5 py-0.5 text-[9px] font-bold uppercase",
                    conf.badge
                  )}
                >
                  {conf.label}
                </span>
                <span className="text-sm font-bold text-[#071428]">{a.title}</span>
              </div>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate-700">
                {a.detail}
              </p>
              {a.action && (
                <p className="mt-0.5 text-[11px] font-semibold text-slate-600">
                  → {a.action}
                </p>
              )}
            </div>
            {a.href && (
              <Link
                href={a.href}
                className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#0a4d6e] hover:underline"
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
