"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTwinStore } from "@/lib/store";
import { useWorkspaceStore } from "@/lib/workspace";
import { SectionHeader, MetricRow } from "@/components/ui/section-header";
import { ActionChecklist } from "@/components/command/ActionChecklist";
import { GoalTracker } from "@/components/command/GoalTracker";
import { PolicyMatrix } from "@/components/command/PolicyMatrix";
import { ShareBar } from "@/components/command/ShareBar";
import { HeatCalendar } from "@/components/command/HeatCalendar";
import { BreakEvenGauge } from "@/components/command/BreakEvenGauge";
import { MemoGenerator } from "@/components/command/MemoGenerator";
import { BenchmarkPanel } from "@/components/command/BenchmarkPanel";
import { fmt, fmtPct } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Kpi } from "@/components/ui/kpi";
import { CalendarRange, ClipboardList, Target, ArrowRight } from "lucide-react";

export default function PlannerPage() {
  const { result, params } = useTwinStore();
  const { notes, setNotes, checklist, goals } = useWorkspaceStore();
  const a = result.annual;

  const red = result.months.filter((m) => m.classification === "red");
  const progress = checklist.filter((c) => c.done).length / checklist.length;

  const weekPlan = useMemo(() => {
    // simple T-4 / T-2 / peak week actions from red months
    return red.map((m) => ({
      month: m.month,
      residual: m.residualAfterImport,
      transfer: m.transferVol,
      outsource: m.outsourceVol,
      cont: m.nsContainersBase,
      actions: [
        `T-4: chốt forecast residual ${fmt(m.residualAfterImport)} · book cont ~${fmt(m.nsContainersBase, 1)}`,
        `T-2: xác nhận TF ${fmt(m.transferVol)} vs outsource ${fmt(m.outsourceVol)} theo BE`,
        `Peak ${m.month}: war-room · monitor case pool · damage KPI`,
      ],
    }));
  }, [red]);

  return (
    <div className="space-y-5">
      <SectionHeader
        kicker="S&OP · Execution"
        title="Planner — mục tiêu, checklist & lịch peak"
        subtitle="Biến Digital Twin thành kế hoạch chạy việc: goal tracker, playbook 30-60-90, policy matrix, share workspace."
        actions={
          <Link href="/report" className="btn-bank-gold px-3 py-2 text-xs">
            Board pack
          </Link>
        }
      />

      <ShareBar />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Checklist progress"
          value={`${Math.round(progress * 100)}%`}
          numericValue={progress * 100}
          digits={0}
          sub={`${checklist.filter((c) => c.done).length}/${checklist.length} việc`}
          tone="accent"
          icon={ClipboardList}
        />
        <Kpi
          label="Goal savings"
          value={`${fmt(a.totalSavings / 1e9, 2)} / ${goals.savingsBn}`}
          sub="tỷ actual / target"
          tone={a.totalSavings / 1e9 >= goals.savingsBn ? "good" : "warn"}
          icon={Target}
        />
        <Kpi
          label="Tháng đỏ"
          value={String(red.length)}
          sub={red.map((m) => m.month).join(", ") || "—"}
          tone={red.length ? "bad" : "good"}
          icon={CalendarRange}
        />
        <Kpi
          label="Twin policy"
          value={`${fmtPct(params.importStackRatio, 0)} / ${fmtPct(params.transferRatio, 0)}`}
          sub="stack / transfer"
        />
      </div>

      <MetricRow
        items={[
          { label: "Cont N→S", value: fmt(a.nsContainersBase) },
          { label: "Case pool", value: fmt(a.peakCasePool) },
          { label: "Outsource", value: fmt(a.outsourceVol) },
          { label: "NPV 3y", value: `${fmt(a.npv / 1e9, 2)} tỷ` },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-5">
          <GoalTracker />
          <BreakEvenGauge />
        </div>
        <div className="xl:col-span-7">
          <ActionChecklist />
        </div>
      </div>

      <PolicyMatrix />
      <HeatCalendar />

      <Card accent>
        <CardHeader>
          <div className="section-kicker">Peak playbook</div>
          <CardTitle>Lịch hành động theo tháng đỏ</CardTitle>
          <CardDescription>
            Sinh từ classification residual Twin · cập nhật khi đổi policy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {weekPlan.length === 0 && (
            <InsightBox title="Không có tháng đỏ" tone="good">
              Policy hiện tại không tạo residual ≥ 30.000. Vẫn giữ monitor Dec–Mar nếu bật TTL.
            </InsightBox>
          )}
          {weekPlan.map((w) => (
            <div
              key={w.month}
              className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-lg font-black text-[var(--ink)]">{w.month}</div>
                <div className="text-xs font-bold text-rose-600 dark:text-rose-300">
                  Residual {fmt(w.residual)} · Cont {fmt(w.cont, 1)}
                </div>
              </div>
              <ul className="mt-2 space-y-1.5 text-[13px] text-[var(--muted)]">
                {w.actions.map((act) => (
                  <li key={act} className="flex gap-2">
                    <span className="text-[var(--gold)]">▸</span>
                    {act}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <MemoGenerator />
        <BenchmarkPanel />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ghi chú S&OP</CardTitle>
          <CardDescription>Lưu local — đi kèm export workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Ghi chú cuộc họp, quyết định, open points…"
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--gold)]"
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link href="/digital-twin" className="btn-bank inline-flex items-center gap-1 px-4 py-2 text-xs">
          Twin <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link href="/wsb" className="btn-bank-outline px-4 py-2 text-xs">
          WSB
        </Link>
        <Link href="/insights" className="btn-bank-outline px-4 py-2 text-xs">
          Insights
        </Link>
        <Link href="/recommendations" className="btn-bank-outline px-4 py-2 text-xs">
          Khuyến nghị
        </Link>
      </div>
    </div>
  );
}

function InsightBox({
  title,
  children,
  tone,
}: {
  title: string;
  children: React.ReactNode;
  tone: "good" | "info";
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        tone === "good"
          ? "border-teal-500/30 bg-teal-500/10 text-teal-900 dark:text-teal-200"
          : "border-[var(--line)] bg-[var(--bg)]"
      }`}
    >
      <div className="text-[10px] font-bold uppercase tracking-wide opacity-80">
        {title}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
