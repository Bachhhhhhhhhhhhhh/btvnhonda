"use client";

import { useMemo } from "react";
import { useTwinStore } from "@/lib/store";
import { buildAlerts, optimizePolicy } from "@/lib/engine/analytics";
import { fmt, fmtPct } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle2,
  FlaskConical,
  Sparkles,
  Zap,
} from "lucide-react";

type FeedItem = {
  id: string;
  time: string;
  icon: typeof Activity;
  tone: "good" | "warn" | "crit" | "info";
  title: string;
  detail: string;
};

export function ActivityFeed() {
  const { result, params, snapshots, activePresetId } = useTwinStore();

  const feed = useMemo(() => {
    const now = new Date();
    const ts = (mins: number) => {
      const d = new Date(now.getTime() - mins * 60000);
      return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    };
    const alerts = buildAlerts(result, params);
    const opt = optimizePolicy(params);
    const a = result.annual;
    const items: FeedItem[] = [
      {
        id: "sim",
        time: ts(0),
        icon: Zap,
        tone: "info",
        title: "Twin recompute",
        detail: `Stack ${fmtPct(params.importStackRatio, 0)} · TF ${fmtPct(params.transferRatio, 0)} · save ${fmt(a.totalSavings / 1e9, 2)} tỷ`,
      },
      {
        id: "opt",
        time: ts(1),
        icon: Sparkles,
        tone: "good",
        title: "Optimizer ready",
        detail: `Best S${Math.round(opt.bestStackRatio * 100)}/T${Math.round(opt.bestTransferRatio * 100)} → ${fmt(opt.bestSavings / 1e9, 2)} tỷ`,
      },
    ];
    if (activePresetId) {
      items.push({
        id: "preset",
        time: ts(2),
        icon: CheckCircle2,
        tone: "info",
        title: `Preset active · ${activePresetId}`,
        detail: "Policy preset đang áp dụng trên Twin",
      });
    }
    alerts.slice(0, 4).forEach((al, i) => {
      items.push({
        id: al.id,
        time: ts(3 + i),
        icon: al.level === "critical" || al.level === "warning" ? AlertTriangle : Activity,
        tone:
          al.level === "critical"
            ? "crit"
            : al.level === "warning"
              ? "warn"
              : al.level === "good"
                ? "good"
                : "info",
        title: al.title,
        detail: al.detail.slice(0, 90) + (al.detail.length > 90 ? "…" : ""),
      });
    });
    snapshots
      .slice()
      .reverse()
      .slice(0, 3)
      .forEach((s, i) => {
        items.push({
          id: s.id,
          time: new Date(s.savedAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          icon: Camera,
          tone: "info",
          title: `Snapshot · ${s.name}`,
          detail: `Save ${fmt(s.result.annual.totalSavings / 1e9, 2)} tỷ`,
        });
      });
    items.push({
      id: "wsb",
      time: ts(12),
      icon: FlaskConical,
      tone: "info",
      title: "WSB sandbox available",
      detail: "What-if builder sẵn sàng stress-test policy",
    });
    return items.slice(0, 12);
  }, [result, params, snapshots, activePresetId]);

  const toneCls = {
    good: "bg-teal-500/15 text-teal-600 dark:text-teal-300",
    warn: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    crit: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
    info: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-4 py-3.5">
        <div>
          <div className="panel-kicker">Activity stream</div>
          <div className="text-sm font-bold text-[var(--ink)]">Nhịp điều hành live</div>
        </div>
        <span className="live-dot h-2 w-2 rounded-full bg-[var(--good)]" />
      </div>
      <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {feed.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.id}
              className="flex gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-[var(--bg)]"
            >
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${toneCls[f.tone]}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[13px] font-semibold leading-snug text-[var(--ink)]">
                    {f.title}
                  </div>
                  <div className="shrink-0 font-mono text-[10px] text-[var(--muted)]">
                    {f.time}
                  </div>
                </div>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--muted)]">
                  {f.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
